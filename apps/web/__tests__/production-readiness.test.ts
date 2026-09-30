import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isSiteLive, buildRobots } from '../src/lib/seo/robots'
import { previewSecretMatches, safeRedirectPath, isPreviewConfigured } from '../src/lib/sanity/preview'
import { sanitiseEvent, ANALYTICS_EVENTS } from '../src/lib/analytics/events'
import {
  DENY_URLS,
  REDACTED,
  isSensitiveKey,
  scrubEvent,
  scrubHeaders,
  scrubUrl,
  scrubValue,
} from '../src/lib/monitoring/scrub'

describe('isSiteLive — indexing gates', () => {
  const KEYS = [
    'NEXT_PUBLIC_IS_LIVE',
    'VERCEL_ENV',
    'DISABLE_INDEXING',
  ] as const
  const saved: Record<string, string | undefined> = {}

  beforeEach(() => {
    for (const key of KEYS) saved[key] = process.env[key]
  })

  afterEach(() => {
    for (const key of KEYS) {
      if (saved[key] === undefined) delete process.env[key]
      else process.env[key] = saved[key]
    }
  })

  it('is not live without the launch flag', () => {
    process.env.NEXT_PUBLIC_IS_LIVE = 'false'
    process.env.VERCEL_ENV = 'production'
    expect(isSiteLive()).toBe(false)
  })

  it('is live on production when the flag is set', () => {
    process.env.NEXT_PUBLIC_IS_LIVE = 'true'
    process.env.VERCEL_ENV = 'production'
    expect(isSiteLive()).toBe(true)
  })

  it('refuses to index a preview deployment even if the launch flag is set there', () => {
    // The single most important guard: preview URLs are public and shareable,
    // so a mis-set flag must never be able to launch them.
    process.env.NEXT_PUBLIC_IS_LIVE = 'true'
    process.env.VERCEL_ENV = 'preview'
    expect(isSiteLive()).toBe(false)
  })

  it('refuses to index a branch build even if the launch flag is set there', () => {
    process.env.NEXT_PUBLIC_IS_LIVE = 'true'
    process.env.VERCEL_ENV = undefined
    delete process.env.VERCEL_ENV
    // No VERCEL_ENV means a non-Vercel host, where the explicit flag governs.
    expect(isSiteLive()).toBe(true)
  })

  it('honours DISABLE_INDEXING as an emergency override', () => {
    process.env.NEXT_PUBLIC_IS_LIVE = 'true'
    process.env.VERCEL_ENV = 'production'
    process.env.DISABLE_INDEXING = 'true'
    expect(isSiteLive()).toBe(false)
    expect(buildRobots({ isLive: isSiteLive() }).rules).toEqual([
      { userAgent: '*', disallow: '/' },
    ])
  })

  it('produces a disallow-all robots.txt when not live', () => {
    process.env.NEXT_PUBLIC_IS_LIVE = 'false'
    const robots = buildRobots({ isLive: isSiteLive(), baseUrl: 'https://nhecof.example' })
    expect(robots.rules).toEqual([{ userAgent: '*', disallow: '/' }])
    expect(robots.sitemap).toBeUndefined()
  })
})

describe('draft mode access control', () => {
  const saved = process.env.SANITY_PREVIEW_SECRET

  afterEach(() => {
    if (saved === undefined) delete process.env.SANITY_PREVIEW_SECRET
    else process.env.SANITY_PREVIEW_SECRET = saved
  })

  it('fails closed when the preview secret is not configured', () => {
    delete process.env.SANITY_PREVIEW_SECRET
    expect(isPreviewConfigured()).toBe(false)
    // The critical case: unset secret must not mean "no secret required".
    expect(previewSecretMatches('')).toBe(false)
    expect(previewSecretMatches(undefined)).toBe(false)
    expect(previewSecretMatches('anything')).toBe(false)
  })

  it('accepts only the exact secret', () => {
    process.env.SANITY_PREVIEW_SECRET = 'correct-horse-battery-staple'
    expect(previewSecretMatches('correct-horse-battery-staple')).toBe(true)
    expect(previewSecretMatches('wrong')).toBe(false)
    expect(previewSecretMatches('correct-horse-battery-stapl')).toBe(false)
    expect(previewSecretMatches('correct-horse-battery-staplee')).toBe(false)
    expect(previewSecretMatches(undefined)).toBe(false)
  })
})

