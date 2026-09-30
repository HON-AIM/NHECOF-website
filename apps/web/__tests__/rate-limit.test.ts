import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { UpstashRateLimiter, type RateLimiter } from '../src/lib/forms/rateLimit'
import { FORM_RATE_LIMIT } from '@/features/forms/constants'

/**
 * The limiter is a resilience boundary, not just a counter: a Redis outage
 * previously surfaced as an unhandled rejection and turned every form
 * submission into a 500. These tests pin the degraded-but-available
 * behaviour, so it cannot regress silently.
 *
 * A stub client is injected rather than pointing at a real unreachable host,
 * because the Upstash SDK retries with backoff internally, which would make
 * these tests slow and timing-dependent.
 */
describe('UpstashRateLimiter', () => {
  let warn: ReturnType<typeof vi.fn>

  beforeEach(() => {
    warn = vi.fn()
    vi.spyOn(console, 'warn').mockImplementation(warn)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  function failingClient(error = new Error('ECONNREFUSED')) {
    return {
      zremrangebyscore: vi.fn().mockRejectedValue(error),
      zadd: vi.fn().mockRejectedValue(error),
      zcard: vi.fn().mockRejectedValue(error),
      pexpire: vi.fn().mockRejectedValue(error),
    }
  }

  it('allows the request instead of throwing when Redis is unreachable', async () => {
    const limiter = new UpstashRateLimiter(failingClient(), { allow: async () => true })
    await expect(limiter.allow('contact', 'ip-hash')).resolves.toBe(true)
  })

  it('honours the fallback decision when Redis is unreachable', async () => {
    const limiter = new UpstashRateLimiter(failingClient(), { allow: async () => false })
    await expect(limiter.allow('contact', 'ip-hash')).resolves.toBe(false)
  })

  it('keeps rate limiting during an outage by using the fallback window', async () => {
    // A counter fallback, standing in for the real in-process window.
    let hits = 0
    const fallback: RateLimiter = {
      allow: async () => {
        hits += 1
        return hits <= FORM_RATE_LIMIT.max
      },
    }
    const limiter = new UpstashRateLimiter(failingClient(), fallback)

    const decisions: boolean[] = []
    for (let i = 0; i < FORM_RATE_LIMIT.max + 3; i += 1) {
      decisions.push(await limiter.allow('contact', 'ip-hash'))
    }
    // An outage degrades the limiter, it does not disable it.
    expect(decisions.slice(0, FORM_RATE_LIMIT.max).every((d) => d === true)).toBe(true)
    expect(decisions.slice(FORM_RATE_LIMIT.max).every((d) => d === false)).toBe(true)
  })

  it('does not record a hit in Redis after an error', async () => {
    const client = failingClient()
    const limiter = new UpstashRateLimiter(client, { allow: async () => true })
    await limiter.allow('contact', 'ip-hash')
    expect(client.zadd).not.toHaveBeenCalled()
  })

  it('warns once about the outage rather than on every submission', async () => {
    const limiter = new UpstashRateLimiter(failingClient(), { allow: async () => true })
    await limiter.allow('contact', 'a')
    await limiter.allow('contact', 'b')
    await limiter.allow('contact', 'c')
    expect(warn).toHaveBeenCalledTimes(1)
  })

  it('enforces the limit against Redis when it is healthy', async () => {
    let count = 0
    const client = {
      zremrangebyscore: vi.fn().mockResolvedValue(1),
      zadd: vi.fn().mockImplementation(async () => {
        count += 1
        return 1
      }),
      zcard: vi.fn().mockImplementation(async () => count),
      pexpire: vi.fn().mockResolvedValue(1),
    }
    const fallback: RateLimiter = { allow: vi.fn().mockResolvedValue(true) }
    const limiter = new UpstashRateLimiter(client, fallback)

    for (let i = 0; i < FORM_RATE_LIMIT.max; i += 1) {
      await expect(limiter.allow('contact', 'ip-hash')).resolves.toBe(true)
    }
    await expect(limiter.allow('contact', 'ip-hash')).resolves.toBe(false)
    // A healthy limiter must never consult the fallback.
    expect(fallback.allow).not.toHaveBeenCalled()
  })
})

describe('getRateLimiter selection', () => {
  const originalWarn = console.warn
  let envBackup: Record<string, string | undefined>

  beforeEach(() => {
    vi.resetModules()
    envBackup = {
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    }
  })

  afterEach(() => {
    for (const [key, value] of Object.entries(envBackup)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    console.warn = originalWarn
    vi.restoreAllMocks()
  })

  it('falls back to the in-process window when Upstash is unconfigured', async () => {
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    const { getRateLimiter, resetRateLimiterForTest } = await import('../src/lib/forms/rateLimit')
    resetRateLimiterForTest()

    const limiter = getRateLimiter()
    for (let i = 0; i < FORM_RATE_LIMIT.max; i += 1) {
      await expect(limiter.allow('contact', 'ip-hash')).resolves.toBe(true)
    }
    await expect(limiter.allow('contact', 'ip-hash')).resolves.toBe(false)
    // A different form type has its own budget.
    await expect(limiter.allow('outreach', 'ip-hash')).resolves.toBe(true)
    // A different client has its own budget.
    await expect(limiter.allow('contact', 'other-ip')).resolves.toBe(true)
  })
})
