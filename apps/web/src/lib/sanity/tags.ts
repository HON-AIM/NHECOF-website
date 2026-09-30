/**
 * Cache-tag taxonomy and Sanity document-type → tag mapping.
 *
 * On-demand revalidation is only as good as the tags that queries actually
 * register. Every `sanityFetch` call passes one of these tags; the webhook at
 * `/api/revalidate` translates an incoming document mutation back into the same
 * set. The two sides must agree, so both read from this file.
 *
 * Design rules:
 *  1. Over-invalidate rather than under-invalidate. A stale published page is a
 *     correctness bug on a health-education site; an extra revalidation is only
 *     a few milliseconds of server work.
 *  2. Unknown document types fall back to the broad tags instead of being
 *     ignored, so a newly added schema can never be silently uncacheable.
 */

export const CACHE_TAGS = {
  homepage: 'homepage',
  articles: 'articles',
  foods: 'foods',
  outreaches: 'outreaches',
  impact: 'impact',
  quotes: 'quotes',
  resources: 'resources',
  siteSettings: 'siteSettings',
  redirects: 'redirects',
  sitemap: 'sitemap',
  searchIndex: 'search-index',
  navigation: 'navigation',
} as const

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS]

/** Every tag the site can register, useful for docs and tests. */
export const ALL_CACHE_TAGS: CacheTag[] = Object.values(CACHE_TAGS)

/**
 * The eight public-content tags named in the deployment plan, in the order the
 * plan lists them. Used by the webhook tests and the ops documentation.
 */
export const CONTENT_TAGS: CacheTag[] = [
  CACHE_TAGS.homepage,
  CACHE_TAGS.articles,
  CACHE_TAGS.foods,
  CACHE_TAGS.outreaches,
  CACHE_TAGS.impact,
  CACHE_TAGS.quotes,
  CACHE_TAGS.resources,
  CACHE_TAGS.siteSettings,
]

/**
 * Broad tags applied to every document type. Anything that can change the set
 * or shape of published URLs invalidates the sitemap, and anything that can
 * change a shared shell (nav, footer, organisation details) invalidates the
 * homepage and navigation.
 */
const ALWAYS: CacheTag[] = [CACHE_TAGS.sitemap]

/**
 * Per-document-type tags. `articles`/`foods` also appear on people documents
 * because author and reviewer bylines are rendered on those pages.
 */
const TAGS_BY_TYPE: Record<string, CacheTag[]> = {
  article: [
    CACHE_TAGS.articles,
    CACHE_TAGS.homepage,
    CACHE_TAGS.impact,
    CACHE_TAGS.searchIndex,
    CACHE_TAGS.navigation,
  ],
  foodProfile: [
    CACHE_TAGS.foods,
    CACHE_TAGS.homepage,
    CACHE_TAGS.impact,
    CACHE_TAGS.searchIndex,
    CACHE_TAGS.navigation,
  ],
  outreach: [CACHE_TAGS.outreaches, CACHE_TAGS.impact, CACHE_TAGS.homepage],
  quote: [CACHE_TAGS.quotes, CACHE_TAGS.homepage],
  resource: [CACHE_TAGS.resources, CACHE_TAGS.homepage, CACHE_TAGS.searchIndex],
  impactMetric: [CACHE_TAGS.impact, CACHE_TAGS.homepage],
  impactMilestone: [CACHE_TAGS.impact],
  siteSettings: [CACHE_TAGS.siteSettings, CACHE_TAGS.homepage, CACHE_TAGS.navigation],
  program: [CACHE_TAGS.homepage, CACHE_TAGS.navigation],
  category: [CACHE_TAGS.articles, CACHE_TAGS.foods, CACHE_TAGS.navigation, CACHE_TAGS.searchIndex],
  tag: [CACHE_TAGS.searchIndex],
  person: [CACHE_TAGS.articles, CACHE_TAGS.foods, CACHE_TAGS.outreaches, CACHE_TAGS.homepage],
  partner: [CACHE_TAGS.outreaches, CACHE_TAGS.homepage],
  testimonial: [CACHE_TAGS.outreaches],
  event: [CACHE_TAGS.homepage, CACHE_TAGS.navigation],
  page: [CACHE_TAGS.homepage, CACHE_TAGS.navigation],

  // The homepage is a Sanity document, not just a cache tag. Without this
  // entry an editor changing the homepage's featured article, impact figures
  // or programme selection would see no change on the live site, because the
  // webhook would purge only `sitemap`. Found by the tag-mapping E2E test.
  homepage: [
    CACHE_TAGS.homepage,
    CACHE_TAGS.navigation,
    CACHE_TAGS.searchIndex,
    CACHE_TAGS.articles,
    CACHE_TAGS.foods,
    CACHE_TAGS.outreaches,
    CACHE_TAGS.impact,
    CACHE_TAGS.quotes,
    CACHE_TAGS.resources,
    CACHE_TAGS.siteSettings,
  ],
}

/**
 * True when the document type is one this file knows how to invalidate.
 * Used by the webhook response to tell an operator that an unfamiliar type was
 * handled by the broad fallback rather than by a deliberate mapping.
 */
export function isKnownDocumentType(type: unknown): boolean {
  return typeof type === 'string' && Object.prototype.hasOwnProperty.call(TAGS_BY_TYPE, type)
}

/**
 * Tags to revalidate for a Sanity document mutation.
 *
 * Accepts the raw webhook body (`{ _type, ... }`) and tolerates missing or
 * unknown types. Returns a de-duplicated, stable list so webhook responses and
 * test assertions are deterministic.
 */
export function tagsForDocument(document: { _type?: unknown } | null | undefined): CacheTag[] {
  const type = typeof document?._type === 'string' ? document._type : undefined
  const specific = (type && TAGS_BY_TYPE[type]) || []
  return dedupe([...ALWAYS, ...specific])
}

/**
 * Tags to revalidate for a slug change / redirect mutation. Sanity's redirect
 * documents are fetched at build time by `next.config.ts` and by the sitemap,
 * so they get their own tag.
 */
export function tagsForRedirects(): CacheTag[] {
  return [CACHE_TAGS.redirects, CACHE_TAGS.sitemap]
}

function dedupe(tags: CacheTag[]): CacheTag[] {
  return [...new Set(tags)]
}
