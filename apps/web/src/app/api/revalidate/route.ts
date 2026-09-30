import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import {
  MAX_WEBHOOK_BYTES,
  SIGNATURE_HEADER,
  planRevalidation,
  verifySanitySignature,
  type SignatureFailure,
} from '@/lib/sanity/webhook'

/**
 * Sanity publish → live site.
 *
 * Sanity POSTs a document mutation here; we verify the HMAC signature against
 * `SANITY_REVALIDATE_SECRET` and purge the matching cache tags. This is what
 * makes an editor's publish visible in roughly 30 seconds rather than after the
 * one-hour time-based revalidate window.
 *
 * Configuration (Sanity → API → Webhooks):
 *   URL        https://<domain>/api/revalidate
 *   Dataset    production
 *   Filter     _type in [article, foodProfile, outreach, quote, resource,
 *                        impactMetric, impactMilestone, siteSettings, program,
 *                        category, tag, person, partner, testimonial, event, page]
 *   HTTP POST, with "Include draft" off
 *   Secret     must equal SANITY_REVALIDATE_SECRET (use the same value in the
 *              webhook's Secret field so Sanity signs with it)
 *   Projection none — the full document is required so `_type` and `slug` can be
 *              read. The payload is not persisted.
 *
 * The signature is verified against the *raw* body, so the body is read as text
 * before any JSON parsing; re-serialising would change the bytes and break the
 * digest.
 */
export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get('content-length') ?? '0')
  if (Number.isFinite(declaredLength) && declaredLength > MAX_WEBHOOK_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json({ error: 'Could not read request body' }, { status: 400 })
  }

  if (rawBody.length > MAX_WEBHOOK_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  const verification = verifySanitySignature(
    rawBody,
    request.headers.get(SIGNATURE_HEADER),
    process.env.SANITY_REVALIDATE_SECRET,
  )
  if (!verification.ok) {
    return NextResponse.json(
      { error: 'Unauthorized', reason: verification.reason },
      // Do not leak *why* the check failed to an unauthenticated caller beyond
      // what is needed for debugging; the reason is short and non-sensitive.
      { status: verification.reason === 'missing-secret' ? 500 : 401 },
    )
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const plan = planRevalidation(payload)
  for (const tag of plan.tags) {
    revalidateTag(tag)
  }

  return NextResponse.json({
    revalidated: true,
    tags: plan.tags,
    type: plan.type,
    documentId: plan.documentId,
    slug: plan.slug,
    usedFallback: plan.usedFallback,
  })
}

/**
 * Plain GET so the endpoint can be health-checked and manually triggered during
 * a release. It is intentionally *not* a revalidation path: a GET must never
 * mutate cache state, because crawlers and link previewers hit links.
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/revalidate',
    method: 'POST',
    signatureHeader: SIGNATURE_HEADER,
    configured: Boolean(process.env.SANITY_REVALIDATE_SECRET),
  })
}

export type { SignatureFailure }
