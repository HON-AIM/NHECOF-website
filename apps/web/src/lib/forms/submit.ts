import { randomUUID } from 'node:crypto'
import type { ZodType } from 'zod'
import { HONEYPOT_FIELD, MAX_FORM_BODY_BYTES } from '@/features/forms/constants'
import type { FormOutput, FormType } from '@/features/forms/schemas'
import { logFormCompleted } from './analytics'
import { sendSubmissionEmails } from './email'
import { getClientIp, hashIp } from './ip'
import type { RateLimiter } from './rateLimit'
import { getRateLimiter } from './rateLimit'
import type { DeliveryRecordStore } from './store'
import { getDeliveryRecordStore } from './store'
import { sanitiseSubmission } from './sanitise'
import { verifyTurnstileToken } from './turnstile'

/**
 * One pipeline to rule the three form routes (plan §9.2). Steps run strictly
 * in this order:
 *
 *   1. method + content-type checks
 *   2. body-size limit (pre-check via Content-Length, then actual byte count)
 *   3. Turnstile verification
 *   4. rate limit (sliding window per IP hash)
 *   5. honeypot field
 *   6. Zod validation
 *   7. sanitisation of every string
 *   8. send (acknowledgement + internal notification) and record delivery
 *
 * Every error message returned to the client is generic and deliberately
 * reveals nothing about the failure — logs carry the detail.
 */

export interface FormSubmissionDeps {
  verifyCaptcha: (token: string | null | undefined, ip: string) => Promise<boolean>
  rateLimiter: Pick<RateLimiter, 'allow'>
  store: DeliveryRecordStore
  sendEmails: (send: {
    formType: FormType
    data: FormOutput
    submitterEmail: string
    reference: string
  }) => Promise<{ simulated: boolean }>
}

export interface FormSubmissionOptions {
  formType: FormType
  schema: ZodType<FormOutput>
  deps?: Partial<FormSubmissionDeps>
}

function jsonError(status: number, error: string, extra?: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ ok: false, error, ...extra }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

function jsonSuccess(reference: string): Response {
  return new Response(JSON.stringify({ ok: true, reference }), {
    status: 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  })
}

export function createReference(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()
  return `NHECOF-${date}-${suffix}`
}

export async function handleFormSubmission(
  request: Request,
  { formType, schema, deps }: FormSubmissionOptions,
): Promise<Response> {
  // 1. method + content-type
  if (request.method !== 'POST') {
    return jsonError(405, 'This endpoint only accepts POST requests.')
  }
  const contentType = request.headers.get('content-type') ?? ''
  if (!contentType.toLowerCase().includes('application/json')) {
    return jsonError(415, 'This endpoint only accepts JSON bodies.')
  }

  // 2. body-size limit
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > MAX_FORM_BODY_BYTES) {
    return jsonError(413, 'That message is too large to send. Please shorten it and try again.')
  }
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return jsonError(400, 'We could not read your message. Please try again.')
  }
  if (Buffer.byteLength(rawBody, 'utf8') > MAX_FORM_BODY_BYTES) {
    return jsonError(413, 'That message is too large to send. Please shorten it and try again.')
  }

  // Then parse — the token and honeypot live alongside the real fields.
  let body: Record<string, unknown>
  try {
    body = JSON.parse(rawBody) as Record<string, unknown>
  } catch {
    return jsonError(400, 'We could not read your message. Please try again.')
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return jsonError(400, 'We could not read your message. Please try again.')
  }

  const ip = getClientIp(request)
  const ipHash = hashIp(ip)
  const turnstileToken = typeof body.turnstileToken === 'string' ? body.turnstileToken : null

  // 3. Turnstile
  const verifyCaptcha = deps?.verifyCaptcha ?? verifyTurnstileToken
  let captchaOk = false
  try {
    captchaOk = await verifyCaptcha(turnstileToken, ip)
  } catch {
    captchaOk = false
  }
  if (!captchaOk) {
    console.log(`[forms] turnstile-rejected ${JSON.stringify({ formType, ipHash })}`)
    return jsonError(400, 'We could not verify your session. Please try again.')
  }

  // 4. rate limit (sliding window per IP hash)
  const rateLimiter = deps?.rateLimiter ?? getRateLimiter()
  let allowed = true
  try {
    allowed = await rateLimiter.allow(formType, ipHash)
  } catch {
    // A limiter outage must never block legitimate submissions silently — but
    // it also must not crash the request. Treat as allowed and continue.
    console.log(`[forms] rate-limiter-unavailable ${JSON.stringify({ formType, ipHash })}`)
    allowed = true
  }
  if (!allowed) {
    console.log(`[forms] rate-limited ${JSON.stringify({ formType, ipHash })}`)
    return jsonError(429, 'Too many submissions from this device. Please try again in about an hour.')
  }

  // 5. honeypot — a filled hidden field means a bot, not a person.
  const honeypotValue = body?.[HONEYPOT_FIELD]
  if (typeof honeypotValue === 'string' && honeypotValue.trim() !== '') {
    console.log(`[forms] honeypot-triggered ${JSON.stringify({ formType, ipHash })}`)
    // Return the same generic message a validation failure would give, so bots
    // cannot distinguish a honeypot block from a plain invalid submission.
    return jsonError(400, 'We could not read your message. Please try again.')
  }

  // 6. Zod validation
  const data = body as Record<string, unknown>
  delete data.turnstileToken
  delete data.website

  const result = schema.safeParse(data)
  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.') || 'form'
      if (!fieldErrors[path]) {
        fieldErrors[path] = issue.message
      }
    }
    return jsonError(400, 'Please correct the highlighted fields and try again.', {
      fieldErrors,
      fields: Object.keys(fieldErrors),
    })
  }

  // 7. sanitisation — every string cleaned before it is emailed or stored.
  const sanitised = sanitiseSubmission(result.data as unknown as Record<string, unknown>) as FormOutput

  const reference = createReference()
  const submitterEmail = (sanitised as { email: string }).email

  // 8. send + record delivery (persist even on failure so retries are possible)
  const store = deps?.store ?? getDeliveryRecordStore()
  const sendEmails = deps?.sendEmails ?? sendSubmissionEmails

  let deliveryStatus: 'sent' | 'failed' = 'failed'
  try {
    await sendEmails({ formType, data: sanitised, submitterEmail, reference })
    deliveryStatus = 'sent'
  } catch (error) {
    deliveryStatus = 'failed'
    console.log(`[forms] delivery-failed ${JSON.stringify({ reference, formType, reason: String(error) })}`)
  }

  await store.save({
    id: reference,
    formType,
    timestamp: new Date().toISOString(),
    deliveryStatus,
  })

  if (deliveryStatus === 'failed') {
    // Safe, human-facing failure with contact fallbacks (never internal detail).
    return jsonError(503, 'We could not send your message right now. Please try again shortly, or contact us by phone or WhatsApp.', {
      fallback: {
        email: process.env.CONTACT_FALLBACK_EMAIL ?? null,
        phone: process.env.CONTACT_FALLBACK_PHONE ?? null,
        whatsapp: process.env.CONTACT_FALLBACK_WHATSAPP ?? null,
      },
    })
  }

  // Analytics: completion events only (never field contents).
  logFormCompleted(formType, reference)

  return jsonSuccess(reference)
}