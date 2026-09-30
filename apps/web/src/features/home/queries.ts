import { unstable_cache } from 'next/cache'
import { urlFor } from '@/lib/sanity/client'
import { sanityFetch } from '@/lib/sanity/fetch'
import { isDraftModeEnabled } from '@/lib/sanity/fetch'
import { CACHE_TAGS } from '@/lib/sanity/tags'
import { useContentFixtures } from '@/lib/content/dataSource'
import { fixtureArticles, fixtureFoods } from '@/lib/content/fixtures'

/* ────────────────────────────────────────────────────────────────────────────
   Types — inline until TypeGen is wired; mirrors the Sanity schemas.
   Keep in sync with apps/studio/schemaTypes/documents/homepage.ts, etc.
   ──────────────────────────────────────────────────────────────────────────── */

export interface SanityImage {
  _type: 'image'
  asset?: { _ref: string; _type: 'reference' }
  alt?: string
  caption?: string
  credit?: string
  decorative?: boolean
  consentStatus?: 'cleared' | 'pending' | 'not-for-publication'
  containsMinors?: boolean
  guardianConsentRecorded?: boolean
}

export interface SanitySlug {
  _type: 'slug'
  current: string
}

export interface SanityReference {
  _type: 'reference'
  _ref: string
}

export interface SeoMeta {
  title?: string
  description?: string
  ogImage?: SanityImage
}

export interface HomepageDoc {
  _id: string
  headline?: string
  subheadline?: string
  heroImage?: SanityImage
  primaryCta?: { label: string; url: string; variant?: string }
  secondaryCta?: { label: string; url: string; variant?: string }
  impactSection?: { heading?: string; description?: string }
  ctaSection?: {
    heading?: string
    description?: string
    actions?: Array<{ label: string; url: string; variant?: string }>
  }
  seo?: SeoMeta
  /** Dereferenced manual selections (computed by the homepage query). */
  featuredArticleDoc?: ArticleSummary
  featuredFoodProfileDoc?: FoodProfileSummary
}

export interface ImpactMetric {
  _id: string
  label: string
  value: number
  asOf: string
  basis: 'computed' | 'manual'
  verifiedBy?: string
  unit?: string
}

export interface Program {
  _id: string
  title: string
  slug: SanitySlug
  summary: string
  order?: number
}

export interface ArticleSummary {
  _id: string
  title: string
  slug: SanitySlug
  summary: string
  publishedAt: string
  featuredImage?: SanityImage
  categories?: Array<{ title: string; slug: SanitySlug }>
  author?: { name: string }
  reviewer?: { name: string }
  reviewStatus?: string
}

export interface FoodProfileSummary {
  _id: string
  title: string
  slug: SanitySlug
  summary: string
  publishedAt: string
  featuredImage?: SanityImage
  aliases?: string[]
  reviewStatus?: string
}

export interface OutreachPhoto {
  src: string
  alt: string
  caption?: string
  credit?: string
  decorative?: boolean
  containsMinors?: boolean
}

export interface OutreachSummary {
  _id: string
  title: string
  slug: SanitySlug
  theme: string
  date: string
  summary: string
  attendance?: number
  screened?: number
  results?: Array<{ label: string; value: string }>
  images?: SanityImage[]
  status: 'upcoming' | 'completed'
  location?: { state?: string; lga?: string }
  /** First consent-cleared outreach photo, resolved to a CDN URL (computed). */
  photo?: OutreachPhoto
}

export interface EventSummary {
  _id: string
  title: string
  slug: SanitySlug
  date: string
  endDate?: string
  summary: string
  venue?: string
  location?: { state?: string; lga?: string }
  status: 'upcoming' | 'completed' | 'cancelled'
}

/* ────────────────────────────────────────────────────────────────────────────
   Queries
   ──────────────────────────────────────────────────────────────────────────── */

const ARTICLE_CARD_FIELDS = `
  _id,
  title,
  slug,
  summary,
  publishedAt,
  featuredImage,
  reviewStatus,
  "categories": categories[]->{ title, slug },
  "author": author->{ name },
  "reviewer": reviewer->{ name },
`

const FOOD_CARD_FIELDS = `
  _id,
  title,
  slug,
  summary,
  publishedAt,
  featuredImage,
  aliases,
  reviewStatus,
`

const HOMEPAGE_FIELDS = `
  _id,
  headline,
  subheadline,
  heroImage,
  primaryCta,
  secondaryCta,
  impactSection,
  ctaSection,
  seo,
  "featuredArticleDoc": featuredArticle->{${ARTICLE_CARD_FIELDS}},
  "featuredFoodProfileDoc": featuredFoodProfile->{${FOOD_CARD_FIELDS}},
`

