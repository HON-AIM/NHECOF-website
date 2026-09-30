import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getApprovedOutreaches, getOutreachBySlug } from '@/features/outreach/queries'
import { selectConsentedTestimonials, selectPublishableImages } from '@/features/impact/aggregate'
import { PageShell } from '@/components/layout/PageShell'
import { Badge } from '@/components/ui/Badge'
import { Figure } from '@/components/ui/Figure'
import { Prose } from '@/components/ui/Prose'
import { Stat } from '@/components/ui/Stat'
import { CalendarIcon, LocationIcon, ExternalLinkIcon, ArticleIcon } from '@/components/icons'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { absoluteUrl } from '@/lib/seo/url'
import { EventJsonLd } from '@/lib/seo/jsonLd'
import { formatDateLong, formatNumber } from '@/lib/format'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { urlFor } from '@/lib/sanity/client'
import { PageViewEvent } from '@/components/analytics/PageViewEvent'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const { outreaches } = await getApprovedOutreaches()
    return outreaches.map((outreach) => ({ slug: outreach.slug.current }))
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

function formatDate(dateStr: string): string {
  return formatDateLong(dateStr)
}

function safeImageSrc(image: { asset?: { _ref?: string } } | undefined): string | undefined {
  if (!image?.asset?._ref) return undefined
  try {
    return urlFor(image).width(1200).auto('format').url()
  } catch {
    return undefined
  }
}

function placeText(outreach: {
  location?: { community?: string; lga?: string; state?: string }
}): string {
  return [outreach.location?.community, outreach.location?.lga, outreach.location?.state]
    .filter(Boolean)
    .join(', ')
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const outreach = await getOutreachBySlug(slug)
  // See the article route: throwing here (metadata phase) is what produces a
  // real 404 status despite the app-level loading.tsx Suspense boundary.
  if (!outreach) notFound()
  return buildMetadata({
    path: `/outreaches/${slug}`,
    fallbackTitle: outreach.title,
    fallbackDescription: outreach.summary,
    image: outreach.images?.[0],
    ogImage: absoluteUrl(`/api/og/outreach/${slug}`),
  })
}

