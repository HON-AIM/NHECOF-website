import { Card, CardBody, CardDescription, CardFooter, CardImage, CardTitle, cn } from './Card'
import { formatDateShort } from '@/lib/format'

interface ArticleCardProps {
  title: string
  slug: string
  summary: string
  author?: string
  reviewer?: string
  publishedAt?: string
  imageUrl?: string
  imageAlt?: string
  categories?: Array<{ title: string }>
  className?: string
}

export function ArticleCard({
  title,
  slug,
  summary,
  author,
  reviewer,
  publishedAt,
  imageUrl,
  imageAlt,
  categories,
  className,
}: ArticleCardProps) {
  const formattedDate = formatDateShort(publishedAt)

  return (
    <Card as="article" variant="interactive" className={cn('h-full', className)}>
      <a href={`/nutrition/articles/${slug}`} className="flex h-full flex-col">
        {imageUrl ? <CardImage src={imageUrl} alt={imageAlt ?? title} /> : null}
        <CardBody className="flex-1">
          {categories && categories.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {categories.map((category) => (
                <span
                  key={category.title}
                  className="inline-flex items-center rounded-full bg-leaf-50 px-2 py-0.5 text-xs font-medium text-leaf-700"
                >
                  {category.title}
                </span>
              ))}
            </div>
          ) : null}
          <CardTitle>{title}</CardTitle>
          {summary ? <CardDescription>{summary}</CardDescription> : null}
          {reviewer ? (
            <p className="text-xs text-ink-400">Reviewed by {reviewer}</p>
          ) : null}
        </CardBody>
        <CardFooter className="mt-auto">
          {author ? <span className="text-xs font-medium text-ink-500">By {author}</span> : null}
          {formattedDate ? (
            <span className="ml-auto text-xs text-ink-500">{formattedDate}</span>
          ) : null}
        </CardFooter>
      </a>
    </Card>
  )
}