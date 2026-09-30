/**
 * PII scrubbing for error monitoring (plan §14 Privacy Principles).
 *
 * Sentry is optional for launch, and if it is enabled it must not become a
 * back door around the privacy rules the rest of the site follows. NHECOF handles
 * health-adjacent content and collects form submissions containing names, email
 * addresses, phone numbers and community details, so an unscrubbed stack trace
 * or request body could ship all of that to a third party.
 *
 * Three layers of defence:
 *  1. `sendDefaultPii: false` (set in the Sentry init) so the SDK does not
 *     attach user context, IP addresses, cookies or request headers by default.
 *  2. This module scrubs anything that still leaks through — cookie values,
 *     `Authorization`, `Set-Cookie`, and any key that looks personal.
 *  3. `denyUrls` drops third-party script errors, which are noisy and can embed
 *     query strings containing search terms.
 *
 * Scrubbing is *redaction*, not removal: a matching value is replaced with
 * `[redacted]` so a developer can still see that a field existed and that the
 * code path touched it. That distinction matters when debugging a form bug.
 */

export const REDACTED = '[redacted]'

/** Header names whose values are never safe to transmit. */
const SENSITIVE_HEADERS = new Set([
  'authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-sanity-token',
  'proxy-authorization',
  'x-csrf-token',
  'x-forwarded-for',
  'x-real-ip',
])

/**
 * Key fragments that indicate personal or sensitive data. Matched
 * case-insensitively as substrings, so `contactEmail` and `contact_email` are
 * both caught.
 */
const SENSITIVE_KEY_FRAGMENTS = [
  'email',
  'password',
  'passwd',
  'secret',
  'token',
  'apikey',
  'api_key',
  'authorization',
  'phone',
  'telephone',
  'whatsapp',
  'address',
  'postcode',
  'zip',
  'dob',
  'birthdate',
  'nhs',
  'bmi',
  'diagnosis',
  'screening',
  'medical',
  'health',
  'consent',
  'signature',
  'coordinates',
  'latitude',
  'longitude',
  'location',
]

/** Query parameters that can carry personal data in a URL. */
const SENSITIVE_QUERY_PARAMS = new Set([
  'email',
  'e',
  'phone',
  'q',
  'query',
  'search',
  'name',
  'token',
  'secret',
  'code',
])

export function isSensitiveKey(key: string): boolean {
  const lower = key.toLowerCase()
  return SENSITIVE_KEY_FRAGMENTS.some((fragment) => lower.includes(fragment))
}

/**
 * Recursively redact personal data from an arbitrary value.
 *
 * Depth- and breadth-limited so a pathological payload cannot hang the error
 * reporter — which would turn a reporting tool into an availability risk.
 */
export function scrubValue(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (depth > 6) return REDACTED

  if (value === null || value === undefined) return value

  if (typeof value === 'string') {
    // Long free text is a likely place for a pasted name or number to hide.
    return value.length > 500 ? `${value.slice(0, 200)}…${REDACTED}` : value
  }

  if (typeof value === 'number' || typeof value === 'boolean') return value

  if (typeof value === 'function') return '[function]'

  if (typeof value !== 'object') return REDACTED

  if (seen.has(value)) return '[circular]'
  seen.add(value)

  if (Array.isArray(value)) {
    return value.slice(0, 50).map((item) => scrubValue(item, depth + 1, seen))
  }

  if (value instanceof Error) {
    return {
      name: value.name,
      message: value.message,
      // Stack frames can contain query strings in file URLs.
      stack: typeof value.stack === 'string' ? value.stack.split('\n').slice(0, 30).join('\n') : undefined,
    }
  }

  const out: Record<string, unknown> = {}
  for (const [key, item] of Object.entries(value as Record<string, unknown>).slice(0, 100)) {
    out[key] = isSensitiveKey(key) ? REDACTED : scrubValue(item, depth + 1, seen)
  }
  return out
}

/** Redact sensitive headers in place on a copy of the object. */
export function scrubHeaders(
  headers: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (!headers) return headers
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(headers)) {
    out[key] = SENSITIVE_HEADERS.has(key.toLowerCase()) ? REDACTED : scrubValue(value, 1)
  }
  return out
}

/**
 * Strip personal data from a URL, keeping the path and non-sensitive params.
 * Used for request breadcrumbs, which Sentry would otherwise send verbatim.
 */
export function scrubUrl(rawUrl: string): string {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    // Not a parseable absolute URL. A relative path is safe to keep as-is;
    // anything else is replaced entirely.
    return rawUrl.startsWith('/') ? rawUrl : REDACTED
  }

  /*
   * `new URL()` happily parses exotic schemes such as `javascript:` and
   * `data:`, so a successful parse is not sufficient evidence that this is a
   * real page URL. Only http(s) is ever legitimate in a breadcrumb, and
   * re-emitting a `javascript:` URL into a monitoring UI would itself be
   * unsafe if that UI ever renders it.
   */
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return REDACTED
  }

  for (const param of [...url.searchParams.keys()]) {
    if (SENSITIVE_QUERY_PARAMS.has(param.toLowerCase())) {
      url.searchParams.set(param, REDACTED)
    }
  }
  return url.toString()
}

/**
 * `beforeSend` for the Sentry client/server initialisers.
 *
 * Applied to every event and to the request context attached to it.
 */
export function scrubEvent<T extends { request?: { url?: string; headers?: Record<string, unknown> }; contexts?: Record<string, unknown>; extra?: Record<string, unknown>; user?: unknown }>(
  event: T,
): T {
  const scrubbed: T = { ...event }

  if (scrubbed.request) {
    scrubbed.request = {
      ...scrubbed.request,
      ...(scrubbed.request.url ? { url: scrubUrl(scrubbed.request.url) } : {}),
      ...(scrubbed.request.headers
        ? { headers: scrubHeaders(scrubbed.request.headers) }
        : {}),
    }
  }

  // `user` should never be populated (sendDefaultPii is false) but strip it if a
  // future code change starts setting it.
  if (scrubbed.user) delete (scrubbed as { user?: unknown }).user

  if (scrubbed.extra) {
    scrubbed.extra = scrubValue(scrubbed.extra) as Record<string, unknown>
  }

  if (scrubbed.contexts) {
    scrubbed.contexts = scrubValue(scrubbed.contexts) as Record<string, unknown>
  }

  return scrubbed
}

/** Third-party script errors to ignore, to reduce noise and query-string leaks. */
export const DENY_URLS = [
  // Cloudflare Turnstile challenge frames throw benign errors in some browsers.
  /^https:\/\/challenges\.cloudflare\.com/,
  // Cloudflare's own beacon.
  /^https:\/\/static\.cloudflareinsights\.com/,
  // Sanity's hosted Studio if it is ever embedded.
  /^https:\/\/.*\.sanity\.io\/build\//,
]

export function shouldIgnoreError(url: string | undefined): boolean {
  if (!url) return false
  return DENY_URLS.some((pattern) => pattern.test(url))
}
