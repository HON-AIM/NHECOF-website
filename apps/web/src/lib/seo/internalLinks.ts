/**
 * Internal linking helpers (plan §12.1 — "internal links between related
 * topics" and descriptive, stable URL slugs).
 *
 * The public URL hierarchy lives in exactly one place so a related-content
 * link, a search result, a card and a `BreadcrumbList` all agree on the same
 * path. Version one has no standalone person page (plan §5.3 puts the founder
 * inside `/about`), so `personProfileHref` only returns a path for people who
 * really do have a public profile — structured data must never point at a URL
 * that 404s.
 */

export type ContentType = 'article' | 'foodProfile' | 'outreach' | 'resource' | 'program'

/** URL prefix per Sanity document type, mirroring the App Router hierarchy. */
export const CONTENT_ROUTES: Record<ContentType, string> = {
  article: '/nutrition/articles',
  foodProfile: '/nutrition/foods',
  outreach: '/outreaches',
  resource: '/resources',
  program: '/what-we-do',
}

/** Human label for a content type, used for badges and related-content cards. */
export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  article: 'Article',
  foodProfile: 'Food Profile',
  outreach: 'Outreach',
  resource: 'Resource',
  program: 'Programme',
}

function slugValue(slug: string | { current?: string | null } | null | undefined): string {
  if (typeof slug === 'string') return slug
  return typeof slug?.current === 'string' ? slug.current : ''
}

/** Public path for a document type + slug, or `null` when the type is unknown. */
export function contentPath(
  type: string | null | undefined,
  slug: string | { current?: string | null } | null | undefined,
): string | null {
  const prefix = type ? CONTENT_ROUTES[type as ContentType] : undefined
  const value = slugValue(slug)
  if (!prefix || !value) return null
  return `${prefix}/${value}`
}

export interface RelatedLinkItem {
  _id?: string
  title?: string
  slug: string | { current?: string | null }
  _type: string
}

/** Internal href for a related-content item, or `null` when it has no route. */
export function relatedContentHref(item: Pick<RelatedLinkItem, 'slug' | '_type'>): string | null {
  return contentPath(item._type, item.slug)
}

/** Badge label for a related-content item, or `null` when the type is unknown. */
export function relatedContentLabel(item: Pick<RelatedLinkItem, '_type'>): string | null {
  return item._type ? (CONTENT_TYPE_LABELS[item._type as ContentType] ?? null) : null
}

/* ────────────────────────────────────────────────────────────────────────────
   Person profiles
   ──────────────────────────────────────────────────────────────────────────── */

export interface PublicPersonRef {
  isFounder?: boolean | null
  slug?: string | { current?: string | null } | null
}

/**
 * The `id` of the founder section on the About page. Kept beside
 * `personProfileHref` so the anchor and the link cannot drift apart.
 */
export const FOUNDER_PROFILE_ANCHOR = '/about#founder-heading'

/**
 * Public profile URL for a person, or `undefined` when they have none.
 *
 * Only the founder has a public profile in version one (plan §5.3). Everyone
 * else is credited by name on the pages that display them, so no `url`/`@id`
 * is emitted for them in structured data.
 */
export function personProfileHref(person?: PublicPersonRef | null): string | undefined {
  if (!person) return undefined
  return person.isFounder ? FOUNDER_PROFILE_ANCHOR : undefined
}
