import type { Metadata } from 'next'
import { getApprovedFoodProfiles, getAllCategories } from '@/features/nutrition/queries'
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
  searchParams: Promise<{ category?: string; group?: string; page?: string }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  const category = params.category
  const title = category
    ? `Food Profiles — ${category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ')}`
    : 'Nigerian Food Profiles'
  return {
    title,
    description:
      'Nutrient information, healthy preparation ideas and practical guidance for common Nigerian foods.',
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

interface Filters {
  category?: string
  group?: string
  page?: string
}

export default async function FoodProfilesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters: Filters = {
    category: params.category,
    group: params.group,
  }
  const currentPage = Math.max(1, parseInt(params.page ?? '1', 10))
  const pageSize = 12

  const [{ profiles, total }, categories] = await Promise.all([
    getApprovedFoodProfiles(params.category, params.group, currentPage, pageSize),
    getAllCategories(),
  ])

  const totalPages = Math.ceil(total / pageSize)
  const topics = categories.filter((c) => c.kind === 'topic')
  const groups = categories.filter((c) => c.kind === 'food-group')
  const activeFilters = Boolean(params.category || params.group)

  function buildUrl(updates: Filters) {
    const merged = { ...filters, ...updates }
    const sp = new URLSearchParams()
    if (merged.category) sp.set('category', merged.category)
    if (merged.group) sp.set('group', merged.group)
    if (merged.page && merged.page !== '1') sp.set('page', merged.page)
    const qs = sp.toString()
    return `/nutrition/foods${qs ? `?${qs}` : ''}`
  }

  return (
    <PageShell
      title="Nigerian Food Profiles"
      eyebrow="Nutrition Hub"
      description="Explore the nutritional benefits, preparation ideas and practical guidance for common Nigerian foods."
      breadcrumbs={generateBreadcrumbs('/nutrition/foods')}
    >
      <Container>
        {/* Content-type switch */}
        <section className="mb-6 flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium text-ink-600">Content:</span>
          <Link
            href="/nutrition/articles"
            className="rounded-full border border-ink-200 px-3 py-1 font-medium text-ink-700 hover:bg-paper-100"
          >
            Articles
          </Link>
          <Link
            href="/nutrition/foods"
            aria-current="page"
            className="rounded-full bg-palm-600 px-3 py-1 font-medium text-white"
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

        {/* Food-group filter */}
        {groups.length > 0 ? (
          <section className="mb-5" aria-label="Filter by food group">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-ink-600 mr-1">Food group:</span>
              <Button asChild variant={!params.group ? 'primary' : 'quiet'} size="sm">
                <Link href={buildUrl({ group: undefined, page: undefined })}>All</Link>
              </Button>
              {groups.map((g) => (
                <Button
                  key={g._id}
                  asChild
                  variant={params.group === g.slug.current ? 'primary' : 'quiet'}
                  size="sm"
                >
                  <Link href={buildUrl({ group: g.slug.current, page: undefined })}>
                    {g.title}
                  </Link>
                </Button>
              ))}
            </div>
          </section>
        ) : null}

        {/* Result count + clear all */}
        <section className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">
            {total} {total === 1 ? 'food profile' : 'food profiles'} found
          </p>
          {activeFilters ? (
            <Link
              href="/nutrition/foods"
              className="rounded-md border border-ink-200 px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-paper-100"
            >
              Clear all
            </Link>
          ) : null}
        </section>

        {profiles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-12">
              {profiles.map((profile) => {
                const src = safeImageSrc(profile.featuredImage)
                return (
                  <Link
                    key={profile._id}
                    href={`/nutrition/foods/${profile.slug.current}`}
                    className="group block h-full"
                  >
                    <Card className="h-full transition-shadow group-hover:shadow-md bg-leaf-50 border-leaf-100">
                      {src ? (
                        <div className="relative aspect-[16/10] overflow-hidden rounded-t-lg bg-paper-100">
                          <ResponsiveImage
                            fill
                            src={src}
                            image={profile.featuredImage}
                            alt={profile.featuredImage?.alt ?? profile.title}
                            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                      ) : null}
                      <CardBody>
                        <CardTitle as="h2" className="group-hover:text-palm-700 transition-colors">
                          {profile.title}
                        </CardTitle>
                        {profile.aliases && profile.aliases.length > 0 ? (
                          <p className="mt-1 text-sm text-ink-500 italic">
                            {profile.aliases.slice(0, 3).join(', ')}
                          </p>
                        ) : null}
                        <CardDescription className="mt-2">{profile.summary}</CardDescription>
                        {profile.categories && profile.categories.length > 0 ? (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {profile.categories.map((cat) => (
                              <Badge key={cat._id} variant="palm" className="text-xs">
                                {cat.title}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                        <div className="mt-4 text-xs text-ink-500">
                          {profile.publishedAt ? (
                            <time dateTime={profile.publishedAt}>
                              {formatDate(profile.publishedAt)}
                            </time>
                          ) : null}
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
                basePath="/nutrition/foods"
                params={{ category: params.category, group: params.group }}
                className="mb-12"
              />
            ) : null}

            <section className="rounded-lg border border-ink-100 bg-paper-50 p-6">
              <p className="text-sm text-ink-600">
                Want the bigger picture?{' '}
                <Link href="/nutrition/articles" variant="branded">
                  Browse nutrition articles
                </Link>{' '}
                or <Link href="/nutrition/search" variant="branded">search the hub</Link> directly.
              </p>
            </section>
          </>
        ) : (
          <EmptyState
            title="No food profiles found"
            description={
              activeFilters
                ? 'Try selecting a different category or food group to find more content.'
                : 'Food profiles will appear here once published in the CMS.'
            }
            action={
              activeFilters ? (
                <Link
                  href="/nutrition/foods"
                  className="inline-flex items-center justify-center gap-2 rounded-md border border-ink-200 bg-transparent px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-paper-100"
                >
                  Clear filters
                </Link>
              ) : undefined
            }
          />
        )}
      </Container>
    </PageShell>
  )
}