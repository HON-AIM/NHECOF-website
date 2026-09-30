/**
 * Content-Security-Policy construction.
 *
 * Built as a pure function so the policy can be unit tested, and so the
 * third-party allowlist is derived from the same environment variables that
 * configure the analytics and error trackers. Deriving rather than hard-coding
 * matters: a hard-coded host list silently stops working (or silently permits a
 * host nobody chose) when the provider changes.
 *
 * Design notes
 * ------------
 * - **Script nonces.** `script-src` uses a per-request nonce plus
 *   `strict-dynamic`. Under CSP Level 3 that makes a host allowlist redundant
 *   for script loading: a script trusted via the nonce may load further scripts.
 *   The explicit hosts remain for older browsers. `'self'` is kept as a
 *   fallback; the nonce is what Next.js attaches to its own bundles.
 * - **`style-src 'unsafe-inline'`.** Kept deliberately. Next.js/Tailwind emit
 *   inline `<style>` and style attributes, and a nonce cannot be applied to
 *   inline style *attributes*. CSS injection is a materially lower risk than
 *   script injection, and dropping this would break the entire design system.
 *   Documented as an accepted, narrowed exception.
 * - **`frame-ancestors 'none'`** rather than relying only on `X-Frame-Options`,
 *   because framing protection is a CSP-native control and XFO is ignored by
 *   some browsers when CSP is present.
 */

export interface CspOptions {
  /** Per-request base64 nonce. Omit for a policy without script noncing. */
  nonce?: string
  /** Allow `'unsafe-eval'`; required by React Fast Refresh in development. */
  isDev?: boolean
  /** Analytics hostname, e.g. `nhecof.org`. */
  analyticsHost?: string
  /** Which analytics provider is configured. */
  analyticsProvider?: string
}

/** Sanity's image and API hosts. Needed for images, queries and uploads. */
export const SANITY_CDN = 'https://cdn.sanity.io'
export const SANITY_API = 'https://*.api.sanity.io'
export const SANITY_UPLOADS = 'https://*.apicdn.sanity.io'

/** Cloudflare Turnstile: the widget script plus the challenge iframe. */
export const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com'
export const TURNSTILE_FRAME = 'https://challenges.cloudflare.com'

/** Sentry browser SDK ingestion and tunnel hosts. */
export const SENTRY_ENVELOPE = 'https://*.ingest.sentry.io'
export const SENTRY_TUNNEL = 'https://*.o*.ingest.sentry.io'

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function hostToOrigin(host: string): string {
  const trimmed = host.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

/**
 * Origins that may receive `connect-src` traffic, derived from the configured
 * analytics provider.
 */
export function analyticsConnectOrigins(options: CspOptions): string[] {
  const provider = options.analyticsProvider
  if (!provider || provider === 'none') return []
  if (provider === 'plausible') {
    // Plausible supports a custom domain on the paid plan.
    return options.analyticsHost ? [hostToOrigin(options.analyticsHost)] : []
  }
  if (provider === 'umami') {
    return options.analyticsHost ? [hostToOrigin(options.analyticsHost)] : []
  }
  if (provider === 'cloudflare') {
    // The beacon posts to the site's own origin; Cloudflare's Web Analytics
    // script is served from static.cloudflareinsights.com.
    return ['https://cloudflareinsights.com', 'https://static.cloudflareinsights.com']
  }
  return []
}

export function analyticsScriptOrigins(options: CspOptions): string[] {
  const provider = options.analyticsProvider
  if (!provider || provider === 'none') return []
  if (provider === 'cloudflare') return ['https://static.cloudflareinsights.com']
  if (provider === 'plausible' || provider === 'umami') {
    return options.analyticsHost ? [hostToOrigin(options.analyticsHost)] : []
  }
  return []
}

/**
 * Build the full policy string.
 *
 * Returned in the conventional `directive value; directive value` form, with
 * multiple spaces collapsed, so it can be set as a single header.
 */
export function buildCsp(options: CspOptions = {}): string {
  const { nonce, isDev = false } = options
  const analyticsScripts = analyticsScriptOrigins(options)
  const analyticsConnects = analyticsConnectOrigins(options)
  // Must be the SAME variable the browser SDK reads. The client provider checks
  // NEXT_PUBLIC_SENTRY_DSN; keying this off SENTRY_DSN instead meant a
  // deployment configured only with the public DSN shipped a client that tried
  // to report, and the CSP blocked it. Silent, and exactly the failure this
  // policy exists to prevent.
  const sentryEnabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN)

  const scriptSrc = unique([
    "'self'",
    ...(nonce ? [`'nonce-${nonce}'`, "'strict-dynamic'"] : []),
    ...(isDev ? ["'unsafe-eval'"] : []),
    TURNSTILE_SCRIPT,
    ...analyticsScripts,
    ...(sentryEnabled ? [SENTRY_ENVELOPE, SENTRY_TUNNEL] : []),
  ])

  const connectSrc = unique([
    "'self'",
    SANITY_API,
    SANITY_CDN,
    TURNSTILE_SCRIPT,
    ...analyticsConnects,
    ...(sentryEnabled ? [SENTRY_ENVELOPE, SENTRY_TUNNEL] : []),
  ])

  const directives: Array<[string, string[]]> = [
    ['default-src', ["'self'"]],
    ['base-uri', ["'self'"]],
    ['object-src', ["'none'"]],
    ['frame-ancestors', ["'none'"]],
    ['form-action', ["'self'"]],
    ['script-src', scriptSrc],
    ['style-src', ["'self'", "'unsafe-inline'"]],
    ['img-src', ["'self'", 'data:', 'blob:', SANITY_CDN]],
    ['font-src', ["'self'", 'data:']],
    ['connect-src', connectSrc],
    ['frame-src', unique([TURNSTILE_FRAME, ...analyticsFrames(options)])],
    ['manifest-src', ["'self'"]],
    ['worker-src', ["'self'", 'blob:']],
    // Block requests to private-network ranges (SSRF hardening for the browser).
    ['upgrade-insecure-requests', []],
  ]

  return directives
    .map(([name, values]) => (values.length ? `${name} ${values.join(' ')}` : name))
    .join('; ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function analyticsFrames(options: CspOptions): string[] {
  const provider = options.analyticsProvider
  if (provider === 'umami' && options.analyticsHost) {
    return [hostToOrigin(options.analyticsHost)]
  }
  return []
}

/**
 * Parse a policy string back into a directive map. Used by tests and by the
 * launch checklist evidence script, so the shipped header can be asserted
 * against the same expectations as the source.
 */
export function parseCsp(policy: string): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const part of policy.split(';')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const [name, ...values] = trimmed.split(/\s+/)
    if (!name) continue
    out[name] = values
  }
  return out
}
