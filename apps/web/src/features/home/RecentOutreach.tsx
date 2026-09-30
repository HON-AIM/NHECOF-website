import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Link } from '@/components/ui/Link'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { formatDateLong, formatNumber } from '@/lib/format'
import type { OutreachSummary } from './queries'

interface RecentOutreachProps {
  outreach: OutreachSummary | null
}

export function RecentOutreach({ outreach }: RecentOutreachProps) {
  if (!outreach) return null

  const locationParts = [outreach.location?.lga, outreach.location?.state].filter(Boolean)

  return (
    <section aria-labelledby="recent-outreach-heading" className="bg-paper-50">
      <Container width="wide" className="py-14 md:py-20">
        <div className="flex flex-wrap items-center gap-3">
          <h2
            id="recent-outreach-heading"
            className="font-display text-2xl font-bold text-ink-900 md:text-3xl"
          >
            Recent outreach
          </h2>
          <Badge variant="success">Completed</Badge>
        </div>

        <div className="mt-8 max-w-2xl">
          <h3 className="font-display text-xl font-semibold text-ink-900">
            <Link href={`/outreaches/${outreach.slug.current}`} variant="subtle">
              {outreach.title}
            </Link>
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-ink-500">
            <time dateTime={outreach.date}>{formatDateLong(outreach.date)}</time>
            {locationParts.length > 0 && (
              <span>{locationParts.join(', ')}</span>
            )}
            <Badge variant="leaf">{outreach.theme}</Badge>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-ink-600">
            {outreach.summary}
          </p>

          {/* Key results */}
          {outreach.results && outreach.results.length > 0 && (
            <div className="mt-5">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                Key results
              </h4>
              <ul className="space-y-1.5">
                {outreach.results.map((result, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-sm text-ink-700"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-leaf-500"
                      aria-hidden="true"
                    />
                    <span>
                      <strong className="font-medium">{result.value}</strong>{' '}
                      {result.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Attendance figures */}
          {(outreach.attendance || outreach.screened) && (
            <div className="mt-5 flex gap-6">
              {outreach.attendance && (
                <div>
                  <p className="font-display text-2xl font-bold text-leaf-700">
                    {formatNumber(outreach.attendance)}
                  </p>
                  <p className="text-xs text-ink-400">Total attendance</p>
                </div>
              )}
              {outreach.screened && (
                <div>
                  <p className="font-display text-2xl font-bold text-leaf-700">
                    {formatNumber(outreach.screened)}
                  </p>
                  <p className="text-xs text-ink-400">Screened</p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6">
            <Link href={`/outreaches/${outreach.slug.current}`} variant="branded" className="text-sm">
              Read the full outreach report
            </Link>
          </div>
        </div>

        {/* One full-width photo band — only when a consent-cleared photo exists */}
        {outreach.photo && (
          <div className="mt-8">
            <div className="relative h-64 w-full overflow-hidden rounded-xl md:h-80">
              <ResponsiveImage
                fill
                src={outreach.photo.src}
                alt={outreach.photo.decorative ? '' : outreach.photo.alt}
                decorative={outreach.photo.decorative}
                sizes="(min-width: 1024px) 1024px, 100vw"
                className="object-cover"
              />
            </div>
            {(outreach.photo.caption || outreach.photo.credit) && (
              <p className="mt-2 text-xs italic text-ink-500">
                {outreach.photo.caption}
                {outreach.photo.credit && (
                  <> — {outreach.photo.credit}</>
                )}
              </p>
            )}
          </div>
        )}
      </Container>
    </section>
  )
}