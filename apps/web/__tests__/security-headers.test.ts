import { describe, it, expect } from 'vitest'
import { buildCsp, parseCsp, analyticsConnectOrigins } from '../src/lib/security/csp'
import { SECURITY_HEADERS, HSTS_MAX_AGE } from '../src/lib/security/headers'

function headerMap(): Record<string, string> {
  return Object.fromEntries(SECURITY_HEADERS.map((h) => [h.key.toLowerCase(), h.value]))
}

describe('static security headers', () => {
  const headers = headerMap()

  it('sets HSTS with a two-year max-age, includeSubDomains and preload', () => {
    const hsts = headers['strict-transport-security']
    expect(hsts).toContain(`max-age=${HSTS_MAX_AGE}`)
    expect(hsts).toContain('includeSubDomains')
    expect(hsts).toContain('preload')
    // Two years, per preloading guidance.
    expect(HSTS_MAX_AGE).toBeGreaterThanOrEqual(63_072_000)
  })

  it('sets nosniff', () => {
    expect(headers['x-content-type-options']).toBe('nosniff')
  })

  it('sets a Referrer-Policy that does not leak internal paths cross-origin', () => {
    // strict-origin-* is the load-bearing property: the older default
    // (origin-when-cross-origin) leaks full paths to every external host.
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
  })

  it('denies framing and declares it in two independent headers', () => {
    expect(headers['x-frame-options']).toBe('DENY')
    const csp = parseCsp(buildCsp({ nonce: 'abc' }))
    expect(csp['frame-ancestors']).toEqual(["'none'"])
  })

  it('sets a Permissions-Policy that denies every unused capability', () => {
    const policy = headers['permissions-policy']
    for (const feature of ['camera', 'microphone', 'geolocation', 'payment', 'usb']) {
      expect(policy).toContain(`${feature}=()`)
    }
  })

  it('does not set a static CSP, which would overwrite the per-request nonce', () => {
    expect(headers).not.toHaveProperty('content-security-policy')
  })
})

describe('Content-Security-Policy', () => {
  it('uses a per-request nonce and strict-dynamic for scripts', () => {
    const csp = parseCsp(buildCsp({ nonce: 'NONCE123' }))
    expect(csp['script-src']).toContain("'nonce-NONCE123'")
    expect(csp['script-src']).toContain("'strict-dynamic'")
  })

  it('generates a different nonce-relevant policy per request', () => {
    expect(buildCsp({ nonce: 'a' })).not.toBe(buildCsp({ nonce: 'b' }))
  })

  it('never allows unsafe-inline for scripts', () => {
    for (const nonce of ['a', 'b', undefined]) {
      const scriptSrc = parseCsp(buildCsp({ nonce }))['script-src']
      expect(scriptSrc).not.toContain("'unsafe-inline'")
    }
  })

  it('only allows unsafe-eval in development', () => {
    expect(parseCsp(buildCsp({ nonce: 'a', isDev: true }))['script-src']).toContain("'unsafe-eval'")
    expect(parseCsp(buildCsp({ nonce: 'a', isDev: false }))['script-src']).not.toContain("'unsafe-eval'")
  })

  it('locks down the dangerous object and base directives', () => {
    const csp = parseCsp(buildCsp({ nonce: 'a' }))
    expect(csp['object-src']).toEqual(["'none'"])
    expect(csp['base-uri']).toEqual(["'self'"])
    expect(csp['form-action']).toEqual(["'self'"])
    expect(csp['default-src']).toEqual(["'self'"])
  })

  it('allows the Sanity CDN for images only where it is needed', () => {
    const csp = parseCsp(buildCsp({ nonce: 'a' }))
    expect(csp['img-src']).toContain('https://cdn.sanity.io')
    // The CDN must not be allowed to serve scripts.
    expect(csp['script-src']).not.toContain('https://cdn.sanity.io')
  })

  it('always allows Turnstile for the script, frame and connection', () => {
    const csp = parseCsp(buildCsp({ nonce: 'a' }))
    expect(csp['script-src']).toContain('https://challenges.cloudflare.com')
    expect(csp['frame-src']).toContain('https://challenges.cloudflare.com')
    expect(csp['connect-src']).toContain('https://challenges.cloudflare.com')
  })

  it('adds no third-party script origins when analytics are disabled', () => {
    const csp = parseCsp(buildCsp({ nonce: 'a', analyticsProvider: 'none' }))
    expect(csp['script-src']).not.toContain('cloudflareinsights')
    expect(analyticsConnectOrigins({ analyticsProvider: 'none' })).toEqual([])
  })

  it('allows exactly the chosen analytics host, not a wildcard', () => {
    const csp = parseCsp(
      buildCsp({ nonce: 'a', analyticsProvider: 'plausible', analyticsHost: 'nhecof.org' }),
    )
    expect(csp['script-src']).toContain('https://nhecof.org')
    expect(csp['connect-src']).toContain('https://nhecof.org')
    expect(csp['script-src']).not.toContain('*')
  })

  it('adds no Sentry origin when no DSN is configured', () => {
    const original = process.env.SENTRY_DSN
    delete process.env.SENTRY_DSN
    const csp = parseCsp(buildCsp({ nonce: 'a' }))
    expect(csp['script-src'].some((v) => v.includes('sentry'))).toBe(false)
    if (original) process.env.SENTRY_DSN = original
  })

  it('always upgrades insecure requests', () => {
    expect(parseCsp(buildCsp({ nonce: 'a' }))).toHaveProperty('upgrade-insecure-requests')
  })

  it('emits a single-line policy parseable by a browser', () => {
    const policy = buildCsp({ nonce: 'a' })
    expect(policy).not.toMatch(/\n/)
    expect(policy).not.toMatch(/;\s*;/)
    expect(policy.endsWith(';')).toBe(false)
  })
})
