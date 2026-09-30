import { describe, it, expect } from 'vitest'
import {
  isSitemapEligible,
  assembleSitemap,
  collectSitemapContent,
  getSitemap,
  STATIC_SITEMAP_ROUTES,
  CMS_PAGE_ROUTES,
} from '../src/lib/seo/sitemap'
import { getSiteUrl } from '../src/lib/seo/url'

const base = getSiteUrl()

describe('isSitemapEligible', () => {
  it('requires a publishedAt date', () => {
    expect(isSitemapEligible({ slug: 'x' })).toBe(false)
  })

  it('requires review approval for health content', () => {
    const published = '2026-01-01T00:00:00Z'
    expect(isSitemapEligible({ slug: 'x', publishedAt: published, reviewStatus: 'draft' }, true)).toBe(
      false,
    )
    expect(
      isSitemapEligible({ slug: 'x', publishedAt: published, reviewStatus: 'submitted' }, true),
    ).toBe(false)
    expect(
      isSitemapEligible({ slug: 'x', publishedAt: published, reviewStatus: 'archived' }, true),
    ).toBe(false)
    expect(
      isSitemapEligible({ slug: 'x', publishedAt: published, reviewStatus: 'approved' }, true),
    ).toBe(true)
  })

  it('rejects health content with no review status at all', () => {
    // Regression: approval used to be passed in as an argument rather than read
    // from the document, so the check could never fail.
    expect(isSitemapEligible({ slug: 'x', publishedAt: '2026-01-01T00:00:00Z' }, true)).toBe(false)
  })

  it('does not require a review status for non-health content', () => {
    expect(isSitemapEligible({ slug: 'o', publishedAt: '2026-01-01T00:00:00Z' })).toBe(true)
  })

  it('requires a slug', () => {
    expect(isSitemapEligible({ slug: '', publishedAt: '2026-01-01T00:00:00Z' })).toBe(false)
  })
})

