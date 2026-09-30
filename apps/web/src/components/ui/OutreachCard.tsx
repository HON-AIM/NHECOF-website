import { Card, CardBody, CardDescription, CardFooter, CardImage, CardTitle, cn } from './Card'
import { formatDateShort } from '@/lib/format'

interface OutreachCardProps {
  title: string
  slug: string
  summary: string
  date?: string
  location?: { community?: string; lga?: string; state?: string }
  status?: 'upcoming' | 'completed'
  imageUrl?: string
  imageAlt?: string
  className?: string
}

const statusBadgeClasses: Record<NonNullable<OutreachCardProps['status']>, string> = {
  upcoming: 'bg-info-light text-info-dark',
  completed: 'bg-success-light text-success-dark',
}

export function OutreachCard({
  title,
  slug,
  summary,
  date,
  location,
  status,
  imageUrl,
  imageAlt,
  className,
}: OutreachCardProps) {
  const locationText = location
    ? [location.community, location.lga, location.state].filter(Boolean).join(', ')
    : ''
  const formattedDate = formatDateShort(date)
  const statusLabel = status ? status.charAt(0).toUpperCase() + status.slice(1) : ''

  return (
    <Card as="article" variant="interactive" className={cn('h-full', className)}>
      <a href={`/outreaches/${slug}`} className="flex h-full flex-col">
        {imageUrl ? <CardImage src={imageUrl} alt={imageAlt ?? title} /> : null}
        <CardBody className="flex-1">
          <CardTitle>{title}</CardTitle>
          {summary ? <CardDescription>{summary}</CardDescription> : null}
        </CardBody>
        <CardFooter className="mt-auto">
          <span className="min-w-0 flex-1">
            {locationText ? (
              <span className="block truncate text-xs text-ink-500">{locationText}</span>
            ) : null}
            {formattedDate ? (
              <span className="block text-xs text-ink-500">{formattedDate}</span>
            ) : null}
          </span>
          {status ? (
            <span
              className={cn(
                'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium',
                statusBadgeClasses[status],
              )}
            >
              {statusLabel}
            </span>
          ) : null}
        </CardFooter>
      </a>
    </Card>
  )
}