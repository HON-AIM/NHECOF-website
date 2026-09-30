/**
 * Static security headers (plan §14 Security Controls).
 *
 * The Content-Security-Policy is intentionally absent — it is per-request and
 * nonce-bearing, so it is set in `src/middleware.ts`. Mixing the two would
 * overwrite the nonce with a static value and block every Next.js script.
 *
 * Kept in its own module so the exact header set can be asserted in unit tests
 * and printed by the launch-checklist evidence script, rather than being an
 * opaque array inside `next.config.ts` that nobody re-reads.
 */

export const HSTS_MAX_AGE = 63_072_000 // 2 years
export const HSTS_INCLUDE_SUBDOMAINS = true
export const HSTS_PRELOAD = true

export const SECURITY_HEADERS: Array<{ key: string; value: string }> = [
  /*
   * HTTP Strict Transport Security.
   *
   * `preload` is included because the apex domain is expected to be HTTPS-only
   * (plan §15 / DNS checklist). Before submitting to the HSTS preload list,
   * confirm every current subdomain supports HTTPS — a preload is effectively
   * irreversible for a year and will brick any plain-HTTP host.
   */
  {
    key: 'Strict-Transport-Security',
    value: [
      `max-age=${HSTS_MAX_AGE}`,
      ...(HSTS_INCLUDE_SUBDOMAINS ? ['includeSubDomains'] : []),
      ...(HSTS_PRELOAD ? ['preload'] : []),
    ].join('; '),
  },
  /*
   * Stops MIME-type sniffing turning a user-supplied file into executable
   * content. This is especially relevant here because the site serves
   * downloadable PDFs and images from `/resources/.../download`.
   */
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  /*
   * Legacy framing defence. `frame-ancestors 'none'` in the CSP is the modern
   * control and takes precedence; this is kept for browsers that predate CSP
   * framing directives.
   */
  { key: 'X-Frame-Options', value: 'DENY' },
  /*
   * Limits how much URL information is leaked to third parties.
   *
   * `strict-origin-when-cross-origin` is the pragmatic default: same-origin
   * requests keep the full path (needed for internal analytics), while
   * cross-origin requests send only the origin, so a shared resource link to a
   * Sanity CDN image or a Resend-hosted PDF does not expose internal article
   * URLs. `origin-when-cross-origin` (the older default) would leak the full
   * path to every external host.
   */
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  /*
   * Restricts powerful browser features the site never uses. Every entry is a
   * denial: the fewer capabilities a compromised page can reach, the smaller the
   * blast radius.
   *
   * - camera/microphone/geolocation : no scanning or media capture
   * - payment                        : no payments before launch readiness
   * - usb                            : no device access
   * - interest-cohort                : not a FLoC-based tracker
   *
   * Note `fullscreen` is intentionally omitted: it is not currently used, but
   * denying it outright would need re-checking if a video player is added.
   */
  {
    key: 'Permissions-Policy',
    value: [
      'camera=()',
      'microphone=()',
      'geolocation=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'accelerometer=()',
      'gyroscope=()',
      'display-capture=()',
      'browsing-topics=()',
      'publickey-credentials-create=()',
    ].join(', '),
  },
  /*
   * Cross-origin opener isolation is not set: it requires `COOP: same-origin`,
   * which breaks OAuth-style popups and Sanity's login flow in embedded
   * contexts. Deliberately omitted and noted here so it is not "fixed" blindly.
   */
]
