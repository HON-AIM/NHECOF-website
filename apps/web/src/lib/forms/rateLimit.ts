import { Redis } from '@upstash/redis'
import { randomUUID } from 'node:crypto'
import { FORM_RATE_LIMIT } from '@/features/forms/constants'

/**
 * Sliding-window rate limiter (plan §9.2): e.g. 5 submissions per hour per
 * form per client IP hash.
 *
 * Production backends to Upstash Redis (a sorted set per key lets us count
 * events inside the current window and evict expired ones, giving a true
 * sliding window rather than a fixed reset). When either Upstash env var is
 * absent (local development / e2e) it transparently falls back to an
 * in-process windowed counter, so the routing logic is exercised the same way.
 */
export interface RateLimiter {
  /** Returns true when the submission may proceed, false when limited. */
  allow(formType: string, ipHash: string): Promise<boolean>
}

const WINDOW_MS = FORM_RATE_LIMIT.windowSeconds * 1000
const MAX = FORM_RATE_LIMIT.max

interface UpstashRedisClient {
  zremrangebyscore(key: string, min: number, max: number): Promise<unknown>
  zadd(key: string, member: { score: number; member: string }): Promise<unknown>
  zcard(key: string): Promise<number>
  pexpire(key: string, ms: number): Promise<unknown>
}

function rateKey(formType: string, ipHash: string): string {
  return `nhecof:forms:rate:${formType}:${ipHash}`
}

/** Exported for tests: the Redis client interface is injected, not constructed here. */
export class UpstashRateLimiter implements RateLimiter {
  private warnedUnavailable = false

  constructor(
    private redis: UpstashRedisClient,
    /** Used when Redis is configured but unreachable. */
    private fallback: RateLimiter,
  ) {}

  async allow(formType: string, ipHash: string): Promise<boolean> {
    const key = rateKey(formType, ipHash)
    const now = Date.now()
    const member = `${now}:${randomUUID()}`

    try {
      // Remove everything outside the current window, then count what remains.
      await this.redis.zremrangebyscore(key, 0, now - WINDOW_MS)
      const count = await this.redis.zcard(key)
      if (count >= MAX) return false

      // Record this attempt on the oldest-expiring slot shape: add + reset TTL.
      await this.redis.zadd(key, { score: now, member })
      await this.redis.pexpire(key, WINDOW_MS)
      return true
    } catch (error) {
      // A Redis outage must not become a 500. Failing closed would discard real
      // outreach requests from schools and churches whenever Upstash has an
      // incident, which is the worse outcome for this site: these forms are the
      // organisation's main contact channel. Degrading to the in-process window
      // keeps *some* limiting active, and Turnstile still gates bots
      // independently, so an outage costs weaker spam protection rather than
      // lost enquiries. Warn once, then stay quiet to avoid log spam.
      if (!this.warnedUnavailable) {
        this.warnedUnavailable = true
        console.warn(
          '[rate-limit] Upstash unavailable, falling back to the in-process window. ' +
            'Form submissions are still rate limited, but limits are per instance.',
          error instanceof Error ? error.message : error,
        )
      }
      return this.fallback.allow(formType, ipHash)
    }
  }
}

/** In-process sliding-window counter used when Upstash is not configured. */
class MemoryRateLimiter implements RateLimiter {
  private buckets = new Map<string, number[]>()

  async allow(formType: string, ipHash: string): Promise<boolean> {
    const key = rateKey(formType, ipHash)
    const now = Date.now()

    const hits = (this.buckets.get(key) ?? []).filter((t) => t > now - WINDOW_MS)
    if (hits.length >= MAX) {
      this.buckets.set(key, hits)
      return false
    }

    hits.push(now)
    this.buckets.set(key, hits)
    return true
  }
}

let limiter: RateLimiter | null = null

export function getRateLimiter(): RateLimiter {
  if (limiter) return limiter

  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (url && token) {
    limiter = new UpstashRateLimiter(new Redis({ url, token }), new MemoryRateLimiter())
  } else {
    limiter = new MemoryRateLimiter()
  }

  return limiter
}

/** Test helper: reset the cached limiter (used by route unit tests). */
export function resetRateLimiterForTest(): void {
  limiter = null
}