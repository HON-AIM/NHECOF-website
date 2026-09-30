import { Card, CardBody, CardDescription, CardImage, CardTitle, cn } from './Card'

interface ProgramCardProps {
  title: string
  slug: string
  summary: string
  imageUrl?: string
  imageAlt?: string
  className?: string
}

export function ProgramCard({
  title,
  slug,
  summary,
  imageUrl,
  imageAlt,
  className,
}: ProgramCardProps) {
  return (
    <Card as="article" variant="interactive" className={cn('h-full', className)}>
      <a href={`/what-we-do/${slug}`} className="flex h-full flex-col">
        {imageUrl ? <CardImage src={imageUrl} alt={imageAlt ?? title} /> : null}
        <CardBody className="flex-1">
          <CardTitle>{title}</CardTitle>
          {summary ? <CardDescription>{summary}</CardDescription> : null}
        </CardBody>
      </a>
    </Card>
  )
}