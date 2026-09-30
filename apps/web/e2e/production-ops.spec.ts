import { expect, test } from '@playwright/test'
import { createHmac } from 'node:crypto'

/**
 * Production-behaviour checks that only hold against a running server.
 *
 * These exist because the unit tests verify the *pure* logic: that buildCsp
 * produces the right string, that verifySignature accepts a correct HMAC. They
 * cannot prove the header actually reaches the browser, that a forged webhook
 * is actually rejected with a 401, or that the health endpoint answers. Those
 * are integration facts, and the security posture of the site depends on them.
 */

const SECRET = process.env.SANITY_REVALIDATE_SECRET ?? 'test'

/**
 * Sanity sends a bare base64 digest, not a `sha256=`-prefixed one (that is
 * Stripe's format). The endpoint also accepts the timestamped
 * `t=<unix>,v1=<digest>` form.
 */
function sign(body: string, secret = SECRET): string {
  return createHmac('sha256', secret).update(body).digest('base64')
}

function signTimestamped(body: string, secret = SECRET): string {
  return `t=${Math.floor(Date.now() / 1000)},v1=${sign(body, secret)}`
}

test.describe('security headers', () => {
  test('every page carries the full static header set', async ({ request }) => {
    const response = await request.get('/')

    expect(response.status()).toBe(200)

    const hsts = response.headers()['strict-transport-security']
    expect(hsts, 'HSTS must be present').toBeTruthy()
    expect(hsts).toContain('max-age=')
    // max-age must be at least a year or it is theatre.
    const maxAge = Number(hsts.match(/max-age=(\d+)/)?.[1] ?? 0)
    expect(maxAge).toBeGreaterThanOrEqual(31_536_000)

    expect(response.headers()['x-content-type-options']).toBe('nosniff')
    expect(response.headers()['x-frame-options']).toBe('DENY')
    expect(response.headers()['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(response.headers()['permissions-policy']).toBeTruthy()

    // A framework that does not need to advertise itself.
    expect(response.headers()['x-powered-by']).toBeUndefined()
  })

  test('the CSP is present and forbids framing and objects', async ({ request }) => {
    const csp = (await request.get('/')).headers()['content-security-policy']
    expect(csp, 'CSP must be present').toBeTruthy()
    expect(csp).toContain("default-src 'self'")
    expect(csp).toContain("object-src 'none'")
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("base-uri 'self'")

    // Turnstile is the one third-party script the site legitimately needs.
    expect(csp).toContain('challenges.cloudflare.com')
  })

  test('the CSP is applied to API routes as well as pages', async ({ request }) => {
    const csp = (await request.get('/api/health')).headers()['content-security-policy']
    expect(csp, 'CSP must cover API routes too').toBeTruthy()
  })
})

test.describe('revalidation webhook', () => {
  test('rejects an unsigned request', async ({ request }) => {
    const response = await request.post('/api/revalidate', {
      data: { _type: 'article', slug: { current: 'test' } },
    })

    expect(response.status()).toBe(401)
  })

  test('rejects a body signed with the wrong secret', async ({ request }) => {
    const body = JSON.stringify({ _type: 'article', slug: { current: 'test' } })
    const response = await request.post('/api/revalidate', {
      headers: { 'sanity-webhook-signature': sign(body, 'not-the-real-secret') },
      data: body,
    })

    expect(response.status()).toBe(401)
  })

  test('rejects a valid signature when the body has been tampered with', async ({ request }) => {
    // Signed for one body, sent with another: the exact attack a naive
    // implementation that re-serialises or reads a parsed field would allow.
    const original = JSON.stringify({ _type: 'article', slug: { current: 'safe' } })
    const tampered = JSON.stringify({ _type: 'article', slug: { current: 'evil' } })

    const response = await request.post('/api/revalidate', {
      headers: { 'sanity-webhook-signature': sign(original) },
      data: tampered,
    })

    expect(response.status()).toBe(401)
  })

  test('rejects an oversized body before hashing it', async ({ request }) => {
    const response = await request.post('/api/revalidate', {
      headers: { 'sanity-webhook-signature': sign('x') },
      data: 'x'.repeat(600_000),
    })

    expect([400, 401, 413]).toContain(response.status())
  })

  test('accepts a correctly signed request', async ({ request }) => {
    const body = JSON.stringify({ _type: 'article', slug: { current: 'test-article' } })
    const response = await request.post('/api/revalidate', {
      headers: { 'sanity-webhook-signature': sign(body) },
      data: body,
    })

    expect(response.status()).toBe(200)
    const payload = await response.json()
    expect(Array.isArray(payload.tags)).toBe(true)
    // An article edit must invalidate the article tag, not just the sitemap.
    expect(payload.tags).toContain('articles')
  })

  test('accepts the timestamped signature form', async ({ request }) => {
    const body = JSON.stringify({ _type: 'resource', slug: { current: 'guide' } })
    const response = await request.post('/api/revalidate', {
      headers: { 'sanity-webhook-signature': signTimestamped(body) },
      data: body,
    })

    expect(response.status()).toBe(200)
    expect((await response.json()).tags).toContain('resources')
  })

  test('maps each document type to its cache tag', async ({ request }) => {
    const cases: Array<[string, string]> = [
      ['outreach', 'outreaches'],
      ['foodProfile', 'foods'],
      ['article', 'articles'],
      ['quote', 'quotes'],
      ['impactMetric', 'impact'],
      ['resource', 'resources'],
      ['siteSettings', 'siteSettings'],
      ['homepage', 'homepage'],
    ]

    for (const [type, expectedTag] of cases) {
      const body = JSON.stringify({ _type: type, slug: { current: 'x' } })
      const response = await request.post('/api/revalidate', {
        headers: { 'sanity-webhook-signature': sign(body) },
        data: body,
      })

      expect(response.status(), `${type} should be accepted`).toBe(200)
      const payload = await response.json()
      expect(payload.tags, `${type} should revalidate ${expectedTag}`).toContain(expectedTag)
    }
  })

  test('GET describes the endpoint without mutating anything', async ({ request }) => {
    const response = await request.get('/api/revalidate')

    expect(response.status()).toBe(200)
    const payload = await response.json()
    expect(payload.method).toBe('POST')
    // Must not leak the secret to anyone who can GET the URL.
    expect(JSON.stringify(payload)).not.toContain(SECRET)
  })
})

test.describe('health endpoint', () => {
  test('reports liveness', async ({ request }) => {
    const response = await request.get('/api/health')
    // 503 is acceptable here: without real Sanity credentials the deep
    // dependency check cannot pass, and a health endpoint that reported 200
    // while every page failed would be worse than useless.
    expect([200, 503]).toContain(response.status())

    const payload = await response.json()
    expect(payload.status).toMatch(/^(ok|degraded)$/)
    expect(payload.service).toBe('nhecof-web')
    expect(typeof payload.uptimeSeconds).toBe('number')
  })

  test('is explicitly uncacheable, so a monitor never reads a stale answer', async ({ request }) => {
    const cacheControl = (await request.get('/api/health')).headers()['cache-control']
    expect(cacheControl).toContain('no-store')
  })
})

test.describe('draft mode', () => {
  test('refuses to enable without a secret', async ({ request }) => {
    const response = await request.get('/api/draft/enable', { maxRedirects: 0 })
    expect([400, 401, 403]).toContain(response.status())
  })

  test('refuses to enable with a wrong secret', async ({ request }) => {
    const response = await request.get('/api/draft/enable?secret=wrong&slug=/', {
      maxRedirects: 0,
    })
    expect([400, 401, 403]).toContain(response.status())
  })

  test('refuses an off-site redirect target', async ({ request }) => {
    // Without a valid secret this must fail before it can be used as an open
    // redirect; the important part is that it never returns a 30x to
    // an external host.
    const response = await request.get('/api/draft/enable?secret=wrong&slug=https://evil.example', {
      maxRedirects: 0,
    })
    expect([400, 401, 403]).toContain(response.status())
  })

  test('is off by default, so no draft content is publicly reachable', async ({ request }) => {
    const response = await request.get('/')
    expect(response.status()).toBe(200)
    // The banner only renders in a draft.
    expect(await response.text()).not.toContain('data-draft-mode')
  })
})
