import type { Metadata } from 'next'
import { getApprovedArticles, getAllCategories } from '@/features/nutrition/queries'
import { PageShell } from '@/components/layout/PageShell'
import { Container } from '@/components/ui/Container'
import { Link } from '@/components/ui/Link'
import { Card, CardBody, CardTitle, CardDescription } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Pagination } from '@/components/ui/Pagination'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { urlFor } from '@/lib/sanity/client'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { SearchIcon } from '@/components/icons'
import { formatDateLong } from '@/lib/format'

export const revalidate = 3600

interface PageProps {
  searchParams: Promise<{
    category?: string
    audience?: string
    condition?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  const category = params.category
  const title = category
    ? `Articles — ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}`
    : 'Nutrition Articles'
  return {
    title,
    description:
      'Evidence-based nutrition articles written and reviewed by qualified professionals.',
  }
}

function formatDate(dateStr: string): string {
  return formatDateLong(dateStr)
}

function safeImageSrc(image: { asset?: { _ref?: string } } | undefined): string | undefined {
  if (!image?.asset?._ref) return undefined
  try {
    return urlFor(image).width(600).auto('format').url()
  } catch {
    return undefined
  }
}

const AUDIENCE_OPTIONS = [
  { value: 'general', label: 'General Public' },
  { value: 'parents', label: 'Parents & Caregivers' },
  { value: 'pregnant', label: 'Pregnant Women' },
  { value: 'young-adults', label: 'Young Adults' },
  { value: 'health-workers', label: 'Health Workers' },
  { value: 'schools', label: 'Schools' },
  { value: 'professionals', label: 'Professionals' },
]

interface Filters {
  category?: string
  audience?: string
  condition?: string
  page?: string
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters: Filters = {
    category: params.category,
    audience: params.audience,
    condition: params.condition,
  }
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10))
  const pageSize = 12

  const [{ articles, total }, categories] = await Promise.all([
    getApprovedArticles(params.category, params.audience, params.condition, currentPage, pageSize),
    getAllCategories(),
  ])

  const totalPages = Math.ceil(total / pageSize)
  const topics = categories.filter((c) => c.kind === 'topic')
  const conditions = categories.filter((c) => c.kind === 'condition')
  const activeFilters = Boolean(params.category || params.audience || params.condition)

  function buildUrl(updates: Filters) {
    const merged = { ...filters, ...updates }
    const sp = new URLSearchParams()
    if (merged.category) sp.set('category', merged.category)
    if (merged.audience) sp.set('audience', merged.audience)
    if (merged.condition) sp.set('condition', merged.condition)
    if (merged.page && merged.page !== '1') sp.set('page', merged.page)
    const qs = sp.toString()
    return `/nutrition/articles${qs ? `?${qs}` : ''}`
  }

  return (
    <PageShell
      title="Nutrition Articles"
      eyebrow="Nutrition Hub"
      description="Browse evidence-based articles on Nigerian nutrition, health and healthy living."
      breadcrumbs={generateBreadcrumbs('/nutrition/articles')}
    >
      <Container>
        {/* Content-type switch */}
        <section className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-ink-600">Content:</span>
          <Link
            href="/nutrition/articles"
            aria-current="page"
            className="rounded-full bg-leaf-700 px-3 py-1 font-medium text-white"
          >
            Articles
          </Link>
          <Link
            href="/nutrition/foods"
            className="rounded-full border border-ink-200 px-3 py-1 font-medium text-ink-700 hover:bg-paper-100"
          >
            Food Profiles
          </Link>
          <Link
            href="/nutrition/search"
            className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 px-3 py-1 font-medium text-ink-700 hover:bg-paper-100"
          >
            <SearchIcon className="h-3.5 w-3.5" />
            Search
          </Link>
        </section>

        {/* Topic filter */}
        <section className="mb-5" aria-label="Filter by topic">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ink-600 mr-1">Topic:</span>
            <Button asChild variant={!params.category ? 'primary' : 'quiet'} size="sm">
              <Link href={buildUrl({ category: undefined, page: undefined })}>All</Link>
            </Button>
            {topics.map((t) => (
              <Button
                key={t._id}
                asChild
                variant={params.category === t.slug.current ? 'primary' : 'quiet'}
                size="sm"
              >
                <Link href={buildUrl({ category: t.slug.current, page: undefined })}>
                  {t.title}
                </Link>
              </Button>
            ))}
          </div>
        </section>

        {/* Audience + condition filters */}
        <section className="mb-5" aria-label="Filter by audience">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ink-600 mr-1">Audience:</span>
            <Button asChild variant={!params.audience ? 'primary' : 'quiet'} size="sm">
              <Link href={buildUrl({ audience: undefined, page: undefined })}>All</Link>
            </Button>
            {AUDIENCE_OPTIONS.map((a) => (
              <Button
                key={a.value}
                asChild
                variant={params.audience === a.value ? 'primary' : 'quiet'}
                size="sm"
              >
                <Link href={buildUrl({ audience: a.value, page: undefined })}>{a.label}</Link>
              </Button>
            ))}
          </div>
        </section>

        {conditions.length > 0 ? (
          <section className="mb-5" aria-label="Filter by health condition">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-ink-600 mr-1">Condition:</span>
              <Button asChild variant={!params.condition ? 'primary' : 'quiet'} size="sm">
                <Link href={buildUrl({ condition: undefined, page: undefined })}>All</Link>
              </Button>
              {conditions.map((c) => (
                <Button
                  key={c._id}
                  asChild
                  variant={params.condition === c.slug.current ? 'primary' : 'quiet'}
                  size="sm"
                >
                  <Link href={buildUrl({ condition: c.slug.current, page: undefined })}>
                    {c.title}
                  </Link>
                </Button>
              ))}
            </div>
          </section>
        ) : null}

        {/* Result count + clear all */}
        <section className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">
            {total} {total === 1 ? 'article' : 'articles'} found
          </p>
          {activeFilters ? (
            <Link
              href="/nutrition/articles"
              className="rounded-md border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-paper-100"
            >
              Clear all
            </Link>
          ) : null}
        </section>

        {articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
              {articles.map((article) => {
                const src = safeImageSrc(article.featuredImage)
                return (
                  <Link
                    key={article._id}
                    href={`/nutrition/articles/${article.slug.current}`}
                    className="group block h-full"
                  >
                    <Card className="h-full transition-shadow group-hover:shadow-md">
                      {src ? (
                        <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg bg-paper-100">
                          <ResponsiveImage
                            fill
                            src={src}
                            image={article.featuredImage}
                            alt={article.featuredImage?.alt ?? article.title}
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      ) : null}
                      <CardBody>
                        {article.categories && article.categories.length > 0 ? (
                          <div className="mb-2 flex flex-wrap gap-1">
                            {article.categories.map((cat) => (
                              <Badge key={cat._id} variant="leaf" className="text-xs">
                                {cat.title}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        <CardTitle as="h2" className="group-hover:text-leaf-700 transition-colors">
                          {article.title}
                        </CardTitle>
                        <CardDescription className="mt-2">{article.summary}</CardDescription>
                        <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
                          <span>{article.author?.name}</span>
                          <time dateTime={article.publishedAt}>
                            {formatDate(article.publishedAt)}
                          </time>
                        </div>
                      </CardBody>
                    </Card>
                  </Link>
                )
              })}
            </div>

            {totalPages > 1 ? (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/nutrition/articles"
                params={{ category: params.category, audience: params.audience, condition: params.condition }}
                className="mb-12"
              />
            ) : null}

            <section className="rounded-lg border border-ink-100 bg-paper-50 p-6">
              <p className="text-sm text-ink-600">
                Looking for nutrient details on specific ingredients?{' '}
                <Link href="/nutrition/foods" variant="branded">
                  Browse Nigerian food profiles
                </Link>{' '}
                or <Link href="/nutrition/search" variant="branded">search the hub</Link> directly.
              </p>
            </section>
          </>
        ) : (
          <EmptyState
            title="No articles found"
            description={
              activeFilters
                ? 'Try broadening your filters, or search for a related keyword instead.'
                : 'Articles will appear here once published in the CMS.'
            }
            action={
              activeFilters ? (
                <div className="flex flex-wrap justify-center gap-2">
                  <Link
                    href="/nutrition/articles"
                    className="inline-flex items-center justify-center gap-2 rounded-md border border-ink-200 bg-transparent px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-paper-100"
                  >
                    Clear filters
                  </Link>
                  <Link
                    href="/nutrition/search"
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-leaf-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-leaf-800"
                  >
                    Search the hub
                  </Link>
                </div>
              ) : undefined
            }
          />
        )}
      </Container>
    </PageShell>
  )
}