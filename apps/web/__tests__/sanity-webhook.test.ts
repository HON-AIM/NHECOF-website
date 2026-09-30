import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { createHmac } from 'node:crypto'
import {
  MAX_WEBHOOK_BYTES,
  SIGNATURE_HEADER,
  planRevalidation,
  verifySanitySignature,
} from '../src/lib/sanity/webhook'
import { CACHE_TAGS, isKnownDocumentType, tagsForDocument, tagsForRedirects } from '../src/lib/sanity/tags'

const SECRET = 'test-revalidate-secret'

function sign(body: string, secret = SECRET): string {
  return createHmac('sha256', secret).update(body, 'utf8').digest('base64')
}

describe('verifySanitySignature', () => {
  it('accepts the classic base64 header shape', () => {
    const body = JSON.stringify({ _type: 'article', _id: 'a1' })
    expect(verifySanitySignature(body, sign(body), SECRET)).toEqual({ ok: true })
  })

  it('accepts the timestamped t=...,v1=... header shape', () => {
    const body = JSON.stringify({ _type: 'quote' })
    const header = `t=${Math.floor(Date.now() / 1000)},v1=${sign(body)}`
    expect(verifySanitySignature(body, header, SECRET)).toEqual({ ok: true })
  })

  it('rejects a signature made with a different secret', () => {
    const body = JSON.stringify({ _type: 'article' })
    const result = verifySanitySignature(body, sign(body, 'wrong-secret'), SECRET)
    expect(result).toEqual({ ok: false, reason: 'mismatch' })
  })

  it('rejects a signature that does not match the body', () => {
    const result = verifySanitySignature(
      JSON.stringify({ _type: 'article' }),
      sign(JSON.stringify({ _type: 'quote' })),
      SECRET,
    )
    expect(result).toEqual({ ok: false, reason: 'mismatch' })
  })

  it('fails closed when the server secret is not configured', () => {
    const body = '{}'
    // A missing secret must never behave as "no secret required".
    expect(verifySanitySignature(body, sign(body, 'anything'), undefined)).toEqual({
      ok: false,
      reason: 'missing-secret',
    })
  })

  it('rejects a missing header', () => {
    expect(verifySanitySignature('{}', null, SECRET)).toEqual({
      ok: false,
      reason: 'missing-signature',
    })
  })

  it('rejects an empty header', () => {
    expect(verifySanitySignature('{}', '   ', SECRET)).toEqual({
      ok: false,
      reason: 'malformed-signature',
    })
  })

  it('rejects a truncated digest without throwing on a length mismatch', () => {
    // timingSafeEqual throws on length mismatch, which would leak via a 500.
    expect(verifySanitySignature('{}', 'abc', SECRET)).toEqual({
      ok: false,
      reason: 'mismatch',
    })
  })

  it('verifies against the raw body, so re-serialised JSON would fail', () => {
    // This is why the route reads text() before JSON.parse(). The body below has
    // non-canonical whitespace that JSON.parse+stringify would normalise away,
    // changing the bytes and therefore the digest.
    const raw = '{"_type":"article",  "_id":"a1"}'
    const reserialised = JSON.stringify(JSON.parse(raw))
    expect(reserialised).not.toBe(raw)
    expect(verifySanitySignature(raw, sign(raw), SECRET)).toEqual({ ok: true })
    expect(verifySanitySignature(reserialised, sign(raw), SECRET).ok).toBe(false)
  })

  it('exposes the expected header name and a sane size limit', () => {
    expect(SIGNATURE_HEADER).toBe('sanity-webhook-signature')
    expect(MAX_WEBHOOK_BYTES).toBeGreaterThan(1024)
  })
})

