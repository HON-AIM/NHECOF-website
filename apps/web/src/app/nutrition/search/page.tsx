import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { contentPath } from '@/lib/seo/internalLinks'
import { getSearchIndex } from '@/features/nutrition/queries'
import { PageShell } from '@/components/layout/PageShell'
import { Container } from '@/components/ui/Container'
import { Link } from '@/components/ui/Link'
import { Card, CardBody, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SearchIcon, CloseIcon, CalendarIcon, LocationIcon } from '@/components/icons'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { formatDateLong } from '@/lib/format'

export const revalidate = 3600

interface PageProps {
  searchParams: Promise<{ q?: string; type?: string }>
}

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/nutrition/search',
    fallbackTitle: 'Search',
    fallbackDescription:
      'Search the Nutrition Hub for evidence-based articles and Nigerian food profiles.',
  })
}

function formatDate(dateStr?: string): string {
  return formatDateLong(dateStr)
}

function itemHref(item: { _type: string; slug: string }): string | null {
  return contentPath(item._type, item.slug)
}

function typeBadge(item: { _type: string }) {
  if (item._type === 'article') return <Badge variant="leaf">Article</Badge>
  if (item._type === 'foodProfile') return <Badge variant="clay">Food Profile</Badge>
  if (item._type === 'resource') return <Badge variant="gold">Resource</Badge>
  return <Badge variant="info">Outreach</Badge>
}

const TYPE_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'article', label: 'Articles' },
  { value: 'foodProfile', label: 'Food Profiles' },
  { value: 'resource', label: 'Resources' },
  { value: 'outreach', label: 'Outreaches' },
]

export default async function SearchPage({ searchParams }: PageProps) {
  const params = await searchParams
  const query = params.q?.trim() ?? ''
  const typeFilter = params.type ?? ''
  const allResults = query ? await getSearchIndex(query) : []
  const results = typeFilter ? allResults.filter((item) => item._type === typeFilter) : allResults

  function buildUrl(updates: { q?: string; type?: string }) {
    const merged = { q: query, type: typeFilter, ...updates }
    const sp = new URLSearchParams()
    if (merged.q) sp.set('q', merged.q)
    if (merged.type) sp.set('type', merged.type)
    const qs = sp.toString()
    return `/nutrition/search${qs ? `?${qs}` : ''}`
  }

  return (
    <PageShell
      title="Search the Nutrition Hub"
      eyebrow="Search"
      description="Find evidence-based articles, Nigerian food profiles and community outreaches."
      breadcrumbs={generateBreadcrumbs('/nutrition/search')}
    >
      <Container className="max-w-3xl">
        <form
          action="/nutrition/search"
          method="get"
          role="search"
          className="mb-6 flex items-center gap-2"
        >
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search articles and foods…"
              aria-label="Search the Nutrition Hub"
              autoFocus
              className="w-full rounded-lg border border-ink-200 bg-paper-50 py-2.5 pl-9 pr-9 text-sm text-ink-800 placeholder:text-ink-400 focus:border-leaf-700 focus:outline-2 focus:outline-offset-2 focus:outline-leaf-700"
            />
            {query ? (
              <a
                href="/nutrition/search"
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600"
              >
                <CloseIcon className="h-4 w-4" />
              </a>
            ) : null}
          </div>
          <button
            type="submit"
            className="rounded-lg bg-leaf-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-leaf-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700"
          >
            Search
          </button>
        </form>

        {/* Content-type segmented control */}
        <div
          role="group"
          aria-label="Filter results by content type"
          className="mb-6 flex flex-wrap gap-2 text-sm"
        >
          {TYPE_OPTIONS.map((option) => {
            const active = typeFilter === option.value
            return (
              <Link
                key={option.value || 'all'}
                href={buildUrl({ type: option.value || undefined })}
                aria-current={active ? 'true' : undefined}
                className={
                  active
                    ? 'rounded-full bg-leaf-700 px-3 py-1 font-medium text-white'
                    : 'rounded-full border border-ink-200 px-3 py-1 font-medium text-ink-700 hover:bg-paper-100'
                }
              >
                {option.label}
              </Link>
            )
          })}
        </div>

        {!query ? (
          <EmptyState
            title="Type a keyword to begin"
            description={
              'Try "Nutrition Basics", "moringa", "anaemia during pregnancy", or "food safety".'
            }
          />
        ) : results.length === 0 ? (
          <EmptyState
            title="No results found"
            description={`Nothing matched "${query}"${
              typeFilter ? ' for this content type' : ''
            }. Try a different keyword.`}
            action={
              <div className="flex flex-wrap justify-center gap-2">
                {typeFilter ? (
                  <Link
                    href={buildUrl({ type: undefined })}
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-ink-200 bg-transparent px-4 py-2 text-sm font-medium text-ink-700 hover:bg-paper-100"
                  >
                    Show all content types
                  </Link>
                ) : null}
                <Link
                  href="/nutrition"
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-leaf-700 px-4 py-2 text-sm font-medium text-white hover:bg-leaf-800"
                >
                  Browse the Nutrition Hub
                </Link>
              </div>
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-ink-500">
              {results.length} {results.length === 1 ? 'result' : 'results'} for “{query}”
            </p>
            <ul className="space-y-4">
              {results.map((item) => {
                const href = itemHref(item)
                if (!href) return null
                return (
                  <li key={`${item._type}-${item._id}`}>
                    <Link href={href} className="group block">
                      <Card className="transition-shadow group-hover:shadow-md">
                        <CardBody>
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            {typeBadge(item)}
                            {item.categories && item.categories.length > 0 ? (
                              <span className="text-xs text-ink-400">
                                {item.categories.map((c) => c.title).join(', ')}
                              </span>
                            ) : null}
                            {item.theme ? (
                              <span className="text-xs text-ink-400">{item.theme}</span>
                            ) : null}
                          </div>
                          <CardTitle
                            as="h2"
                            className="text-base group-hover:text-leaf-700 transition-colors"
                          >
                            {item.title}
                          </CardTitle>
                          {item.aliases && item.aliases.length > 0 ? (
                            <p className="mt-1 text-sm text-ink-500 italic">
                              {item.aliases.join(', ')}
                            </p>
                          ) : null}
                          {item.summary ? (
                            <CardDescription className="mt-1 line-clamp-2">
                              {item.summary}
                            </CardDescription>
                          ) : null}
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-400">
                            {item.location?.state ? (
                              <span className="inline-flex items-center gap-1">
                                <LocationIcon className="h-3.5 w-3.5" />
                                {[item.location.lga, item.location.state]
                                  .filter(Boolean)
                                  .join(', ')}
                              </span>
                            ) : null}
                            {item.publishedAt ? (
                              <span className="inline-flex items-center gap-1">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                {formatDate(item.publishedAt)}
                              </span>
                            ) : null}
                          </div>
                        </CardBody>
                      </Card>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </Container>
    </PageShell>
  )
}