describe('safeRedirectPath — open redirect prevention', () => {
  it('keeps same-origin relative paths', () => {
    expect(safeRedirectPath('/nutrition/articles/foo')).toBe('/nutrition/articles/foo')
  })

  it('normalises a bare slug to a path', () => {
    expect(safeRedirectPath('nutrition/articles/foo')).toBe('/nutrition/articles/foo')
  })

  it('rejects absolute and protocol-relative URLs', () => {
    expect(safeRedirectPath('https://evil.example/steal')).toBe('/')
    expect(safeRedirectPath('//evil.example/steal')).toBe('/')
    expect(safeRedirectPath('//evil.example')).toBe('/')
  })

  it('rejects a scheme-smuggled path', () => {
    expect(safeRedirectPath('/javascript:alert(1)')).toBe('/')
  })

  it('rejects traversal', () => {
    expect(safeRedirectPath('/../../etc/passwd')).toBe('/')
    expect(safeRedirectPath('/a/../../b')).toBe('/')
  })

  it('falls back for empty or missing input', () => {
    expect(safeRedirectPath(null)).toBe('/')
    expect(safeRedirectPath('')).toBe('/')
    expect(safeRedirectPath('   ')).toBe('/')
  })
})

describe('analytics privacy — no personal data leaves the browser', () => {
  it('drops an unknown event name entirely', () => {
    expect(sanitiseEvent('definitely_not_a_real_event', { a: 1 })).toBeNull()
  })

  it('drops properties that are not in the event schema', () => {
    const result = sanitiseEvent('article_viewed', {
      slug: 'eat-well',
      title: 'Eating well in Nigeria',
      email: 'someone@example.com',
    })
    expect(result?.properties).toEqual({ slug: 'eat-well' })
  })

  it('refuses to forward a raw search query', () => {
    // The query property does not exist on the schema, so it cannot be sent.
    const result = sanitiseEvent('search_performed', {
      query: 'my husband has diabetes',
      queryLength: 21,
      resultCount: 0,
    })
    expect(result?.properties).not.toHaveProperty('query')
    expect(result?.properties).toEqual({ queryLength: 21, resultCount: 0 })
  })

  it('drops enum values outside the allowed list rather than coercing them', () => {
    const result = sanitiseEvent('outreach_viewed', {
      slug: 'ibadan-2025',
      status: 'SOME_NEW_STATUS',
    })
    expect(result?.properties.status).toBeUndefined()
  })

  it('rejects a slug that is not a URL-safe slug', () => {
    expect(sanitiseEvent('article_viewed', { slug: 'Eat Well / Nigeria' })?.properties.slug).toBeUndefined()
    expect(sanitiseEvent('article_viewed', { slug: '../etc/passwd' })?.properties.slug).toBeUndefined()
  })

  it('rejects a non-boolean or non-number where the schema demands one', () => {
    const result = sanitiseEvent('article_viewed', {
      slug: 'ok-slug',
      hasReviewer: 'yes',
      readingTimeMinutes: 'six',
    })
    expect(result?.properties).toEqual({ slug: 'ok-slug' })
  })

  it('covers every plan-section-17 event with a schema', () => {
    for (const name of [
      'article_viewed',
      'food_profile_viewed',
      'search_performed',
      'filter_applied',
      'resource_downloaded',
      'outreach_viewed',
      'outreach_request_completed',
      'partnership_enquiry_completed',
      'volunteer_interest',
      'newsletter_signup',
    ]) {
      expect(ANALYTICS_EVENTS).toHaveProperty(name)
    }
  })

  it('defines no free-text string property on any event', () => {
    // A 'string' type would be an open door for personal data.
    for (const [name, spec] of Object.entries(ANALYTICS_EVENTS)) {
      for (const [key, prop] of Object.entries(spec.properties)) {
        expect(['slug', 'enum', 'number', 'boolean'], `${name}.${key}`).toContain(prop.type)
      }
    }
  })
})

