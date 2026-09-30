import NextLink from 'next/link'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { formatDateFull } from '@/lib/format'
import { CalendarIcon, LocationIcon } from '@/components/icons'

interface UpcomingActivityProps {
  activity: {
    _type: string
    title: string
    slug: { current: string }
    date: string
    summary: string
    venue?: string
    location?: { state?: string; lga?: string }
    status: string
  } | null
}

export function UpcomingActivity({ activity }: UpcomingActivityProps) {
  if (!activity || activity.status !== 'upcoming') return null

  const isEvent = activity._type === 'event'
  const href = isEvent
    ? `/events/${activity.slug.current}`
    : `/outreaches/${activity.slug.current}`

  const locationParts = [
    activity.venue,
    activity.location?.lga,
    activity.location?.state,
  ].filter(Boolean)

  return (
    <section
      aria-labelledby="upcoming-heading"
      className="bg-palm-50 border-y border-palm-200"
    >
      <Container width="wide" className="py-10 md:py-14">
        <div className="flex flex-wrap items-center gap-3">
          <h2
            id="upcoming-heading"
            className="font-display text-xl font-bold text-ink-900 md:text-2xl"
          >
            Upcoming activity
          </h2>
          <Badge variant="palm">Coming up</Badge>
        </div>

        <div className="mt-5 rounded-xl border border-palm-200 bg-white p-6">
          <h3 className="font-display text-lg font-semibold text-ink-900">
            <NextLink href={href} className="hover:text-leaf-700">
              {activity.title}
            </NextLink>
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-ink-500">
            <span className="inline-flex items-center gap-1.5">
              <CalendarIcon className="h-4 w-4 text-palm-600" />
              <time dateTime={activity.date}>{formatDateFull(activity.date)}</time>
            </span>
            {locationParts.length > 0 && (
              <span className="inline-flex items-center gap-1.5">
                <LocationIcon className="h-4 w-4 text-palm-600" />
                {locationParts.join(', ')}
              </span>
            )}
          </div>

          <p className="mt-3 text-sm leading-relaxed text-ink-600">
            {activity.summary}
          </p>
        </div>
      </Container>
    </section>
  )
}