const IMPACT_METRICS = `
  *[_type == "impactMetric" && (basis == "computed" || (basis == "manual" && defined(verifiedBy)))]
    | order(value desc) [0...4] {
    _id,
    label,
    value,
    asOf,
    basis,
    verifiedBy,
    unit,
  }
`

const PROGRAMMES = `
  *[_type == "program"] | order(order asc, _createdAt asc) [0...6] {
    _id,
    title,
    slug,
    summary,
    order,
  }
`

const FEATURED_ARTICLE = `
  *[_type == "article" && reviewStatus == "approved" && featured == true]
    | order(publishedAt desc) [0...1] {
    ${ARTICLE_CARD_FIELDS}
  }
`

const FALLBACK_ARTICLE = `
  *[_type == "article" && reviewStatus == "approved"]
    | order(publishedAt desc) [0...1] {
    ${ARTICLE_CARD_FIELDS}
  }
`

const FEATURED_FOOD_PROFILE = `
  *[_type == "foodProfile" && reviewStatus == "approved"]
    | order(publishedAt desc) [0...1] {
    ${FOOD_CARD_FIELDS}
  }
`

const LATEST_COMPLETED_OUTREACH = `
  *[_type == "outreach" && status == "completed"] | order(date desc) [0...1] {
    _id,
    title,
    slug,
    theme,
    date,
    summary,
    attendance,
    screened,
    results,
    images,
    status,
    location,
  }
`

const UPCOMING_ACTIVITIES = `
  {
    "outreach": *[_type == "outreach" && status == "upcoming"] | order(date asc) [0...5] {
      _type,
      _id,
      title,
      slug,
      date,
      summary,
      location,
      status,
    },
    "event": *[_type == "event" && status == "upcoming"] | order(date asc) [0...5] {
      _type,
      _id,
      title,
      slug,
      date,
      summary,
      venue,
      location,
      status,
    },
  }
`

/* ────────────────────────────────────────────────────────────────────────────
   Fetch helpers
   ──────────────────────────────────────────────────────────────────────────── */

export interface UpcomingActivity {
  _type: string
  _id: string
  title: string
  slug: { current: string }
  date: string
  summary: string
  venue?: string
  location?: { state?: string; lga?: string }
  status: string
}

interface UpcomingResult {
  outreach: UpcomingActivity[]
  event: UpcomingActivity[]
}

export interface HomepageData {
  homepage: HomepageDoc | null
  /** Resolved hero image CDN URL (computed). */
  heroImageSrc?: string
  /** Resolved SEO social-share image CDN URL (computed). */
  ogImageSrc?: string
  impactMetrics: ImpactMetric[]
  programmes: Program[]
  article: ArticleSummary | null
  foodProfile: FoodProfileSummary | null
  outreach: OutreachSummary | null
  upcoming: UpcomingActivity | null
}

const EMPTY_DATA: HomepageData = {
  homepage: null,
  impactMetrics: [],
  programmes: [],
  article: null,
  foodProfile: null,
  outreach: null,
  upcoming: null,
}

async function safeFetch<T>(query: string, fallback: T): Promise<T> {
  try {
    return await sanityFetch<T>(query, undefined, {
      // The outer function is wrapped in unstable_cache with the homepage tag;
      // registering the same tag on the underlying fetch keeps the two tag
      // sources in agreement so a webhook purge reaches both layers.
      tags: [CACHE_TAGS.homepage],
    })
  } catch {
    return fallback
  }
}

/** Resolve a Sanity image ref to a CDN URL. Never throws — returns undefined
    when env is missing or the ref is unusable (dev without .env). */
function resolveImageSrc(
  image: SanityImage | undefined,
  width: number,
): string | undefined {
  try {
    if (!image?.asset?._ref) return undefined
    const url = urlFor(image).width(width).auto('format').url()
    return url || undefined
  } catch {
    return undefined
  }
}

/** First consent-cleared outreach photo, resolved to a CDN URL. */
function resolveOutreachPhoto(
  images: SanityImage[] | undefined,
): OutreachPhoto | undefined {
  if (!images?.length) return undefined
  const cleared = images.find(
    (img) => img.consentStatus === 'cleared' && Boolean(img.asset?._ref),
  )
  if (!cleared) return undefined
  const src = resolveImageSrc(cleared, 1600)
  if (!src) return undefined
  return {
    src,
    alt: cleared.alt || cleared.caption || '',
    caption: cleared.caption,
    credit: cleared.credit,
    decorative: cleared.decorative,
    containsMinors: cleared.containsMinors,
  }
}

