import { NextResponse } from 'next/server'
import { getSearchIndex, type SearchIndexItem } from '@/features/nutrition/queries'
import { contentPath } from '@/lib/seo/internalLinks'

export const revalidate = 3600

/**
 * Compact, public search index consumed client-side by the command palette.
 * Built from approved articles, food profiles, resources and outreaches only.
 */
export interface ClientSearchItem {
  id: string
  type: 'article' | 'foodProfile' | 'outreach' | 'resource'
  title: string
  href: string
  summary?: string
  keywords: string[]
  publishedAt?: string
}

function toClientItem(item: SearchIndexItem): ClientSearchItem | null {
  const href = contentPath(item._type, item.slug)
  if (!href) return null

  const keywords = [
    item._type === 'outreach' ? (item.theme ?? '') : '',
    item._type === 'resource' ? (item.language ?? '') : '',
    ...(item.aliases ?? []),
    ...(item.categories?.map((c) => c.title) ?? []),
    ...(item.audiences ?? []),
    item.location?.state ?? '',
    item.location?.lga ?? '',
  ].filter(Boolean)

  return {
    id: `${item._type}-${item._id}`,
    type: item._type,
    title: item.title,
    href,
    summary: item.summary,
    keywords: [...new Set(keywords)],
    publishedAt: item.publishedAt,
  }
}

export async function GET() {
  const items = await getSearchIndex()
  return NextResponse.json(
    items.map(toClientItem).filter((item): item is ClientSearchItem => item !== null),
  )
}