export default async function OutreachPage({ params }: PageProps) {
  const { slug } = await params
  const outreach = await getOutreachBySlug(slug)
  if (!outreach) notFound()

  const place = placeText(outreach)
  const gallery = selectPublishableImages(outreach.images)
  const testimonials = selectConsentedTestimonials(outreach.testimonials)

  const sectionClass = 'mb-10'

  return (
    <PageShell
      title={outreach.title}
      eyebrow="Outreach"
      description={outreach.summary}
      breadcrumbs={generateBreadcrumbs(`/outreaches/${slug}`)}
    >
      <PageViewEvent
        event="outreach_viewed"
        properties={{ slug, status: outreach.status === 'upcoming' ? 'upcoming' : 'completed' }}
      />
      <article className="mx-auto max-w-3xl">
        {outreach.status === 'upcoming' ? (
          <EventJsonLd
            name={outreach.title}
            startDate={outreach.date}
            description={outreach.summary}
            url={absoluteUrl(`/outreaches/${slug}`)}
            venueName={outreach.venue || place || 'Community venue'}
            addressLocality={outreach.location?.lga}
            addressRegion={outreach.location?.state}
          />
        ) : null}

        {/* Masthead meta strip */}
        <header className="mb-8">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={outreach.status === 'upcoming' ? 'default' : 'leaf'}>
              {outreach.status === 'upcoming' ? 'Upcoming' : 'Completed'}
            </Badge>
            <Badge variant="info">{outreach.theme}</Badge>
            {outreach.verified && outreach.status === 'completed' ? (
              <Badge variant="palm">Verified record</Badge>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
            <time dateTime={outreach.date} className="flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-leaf-700" />
              {formatDate(outreach.date)}
            </time>
            {place ? (
              <span className="flex items-center gap-1.5">
                <LocationIcon className="h-4 w-4 text-leaf-700" />
                {place}
              </span>
            ) : null}
            {outreach.venue ? <span className="text-ink-400">at {outreach.venue}</span> : null}
          </div>
        </header>

        {/* Attendance & screened — Stat components (plan 6.6) */}
        {outreach.attendance != null || outreach.screened != null ? (
          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {outreach.attendance != null ? (
              <Stat
                value={formatNumber(outreach.attendance)}
                label="Total attendance"
                className="rounded-lg border border-ink-100 bg-white p-5"
              />
            ) : null}
            {outreach.screened != null ? (
              <Stat
                value={formatNumber(outreach.screened)}
                label="People screened"
                className="rounded-lg border border-ink-100 bg-white p-5"
              />
            ) : null}
          </div>
        ) : null}

        {outreach.objectives && outreach.objectives.length > 0 ? (
          <section className={sectionClass} aria-labelledby="outreach-objectives">
            <SectionHeading id="outreach-objectives">Summary &amp; objectives</SectionHeading>
            <p className="mb-4 text-ink-700">{outreach.summary}</p>
            <Prose value={outreach.objectives} />
          </section>
        ) : (
          <section className={sectionClass} aria-labelledby="outreach-summary">
            <SectionHeading id="outreach-summary">Summary</SectionHeading>
            <p className="text-ink-700">{outreach.summary}</p>
          </section>
        )}

        {outreach.targetPopulation ? (
          <section className={sectionClass} aria-labelledby="outreach-target">
            <SectionHeading id="outreach-target">Target population</SectionHeading>
            <p className="text-ink-700">{outreach.targetPopulation}</p>
          </section>
        ) : null}

        {outreach.activities && outreach.activities.length > 0 ? (
          <section className={sectionClass} aria-labelledby="outreach-activities">
            <SectionHeading id="outreach-activities">Activities conducted</SectionHeading>
            <Prose value={outreach.activities} />
          </section>
        ) : null}

        {outreach.results && outreach.results.length > 0 ? (
          <section className={sectionClass} aria-labelledby="outreach-results">
            <SectionHeading id="outreach-results">Key results</SectionHeading>
            <dl className="rounded-lg border border-ink-100 bg-white">
              {outreach.results.map((result) => (
                <div
                  key={result.label}
                  className="flex items-center justify-between gap-4 border-b border-ink-100 px-4 py-3 last:border-b-0"
                >
                  <dt className="text-sm text-ink-600">{result.label}</dt>
                  <dd className="text-sm font-semibold text-ink-900">{result.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}

        {outreach.outcomes && outreach.outcomes.length > 0 ? (
          <section className={sectionClass} aria-labelledby="outreach-outcomes">
            <SectionHeading id="outreach-outcomes">Key findings</SectionHeading>
            <Prose value={outreach.outcomes} />
          </section>
        ) : null}

        {outreach.volunteers && outreach.volunteers.length > 0 ? (
          <section className={sectionClass} aria-labelledby="outreach-volunteers">
            <SectionHeading id="outreach-volunteers">Volunteers &amp; professionals</SectionHeading>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {outreach.volunteers.map((person) => (
                <li
                  key={person.name}
                  className="rounded-lg border border-ink-100 bg-white px-4 py-3"
                >
                  <p className="font-medium text-ink-900">{person.name}</p>
                  {person.role || person.qualifications ? (
                    <p className="mt-0.5 text-sm text-ink-500">
                      {[person.role, person.qualifications].filter(Boolean).join(' — ')}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {outreach.partners && outreach.partners.length > 0 ? (
          <section className={sectionClass} aria-labelledby="outreach-partners">
            <SectionHeading id="outreach-partners">Partners &amp; sponsors</SectionHeading>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {outreach.partners.map((partner) => {
                const [approvedLogo] = selectPublishableImages(partner.logo ? [partner.logo] : [])
                const logoSrc = safeImageSrc(approvedLogo)
                return (
                  <li
                    key={partner.slug}
                    className="flex items-center gap-3 rounded-lg border border-ink-100 bg-white px-4 py-3"
                  >
                    {logoSrc ? (
                      <ResponsiveImage
                        src={logoSrc}
                        image={approvedLogo}
                        alt=""
                        ratio="1/1"
                        displayWidth={160}
                        sizes="40px"
                        className="h-10 w-10 shrink-0 rounded object-contain"
                      />
                    ) : null}
                    <div>
                      <p className="font-medium text-ink-900">
                        {partner.website ? (
                          <a
                            href={partner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-leaf-700"
                          >
                            {partner.name}
                          </a>
                        ) : (
                          partner.name
                        )}
                      </p>
                      {partner.type ? (
                        <p className="text-xs capitalize text-ink-500">{partner.type}</p>
                      ) : null}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}

        {outreach.followUp ? (
          <section className={sectionClass} aria-labelledby="outreach-followup">
            <SectionHeading id="outreach-followup">Follow-up</SectionHeading>
            <p className="text-ink-700">{outreach.followUp}</p>
          </section>
        ) : null}

        {/* Photo gallery — consented images only; the rest are omitted silently */}
        {gallery.length > 0 ? (
          <section className={sectionClass} aria-labelledby="outreach-gallery">
            <SectionHeading id="outreach-gallery">Photo gallery</SectionHeading>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {gallery.map((img, i) => {
                const src = safeImageSrc(img)
                return (
                  <Figure
                    key={img.asset?._ref ?? i}
                    src={src}
                    image={img}
                    alt={img.alt ?? img.caption ?? outreach.title}
                    caption={img.caption}
                    credit={img.credit}
                    decorative={img.decorative}
                    consentStatus="cleared"
                    containsMinors={img.containsMinors}
                  />
                )
              })}
            </div>
          </section>
        ) : null}

        {testimonials.length > 0 ? (
          <section className={sectionClass} aria-labelledby="outreach-testimonials">
            <SectionHeading id="outreach-testimonials">What people said</SectionHeading>
            <ul className="space-y-4">
              {testimonials.map((t) => (
                <li key={t.attribution} className="rounded-lg bg-paper-100 p-5">
                  <blockquote className="text-ink-800">&ldquo;{t.quote}&rdquo;</blockquote>
                  <p className="mt-3 text-sm font-medium text-ink-600">— {t.attribution}</p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {outreach.relatedResource ? (
          <section className={sectionClass} aria-labelledby="outreach-resource">
            <SectionHeading id="outreach-resource">Related report / resource</SectionHeading>
            <div className="flex items-start gap-3 rounded-lg border border-ink-100 bg-white p-4">
              <ArticleIcon className="mt-0.5 h-5 w-5 shrink-0 text-leaf-700" />
              <div>
                <p className="font-medium text-ink-900">{outreach.relatedResource.title}</p>
                {outreach.relatedResource.description ? (
                  <p className="mt-1 text-sm text-ink-600">{outreach.relatedResource.description}</p>
                ) : null}
                <p className="mt-2 text-sm">
                  <a
                    href={outreach.relatedResource.externalUrl || outreach.relatedResource.fileUrl || undefined}
                    target={outreach.relatedResource.externalUrl ? '_blank' : undefined}
                    rel={outreach.relatedResource.externalUrl ? 'noopener noreferrer' : undefined}
                    className="inline-flex items-center gap-1 font-medium text-leaf-700 hover:text-leaf-800"
                  >
                    {outreach.relatedResource.type
                      ? `Open ${outreach.relatedResource.type.toLowerCase()}`
                      : 'Open resource'}
                    <ExternalLinkIcon className="h-3.5 w-3.5" />
                  </a>
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <p className="rounded-lg bg-paper-100 p-4 text-sm text-ink-600">
          Questions about this outreach or the data reported here? Reach the NHECOF team via the
          contact page.
        </p>
      </article>
    </PageShell>
  )
}

function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-4 border-b border-paper-200 pb-2 font-display text-xl font-semibold text-ink-900"
    >
      {children}
    </h2>
  )
}