import type { QueryParams } from '@sanity/client'
import type { PortableTextBlock } from '@portabletext/types'
import { sanityFetch } from '@/lib/sanity/fetch'
import { CACHE_TAGS, type CacheTag } from '@/lib/sanity/tags'
import type { SanityImage, SanitySlug, SeoMeta } from '@/features/home/queries'
import { useContentFixtures } from '@/lib/content/dataSource'
import {
  fixtureArticles,
  fixtureCategories,
  fixtureFoods,
  fixtureOutreaches,
  fixtureResources,
  fixtureTopicCounts,
  type FixtureArticle,
  type FixtureCategory,
  type FixtureFood,
  type FixtureOutreach,
} from '@/lib/content/fixtures'

/* ────────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────────── */

export interface Citation {
  title: string
  publisher?: string
  url?: string
  accessedAt?: string
}

export interface Nutrient {
  name: string
  amount?: string
  note?: string
}

export interface CategoryDoc {
  _id: string
  title: string
  slug: SanitySlug
  kind: 'topic' | 'tag' | 'condition' | 'food-group'
  description?: string
}

export interface ArticleDoc {
  _id: string
  title: string
  slug: SanitySlug
  summary: string
  featuredImage?: SanityImage
  author: { name: string; qualifications?: string; slug?: SanitySlug }
  reviewer: { name: string; qualifications?: string; slug?: SanitySlug }
  categories: Array<{ _id: string; title: string; slug: SanitySlug; kind?: string }>
  audiences?: string[]
  keyTakeaways?: string[]
  body?: PortableTextBlock[]
  references?: Citation[]
  relatedContent?: Array<{ _id: string; title: string; slug: SanitySlug; _type: string }>
  featured?: boolean
  publishedAt: string
  lastReviewedAt?: string
  nextReviewAt?: string
  reviewStatus: 'draft' | 'submitted' | 'approved' | 'needs-revision' | 'archived'
  seo?: SeoMeta
}

export interface FoodProfileDoc {
  _id: string
  title: string
  slug: SanitySlug
  scientificName?: string
  aliases?: string[]
  summary: string
  featuredImage?: SanityImage
  description?: PortableTextBlock[]
  nutrients?: Nutrient[]
  benefits?: PortableTextBlock[]
  preparation?: PortableTextBlock[]
  portionContext?: string
  cautions: string
  myths?: PortableTextBlock[]
  mealIdeas?: PortableTextBlock[]
  categories?: Array<{ _id: string; title: string; slug: SanitySlug }>
  references?: Citation[]
  author: { name: string; qualifications?: string; slug?: SanitySlug }
  reviewer: { name: string; qualifications?: string; slug?: SanitySlug }
  publishedAt?: string
  lastReviewedAt?: string
  nextReviewAt?: string
  featured?: boolean
  reviewStatus: 'draft' | 'submitted' | 'approved' | 'needs-revision' | 'archived'
  seo?: SeoMeta
}

export interface RelatedContentItem {
  _id: string
  title: string
  slug: SanitySlug
  _type: 'article' | 'foodProfile'
}

export interface SearchIndexItem {
  _type: 'article' | 'foodProfile' | 'outreach' | 'resource'
  _id: string
  title: string
  slug: string
  summary?: string
  aliases?: string[]
  categories?: Array<{ title: string }>
  audiences?: string[]
  theme?: string
  location?: { state?: string; lga?: string }
  language?: string
  publishedAt?: string
}

export interface TopicWithCount {
  category: CategoryDoc
  count: number
}

/* ────────────────────────────────────────────────────────────────────────────
   Safe fetch
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Nutrition queries span two content types plus the shared category and search
 * index, so the default tag set is deliberately broad. Callers that know they
 * are reading a single type (article archive vs food archive) narrow it via
 * the `tags` argument, which keeps a food publish from needlessly rebuilding
 * every article page.
 */
