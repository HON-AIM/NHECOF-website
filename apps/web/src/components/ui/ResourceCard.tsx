import { Card, CardBody, CardDescription, CardFooter, CardImage, CardTitle, cn } from './Card'

interface ResourceCardProps {
  title: string
  slug: string
  description?: string
  type?: string
  thumbnailUrl?: string
  thumbnailAlt?: string
  fileMeta?: string
  dateLabel?: string
  className?: string
}

const typeLabels: Record<string, string> = {
  guide: 'Guide',
  infographic: 'Infographic',
  report: 'Report',
  'fact-sheet': 'Fact Sheet',
  poster: 'Poster',
  other: 'Resource',
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

export function ResourceCard({
  title,
  slug,
  description,
  type,
  thumbnailUrl,
  thumbnailAlt,
  fileMeta,
  dateLabel,
  className,
}: ResourceCardProps) {
  const typeLabel = type ? (typeLabels[type] ?? type.charAt(0).toUpperCase() + type.slice(1)) : ''

  return (
    <Card as="article" variant="interactive" className={cn('h-full', className)}>
      <a href={`/resources/${slug}`} className="flex h-full flex-col">
        {thumbnailUrl ? (
          <CardImage src={thumbnailUrl} alt={thumbnailAlt ?? title} />
        ) : null}
        <CardBody className="flex-1">
          {typeLabel ? (
            <span className="inline-flex items-center rounded-full bg-leaf-50 px-2 py-0.5 text-xs font-medium text-leaf-700">
              {typeLabel}
            </span>
          ) : null}
          <CardTitle as="h2">{title}</CardTitle>
          {description ? <CardDescription>{description}</CardDescription> : null}
        </CardBody>
        <CardFooter className="mt-auto flex-col items-start gap-1">
          <span className="flex items-center gap-2 text-xs font-medium text-leaf-700">
            Download
            <DownloadIcon className="h-4 w-4 text-leaf-700" />
          </span>
          {fileMeta ? <span className="text-xs text-ink-500">{fileMeta}</span> : null}
          {dateLabel ? (
            <time className="text-xs text-ink-500">{dateLabel}</time>
          ) : null}
        </CardFooter>
      </a>
    </Card>
  )
}