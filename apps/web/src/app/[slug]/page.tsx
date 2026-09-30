import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPageBySlug } from '@/lib/sanity/queries'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { urlFor } from '@/lib/sanity/client'
import { sanityFetch } from '@/lib/sanity/fetch'
import { CACHE_TAGS } from '@/lib/sanity/tags'
import { Prose } from '@/components/ui/Prose'
import { PageShell } from '@/components/layout/PageShell'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { Container } from '@/components/ui/Container'
import { Figure } from '@/components/ui/Figure'
import { formatDateLong } from '@/lib/format'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    // Pinned to published content: a draft page must not cause a build-time
    // static param, and `page` publishes are covered by the siteSettings tag.
    const slugs = await sanityFetch<string[]>(`*[_type == "page"][].slug.current`, undefined, {
      tags: [CACHE_TAGS.siteSettings, CACHE_TAGS.homepage, CACHE_TAGS.navigation],
      preview: false,
    })
    return slugs.map((slug) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = await getPageBySlug(slug)
  // See the article route: throwing here (metadata phase) is what produces a
  // real 404 status despite the app-level loading.tsx Suspense boundary.
  if (!page) notFound()
  return buildMetadata({
    path: `/${page.slug.current}`,
    fallbackTitle: page.title,
    seo: page.seo,
    image: page.featuredImage,
  })
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  const page = await getPageBySlug(slug)

  if (!page) notFound()

  const image = page.featuredImage
  const imageUrl =
    image && image.asset?._ref ? urlFor(image).width(1200).auto('format').url() : undefined

  return (
    <PageShell
      title={page.title}
      breadcrumbs={generateBreadcrumbs(`/${page.slug.current}`, {
        [page.slug.current]: page.title,
      })}
    >
      <Container>
        {image && imageUrl ? (
          <Figure
            src={imageUrl}
            alt={image.decorative ? '' : image.alt ?? ''}
            caption={image.caption}
            credit={image.credit}
            decorative={image.decorative}
            consentStatus={image.consentStatus ?? 'pending'}
            containsMinors={image.containsMinors}
            className="mb-8"
          />
        ) : null}

        {page.publishedAt ? (
          <p className="mb-6 text-sm text-ink-500">
            Published {formatDateLong(page.publishedAt)}
          </p>
        ) : null}

        {page.body && page.body.length > 0 ? <Prose value={page.body} /> : null}
      </Container>
    </PageShell>
  )
}