async function safeFetch<T>(
  query: string,
  fallback: T,
  params?: QueryParams,
  tags: CacheTag[] = [CACHE_TAGS.articles, CACHE_TAGS.foods, CACHE_TAGS.searchIndex, CACHE_TAGS.navigation],
): Promise<T> {
  try {
    return await sanityFetch<T>(query, params ?? {}, { tags })
  } catch {
    return fallback
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   Fixture adapters
   ──────────────────────────────────────────────────────────────────────────── */

function adaptCategory(c: FixtureCategory): CategoryDoc {
  return { _id: c._id, title: c.title, slug: { _type: 'slug', current: c.slug.current }, kind: c.kind, description: c.description }
}

/** Fixture SEO used the legacy metaTitle/metaDescription shape — normalise. */
function adaptFixtureSeo(
  seo?: { metaTitle?: string; metaDescription?: string },
): SeoMeta | undefined {
  if (!seo) return undefined
  return {
    ...(seo.metaTitle ? { title: seo.metaTitle } : {}),
    ...(seo.metaDescription ? { description: seo.metaDescription } : {}),
  }
}

function adaptArticle(a: FixtureArticle): ArticleDoc {
  return { ...(a as unknown as ArticleDoc), seo: adaptFixtureSeo(a.seo) }
}

function adaptFood(f: FixtureFood): FoodProfileDoc {
  return { ...(f as unknown as FoodProfileDoc), seo: adaptFixtureSeo(f.seo) }
}

function adaptOutreach(o: FixtureOutreach): SearchIndexItem {
  return {
    _type: 'outreach',
    _id: o._id,
    title: o.title,
    slug: o.slug.current,
    summary: o.summary,
    theme: o.theme,
    location: o.location,
    publishedAt: o.date,
  }
}

function fixtureArticleSearchItems(): SearchIndexItem[] {
  return fixtureArticles().map((a) => ({
    _type: 'article',
    _id: a._id,
    title: a.title,
    slug: a.slug.current,
    summary: a.summary,
    categories: a.categories.map((c) => ({ title: c.title })),
    audiences: a.audiences,
    publishedAt: a.publishedAt,
  }))
}

function fixtureFoodSearchItems(): SearchIndexItem[] {
  return fixtureFoods().map((f) => ({
    _type: 'foodProfile',
    _id: f._id,
    title: f.title,
    slug: f.slug.current,
    summary: f.summary,
    aliases: f.aliases,
    categories: f.categories.map((c) => ({ title: c.title })),
    publishedAt: f.publishedAt,
  }))
}

function fixtureResourceSearchItems(): SearchIndexItem[] {
  return fixtureResources().map((r) => ({
    _type: 'resource',
    _id: r._id,
    title: r.title,
    slug: r.slug.current,
    summary: r.description,
    categories: r.categories.map((c) => ({ title: c.title })),
    audiences: r.audiences,
    language: r.language,
    publishedAt: r.publishedAt,
  }))
}

/* ────────────────────────────────────────────────────────────────────────────
   Categories
   ──────────────────────────────────────────────────────────────────────────── */

export async function getAllCategories(): Promise<CategoryDoc[]> {
  if (useContentFixtures()) return fixtureCategories().map(adaptCategory)
  return safeFetch<CategoryDoc[]>(
    `*[_type == "category"] | order(kind asc, title asc){
      _id, title, slug, kind, description,
    }`,
    [],
  )
}

export async function getTopicCategories(): Promise<CategoryDoc[]> {
  if (useContentFixtures()) {
    return fixtureCategories()
      .filter((c) => c.kind === 'topic')
      .map(adaptCategory)
  }
  return safeFetch<CategoryDoc[]>(
    `*[_type == "category" && kind == "topic"] | order(title asc){
      _id, title, slug, kind, description,
    }`,
    [],
  )
}

/** Topic categories with an approved-content count (drives the hub entry tiles). */
export async function getTopicCounts(): Promise<TopicWithCount[]> {
  if (useContentFixtures()) {
    return fixtureTopicCounts().map(({ category, count }) => ({ category: adaptCategory(category), count }))
  }
  const rows = await safeFetch<
    Array<CategoryDoc & { count: number }>
  >(
    `*[_type == "category" && kind == "topic"]{
      _id, title, slug, kind, description,
      "count": (
        count(*[_type == "article" && reviewStatus == "approved" && references(^._id)]) +
        count(*[_type == "foodProfile" && reviewStatus == "approved" && references(^._id)])
      )
    } | order(title asc)`,
    [],
  )
  return rows.map(({ count, ...category }) => ({ category, count }))
}

/* ────────────────────────────────────────────────────────────────────────────
   Articles
   ──────────────────────────────────────────────────────────────────────────── */

export async function getApprovedArticles(
  category?: string,
  audience?: string,
  condition?: string,
  page = 1,
  pageSize = 12,
): Promise<{ articles: ArticleDoc[]; total: number }> {
  if (useContentFixtures()) {
    let items = fixtureArticles().filter((a) => a.reviewStatus === 'approved')
    if (category) items = items.filter((a) => a.categories.some((c) => c.slug.current === category))
    if (audience) items = items.filter((a) => (a.audiences ?? []).includes(audience))
    if (condition) items = items.filter((a) => a.categories.some((c) => c.slug.current === condition))
    items = items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    const total = items.length
    const start = (page - 1) * pageSize
    return { articles: items.slice(start, start + pageSize).map(adaptArticle), total }
  }

  const filters = ['_type == "article"', 'reviewStatus == "approved"']
  const params: Record<string, string> = {}

  if (category) {
    filters.push('"$category" in categories[]->slug.current')
    params.category = category
  }
  if (audience) {
    filters.push('"$audience" in audiences')
    params.audience = audience
  }
  if (condition) {
    filters.push('"$condition" in categories[]->slug.current')
    params.condition = condition
  }

  const where = filters.join(' && ')
  const start = (page - 1) * pageSize

  const dataQuery = `[${where}] | order(publishedAt desc) [${start}...${start + pageSize}]{
    _id, title, slug, summary, publishedAt, featuredImage, audiences,
    "categories": categories[]->{ _id, title, slug, kind },
    "author": author->{ name, qualifications, slug },
    "reviewer": reviewer->{ name, qualifications, slug },
  }`

  const [total, articles] = await Promise.all([
    safeFetch<number>(`count(*[${where}])`, 0, params),
    safeFetch<ArticleDoc[]>(`*${dataQuery}`, [], params),
  ])

  return { articles, total }
}

export async function getArticleBySlug(slug: string): Promise<ArticleDoc | null> {
  if (useContentFixtures()) {
    const found = fixtureArticles().find((a) => a.slug.current === slug && a.reviewStatus === 'approved')
    return found ? adaptArticle(found) : null
  }
  return safeFetch<ArticleDoc | null>(
    `*[_type == "article" && slug.current == $slug && reviewStatus == "approved"][0]{
      _id, title, slug, summary, featuredImage, audiences, keyTakeaways, body,
      publishedAt, lastReviewedAt, nextReviewAt, reviewStatus, featured,
      "author": author->{ name, qualifications, slug },
      "reviewer": reviewer->{ name, qualifications, slug },
      "categories": categories[]->{ _id, title, slug, kind },
      "references": references[]{ title, publisher, url, accessedAt },
      "relatedContent": relatedContent[]->{ _id, title, slug, _type },
      seo,
    }`,
    null,
    { slug },
  )
}

export async function getFeaturedArticle(): Promise<ArticleDoc | null> {
  if (useContentFixtures()) {
    const found = fixtureArticles()
      .filter((a) => a.reviewStatus === 'approved')
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.publishedAt.localeCompare(a.publishedAt))[0]
    return found ? adaptArticle(found) : null
  }
  return safeFetch<ArticleDoc | null>(
    `*[_type == "article" && reviewStatus == "approved"] | order(featured desc, publishedAt desc) [0]{
      _id, title, slug, summary, publishedAt, featuredImage,
      "categories": categories[]->{ _id, title, slug },
      "author": author->{ name },
    }`,
    null,
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Food profiles
   ──────────────────────────────────────────────────────────────────────────── */

export async function getApprovedFoodProfiles(
  category?: string,
  group?: string,
  page = 1,
  pageSize = 12,
): Promise<{ profiles: FoodProfileDoc[]; total: number }> {
  if (useContentFixtures()) {
    let items = fixtureFoods().filter((f) => f.reviewStatus === 'approved')
    if (category) items = items.filter((f) => (f.categories ?? []).some((c) => c.slug.current === category))
    if (group) items = items.filter((f) => (f.categories ?? []).some((c) => c.slug.current === group))
    items = items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    const total = items.length
    const start = (page - 1) * pageSize
    return { profiles: items.slice(start, start + pageSize).map(adaptFood), total }
  }

  const filters = ['_type == "foodProfile"', 'reviewStatus == "approved"']
  const params: Record<string, string> = {}

  if (category) {
    filters.push('"$category" in categories[]->slug.current')
    params.category = category
  }
  if (group) {
    filters.push('"$group" in categories[]->slug.current')
    params.group = group
  }

  const where = filters.join(' && ')
  const start = (page - 1) * pageSize

  const [total, profiles] = await Promise.all([
    safeFetch<number>(`count(*[${where}])`, 0, params),
    safeFetch<FoodProfileDoc[]>(
      `*[${where}] | order(publishedAt desc) [${start}...${start + pageSize}]{
        _id, title, slug, summary, publishedAt, featuredImage, aliases,
        "categories": categories[]->{ _id, title, slug, kind },
        "author": author->{ name, qualifications },
        "reviewer": reviewer->{ name, qualifications },
      }`,
      [],
      params,
    ),
  ])

  return { profiles, total }
}

export async function getFoodProfileBySlug(slug: string): Promise<FoodProfileDoc | null> {
  if (useContentFixtures()) {
    const found = fixtureFoods().find((f) => f.slug.current === slug && f.reviewStatus === 'approved')
    return found ? adaptFood(found) : null
  }
  return safeFetch<FoodProfileDoc | null>(
    `*[_type == "foodProfile" && slug.current == $slug && reviewStatus == "approved"][0]{
      _id, title, slug, scientificName, aliases, summary, featuredImage,
      description, nutrients, benefits, preparation, portionContext, cautions,
      myths, mealIdeas,
      publishedAt, lastReviewedAt, nextReviewAt, reviewStatus, featured,
      "categories": categories[]->{ _id, title, slug, kind },
      "references": references[]{ title, publisher, url, accessedAt },
      "author": author->{ name, qualifications, slug },
      "reviewer": reviewer->{ name, qualifications, slug },
      seo,
    }`,
    null,
    { slug },
  )
}

export async function getFeaturedFoodProfile(): Promise<FoodProfileDoc | null> {
  if (useContentFixtures()) {
    const found = fixtureFoods()
      .filter((f) => f.reviewStatus === 'approved')
      .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)) || b.publishedAt.localeCompare(a.publishedAt))[0]
    return found ? adaptFood(found) : null
  }
  return safeFetch<FoodProfileDoc | null>(
    `*[_type == "foodProfile" && reviewStatus == "approved"] | order(featured desc, publishedAt desc) [0]{
      _id, title, slug, summary, publishedAt, featuredImage, aliases,
      "author": author->{ name },
    }`,
    null,
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Related content — editor picks first, then category fallback that stays
   safe (never pairs a "health conditions" article with food profiles in a way
   that implies treatment).
   ──────────────────────────────────────────────────────────────────────────── */

export async function getFallbackRelated(
  article: Pick<ArticleDoc, '_id' | 'categories'>,
  excludeIds: string[],
  limit = 3,
): Promise<RelatedContentItem[]> {
  const primary = article.categories?.[0]
  const isConditionFocused =
    primary?.slug.current === 'health-conditions' ||
    article.categories?.some((c) => (c as { kind?: string }).kind === 'condition')

  if (useContentFixtures()) {
    const all: Array<{ _id: string; title: string; slug: { current: string }; _type: 'article' | 'foodProfile'; publishedAt: string; categories: Array<{ slug: { current: string } }> }> = [
      ...fixtureArticles().map((a) => ({ _id: a._id, title: a.title, slug: a.slug, _type: 'article' as const, publishedAt: a.publishedAt, categories: a.categories })),
      ...fixtureFoods().map((f) => ({ _id: f._id, title: f.title, slug: f.slug, _type: 'foodProfile' as const, publishedAt: f.publishedAt, categories: f.categories ?? [] })),
    ]
    const pooled = all.filter(
      (item) =>
        item._id !== article._id &&
        !excludeIds.includes(item._id) &&
        (!isConditionFocused || item._type === 'article') &&
        primary !== undefined &&
        item.categories.some((c) => c.slug.current === primary.slug.current),
    )
    return pooled
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit)
      .map((item) => ({ _id: item._id, title: item.title, slug: { _type: 'slug', current: item.slug.current }, _type: item._type }))
  }

  const filters = [
    '_type in ["article", "foodProfile"]',
    'reviewStatus == "approved"',
    '_id != $id',
  ]
  const params: Record<string, string> = { id: article._id }
  if (primary) {
    filters.push('"$primary" in categories[]->slug.current')
    params.primary = primary.slug.current
  }
  if (isConditionFocused) filters.push('_type == "article"')

  return safeFetch<RelatedContentItem[]>(
    `*[${filters.join(' && ')}] | order(publishedAt desc) [0...${limit}]{
      _id, title, slug, _type,
    }`,
    [],
    params,
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Search index (articles + food profiles + outreach)
   ──────────────────────────────────────────────────────────────────────────── */

export async function getSearchIndex(term?: string): Promise<SearchIndexItem[]> {
  const query = term?.trim().toLowerCase()

  if (useContentFixtures()) {
    const articleItems = fixtureArticleSearchItems()
    const foodItems = fixtureFoodSearchItems()
    const outreachItems = fixtureOutreaches().map(adaptOutreach)
    const resourceItems = fixtureResourceSearchItems()
    const all = [...articleItems, ...foodItems, ...outreachItems, ...resourceItems]

    if (query) {
      const terms = query.split(/\s+/).filter(Boolean)
      return all.filter((item) => {
        const haystack = [
          item.title,
          item.summary ?? '',
          ...(item.aliases ?? []),
          ...(item.categories?.map((c) => c.title) ?? []),
          ...(item.audiences ?? []),
          item.theme ?? '',
          item.location?.state ?? '',
          item.location?.lga ?? '',
          item.language ?? '',
        ]
          .join(' ')
          .toLowerCase()
        return terms.every((t) => haystack.includes(t))
      })
    }
    return all
  }

  const contentWhere =
    '((_type in ["article", "foodProfile"] && reviewStatus == "approved") || (_type == "outreach" && status in ["upcoming", "completed"]) || (_type == "resource" && defined(publishedAt)))'

  const termFilter = query
    ? ' && (title match $term || summary match $term || string::lower(aliases[]) match $term || categories[]->title match $term || audiences[] match $term || theme match $term || location.state match $term || location.lga match $term || language match $term)'
    : ''

  return safeFetch<SearchIndexItem[]>(
    `*[${contentWhere}${termFilter}] | order(publishedAt desc) [0...80]{
      _type, _id, title, "slug": slug.current, summary,
      aliases, "categories": categories[]->{ title }, audiences, theme,
      location, language, publishedAt,
    }`,
    [],
    query ? { term: `*${query}*` } : undefined,
  )
}