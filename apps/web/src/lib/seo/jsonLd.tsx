import type { ReactNode } from 'react'
import { absoluteUrl } from './url'
import { SITE_DEFAULTS } from './defaults'

/* ────────────────────────────────────────────────────────────────────────────
   Serialization
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Escape a value for inline application/ld+json. Replacing `<` with `\u003c`
 * (and the JSON line separators) guarantees no `</script>` sequence can break
 * out of the script tag (plan §12.2).
 */
export function safeJsonLd(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029')
}

function JsonLdScript({ data, children }: { data?: unknown; children?: ReactNode }) {
  if (children) {
    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(children) }}
      />
    )
  }
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }} />
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Organization
   ──────────────────────────────────────────────────────────────────────────── */

export interface OrganizationJsonLdProps {
  name: string
  url?: string
  logoUrl?: string
  sameAs?: string[]
}

export function buildOrganizationJsonLd(props: OrganizationJsonLdProps) {
  const { name, url, logoUrl, sameAs } = props
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    ...(url ? { url } : {}),
    ...(logoUrl ? { logo: { '@type': 'ImageObject', url: logoUrl } } : {}),
    ...(sameAs && sameAs.length > 0 ? { sameAs } : {}),
  }
}

/** Site-wide Organization graph, rendered on every public page (plan §12.2). */
export function OrganizationJsonLd(props: OrganizationJsonLdProps) {
  return <JsonLdScript data={buildOrganizationJsonLd(props)} />
}

/* ────────────────────────────────────────────────────────────────────────────
   BreadcrumbList
   ──────────────────────────────────────────────────────────────────────────── */

export interface JsonLdCrumb {
  label: string
  href?: string
}

export function buildBreadcrumbListJsonLd(items: JsonLdCrumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  }
}

/** Breadcrumb structured data mirroring the rendered breadcrumb trail. */
export function BreadcrumbJsonLd({ items }: { items: JsonLdCrumb[] }) {
  const crumbs = items.filter((item) => item.label || item.href)
  if (crumbs.length === 0) return null
  return <JsonLdScript data={buildBreadcrumbListJsonLd(crumbs)} />
}

/* ────────────────────────────────────────────────────────────────────────────
   Person
   ──────────────────────────────────────────────────────────────────────────── */

export interface PersonJsonLdProps {
  name: string
  /**
   * Absolute or site-relative URL of a page that publicly profiles this person.
   * Omit when they have no public profile — an `@id`/`url` is then not emitted,
   * so structured data never points at a page that does not exist.
   */
  profileHref?: string
  role?: string
  qualifications?: string
  imageUrl?: string
}

/**
 * Person graph for author/reviewer attribution. Deliberately has no `@context`
 * so it can be nested inside an `Article` node; `PersonJsonLd` adds the context
 * when rendered standalone.
 *
 * `profileHref` is the only way to obtain an `@id`/`url` (plan §12.2). Never
 * derive a profile URL from a slug alone — version one has no person page, so a
 * derived URL would 404 and would describe something the page does not show.
 */
export function buildPersonJsonLd({
  name,
  profileHref,
  role,
  qualifications,
  imageUrl,
}: PersonJsonLdProps) {
  const profileUrl = profileHref ? absoluteUrl(profileHref) : undefined
  return {
    '@type': 'Person',
    name,
    ...(profileUrl ? { '@id': profileUrl, url: profileUrl } : {}),
    ...(role ? { jobTitle: role } : {}),
    ...(qualifications ? { description: qualifications } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
  }
}

export function PersonJsonLd(props: PersonJsonLdProps) {
  return <JsonLdScript data={{ '@context': 'https://schema.org', ...buildPersonJsonLd(props) }} />
}

/* ────────────────────────────────────────────────────────────────────────────
   Article
   ──────────────────────────────────────────────────────────────────────────── */

export interface ArticleJsonLdPerson {
  name: string
  /** Public profile URL, when one exists. See `PersonJsonLdProps.profileHref`. */
  profileHref?: string
  role?: string
  qualifications?: string
}

export interface ArticleJsonLdProps {
  title: string
  url: string
  description: string
  imageUrl?: string
  datePublished: string
  dateModified?: string
  /** Author is required by schema.org. A person with a public profile gets an @id. */
  author: ArticleJsonLdPerson
  /** Reviewed-by is emitted only when a named reviewer exists (schema.org `reviewedBy`). */
  reviewer?: ArticleJsonLdPerson | null
  publisherName?: string
  publisherLogoUrl?: string
  section?: string
}

export function buildArticleJsonLd(props: ArticleJsonLdProps) {
  const {
    title,
    url,
    description,
    imageUrl,
    datePublished,
    dateModified,
    author,
    reviewer,
    publisherName,
    publisherLogoUrl,
    section,
  } = props

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    ...(imageUrl ? { image: [imageUrl] } : {}),
    datePublished,
    dateModified: dateModified || datePublished,
    author: buildPersonJsonLd(author),
    ...(reviewer ? { reviewedBy: buildPersonJsonLd(reviewer) } : {}),
    publisher: {
      '@type': 'Organization',
      name: publisherName || SITE_DEFAULTS.organisationName,
      ...(publisherLogoUrl ? { logo: { '@type': 'ImageObject', url: publisherLogoUrl } } : {}),
    },
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(section ? { articleSection: section } : {}),
  }
}

export function ArticleJsonLd(props: ArticleJsonLdProps) {
  return <JsonLdScript data={buildArticleJsonLd(props)} />
}

/* ────────────────────────────────────────────────────────────────────────────
   Event
   ──────────────────────────────────────────────────────────────────────────── */

export interface EventJsonLdProps {
  name: string
  startDate: string
  endDate?: string
  description?: string
  url?: string
  imageUrl?: string
  venueName?: string
  addressLocality?: string
  addressRegion?: string
  organizerName?: string
}

/**
 * Event graph. Only emit for genuine, public events — never private meetings.
 * `eventStatus` is pinned to `EventScheduled`; callers must gate on the
 * outreach/event status before rendering (see the outreach detail page).
 */
export function buildEventJsonLd(props: EventJsonLdProps) {
  const {
    name,
    startDate,
    endDate,
    description,
    url,
    imageUrl,
    venueName,
    addressLocality,
    addressRegion,
    organizerName,
  } = props

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name,
    startDate,
    ...(endDate ? { endDate } : {}),
    ...(description ? { description } : {}),
    ...(url ? { url } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      ...(venueName ? { name: venueName } : {}),
      address: {
        '@type': 'PostalAddress',
        ...(addressLocality ? { addressLocality } : {}),
        ...(addressRegion ? { addressRegion } : {}),
      },
    },
    organizer: {
      '@type': 'Organization',
      name: organizerName || SITE_DEFAULTS.organisationName,
    },
  }
}

export function EventJsonLd(props: EventJsonLdProps) {
  return <JsonLdScript data={buildEventJsonLd(props)} />
}
