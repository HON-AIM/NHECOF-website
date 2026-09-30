/**
 * Sanity webhook signature verification and revalidation planning.
 *
 * Kept free of Next.js imports so it can be unit tested directly. The route
 * handler at `/api/revalidate` is a thin wrapper around `handleWebhookRequest`.
 *
 * Security model
 * --------------
 * The endpoint is unauthenticated by design — Sanity calls it — so the *only*
 * thing that makes it safe is the HMAC signature. An attacker who guesses the
 * URL cannot forge a valid digest without the shared secret, and a forged
 * request would let them force unbounded cache invalidation (a cheap
 * denial-of-service), so verification happens before any parsing side effects.
 */

import { createHmac, timingSafeEqual } from 'node:crypto'
import { isKnownDocumentType, tagsForDocument, type CacheTag } from './tags'

export const SIGNATURE_HEADER = 'sanity-webhook-signature'

/** Refuse absurd bodies before doing any crypto work. */
export const MAX_WEBHOOK_BYTES = 512 * 1024

export type SignatureFailure =
  | 'missing-secret'
  | 'missing-signature'
  | 'malformed-signature'
  | 'mismatch'

export type SignatureResult =
  | { ok: true }
  | { ok: false; reason: SignatureFailure }

/**
 * Verify a `sanity-webhook-signature` header.
 *
 * Sanity has shipped two header shapes, so both are accepted:
 *  - `<base64 hmac>` (classic)
 *  - `t=<unix-seconds>,v1=<base64 hmac>` (timestamped)
 *
 * Comparison is constant-time, and every candidate is length-checked first
 * because `timingSafeEqual` throws on a length mismatch (which would itself
 * leak information through a 500).
 */
export function verifySanitySignature(
  rawBody: string,
  signatureHeader: string | null | undefined,
  secret: string | undefined,
): SignatureResult {
  if (!secret) return { ok: false, reason: 'missing-secret' }
  if (!signatureHeader) return { ok: false, reason: 'missing-signature' }

  const candidates = extractCandidates(signatureHeader)
  if (candidates.length === 0) return { ok: false, reason: 'malformed-signature' }

  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('base64')

  for (const candidate of candidates) {
    if (constantTimeEquals(candidate, expected)) return { ok: true }
  }
  return { ok: false, reason: 'mismatch' }
}

/**
 * Pull the base64 digest out of either supported header shape.
 *
 * The timestamped form is accepted without a freshness window: Sanity does not
 * publish a signing timestamp contract we can rely on for replay protection,
 * and adding an unverifiable check would be security theatre. Replay is
 * harmless here — the worst case is re-invalidating a cache.
 */
function extractCandidates(header: string): string[] {
  const trimmed = header.trim()
  if (!trimmed) return []

  if (trimmed.includes('=') && trimmed.includes(',')) {
    return trimmed
      .split(',')
      .map((part) => part.trim())
      .filter((part) => part.startsWith('v1='))
      .map((part) => part.slice('v1='.length))
      .filter(Boolean)
  }

  return [trimmed]
}

function constantTimeEquals(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8')
  const bBuf = Buffer.from(b, 'utf8')
  if (aBuf.length !== bBuf.length) return false
  return timingSafeEqual(aBuf, bBuf)
}

export interface RevalidationPlan {
  /** Tags to purge, de-duplicated and stable. */
  tags: CacheTag[]
  /** Document type from the payload, if present. */
  type: string | null
  /** Document id, echoed back so the editor can identify what changed. */
  documentId: string | null
  /** Document slug, when the payload carries one. */
  slug: string | null
  /** True when the type was not recognised and the broad fallback was used. */
  usedFallback: boolean
}

/**
 * Turn a webhook payload into the set of tags to purge.
 *
 * Unknown document types intentionally fall back to the always-on tags rather
 * than being ignored, so a schema added after this file was written can never
 * be silently uncacheable.
 */
export function planRevalidation(payload: unknown): RevalidationPlan {
  const body = isRecord(payload) ? payload : {}
  const type = typeof body._type === 'string' ? body._type : null
  const documentId = typeof body._id === 'string' ? body._id : null
  const slug = readSlug(body)

  const tags = tagsForDocument(body)
  // "Fallback used" means the mapping table did not have a deliberate entry for
  // this type, so only the always-on tags were purged. Reported so an operator
  // can notice a new document type that needs a real mapping.
  const usedFallback = !isKnownDocumentType(type)

  return { tags, type, documentId, slug, usedFallback }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readSlug(body: Record<string, unknown>): string | null {
  const slug = body.slug
  if (typeof slug === 'string') return slug
  if (isRecord(slug) && typeof slug.current === 'string') return slug.current
  return null
}
