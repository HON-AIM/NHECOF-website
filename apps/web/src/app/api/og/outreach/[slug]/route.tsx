import { notFound } from 'next/navigation'
import { getOutreachBySlug } from '@/features/outreach/queries'
import { selectPublishableImages } from '@/features/impact/aggregate'
import { ogCard } from '@/lib/seo/ogCard'
import { resolveMetaImage } from '@/lib/seo/buildMetadata'
import { formatDateLong } from '@/lib/format'

export const runtime = 'nodejs'

interface RouteProps {
  params: Promise<{ slug: string }>
}

const LONG_TITLE_THRESHOLD = 54

/**
 * Dynamic Open Graph image for an outreach record (plan §12.3). Uses the first
 * consent-cleared gallery photo; headers/theme field notes the outreach.
 */
export async function GET(_request: Request, { params }: RouteProps) {
  const { slug } = await params
  const outreach = await getOutreachBySlug(slug)
  if (!outreach) notFound()

  const [cover] = selectPublishableImages(outreach.images)
  const dateNote = outreach.date ? formatDateLong(outreach.date) : undefined
  const place = [outreach.location?.community, outreach.location?.state].filter(Boolean).join(', ')

  return ogCard({
    eyebrow: 'Outreach',
    title: outreach.title,
    note: [dateNote, place].filter(Boolean).join(' · ') || undefined,
    imageSrc: resolveMetaImage(cover),
    titleFontSize: outreach.title.length > LONG_TITLE_THRESHOLD ? 40 : 56,
  })
}