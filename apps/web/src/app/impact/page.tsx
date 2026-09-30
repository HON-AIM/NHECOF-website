import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import Link from 'next/link'
import { getImpactOverview, type ImpactRow } from '@/features/impact/queries'
import type { ImpactStat } from '@/features/impact/aggregate'
import { PageShell } from '@/components/layout/PageShell'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Stat } from '@/components/ui/Stat'
import { CalendarIcon, LocationIcon } from '@/components/icons'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { formatDateShort as formatFullDate, formatNumber } from '@/lib/format'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/impact',
    fallbackTitle: 'Our Impact',
    fallbackDescription:
      'Verified impact statistics, historical milestones, per-outreach results, geographic reach and consented community stories from NHECOF.',
  })
}

/** Renders the visible [PLACEHOLDER] marker required while data is missing. */
function PlaceholderNote({ message }: { message: string }) {
  return (
    <p className="rounded-lg border-2 border-dashed border-ink-200 bg-white p-4 text-sm text-ink-500">
      <span className="font-mono font-semibold text-info-dark">[PLACEHOLDER]</span> {message}
    </p>
  )
}

function BlockHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="font-display text-2xl font-bold text-ink-900 md:text-3xl"
    >
      {children}
    </h2>
  )
}

export default async function ImpactPage() {
  const overview = await getImpactOverview()
  const hasAnyCumulative =
    overview.cumulative.some((m) => m.value != null) || overview.manual.length > 0
  const completedRows = overview.perOutreach.filter((row) => row.status === 'completed')
  const geoAsOf = completedRows.reduce<string | null>(
    (latest, row) => (row.date > (latest ?? '') ? row.date : latest),
    null,
  )

  return (
    <PageShell
      title="Our Impact"
      eyebrow="Community"
      description="Every figure on this page is traceable to a published, verified outreach record or an approved internal record. Unverified numbers are never displayed."
      breadcrumbs={generateBreadcrumbs('/impact')}
    >
      <Container>
        {/* ── Block 1: Cumulative impact ─────────────────────────────────── */}
        <section aria-labelledby="cumulative-heading" className="border-b border-paper-200 py-10">
          <BlockHeading id="cumulative-heading">Current cumulative impact</BlockHeading>
          <p className="mt-2 max-w-prose text-ink-600">
            Totals are derived from published, verified outreach records. Manual figures carry
            their verification line.
          </p>
          {hasAnyCumulative ? (
            <div className="mt-8 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
              {overview.cumulative
                .filter((m) => m.value != null)
                .map((m) => (
                  <CumulativeStat key={m.key} metric={m} />
                ))}
              {overview.manual
                .filter(
                  (m) =>
                    !overview.cumulative.some(
                      (c) => c.value != null && c.label.toLowerCase() === m.label.toLowerCase(),
                    ),
                )
                .map((m) => (
                  <div key={m._id} className="rounded-lg border border-ink-100 bg-white p-5">
                    <p className="font-display text-4xl font-bold text-leaf-700">
                      {formatNumber(m.value)}
                      {m.unit ? <span className="ml-1 text-lg text-ink-500">{m.unit}</span> : null}
                    </p>
                    <p className="mt-1 text-lg text-ink-700">{m.label}</p>
                    <p className="mt-1 text-sm text-ink-400">as of {formatFullDate(m.asOf)}</p>
                    <p className="mt-1 text-xs italic text-ink-400">
                      Verified by {m.verifiedBy}, {formatFullDate(m.asOf)}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <div className="mt-6">
              <PlaceholderNote message="Cumulative impact figures will appear here once verified outreach records are published." />
            </div>
          )}
        </section>

        {/* ── Block 2: Historical milestones ─────────────────────────────── */}
        <section aria-labelledby="milestones-heading" className="border-b border-paper-200 py-10">
          <BlockHeading id="milestones-heading">Historical milestones</BlockHeading>
          <p className="mt-2 max-w-prose text-ink-600">
            Dated achievements, oldest to newest. Earlier records are preserved as milestones, not
            replaced.
          </p>
          {overview.milestones.length > 0 ? (
            <ol className="mt-8 space-y-6 border-l-2 border-leaf-100 pl-6">
              {overview.milestones.map((milestone) => (
                <li key={milestone._id} className="relative">
                  <span
                    aria-hidden="true"
                    className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-leaf-700"
                  />
                  <time
                    dateTime={milestone.date}
                    className="text-sm font-semibold uppercase tracking-wide text-leaf-700"
                  >
                    {formatFullDate(milestone.date)}
                  </time>
                  <p className="mt-1 text-base font-semibold text-ink-900">{milestone.title}</p>
                  <p className="mt-1 text-sm text-ink-600">{milestone.description}</p>
                </li>
              ))}
            </ol>
          ) : (
            <div className="mt-6">
              <PlaceholderNote message="Dated milestones (including earlier records such as the 230+ people reached across six communities) will appear here once entered in the CMS." />
            </div>
          )}
        </section>

        {/* ── Block 3: Per-outreach results ──────────────────────────────── */}
        <section aria-labelledby="per-outreach-heading" className="border-b border-paper-200 py-10">
          <BlockHeading id="per-outreach-heading">Per-outreach results</BlockHeading>
          <p className="mt-2 max-w-prose text-ink-600">
            Individual outreach records. Only verified records contribute to the cumulative totals
            above. On small screens this table collapses into cards.
          </p>
          {overview.perOutreach.length > 0 ? (
            <div className="mt-8">
              {/* Desktop table */}
              <table className="w-full hidden border-collapse overflow-hidden rounded-lg md:table">
                <thead>
                  <tr className="bg-leaf-50 text-left text-xs font-semibold uppercase tracking-wide text-leaf-900">
                    <th scope="col" className="px-4 py-3">Outreach</th>
                    <th scope="col" className="px-4 py-3">Date</th>
                    <th scope="col" className="px-4 py-3">Location</th>
                    <th scope="col" className="px-4 py-3 text-right">Attendance</th>
                    <th scope="col" className="px-4 py-3 text-right">Screened</th>
                    <th scope="col" className="px-4 py-3">Verified</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {overview.perOutreach.map((row) => (
                    <ImpactTableRow key={row._id} row={row} />
                  ))}
                </tbody>
              </table>

              {/* Mobile stacked cards */}
              <ul className="space-y-4 md:hidden">
                {overview.perOutreach.map((row) => (
                  <ImpactCard key={row._id} row={row} />
                ))}
              </ul>
            </div>
          ) : (
            <div className="mt-6">
              <PlaceholderNote message="Per-outreach records will appear here once outreaches are published." />
            </div>
          )}
        </section>

        {/* ── Block 4: Geographic reach ──────────────────────────────────── */}
        <section aria-labelledby="geographic-heading" className="border-b border-paper-200 py-10">
          <BlockHeading id="geographic-heading">Geographic reach</BlockHeading>
          <p className="mt-2 max-w-prose text-ink-600">
            Completed outreach events tallied by state. Every count carries the
            date of the most recent completed outreach.
            {/* Seam: an interactive SVG Nigeria map can slot in here later (plan §6.7). */}
          </p>
          {overview.geographic.length > 0 && geoAsOf ? (
            <p className="mt-1 text-sm text-ink-400">As of {formatFullDate(geoAsOf)}</p>
          ) : null}
          {overview.geographic.length > 0 ? (
            <ul className="mt-8 space-y-3" aria-label="Reach by state">
              {overview.geographic.map((item) => (
                <li key={item.state} className="flex items-center gap-4">
                  <span className="w-24 shrink-0 text-sm font-medium text-ink-700">{item.state}</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-leaf-50">
                    <div
                      className="h-full rounded-full bg-leaf-700"
                      style={{ width: `${(item.count / overview.geographic[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-sm text-ink-600">
                    {item.count}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-6">
              <PlaceholderNote message="Completed outreach locations will appear here as a per-state tally." />
            </div>
          )}
        </section>

        {/* ── Block 5: Stories ───────────────────────────────────────────── */}
        <section aria-labelledby="stories-heading" className="py-10">
          <BlockHeading id="stories-heading">Community stories</BlockHeading>
          <p className="mt-2 max-w-prose text-ink-600">
            Only testimonials with publication permission on file are shared here.
          </p>
          {overview.stories.length > 0 ? (
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2">
              {overview.stories.map((story) => (
                <figure key={story._id} className="rounded-lg bg-paper-100 p-5">
                  <blockquote className="text-ink-800">&ldquo;{story.quote}&rdquo;</blockquote>
                  <figcaption className="mt-3 text-sm text-ink-600">
                    — {story.attribution}
                    {story.sourceTitle ? (
                      <span className="text-ink-400"> · {story.sourceTitle}</span>
                    ) : null}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <PlaceholderNote message="Consented community stories will appear here once testimonials with permission are published." />
            </div>
          )}
        </section>
      </Container>
    </PageShell>
  )
}

function CumulativeStat({ metric }: { metric: ImpactStat }) {
  return (
    <div className="rounded-lg border border-ink-100 bg-white p-5">
      <Stat
        value={metric.value != null ? formatNumber(metric.value) : '—'}
        label={metric.label}
        asOf={metric.asOf ? `as of ${formatFullDate(metric.asOf)}` : undefined}
        className="[&_p:first-child]:text-3xl lg:[&_p:first-child]:text-4xl"
      />
    </div>
  )
}

function ImpactTableRow({ row }: { row: ImpactRow }) {
  return (
    <tr className="bg-white hover:bg-paper-50">
      <th scope="row" className="px-4 py-3 text-left font-medium text-ink-900">
        <Link href={`/outreaches/${row.slug}`} className="hover:text-leaf-700">
          {row.title}
        </Link>
        <p className="mt-0.5 text-xs font-normal text-ink-400">{row.theme}</p>
      </th>
      <td className="px-4 py-3 text-sm text-ink-600">
        <time dateTime={row.date}>{formatFullDate(row.date)}</time>
      </td>
      <td className="px-4 py-3 text-sm text-ink-600">
        {[row.location?.lga, row.location?.state].filter(Boolean).join(', ')}
      </td>
      <td className="px-4 py-3 text-right text-sm text-ink-700">
        {row.attendance != null ? formatNumber(row.attendance) : '—'}
      </td>
      <td className="px-4 py-3 text-right text-sm text-ink-700">
        {row.screened != null ? formatNumber(row.screened) : '—'}
      </td>
      <td className="px-4 py-3 text-sm">
        {row.verified ? (
          <span className="inline-flex items-center gap-1.5 text-leaf-800">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-leaf-700" />
            Verified
          </span>
        ) : (
          <span className="text-ink-400">—</span>
        )}
      </td>
    </tr>
  )
}

function ImpactCard({ row }: { row: ImpactRow }) {
  return (
    <li className="rounded-lg border border-ink-100 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={row.status === 'upcoming' ? 'default' : 'leaf'}>
          {row.status === 'upcoming' ? 'Upcoming' : 'Completed'}
        </Badge>
        <span className="text-xs text-ink-400">{row.theme}</span>
      </div>
      <p className="mt-3 text-base font-semibold text-ink-900">
        <Link href={`/outreaches/${row.slug}`} className="hover:text-leaf-700">
          {row.title}
        </Link>
      </p>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-500">
        <span className="flex items-center gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5" />
          {formatFullDate(row.date)}
        </span>
        {row.location?.state ? (
          <span className="flex items-center gap-1.5">
            <LocationIcon className="h-3.5 w-3.5" />
            {[row.location.lga, row.location.state].filter(Boolean).join(', ')}
          </span>
        ) : null}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-ink-100 pt-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-400">Attendance</dt>
          <dd className="text-sm font-medium text-ink-800">
            {row.attendance != null ? formatNumber(row.attendance) : '—'}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-ink-400">Screened</dt>
          <dd className="text-sm font-medium text-ink-800">
            {row.screened != null ? formatNumber(row.screened) : '—'}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-xs uppercase tracking-wide text-ink-400">Verified</dt>
          <dd className="text-sm text-ink-800">
            {row.verified ? 'Verified outreach record' : 'Not yet verified'}
          </dd>
        </div>
      </dl>
    </li>
  )
}