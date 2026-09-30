import { sanityFetch } from '@/lib/sanity/fetch'
import { CACHE_TAGS } from '@/lib/sanity/tags'
import { useContentFixtures } from '@/lib/content/dataSource'
import { fixtureResources } from '@/lib/content/fixtures'
import type { FixtureResource, FixtureResourceType } from '@/lib/content/fixtures'

export type ResourceType = FixtureResourceType

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  guide: 'Guide',
  infographic: 'Infographic',
  report: 'Report',
  'fact-sheet': 'Fact Sheet',
  poster: 'Poster',
  other: 'Other',
}

export const RESOURCE_TYPES: ResourceType[] = ['guide', 'infographic', 'report', 'fact-sheet', 'poster', 'other']

export const LANGUAGE_LABELS: Record<string, string> = {
  en: 'English',
  ha: 'Hausa',
  yo: 'Yoruba',
  ig: 'Igbo',
  pcm: 'Pidgin',
}

export interface ResourceCategory {
  title: string
  slug: string
  kind?: string
}

export interface ResourceDoc {
  _id: string
  title: string
  slug: string
  description?: string | null
  type: ResourceType
  /** Resolved target for the download button (file asset URL or external URL). */
  downloadUrl: string | null
  fileExtension?: string | null
  fileSizeBytes?: number | null
  language: string
  audiences: string[]
  categories: ResourceCategory[]
  publishedAt: string
}

export interface ResourceFilters {
  type?: string
  topic?: string
  audience?: string
}

export function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function languageLabel(code: string): string {
  return LANGUAGE_LABELS[code] ?? code
}

function sortByNewest<T extends { publishedAt: string }>(items: T[]): T[] {
  return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
}

function adaptFixtureResource(r: FixtureResource): ResourceDoc {
  return {
    _id: r._id,
    title: r.title,
    slug: r.slug.current,
    description: r.description,
    type: r.type,
    downloadUrl: r.file.externalUrl ?? r.file.file ?? null,
    fileExtension: r.file.extension ?? null,
    fileSizeBytes: r.file.sizeBytes ?? null,
    language: r.language,
    audiences: r.audiences,
    categories: r.categories.map((c) => ({ title: c.title, slug: c.slug.current })),
    publishedAt: r.publishedAt,
  }
}

async function safeFetch<T>(query: string, params?: Record<string, string | undefined>): Promise<T> {
  try {
    return await sanityFetch<T>(query, params ?? {}, {
      tags: [CACHE_TAGS.resources, CACHE_TAGS.homepage, CACHE_TAGS.searchIndex],
    })
  } catch {
    return [] as unknown as T
  }
}

export async function getResources(filters: ResourceFilters = {}): Promise<ResourceDoc[]> {
  if (useContentFixtures()) {
    let items = fixtureResources().map(adaptFixtureResource)
    if (filters.type) items = items.filter((r) => r.type === filters.type)
    if (filters.topic) items = items.filter((r) => r.categories.some((c) => c.slug === filters.topic))
    if (filters.audience) items = items.filter((r) => r.audiences.includes(filters.audience as string))
    return sortByNewest(items)
  }

  const where: string[] = ['_type == "resource"', 'defined(publishedAt)']
  const params: Record<string, string> = {}
  if (filters.type) {
    where.push('type == $type')
    params.type = filters.type
  }
  if (filters.topic) {
    where.push('"$topic" in categories[]->slug.current')
    params.topic = filters.topic
  }
  if (filters.audience) {
    where.push('"$audience" in audiences')
    params.audience = filters.audience
  }

  return safeFetch<ResourceDoc[]>(
    `*[${where.join(' && ')}] | order(publishedAt desc){
      _id, title, "slug": slug.current, description, type,
      "downloadUrl": coalesce(file.asset->url, externalUrl),
      "fileExtension": file.asset->extension,
      "fileSizeBytes": file.asset->size,
      language, audiences,
      "categories": categories[]->{ title, "slug": slug.current, kind },
      publishedAt,
    }`,
    params,
  )
}

export async function getResourceBySlug(slug: string): Promise<ResourceDoc | null> {
  if (useContentFixtures()) {
    const found = fixtureResources().map(adaptFixtureResource).find((r) => r.slug === slug)
    return found ?? null
  }

  try {
    const row = await sanityFetch<ResourceDoc | null>(
      `*[_type == "resource" && slug.current == $slug && defined(publishedAt)][0]{
        _id, title, "slug": slug.current, description, type,
        "downloadUrl": coalesce(file.asset->url, externalUrl),
        "fileExtension": file.asset->extension,
        "fileSizeBytes": file.asset->size,
        language, audiences,
        "categories": categories[]->{ title, "slug": slug.current, kind },
        publishedAt,
      }`,
      { slug },
      { tags: [CACHE_TAGS.resources, CACHE_TAGS.homepage] },
    )
    return row ?? null
  } catch {
    return null
  }
}