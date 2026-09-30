import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { FormType } from '../src/features/forms/schemas'
import type { DeliveryRecordStore } from '../src/lib/forms/store'
import { handleFormSubmission } from '../src/lib/forms/submit'
import { contactSchema } from '../src/features/forms/schemas'
import { MAX_FORM_BODY_BYTES } from '../src/features/forms/constants'

const VALID_CONTACT = {
  name: 'Ada Okafor',
  email: 'ada@example.com',
  telephone: '0803 123 4567',
  subject: 'Volunteering',
  message: 'I would like to volunteer as a translator for Hausa materials.',
  privacyConsent: true,
}

interface MockRecordStore extends DeliveryRecordStore {
  saved: Array<{ id: string; deliveryStatus: string }>
}

function mockStore(): MockRecordStore {
  const saved: MockRecordStore['saved'] = []
  const store: MockRecordStore = {
    saved,
    async save(record) {
      saved.push({ id: record.id, deliveryStatus: record.deliveryStatus })
    },
    async prune() {
      return 0
    },
  }
  return store
}

function alwaysAllowRateLimiter() {
  return { allow: vi.fn(async () => true) }
}

function alwaysTrueCaptcha() {
  return vi.fn(async () => true)
}

function makeRequest(body: Record<string, unknown>, extra: { method?: string; headers?: Record<string, string> } = {}) {
  return new Request('http://localhost:3000/api/contact', {
    method: extra.method ?? 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...extra.headers,
    },
    ...(extra.method && extra.method !== 'POST' ? {} : { body: JSON.stringify(body) }),
  })
}

async function runRoute(opts: {
  body?: Record<string, unknown>
  store?: DeliveryRecordStore
  verifyCaptcha?: (token: string | null | undefined, ip: string) => Promise<boolean>
  rateLimiter?: { allow: (f: string, h: string) => Promise<boolean> }
  sendEmails?: (opts: { reference: string; submitterEmail: string; formType: FormType }) => Promise<unknown>
  method?: string
  headers?: Record<string, string>
}) {
  const store = opts.store ?? mockStore()
  return {
    response: await handleFormSubmission(makeRequest(opts.body ?? VALID_CONTACT, { method: opts.method, headers: opts.headers }), {
      formType: 'contact' as FormType,
      schema: contactSchema,
      deps: {
        store,
        verifyCaptcha: opts.verifyCaptcha ?? alwaysTrueCaptcha(),
        rateLimiter: opts.rateLimiter ?? alwaysAllowRateLimiter(),
        sendEmails: (opts.sendEmails ?? vi.fn(async () => ({}))) as never,
      },
    }),
    store: store as MockRecordStore,
  }
}

async function readJson(response: Response) {
  return response.json() as Promise<Record<string, unknown>>
}

