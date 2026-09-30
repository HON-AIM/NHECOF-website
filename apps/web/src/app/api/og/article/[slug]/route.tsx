import { notFound } from 'next/navigation'
import { getArticleBySlug } from '@/features/nutrition/queries'
import { ogCard } from '@/lib/seo/ogCard'
import { resolveMetaImage } from '@/lib/seo/buildMetadata'

export const runtime = 'nodejs'

interface RouteProps {
  params: Promise<{ slug: string }>
}

const LONG_TITLE_THRESHOLD = 54

/**
 * Dynamic Open Graph image for an article (plan §12.3): Fraunces headline,
 * brand palette and the cleared featured photo when one exists.
 */
export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  if (!article) notFound()

  const authorNote = article.author?.name ? `By ${article.author.name}` : undefined

  return ogCard({
    eyebrow: 'Article',
    title: article.title,
    note: authorNote,
    imageSrc: resolveMetaImage(article.featuredImage),
    titleFontSize: article.title.length > LONG_TITLE_THRESHOLD ? 40 : 56,
  })
}