describe('error monitoring PII scrubbing', () => {
  it('recognises personal-data key fragments', () => {
    for (const key of [
      'email',
      'contactEmail',
      'phone',
      'password',
      'apiKey',
      'diagnosis',
      'guardianConsentRecorded',
      'latitude',
    ]) {
      expect(isSensitiveKey(key), key).toBe(true)
    }
    expect(isSensitiveKey('slug')).toBe(false)
    expect(isSensitiveKey('title')).toBe(false)
  })

  it('redacts sensitive keys while preserving structure', () => {
    const scrubbed = scrubValue({
      slug: 'eat-well',
      email: 'someone@example.com',
      phone: '+2348012345678',
      nested: { apiKey: 'sk_live_abc', keep: 'visible' },
    }) as Record<string, unknown>

    expect(scrubbed.slug).toBe('eat-well')
    expect(scrubbed.email).toBe(REDACTED)
    expect(scrubbed.phone).toBe(REDACTED)
    expect((scrubbed.nested as Record<string, unknown>).apiKey).toBe(REDACTED)
    // Non-sensitive data survives, so the report is still useful for debugging.
    expect((scrubbed.nested as Record<string, unknown>).keep).toBe('visible')
  })

  it('redacts authorization and cookie headers', () => {
    const scrubbed = scrubHeaders({
      Authorization: 'Bearer secret-token',
      Cookie: '__prerender_bypass=abc',
      'Content-Type': 'application/json',
    })
    expect(scrubbed?.Authorization).toBe(REDACTED)
    expect(scrubbed?.Cookie).toBe(REDACTED)
    expect(scrubbed?.['Content-Type']).toBe('application/json')
  })

  it('strips sensitive query params from URLs but keeps the path', () => {
    const scrubbed = scrubUrl('https://nhecof.org/nutrition?q=sickle%20cell%20diet&page=2')
    expect(scrubbed).toContain('/nutrition')
    expect(scrubbed).toContain('page=2')
    expect(scrubbed).not.toContain('sickle')
  })

  it('replaces a non-relative, non-URL string rather than passing it through', () => {
    expect(scrubUrl('javascript:alert(1)')).toBe(REDACTED)
    expect(scrubUrl('/about')).toBe('/about')
  })

  it('strips a user object if a future change starts attaching one', () => {
    const event = scrubEvent({
      request: { url: 'https://nhecof.org/contact', headers: { Cookie: 'a=b' } },
      user: { email: 'someone@example.com' },
      extra: { email: 'someone@example.com', reference: 'NHECOF-123' },
    })
    expect(event.user).toBeUndefined()
    expect((event.extra as Record<string, unknown>).email).toBe(REDACTED)
    expect((event.extra as Record<string, unknown>).reference).toBe('NHECOF-123')
    expect(event.request?.url).not.toContain('Cookie')
  })

  it('survives circular references without hanging', () => {
    const cyclic: Record<string, unknown> = { name: 'x' }
    cyclic.self = cyclic
    expect(() => scrubValue(cyclic)).not.toThrow()
  })

  it('ignores benign third-party script errors', () => {
    expect(DENY_URLS.some((p) => p.test('https://challenges.cloudflare.com/abc'))).toBe(true)
    expect(DENY_URLS.some((p) => p.test('https://nhecof.org/boom'))).toBe(false)
  })
})
