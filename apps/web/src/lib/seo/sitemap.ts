import type { MetadataRoute } from 'next'
import type { SanitySlug } from '@/features/home/queries'
import { sanityFetch } from '@/lib/sanity/fetch'
import { CACHE_TAGS } from '@/lib/sanity/tags'
import { useContentFixtures } from '@/lib/content/dataSource'
import {
  fixtureArticles,
  fixtureFoods,
  fixtureOutreaches,
  fixtureResources,
} from '@/lib/content/fixtures'
import { programmeDetailRoutesEnabled } from '@/lib/features'
import { absoluteUrl } from './url'

/* ────────────────────────────────────────────────────────────────────────────
   Static routes (always present, plan §3.2)
   ──────────────────────────────────────────────────────────────────────────── */

export const STATIC_SITEMAP_ROUTES: Array<{
  path: string
  changeFrequency?: 'weekly' | 'monthly' | 'yearly'
  priority?: number
}> = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/what-we-do', priority: 0.9, changeFrequency: 'monthly' },
  { path: '/impact', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/get-involved', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/partner', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/request-an-outreach', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/nutrition', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/nutrition/articles', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/nutrition/foods', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/nutrition/search', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/outreaches', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/resources', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/editorial-policy', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/medical-disclaimer', priority: 0.4, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
]

/* ────────────────────────────────────────────────────────────────────────────
   Content model
   ──────────────────────────────────────────────────────────────────────────── */

export interface SitemapDocItem {
  slug: string
  publishedAt?: string | null
  updatedAt?: string | null
  /**
   * Editorial review status. Required for health content (articles, food
   * profiles) and absent for content types that are not medically reviewed.
   */
  reviewStatus?: string | null
}

export interface SitemapContent {
  articles: SitemapDocItem[]
  foods: SitemapDocItem[]
  outreaches: SitemapDocItem[]
  resources: SitemapDocItem[]
  pages: SitemapDocItem[]
  programmes: SitemapDocItem[]
}

export const EMPTY_CONTENT: SitemapContent = {
  articles: [],
  foods: [],
  outreaches: [],
  resources: [],
  pages: [],
  programmes: [],
}

export const CMS_PAGE_ROUTES: Record<string, string> = {
  about: '/about',
  'what-we-do': '/what-we-do',
  impact: '/impact',
  'get-involved': '/get-involved',
  contact: '/contact',
  privacy: '/privacy',
  'editorial-policy': '/editorial-policy',
  'medical-disclaimer': '/medical-disclaimer',
  partner: '/partner',
  info: '/what-we-do',
}

/* ────────────────────────────────────────────────────────────────────────────
   Eligibility (plan §12.1 / §3.2)
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Only published, review-approved content may appear in the sitemap.
 *
 * `requireReview` is set for health content (articles, food profiles). The
 * status is read from the item itself rather than being passed in, so this
 * check genuinely enforces approval: an unreviewed document that reaches the
 * assembler — via a new query, a fixture, or a GROQ typo — is still excluded.
 */
export function isSitemapEligible(item: SitemapDocItem, requireReview = false): boolean {
  if (!item.slug) return false
  if (!item.publishedAt) return false
  if (requireReview && item.reviewStatus !== 'approved') return false
  return true
}

/* ────────────────────────────────────────────────────────────────────────────
   Assembly
   ──────────────────────────────────────────────────────────────────────────── */

function makeEntry(
  path: string,
  lastmod?: string | null,
  opts?: { changeFrequency?: 'weekly' | 'monthly' | 'yearly'; priority?: number },
): MetadataRoute.Sitemap[number] {
  const entry: MetadataRoute.Sitemap[number] = { url: absoluteUrl(path) }
  if (lastmod) entry.lastModified = new Date(lastmod)
  if (opts?.changeFrequency) entry.changeFrequency = opts.changeFrequency
  if (opts?.priority != null) entry.priority = opts.priority
  return entry
}

