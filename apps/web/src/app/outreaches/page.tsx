import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import Link from 'next/link'
import { getApprovedOutreaches, getOutreachFilterOptions, type OutreachFilters } from '@/features/outreach/queries'
import { PageShell } from '@/components/layout/PageShell'
import { Container } from '@/components/ui/Container'
import { Card, CardBody, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { CalendarIcon, LocationIcon } from '@/components/icons'
import { LEAF_CUT_PATH } from '@/components/ui/LeafCutFrame'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { selectPublishableImages } from '@/features/impact/aggregate'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { formatDateShort, formatNumber } from '@/lib/format'
import { urlFor } from '@/lib/sanity/client'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/outreaches',
    fallbackTitle: 'Outreaches & Community Activities',
    fallbackDescription:
      'Completed and upcoming community outreach and education activities delivered by NHECOF with partners across Nigeria.',
  })
}

function formatShortDate(dateStr: string): string {
  return formatDateShort(dateStr)
}

function safeImageSrc(image: { asset?: { _ref?: string } } | undefined): string | undefined {
  if (!image?.asset?._ref) return undefined
  try {
    return urlFor(image).width(1200).auto('format').url()
  } catch {
    return undefined
  }
}

function placeLine(outreach: {
  location?: { community?: string; lga?: string; state?: string }
}): string {
  const parts = [outreach.location?.community, outreach.location?.lga, outreach.location?.state].filter(
    Boolean,
  )
  return parts.join(', ')
}

/** One tangible outcome for the card (results > attendance > screened). */
function outcomeLine(outreach: {
  results?: Array<{ label: string; value: string }>
  attendance?: number
  screened?: number
}): string | null {
  if (outreach.results && outreach.results.length > 0) {
    const first = outreach.results[0]
    return `${first.label}: ${first.value}`
  }
  if (typeof outreach.attendance === 'number' && outreach.attendance > 0) {
    return `${formatNumber(outreach.attendance)} people attended`
  }
  if (typeof outreach.screened === 'number' && outreach.screened > 0) {
    return `${formatNumber(outreach.screened)} people screened`
  }
  return null
}

export default async function OutreachesPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; state?: string; programme?: string }>
}) {
  const params = await searchParams
  const filters: OutreachFilters = {
    year: params.year,
    state: params.state,
    programme: params.programme,
  }

  const [{ outreaches, total }, options] = await Promise.all([
    getApprovedOutreaches(filters),
    getOutreachFilterOptions(),
  ])

  const hasActiveFilter = Boolean(filters.year || filters.state || filters.programme)

  function linkFor(overrides: Partial<OutreachFilters>): string {
    const next: OutreachFilters = { year: filters.year, state: filters.state, programme: filters.programme, ...overrides }
    const qs = new URLSearchParams()
    for (const [key, value] of Object.entries(next)) {
      if (value) qs.set(key, value)
    }
    const query = qs.toString()
    return query ? `/outreaches?${query}` : '/outreaches'
  }

  const filterGroupClass = 'flex flex-wrap items-center gap-1.5'

  return (
    <PageShell
      title="Outreaches & Community Activities"
      eyebrow="Community"
      description="Screening, education and outreach events delivered with partners across Nigeria — upcoming first, then completed records."
      breadcrumbs={generateBreadcrumbs('/outreaches')}
    >
      <Container>
        <div className="mb-8 rounded-xl border border-ink-100 bg-white p-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div role="group" aria-labelledby="outreach-filter-year">
              <p id="outreach-filter-year" className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Year</p>
              <div className={filterGroupClass}>
                <FilterLink href={linkFor({ year: undefined })} label="All" active={!filters.year} />
                {options.years.map((year) => (
                  <FilterLink
                    key={year}
                    href={linkFor({ year })}
                    label={year}
                    active={filters.year === year}
                  />
                ))}
              </div>
            </div>
            <div role="group" aria-labelledby="outreach-filter-state">
              <p id="outreach-filter-state" className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">State</p>
              <div className={filterGroupClass}>
                <FilterLink href={linkFor({ state: undefined })} label="All" active={!filters.state} />
                {options.states.map((state) => (
                  <FilterLink
                    key={state}
                    href={linkFor({ state })}
                    label={state}
                    active={filters.state === state}
                  />
                ))}
              </div>
            </div>
            <div role="group" aria-labelledby="outreach-filter-programme">
              <p id="outreach-filter-programme" className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">Programme</p>
              <div className={filterGroupClass}>
                <FilterLink href={linkFor({ programme: undefined })} label="All" active={!filters.programme} />
                {options.programmes.map((programme) => (
                  <FilterLink
                    key={programme}
                    href={linkFor({ programme })}
                    label={programme.replace(/-/g, ' ')}
                    active={filters.programme === programme}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {outreaches.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-ink-500" role="status">
              {total} {total === 1 ? 'outreach' : 'outreaches'}
              {hasActiveFilter ? ' found' : ' listed'}
            </p>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {outreaches.map((outreach) => {
                const [cover] = selectPublishableImages(outreach.images)
                const coverSrc = safeImageSrc(cover)
                const outcome = outcomeLine(outreach)
                const place = placeLine(outreach)
                return (
                  <li key={outreach._id}>
                    <Link
                      href={`/outreaches/${outreach.slug.current}`}
                      className="group flex h-full"
                    >
                      <Card className="h-full w-full overflow-hidden transition-shadow group-hover:shadow-md">
                        {coverSrc ? (
                          <div className="aspect-[16/10] w-full bg-leaf-100 p-2">
                            <div
                              className="relative h-full w-full overflow-hidden"
                              style={{ clipPath: LEAF_CUT_PATH }}
                            >
                              <ResponsiveImage
                                fill
                                src={coverSrc}
                                image={cover}
                                alt={cover.alt ?? outreach.title}
                                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                className="object-cover transition-transform group-hover:scale-105"
                              />
                            </div>
                          </div>
                        ) : null}
                        <CardBody className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <Badge variant={outreach.status === 'upcoming' ? 'default' : 'leaf'}>
                              {outreach.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                            </Badge>
                            <span className="text-xs text-ink-400">{outreach.theme}</span>
                          </div>
                          <CardTitle as="h2" className="text-base group-hover:text-leaf-700 transition-colors">
                            {outreach.title}
                          </CardTitle>
                          <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-500">
                            <LocationIcon className="h-3.5 w-3.5 shrink-0" />
                            {place}
                            <span aria-hidden="true">·</span>
                            <CalendarIcon className="h-3.5 w-3.5 shrink-0" />
                            {formatShortDate(outreach.date)}
                          </p>
                          {outcome ? (
                            <p className="mt-3 text-sm font-medium text-leaf-800">{outcome}</p>
                          ) : null}
                        </CardBody>
                      </Card>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <EmptyState
            title="No outreaches match these filters"
            description="Try clearing the year, state or programme filter, or check back when new activities are scheduled."
          />
        )}
      </Container>
    </PageShell>
  )
}

function FilterLink({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className={
        active
          ? 'inline-flex items-center rounded-full bg-leaf-700 px-3 py-1 text-sm font-medium text-white'
          : 'inline-flex items-center rounded-full border border-ink-200 bg-paper-50 px-3 py-1 text-sm text-ink-700 hover:border-leaf-600 hover:text-leaf-800'
      }
    >
      {label}
    </Link>
  )
}