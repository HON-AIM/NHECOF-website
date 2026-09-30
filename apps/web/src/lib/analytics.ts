/**
 * Privacy-conscious anonymous analytics (plan §17).
 *
 * Events only ever carry non-identifying details (paths, counts) — never
 * personal data. They are emitted as a structured console line that a future
 * logging pipeline can ship, and they must never throw or block rendering.
 */

export function logAnonymousEvent(
  eventName: string,
  payload?: Record<string, unknown>,
): void {
  try {
    console.log(`[analytics] ${eventName} ${JSON.stringify(payload ?? {})}`)
  } catch {
    // Analytics must never break a page render.
  }
}