describe('form submission pipeline', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('accepts a valid submission and returns a reference number', async () => {
    const sendEmails = vi.fn(async () => ({}))
    const { response, store } = await runRoute({ sendEmails: sendEmails as never })
    expect(response.status).toBe(200)
    const json = await readJson(response)
    expect(json.ok).toBe(true)
    expect(String(json.reference)).toMatch(/^NHECOF-\d{8}-[A-Z0-9]{6}$/)
    expect(sendEmails).toHaveBeenCalledTimes(1)
    expect(store.saved).toHaveLength(1)
    expect(store.saved[0].deliveryStatus).toBe('sent')
  })

  it('rejects a failed captcha (turnstile) with a generic message', async () => {
    const verifyCaptcha = vi.fn(async () => false)
    const { response } = await runRoute({ verifyCaptcha })
    expect(response.status).toBe(400)
    const json = await readJson(response)
    expect(json.ok).toBe(false)
    expect(json.error).toContain('session')
  })

  it('treats a captcha outage as a failure (fail closed)', async () => {
    const verifyCaptcha = vi.fn(async () => {
      throw new Error('siteverify down')
    })
    const { response } = await runRoute({ verifyCaptcha })
    expect(response.status).toBe(400)
  })

  it('rejects when the rate limiter returns false', async () => {
    const rateLimiter = { allow: vi.fn(async () => false) }
    const { response } = await runRoute({ rateLimiter })
    expect(response.status).toBe(429)
    const json = await readJson(response)
    expect(String(json.error)).toContain('Too many submissions')
  })

  it('treats a rate-limiter outage as allowed (does not block real users)', async () => {
    const rateLimiter = {
      allow: vi.fn(async () => {
        throw new Error('redis down')
      }),
    }
    const { response } = await runRoute({ rateLimiter })
    expect(response.status).toBe(200)
  })

  it('rejects a filled honeypot as spam without revealing the block', async () => {
    const sendEmails = vi.fn(async () => ({}))
    const { response, store } = await runRoute({
      body: { ...VALID_CONTACT, website: 'https://spam.example' },
      sendEmails: sendEmails as never,
    })
    expect(response.status).toBe(400)
    expect(sendEmails).not.toHaveBeenCalled()
    expect(store.saved).toHaveLength(0)
  })

  it('returns field errors for an invalid submission', async () => {
    const { response } = await runRoute({ body: { ...VALID_CONTACT, email: 'nope' } })
    expect(response.status).toBe(400)
    const json = await readJson(response)
    expect(json.fieldErrors).toHaveProperty('email')
  })

  it('returns a safe 503 with fallback contact when delivery fails', async () => {
    const sendEmails = vi.fn(async () => {
      throw new Error('Resend quota exceeded')
    })
    const { response, store } = await runRoute({ sendEmails: sendEmails as never })
    expect(response.status).toBe(503)
    const json = await readJson(response)
    expect(json.ok).toBe(false)
    expect(store.saved[0].deliveryStatus).toBe('failed')
    expect(json.fallback).toBeDefined()
  })

  it('rejects a GET request with 405 and does not send emails', async () => {
    const sendEmails = vi.fn(async () => ({}))
    const { response } = await runRoute({ method: 'GET', sendEmails: sendEmails as never })
    expect(response.status).toBe(405)
    expect(sendEmails).not.toHaveBeenCalled()
  })

  it('rejects a non-JSON content type with 415', async () => {
    const { response } = await runRoute({
      headers: { 'Content-Type': 'text/plain' },
    })
    expect(response.status).toBe(415)
  })

  it('rejects an oversized body with 413 before sending', async () => {
    const headers = { 'Content-Type': 'application/json' }
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: 'x'.repeat(MAX_FORM_BODY_BYTES + 1) }),
    })
    const sendEmails = vi.fn(async () => ({}))
    const response = await handleFormSubmission(request, {
      formType: 'contact',
      schema: contactSchema,
      deps: {
        store: mockStore(),
        verifyCaptcha: alwaysTrueCaptcha(),
        rateLimiter: alwaysAllowRateLimiter(),
        sendEmails: sendEmails as never,
      },
    })
    expect(response.status).toBe(413)
    expect(sendEmails).not.toHaveBeenCalled()
  })

  it('rejects malformed JSON with a generic 400', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{this is not json',
    })
    const response = await handleFormSubmission(request, {
      formType: 'contact',
      schema: contactSchema,
      deps: { store: mockStore(), verifyCaptcha: alwaysTrueCaptcha(), rateLimiter: alwaysAllowRateLimiter() },
    })
    expect(response.status).toBe(400)
  })

  it('persists the record even when the send fails (retry-able)', async () => {
    const sendEmails = vi.fn(async () => {
      throw new Error('timeout')
    })
    const { response, store } = await runRoute({ sendEmails: sendEmails as never })
    expect(response.status).toBe(503)
    expect(store.saved).toHaveLength(1)
    expect(store.saved[0]).toMatchObject({ deliveryStatus: 'failed' })
    expect(store.saved[0].id).toMatch(/^NHECOF-/)
  })
})