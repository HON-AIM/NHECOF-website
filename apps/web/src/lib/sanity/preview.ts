/**
 * Draft-mode access control.
 *
 * The rule the plan sets is "drafts are never reachable from public URLs". That
 * is enforced in three independent layers, and all three must hold:
 *
 *  1. **Secret gate.** `/api/draft/enable` only sets the draft cookie when the
 *     caller presents `SANITY_PREVIEW_SECRET`.
 *  2. **Server-only credentials.** Draft reads use `SANITY_API_READ_TOKEN`,
 *     which has no `NEXT_PUBLIC_` prefix and is therefore never serialised into
 *     the client bundle. A visitor cannot fetch drafts because the browser
 *     never receives a credential that could.
 *  3. **Noindex + no-store.** The draft banner forces `noindex` on preview
 *     responses, and draft reads bypass the data cache entirely so a draft can
 *     never be cached and later served to the public.
 *
 * `SANITY_PREVIEW_SECRET` is deliberately distinct from
 * `SANITY_REVALIDATE_SECRET`, so exposing one does not expose the other.
 */

import { timingSafeEqual } from 'node:crypto'

/**
 * Constant-time secret comparison.
 *
 * Returns false for undefined/empty values so a misconfigured deployment fails
 * closed: an unset secret must never behave as "no secret required".
 */
export function previewSecretMatches(provided: string | null | undefined): boolean {
  const expected = process.env.SANITY_PREVIEW_SECRET
  if (!expected || !provided) return false

  const a = Buffer.from(provided, 'utf8')
  const b = Buffer.from(expected, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

/** True when the deployment has the secret set at all. */
export function isPreviewConfigured(): boolean {
  return Boolean(process.env.SANITY_PREVIEW_SECRET)
}

/**
 * Normalise the `slug` query parameter into a same-origin redirect path.
 *
 * The parameter is fully attacker-controlled, so it is validated rather than
 * trusted. Without this, `?slug=https://evil.example` would turn the preview
 * link into an open redirect that also forwards the draft cookie.
 */
export function safeRedirectPath(raw: string | null, fallback = '/'): string {
  if (!raw) return fallback

  let candidate = raw.trim()
  if (!candidate) return fallback

  // Accept a bare slug or a path and normalise to a leading slash.
  if (!candidate.startsWith('/')) {
    if (candidate.includes('://') || candidate.startsWith('//')) return fallback
    candidate = `/${candidate}`
  }

  // Reject protocol-relative and absolute URLs outright.
  if (candidate.startsWith('//')) return fallback
  if (/^\/[a-z][a-z0-9+.-]*:/i.test(candidate)) return fallback

  // Reject traversal.
  if (candidate.split('/').some((segment) => segment === '..')) return fallback

  return candidate
}

/** Short, non-sensitive message shown on a failed preview attempt. */
export const PREVIEW_DENIED_MESSAGE =
  'Preview link is invalid or expired. Ask the content manager for a fresh link.'