describe('tagsForDocument', () => {
  it('maps an article publish to the article-facing tags', () => {
    const tags = tagsForDocument({ _type: 'article' })
    expect(tags).toContain(CACHE_TAGS.articles)
    expect(tags).toContain(CACHE_TAGS.homepage)
    expect(tags).toContain(CACHE_TAGS.impact)
    expect(tags).toContain(CACHE_TAGS.sitemap)
  })

  it('maps a food profile publish to the food-facing tags', () => {
    const tags = tagsForDocument({ _type: 'foodProfile' })
    expect(tags).toContain(CACHE_TAGS.foods)
    expect(tags).not.toContain(CACHE_TAGS.articles)
  })

  it('maps an outreach publish to impact, because impact is computed from outreaches', () => {
    const tags = tagsForDocument({ _type: 'outreach' })
    expect(tags).toContain(CACHE_TAGS.outreaches)
    expect(tags).toContain(CACHE_TAGS.impact)
  })

  it('maps a quote publish to the quotes tag', () => {
    expect(tagsForDocument({ _type: 'quote' })).toContain(CACHE_TAGS.quotes)
  })

  it('maps a resource publish to the resources tag', () => {
    expect(tagsForDocument({ _type: 'resource' })).toContain(CACHE_TAGS.resources)
  })

  it('maps site settings to the shared shell tags', () => {
    const tags = tagsForDocument({ _type: 'siteSettings' })
    expect(tags).toContain(CACHE_TAGS.siteSettings)
    expect(tags).toContain(CACHE_TAGS.homepage)
    expect(tags).toContain(CACHE_TAGS.navigation)
  })

  it('invalidates people bylines on article, food and outreach pages', () => {
    const tags = tagsForDocument({ _type: 'person' })
    expect(tags).toContain(CACHE_TAGS.articles)
    expect(tags).toContain(CACHE_TAGS.foods)
    expect(tags).toContain(CACHE_TAGS.outreaches)
  })

  it('maps a homepage document to every tag its selections feed', () => {
    // Regression test. The `homepage` document was missing from the mapping
    // table, so editing the homepage's featured article or impact figures
    // purged only `sitemap` and the change never reached the live site. Found
    // by the tag-mapping E2E test, pinned here so it cannot come back.
    const tags = tagsForDocument({ _type: 'homepage' })

    expect(tags).toContain(CACHE_TAGS.homepage)
    expect(tags).toContain(CACHE_TAGS.articles)
    expect(tags).toContain(CACHE_TAGS.foods)
    expect(tags).toContain(CACHE_TAGS.outreaches)
    expect(tags).toContain(CACHE_TAGS.impact)
    expect(tags).toContain(CACHE_TAGS.quotes)
    expect(tags).toContain(CACHE_TAGS.resources)
    expect(tags).toContain(CACHE_TAGS.siteSettings)
    expect(isKnownDocumentType('homepage')).toBe(true)
  })

  it('treats every documented content type as known, so none falls back', () => {
    // A type that silently fell back would still revalidate the sitemap, which
    // is enough to look like it worked while leaving the page itself stale.
    for (const type of [
      'article',
      'foodProfile',
      'outreach',
      'quote',
      'resource',
      'homepage',
      'siteSettings',
      'impactMetric',
      'impactMilestone',
      'program',
      'person',
      'partner',
      'testimonial',
      'event',
      'page',
      'category',
      'tag',
    ]) {
      expect(isKnownDocumentType(type), `${type} should be a known type`).toBe(true)
      expect(tagsForDocument({ _type: type }), `${type} should not fall back`).not.toEqual([
        CACHE_TAGS.sitemap,
      ])
    }
  })

  it('always invalidates the sitemap', () => {
    for (const type of ['article', 'foodProfile', 'quote', 'outreach', 'resource', 'partner']) {
      expect(tagsForDocument({ _type: type })).toContain(CACHE_TAGS.sitemap)
    }
  })

  it('falls back to the sitemap for an unknown or missing type rather than ignoring it', () => {
    // Over-invalidate: a schema added later must never be silently uncacheable.
    expect(tagsForDocument({ _type: 'somethingNewIn2030' })).toEqual([CACHE_TAGS.sitemap])
    expect(tagsForDocument({})).toEqual([CACHE_TAGS.sitemap])
    expect(tagsForDocument(null)).toEqual([CACHE_TAGS.sitemap])
    expect(tagsForDocument(undefined)).toEqual([CACHE_TAGS.sitemap])
  })

  it('never returns duplicates', () => {
    const tags = tagsForDocument({ _type: 'article' })
    expect(new Set(tags).size).toBe(tags.length)
  })

  it('exposes a dedicated redirect tag set', () => {
    expect(tagsForRedirects()).toEqual([CACHE_TAGS.redirects, CACHE_TAGS.sitemap])
  })
})