async function fetchHomepageData(): Promise<HomepageData> {
  if (useContentFixtures()) {
    const articles = fixtureArticles()
      .filter((a) => a.reviewStatus === 'approved')
      .sort(
        (a, b) =>
          Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
          b.publishedAt.localeCompare(a.publishedAt),
      )
    const foods = fixtureFoods()
      .filter((f) => f.reviewStatus === 'approved')
      .sort(
        (a, b) =>
          Number(Boolean(b.featured)) - Number(Boolean(a.featured)) ||
          b.publishedAt.localeCompare(a.publishedAt),
      )
    const first = articles[0]
    const foodProfile = foods[0]

    return {
      homepage: null,
      impactMetrics: [],
      programmes: [],
      article: first
        ? {
            _id: first._id,
            title: first.title,
            slug: { _type: 'slug', current: first.slug.current },
            summary: first.summary,
            publishedAt: first.publishedAt,
            categories: first.categories.map((c) => ({
              title: c.title,
              slug: { _type: 'slug', current: c.slug.current },
            })),
            author: first.author ? { name: first.author.name } : undefined,
          }
        : null,
      foodProfile: foodProfile
        ? {
            _id: foodProfile._id,
            title: foodProfile.title,
            slug: { _type: 'slug', current: foodProfile.slug.current },
            summary: foodProfile.summary,
            publishedAt: foodProfile.publishedAt,
            aliases: foodProfile.aliases,
          }
        : null,
      outreach: null,
      upcoming: null,
    }
  }

  const [homepage, impactMetrics, programmes, featuredArticle, fallbackArticle, featuredFoodProfile, recentOutreach, upcomingActivities] =
    await Promise.all([
      safeFetch<HomepageDoc | null>(`*[_type == "homepage"][0]{${HOMEPAGE_FIELDS}}`, null),
      safeFetch<ImpactMetric[]>(IMPACT_METRICS, []),
      safeFetch<Program[]>(PROGRAMMES, []),
      safeFetch<ArticleSummary[]>(FEATURED_ARTICLE, []),
      safeFetch<ArticleSummary[]>(FALLBACK_ARTICLE, []),
      safeFetch<FoodProfileSummary[]>(FEATURED_FOOD_PROFILE, []),
      safeFetch<OutreachSummary[]>(LATEST_COMPLETED_OUTREACH, []),
      safeFetch<UpcomingResult>(UPCOMING_ACTIVITIES, { outreach: [], event: [] }),
    ])

  // Manual homepage selections take priority; auto/latest are the fallback.
  const manualArticle =
    homepage?.featuredArticleDoc?.reviewStatus === 'approved'
      ? homepage.featuredArticleDoc
      : null
  const manualFood =
    homepage?.featuredFoodProfileDoc?.reviewStatus === 'approved'
      ? homepage.featuredFoodProfileDoc
      : null

  const article = manualArticle ?? featuredArticle?.[0] ?? fallbackArticle?.[0] ?? null
  const foodProfile = manualFood ?? featuredFoodProfile?.[0] ?? null
  const outreach = recentOutreach?.[0] ?? null

  const allUpcoming = [
    ...(upcomingActivities?.outreach ?? []),
    ...(upcomingActivities?.event ?? []),
  ].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  )
  const upcoming = allUpcoming[0] ?? null

  // Resolve image URLs (guarded — fails silently when env is absent in dev).
  const heroImageSrc = resolveImageSrc(homepage?.heroImage, 1200)
  const ogImageSrc = resolveImageSrc(homepage?.seo?.ogImage, 1200)
  if (outreach) outreach.photo = resolveOutreachPhoto(outreach.images)

  return {
    homepage,
    heroImageSrc,
    ogImageSrc,
    impactMetrics,
    programmes,
    article,
    foodProfile,
    outreach,
    upcoming,
  }
}

const getCachedHomepageData = unstable_cache(
  async () => {
    try {
      return await fetchHomepageData()
    } catch {
      return EMPTY_DATA
    }
  },
  ['homepage-data'],
  { tags: [CACHE_TAGS.homepage], revalidate: 3600 },
)

export async function getHomepageData(): Promise<HomepageData> {
  // unstable_cache writes to the shared Data Cache, which draft mode does NOT
  // bypass. Calling the wrapper in a draft would therefore serve the cached
  // *published* homepage — an editor would see stale content and believe draft
  // mode was broken. Drafts skip the wrapper and go straight to the preview
  // client. This is the single most important draft-mode correctness rule in
  // this file; do not "simplify" it back into an unconditional call.
  if (await isDraftModeEnabled()) return fetchHomepageData()
  return getCachedHomepageData()
}