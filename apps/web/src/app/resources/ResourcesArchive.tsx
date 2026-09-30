import Link from 'next/link'
import { EmptyState } from '@/components/ui/EmptyState'
import { ResourceCard } from '@/components/ui/ResourceCard'

export interface ResourceArchiveItem {
  id: string
  title: string
  slug: string
  description?: string | null
  type: string
  topics: string[]
  audiences: string[]
  fileMeta: string
  dateLabel: string
}

interface CountOption {
  value: string
  label: string
  count: number
}

type FilterKey = 'type' | 'topic' | 'audience'

function linkFor(current: Partial<Record<FilterKey, string>>, overrides: Partial<Record<FilterKey, string>>): string {
  const next = { ...current, ...overrides }
  const qs = new URLSearchParams()
  for (const [key, value] of Object.entries(next)) {
    if (value) qs.set(key, value)
  }
  const query = qs.toString()
  return query ? `/resources?${query}` : '/resources'
}

function FilterLink({
  href,
  label,
  filterKey,
  filterValue,
}: {
  href: string
  label: string
  /** Lets the client enhancer mark the chip active without re-rendering. */
  filterKey: FilterKey
  filterValue: string | null
}) {
  return (
    <Link
      href={href}
      data-filter-key={filterKey}
      data-filter-value={filterValue ?? ''}
      className="inline-flex items-center rounded-full border border-ink-200 bg-paper-50 px-3 py-1 text-sm text-ink-700 hover:border-leaf-600 hover:text-leaf-800 aria-[current=true]:border-transparent aria-[current=true]:bg-leaf-700 aria-[current=true]:text-white"
    >
      {label}
    </Link>
  )
}

function FilterGroup({
  id,
  label,
  links,
}: {
  id: string
  label: string
  links: Array<{ href: string; label: string; filterKey: FilterKey; filterValue: string | null }>
}) {
  return (
    <div role="group" aria-labelledby={id}>
      <p id={id} className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-500">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        {links.map((link) => (
          <FilterLink key={link.href} {...link} />
        ))}
      </div>
    </div>
  )
}

export interface ResourcesArchiveProps {
  items: ResourceArchiveItem[]
  typeOptions: CountOption[]
  topicOptions: CountOption[]
  audienceOptions: CountOption[]
}

/**
 * The full archive is rendered on the server, statically, for every filter
 * combination — so the grid is in the first paint and the route stays
 * prerenderable (plan §13).
 *
 * This was previously a client component reading `useSearchParams()` inside a
 * `<Suspense fallback={null}>`. During prerender the hook suspends, so the
 * whole filter panel and results grid was absent from the initial HTML and only
 * appeared after hydration: a 0.606 Cumulative Layout Shift on /resources
 * (Lighthouse performance 64). Each card now carries its filter values as data
 * attributes and `ResourcesFilterEnhancer` applies the query-string filter after
 * mount. Without JavaScript visitors see the complete archive and working links,
 * which is the graceful degradation we want for a public content site.
 */
export function ResourcesArchive({
  items,
  typeOptions,
  topicOptions,
  audienceOptions,
}: ResourcesArchiveProps) {
  return (
    <>
      <div className="mb-8 rounded-xl border border-ink-100 bg-white p-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FilterGroup
            id="resource-filter-type"
            label="Type"
            links={[
              { href: linkFor({}, {}), label: 'All', filterKey: 'type', filterValue: null },
              ...typeOptions.map((option) => ({
                href: linkFor({}, { type: option.value }),
                label: `${option.label} (${option.count})`,
                filterKey: 'type' as const,
                filterValue: option.value,
              })),
            ]}
          />
          <FilterGroup
            id="resource-filter-topic"
            label="Topic"
            links={[
              { href: linkFor({}, {}), label: 'All', filterKey: 'topic', filterValue: null },
              ...topicOptions.map((option) => ({
                href: linkFor({}, { topic: option.value }),
                label: `${option.label} (${option.count})`,
                filterKey: 'topic' as const,
                filterValue: option.value,
              })),
            ]}
          />
          <FilterGroup
            id="resource-filter-audience"
            label="Audience"
            links={[
              { href: linkFor({}, {}), label: 'All', filterKey: 'audience', filterValue: null },
              ...audienceOptions.map((option) => ({
                href: linkFor({}, { audience: option.value }),
                label: `${option.label} (${option.count})`,
                filterKey: 'audience' as const,
                filterValue: option.value,
              })),
            ]}
          />
        </div>
      </div>

      {items.length > 0 ? (
        <>
          <p className="mb-4 text-sm text-ink-500" role="status" data-resource-count>
            {items.length} {items.length === 1 ? 'resource' : 'resources'} available
          </p>
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3" data-resource-grid>
            {items.map((item) => (
              <li
                key={item.id}
                data-resource-item
                data-type={item.type}
                data-topics={item.topics.join(' ')}
                data-audiences={item.audiences.join(' ')}
              >
                <ResourceCard
                  title={item.title}
                  slug={item.slug}
                  description={item.description ?? undefined}
                  type={item.type}
                  fileMeta={item.fileMeta}
                  dateLabel={item.dateLabel}
                />
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-ink-600" data-resource-empty hidden>
            No resources match these filters. Try clearing the type, topic or audience filter, or
            check back when new resources are added.
          </p>
        </>
      ) : (
        <EmptyState
          title="No resources available yet"
          description="Guides, infographics and fact sheets will appear here as they are published."
        />
      )}
    </>
  )
}