function itemRoute(segment: string, item: SitemapDocItem): string {
  return `/nutrition/${segment}/${item.slug}`
}

/** Assemble the full sitemap from static routes + published content. */
export function assembleSitemap(content: SitemapContent): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = STATIC_SITEMAP_ROUTES.map((route) =>
    makeEntry(route.path, undefined, {
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    }),
  )

  for (const article of content.articles) {
    if (!isSitemapEligible(article, true)) continue
    entries.push(
      makeEntry(itemRoute('articles', article), article.updatedAt ?? article.publishedAt, {
        changeFrequency: 'weekly',
      }),
    )
  }
  for (const food of content.foods) {
    if (!isSitemapEligible(food, true)) continue
    entries.push(
      makeEntry(itemRoute('foods', food), food.updatedAt ?? food.publishedAt, {
        changeFrequency: 'weekly',
      }),
    )
  }
  for (const outreach of content.outreaches) {
    if (!isSitemapEligible(outreach)) continue
    entries.push(
      makeEntry(`/outreaches/${outreach.slug}`, outreach.updatedAt ?? outreach.publishedAt, {
        changeFrequency: 'monthly',
      }),
    )
  }
  for (const resource of content.resources) {
    if (!isSitemapEligible(resource)) continue
    entries.push(
      makeEntry(`/resources/${resource.slug}`, resource.updatedAt ?? resource.publishedAt, {
        changeFrequency: 'weekly',
      }),
    )
  }
  for (const page of content.pages) {
    if (!isSitemapEligible(page)) continue
    const route = CMS_PAGE_ROUTES[page.slug]
    if (!route) continue
    entries.push(
      makeEntry(route, page.updatedAt ?? page.publishedAt, { changeFrequency: 'monthly' }),
    )
  }
  for (const programme of content.programmes) {
    if (!programme.publishedAt) continue
    entries.push(
      makeEntry(`/what-we-do/${programme.slug}`, programme.updatedAt ?? programme.publishedAt, {
        changeFrequency: 'monthly',
      }),
    )
  }

  return entries
}

/* ────────────────────────────────────────────────────────────────────────────
   Data collection
   ──────────────────────────────────────────────────────────────────────────── */

function slugOf(slug: string | SanitySlug | undefined): string | undefined {
  if (!slug) return undefined
  return typeof slug === 'string' ? slug : slug.current
}

async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise
  } catch {
    return fallback
  }
}

/**
 * Sitemap reads are pinned to the published perspective.
 *
 * `preview: false` is deliberate and not merely a default: draft mode is a
 * real, secret-gated session, and a draft article URL leaking into
 * `/sitemap.xml` would advertise unpublished content to every search engine.
 * The `sitemap` tag means any publish or unpublish refreshes the file.
 */
function sitemapFetch<T>(query: string, params?: Record<string, unknown>): Promise<T> {
  return sanityFetch<T>(query, params ?? {}, {
    tags: [CACHE_TAGS.sitemap],
    preview: false,
  })
}

