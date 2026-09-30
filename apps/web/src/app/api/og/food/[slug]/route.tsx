import { notFound } from 'next/navigation'
import { getFoodProfileBySlug } from '@/features/nutrition/queries'
import { ogCard } from '@/lib/seo/ogCard'
import { resolveMetaImage } from '@/lib/seo/buildMetadata'

export const runtime = 'nodejs'

interface RouteProps {
  params: Promise<{ slug: string }>
}

const LONG_TITLE_THRESHOLD = 54

/**
 * Dynamic Open Graph image for a food profile (plan §12.3).
 */
export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params
  const profile = await getFoodProfileBySlug(slug)
  if (!profile) notFound()

  const note =
    profile.aliases?.[0] ?? profile.scientificName ?? undefined

  return ogCard({
    eyebrow: 'Food Profile',
    title: profile.title,
    note: note ? `Also known as ${note}` : undefined,
    imageSrc: resolveMetaImage(profile.featuredImage),
    titleFontSize: profile.title.length > LONG_TITLE_THRESHOLD ? 40 : 56,
  })
}