describe('planRevalidation', () => {
  it('reads both slug shapes Sanity can send', () => {
    expect(planRevalidation({ _type: 'article', slug: { current: 'eat-well' } }).slug).toBe('eat-well')
    expect(planRevalidation({ _type: 'article', slug: 'eat-well' }).slug).toBe('eat-well')
    expect(planRevalidation({ _type: 'article' }).slug).toBeNull()
  })

  it('echoes the document type and id for editor debugging', () => {
    const plan = planRevalidation({ _type: 'foodProfile', _id: 'foods.1' })
    expect(plan.type).toBe('foodProfile')
    expect(plan.documentId).toBe('foods.1')
  })

  it('flags when the fallback was used', () => {
    expect(planRevalidation({ _type: 'brandNewType' }).usedFallback).toBe(true)
    expect(planRevalidation({ _type: 'article' }).usedFallback).toBe(false)
  })

  it('does not throw on a non-object payload', () => {
    for (const bad of [null, undefined, 'string', 42, [1, 2]]) {
      const plan = planRevalidation(bad)
      expect(plan.tags).toEqual([CACHE_TAGS.sitemap])
    }
  })
})

describe('webhook signature + tag integration', () => {
  const original = process.env.SANITY_REVALIDATE_SECRET

  beforeEach(() => {
    process.env.SANITY_REVALIDATE_SECRET = SECRET
  })

  afterEach(() => {
    if (original === undefined) delete process.env.SANITY_REVALIDATE_SECRET
    else process.env.SANITY_REVALIDATE_SECRET = original
  })

  it('produces a verifiable plan from a realistically shaped Sanity payload', () => {
    const body = JSON.stringify({
      _id: 'articles.drafts.abc',
      _type: 'article',
      slug: { _type: 'slug', current: 'moringa-benefits' },
      operation: 'publish',
    })

    expect(verifySanitySignature(body, sign(body), process.env.SANITY_REVALIDATE_SECRET)).toEqual({
      ok: true,
    })

    const plan = planRevalidation(JSON.parse(body))
    expect(plan.tags).toContain(CACHE_TAGS.articles)
    expect(plan.slug).toBe('moringa-benefits')
    expect(plan.usedFallback).toBe(false)
  })

  it('covers all eight plan-named content tags across representative publishes', () => {
    const required = [
      CACHE_TAGS.homepage,
      CACHE_TAGS.articles,
      CACHE_TAGS.foods,
      CACHE_TAGS.outreaches,
      CACHE_TAGS.impact,
      CACHE_TAGS.quotes,
      CACHE_TAGS.resources,
      CACHE_TAGS.siteSettings,
    ]
    const produced = new Set([
      ...tagsForDocument({ _type: 'article' }),
      ...tagsForDocument({ _type: 'foodProfile' }),
      ...tagsForDocument({ _type: 'outreach' }),
      ...tagsForDocument({ _type: 'quote' }),
      ...tagsForDocument({ _type: 'resource' }),
      ...tagsForDocument({ _type: 'siteSettings' }),
    ])
    for (const tag of required) {
      expect(produced.has(tag)).toBe(true)
    }
  })
})