async function fetchSanityContent(): Promise<SitemapContent> {
  const programmes = programmeDetailRoutesEnabled()

  const [articles, foods, outreaches, resources, pages] = await Promise.all([
    safe(
      sitemapFetch<
        Array<{ slug: SanitySlug; publishedAt: string; reviewStatus: string; _updatedAt: string }>
      >(
        `*[_type == "article" && reviewStatus == "approved" && defined(publishedAt)]{
          slug, publishedAt, reviewStatus, _updatedAt
        }`,
      ),
      [],
    ),
    safe(
      sitemapFetch<
        Array<{ slug: SanitySlug; publishedAt: string; reviewStatus: string; _updatedAt: string }>
      >(
        `*[_type == "foodProfile" && reviewStatus == "approved" && defined(publishedAt)]{
          slug, publishedAt, reviewStatus, _updatedAt
        }`,
      ),
      [],
    ),
    safe(
      sitemapFetch<Array<{ slug: SanitySlug; date: string; _updatedAt: string }>>(
        `*[_type == "outreach" && status in ["upcoming", "completed"]]{
          slug, date, _updatedAt
        }`,
      ),
      [],
    ),
    safe(
      sitemapFetch<Array<{ slug: SanitySlug; publishedAt: string; _updatedAt: string }>>(
        `*[_type == "resource" && defined(publishedAt)]{
          slug, publishedAt, _updatedAt
        }`,
      ),
      [],
    ),
    safe(
      sitemapFetch<Array<{ slug: SanitySlug; publishedAt?: string; _updatedAt: string }>>(
        `*[_type == "page" && defined(publishedAt)]{
          slug, publishedAt, _updatedAt
        }`,
      ),
      [],
    ),
  ])

  const programmeRows = programmes
    ? await safe(
        sitemapFetch<Array<{ slug: SanitySlug; _updatedAt: string }>>(
          `*[_type == "program"]{ slug, _updatedAt }`,
        ),
        [],
      )
    : []

  return {
    articles: articles
      .map((a) => ({
        slug: slugOf(a.slug)!,
        publishedAt: a.publishedAt,
        reviewStatus: a.reviewStatus,
        updatedAt: a._updatedAt,
      }))
      .filter((a) => Boolean(a.slug)),
    foods: foods
      .map((f) => ({
        slug: slugOf(f.slug)!,
        publishedAt: f.publishedAt,
        reviewStatus: f.reviewStatus,
        updatedAt: f._updatedAt,
      }))
      .filter((f) => Boolean(f.slug)),
    outreaches: outreaches
      .map((o) => ({ slug: slugOf(o.slug)!, publishedAt: o.date, updatedAt: o._updatedAt }))
      .filter((o) => Boolean(o.slug)),
    resources: resources
      .map((r) => ({ slug: slugOf(r.slug)!, publishedAt: r.publishedAt, updatedAt: r._updatedAt }))
      .filter((r) => Boolean(r.slug)),
    pages: pages
      .map((p) => ({ slug: slugOf(p.slug)!, publishedAt: p.publishedAt, updatedAt: p._updatedAt }))
      .filter((p) => Boolean(p.slug)),
    programmes: programmeRows
      .map((p) => ({
        slug: slugOf(p.slug)!,
        publishedAt: new Date().toISOString(),
        updatedAt: p._updatedAt,
      }))
      .filter((p) => Boolean(p.slug)),
  }
}

/**
 * Fixture content carries the real `reviewStatus` through unfiltered, so
 * `assembleSitemap` remains the single place that enforces review approval
 * (identical to the live Sanity path).
 */
function fetchFixtureContent(): SitemapContent {
  return {
    articles: fixtureArticles().map((a) => ({
      slug: a.slug.current,
      publishedAt: a.publishedAt,
      reviewStatus: a.reviewStatus,
      updatedAt: a.lastReviewedAt,
    })),
    foods: fixtureFoods().map((f) => ({
      slug: f.slug.current,
      publishedAt: f.publishedAt,
      reviewStatus: f.reviewStatus,
      updatedAt: f.lastReviewedAt,
    })),
    outreaches: fixtureOutreaches()
      .filter((o) => o.status === 'upcoming' || o.status === 'completed')
      .map((o) => ({ slug: o.slug.current, publishedAt: o.date, updatedAt: o.date })),
    resources: fixtureResources()
      .filter((r) => r.publishedAt)
      .map((r) => ({ slug: r.slug.current, publishedAt: r.publishedAt, updatedAt: r.publishedAt })),
    pages: [],
    programmes: [],
  }
}

export async function collectSitemapContent(): Promise<SitemapContent> {
  if (useContentFixtures()) return fetchFixtureContent()
  return fetchSanityContent()
}

export async function getSitemap(): Promise<MetadataRoute.Sitemap> {
  return assembleSitemap(await collectSitemapContent())
}
