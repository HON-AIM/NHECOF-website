import { describe, it, expect, beforeEach, vi, afterEach, type MockInstance } from 'vitest'

import { POST } from '../src/app/api/analytics/route'
import { ANALYTICS_EVENTS } from '../src/lib/analytics/events'

/**
 * The relay is the only place the event schema is enforced for custom events,
 * so it is the thing that stops a future call site from shipping personal data
 * to a vendor. These tests treat the server as the trust boundary: the client
 * is assumed to be hostile or buggy.
 */

function request(body: unknown): Request {
  return new Request('http://localhost:3000/api/analytics', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/analytics', () => {
  let logSpy: MockInstance<(...args: unknown[]) => void>
  let fetchSpy: MockInstance<typeof fetch>
  let originalProvider: string | undefined
  let originalHost: string | undefined

  beforeEach(() => {
    logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response(''))
    // Snapshot rather than assume: leaking a mutated env var into another
    // test file makes failures depend on execution order, which is the hardest
    // kind of test bug to diagnose later.
    originalProvider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER
    originalHost = process.env.NEXT_PUBLIC_ANALYTICS_HOST
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'none'
    delete process.env.NEXT_PUBLIC_ANALYTICS_HOST
  })

  afterEach(() => {
    logSpy.mockRestore()
    fetchSpy.mockRestore()

    if (originalProvider === undefined) delete process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER
    else process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = originalProvider

    if (originalHost === undefined) delete process.env.NEXT_PUBLIC_ANALYTICS_HOST
    else process.env.NEXT_PUBLIC_ANALYTICS_HOST = originalHost
  })

  it('accepts a known event and records it', async () => {
    const res = await POST(request({ name: 'search_performed', properties: { queryLength: 12, resultCount: 4 } }))

    expect(res.status).toBe(204)
    expect(logSpy).toHaveBeenCalledOnce()
    expect(logSpy.mock.calls[0][0]).toContain('event=search_performed')
    expect(logSpy.mock.calls[0][0]).toContain('queryLength')
  })

  it('rejects an event name that is not in the schema', async () => {
    const res = await POST(request({ name: 'definitely_not_a_real_event' }))
    expect(res.status).toBe(400)
    expect(logSpy).not.toHaveBeenCalled()
  })

  it('strips properties that are not in the schema, even when the client sends them', async () => {
    await POST(
      request({
        name: 'search_performed',
        properties: {
          queryLength: 8,
          resultCount: 2,
          // None of these exist in the schema. A buggy or hostile client could
          // otherwise attach anything it liked.
          email: 'someone@example.com',
          query: 'my husband has diabetes',
        },
      }),
    )

    const logged = logSpy.mock.calls[0][0] as string
    // Assert on the parsed key set, not on substrings: "queryLength" contains
    // the substring "query", so a naive not.toContain('query') would fail for
    // the wrong reason and a sloppier version could pass for the wrong reason.
    const json = JSON.parse(logged.slice(logged.indexOf('{'), logged.lastIndexOf('}') + 1))
    expect(Object.keys(json).sort()).toEqual(['queryLength', 'resultCount'])
    expect(JSON.stringify(json)).not.toContain('diabetes')
    expect(JSON.stringify(json)).not.toContain('someone@example.com')
  })

  it('rejects a payload with no name', async () => {
    const res = await POST(request({ properties: {} }))
    expect(res.status).toBe(400)
  })

  it('tolerates a missing properties object', async () => {
    const res = await POST(request({ name: 'article_viewed' }))
    expect(res.status).toBe(204)
  })

  it('does not forward to a vendor when the provider is none', async () => {
    await POST(request({ name: 'article_viewed', properties: { slug: 'eat-well' } }))
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('forwards to the vendor when the provider supports custom events', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'plausible'
    process.env.NEXT_PUBLIC_ANALYTICS_HOST = 'analytics.example.com'

    await POST(request({ name: 'resource_downloaded', properties: { slug: 'portion-guide' } }))

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, init] = fetchSpy.mock.calls[0] as [string, RequestInit]
    expect(url).toContain('analytics.example.com')
    expect(JSON.parse(init.body as string).name).toBe('resource_downloaded')
  })

  it('does not forward to Cloudflare, which has no public custom-event API', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'cloudflare'

    const res = await POST(request({ name: 'outreach_viewed', properties: { slug: 'ibadan-2025' } }))

    // Recorded server-side, but not forwarded: forwarding to a non-existent
    // endpoint would just be a request that always fails.
    expect(res.status).toBe(204)
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(logSpy.mock.calls[0][0]).toContain('outreach_viewed')
  })

  it('still records the event when the vendor request fails', async () => {
    process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER = 'umami'
    process.env.NEXT_PUBLIC_ANALYTICS_HOST = 'https://umami.example.com'
    fetchSpy.mockImplementation(async () => {
      throw new Error('vendor down')
    })

    const res = await POST(request({ name: 'newsletter_signup' }))

    expect(res.status).toBe(204)
    expect(logSpy).toHaveBeenCalledOnce()
  })

  it('every schema property is a non-free-text type', () => {
    // Regression guard: adding a `string` property type to the schema would
    // quietly reopen the door to personal data in analytics.
    for (const [event, spec] of Object.entries(ANALYTICS_EVENTS)) {
      for (const [property, propertySpec] of Object.entries(spec.properties)) {
        expect(
          ['slug', 'enum', 'number', 'boolean'],
          `${event}.${property} has type "${(propertySpec as { type: string }).type}"`,
        ).toContain((propertySpec as { type: string }).type)
      }
    }
  })
})