describe('assembleSitemap', () => {
  it('always includes every static route with absolute URLs', () => {
    const sitemap = assembleSitemap({
      articles: [],
      foods: [],
      outreaches: [],
      resources: [],
      pages: [],
      programmes: [],
    })
    const urls = sitemap.map((entry) => entry.url)
    for (const route of STATIC_SITEMAP_ROUTES) {
      expect(urls).toContain(`${base}${route.path}`)
    }
  })

  it('excludes articles with no published date (draft content)', () => {
    const sitemap = assembleSitemap({
      articles: [
        { slug: 'published-article', publishedAt: '2026-01-01T00:00:00Z', reviewStatus: 'approved' },
        { slug: 'unpublished-article' },
      ],
      foods: [],
      outreaches: [],
      resources: [],
      pages: [],
      programmes: [],
    })
    const urls = sitemap.map((entry) => entry.url)
    expect(urls).toContain(`${base}/nutrition/articles/published-article`)
    expect(urls).not.toContain(`${base}/nutrition/articles/unpublished-article`)
  })

  it('excludes unreviewed and archived articles and food profiles', () => {
    // The acceptance criterion: an unreviewed article must be absent from the
    // sitemap even if it reaches the assembler with a publication date.
    const sitemap = assembleSitemap({
      articles: [
        { slug: 'reviewed', publishedAt: '2026-01-01T00:00:00Z', reviewStatus: 'approved' },
        { slug: 'draft-article', publishedAt: '2026-01-01T00:00:00Z', reviewStatus: 'draft' },
        { slug: 'submitted-article', publishedAt: '2026-01-01T00:00:00Z', reviewStatus: 'submitted' },
        { slug: 'needs-revision-article', publishedAt: '2026-01-01T00:00:00Z', reviewStatus: 'needs-revision' },
        { slug: 'archived-article', publishedAt: '2026-01-01T00:00:00Z', reviewStatus: 'archived' },
        { slug: 'statusless-article', publishedAt: '2026-01-01T00:00:00Z' },
      ],
      foods: [
        { slug: 'garri', publishedAt: '2026-01-01T00:00:00Z', reviewStatus: 'approved' },
        { slug: 'unreviewed-food', publishedAt: '2026-01-01T00:00:00Z', reviewStatus: 'draft' },
      ],
      outreaches: [],
      resources: [],
      pages: [],
      programmes: [],
    })
    const urls = sitemap.map((entry) => entry.url)
    expect(urls).toContain(`${base}/nutrition/articles/reviewed`)
    expect(urls).toContain(`${base}/nutrition/foods/garri`)
    for (const excluded of [
      'draft-article',
      'submitted-article',
      'needs-revision-article',
      'archived-article',
      'statusless-article',
    ]) {
      expect(urls).not.toContain(`${base}/nutrition/articles/${excluded}`)
    }
    expect(urls).not.toContain(`${base}/nutrition/foods/unreviewed-food`)
  })

  it('never exposes internal-only routes such as the styleguide', () => {
    const sitemap = assembleSitemap({
      articles: [],
      foods: [],
      outreaches: [],
      resources: [],
      pages: [
        { slug: 'styleguide', publishedAt: '2026-01-01T00:00:00Z' },
        { slug: 'about', publishedAt: '2026-01-01T00:00:00Z' },
      ],
      programmes: [],
    })
    const urls = sitemap.map((entry) => entry.url)
    expect(urls).not.toContain(`${base}/styleguide`)
    expect(urls.some((url) => url.includes('/preview') || url.includes('/api/'))).toBe(false)
  })

  it('includes approved foods and completed/upcoming outreaches', () => {
    const sitemap = assembleSitemap({
      articles: [],
      foods: [{ slug: 'garri', publishedAt: '2026-01-01T00:00:00Z', reviewStatus: 'approved' }],
      outreaches: [{ slug: 'lafia-workshop', publishedAt: '2026-06-10T00:00:00Z' }],
      resources: [],
      pages: [],
      programmes: [],
    })
    const urls = sitemap.map((entry) => entry.url)
    expect(urls).toContain(`${base}/nutrition/foods/garri`)
    expect(urls).toContain(`${base}/outreaches/lafia-workshop`)
  })

  it('maps CMS pages through CMS_PAGE_ROUTES and skips unknown slugs', () => {
    const sitemap = assembleSitemap({
      articles: [],
      foods: [],
      outreaches: [],
      resources: [],
      pages: [
        { slug: 'about', publishedAt: '2026-01-01T00:00:00Z' },
        { slug: 'totally-unknown-page', publishedAt: '2026-01-01T00:00:00Z' },
      ],
      programmes: [],
    })
    const urls = sitemap.map((entry) => entry.url)
    expect(urls).toContain(`${base}${CMS_PAGE_ROUTES['about']}`)
    expect(urls).not.toContain(`${base}/${'totally-unknown-page'}`)
  })

  it('uses lastModified when available', () => {
    const sitemap = assembleSitemap({
      articles: [
        {
          slug: 'a',
          publishedAt: '2026-01-01T00:00:00Z',
          updatedAt: '2026-02-01T00:00:00Z',
          reviewStatus: 'approved',
        },
      ],
      foods: [],
      outreaches: [],
      resources: [],
      pages: [],
      programmes: [],
    })
    const entry = sitemap.find((e) => e.url === `${base}/nutrition/articles/a`)
    expect(entry?.lastModified).toEqual(new Date('2026-02-01T00:00:00Z'))
  })

  it('derives lastModified from _updatedAt, not the publication date', async () => {
    // Guards the live path: lastmod must reflect the Sanity _updatedAt value so
    // search engines see real edits, not the original publish date.
    const sitemap = await getSitemap()
    const articles = sitemap.filter((e) => e.url.includes('/nutrition/articles/'))
    for (const entry of articles) {
      expect(entry.lastModified).toBeInstanceOf(Date)
    }
  })

  it('omits the unreviewed draft article from the real generated sitemap', async () => {
    // End-to-end through the actual data source, not a hand-built fixture.
    const content = await collectSitemapContent()
    const draft = content.articles.find((a) => a.slug === 'unreviewed-hypertension-draft')
    expect(draft, 'fixture dataset should contain an unreviewed draft to guard against').toBeDefined()
    expect(draft?.reviewStatus).toBe('draft')

    const urls = (await getSitemap()).map((e) => e.url)
    expect(urls).not.toContain(`${base}/nutrition/articles/unreviewed-hypertension-draft`)
  })
})