import { Card, CardBody, CardDescription, CardImage, CardTitle, cn } from './Card'

interface FoodCardProps {
  title: string
  slug: string
  summary: string
  scientificName?: string
  imageUrl?: string
  imageAlt?: string
  className?: string
}

export function FoodCard({
  title,
  slug,
  summary,
  scientificName,
  imageUrl,
  imageAlt,
  className,
}: FoodCardProps) {
  return (
    <Card as="article" variant="interactive" className={cn('h-full', className)}>
      <a href={`/nutrition/foods/${slug}`} className="flex h-full flex-col">
        {imageUrl ? <CardImage src={imageUrl} alt={imageAlt ?? title} /> : null}
        <CardBody className="flex-1">
          <CardTitle>{title}</CardTitle>
          {scientificName ? (
            <p className="text-sm italic text-ink-500">{scientificName}</p>
          ) : null}
          {summary ? <CardDescription>{summary}</CardDescription> : null}
        </CardBody>
      </a>
    </Card>
  )
}