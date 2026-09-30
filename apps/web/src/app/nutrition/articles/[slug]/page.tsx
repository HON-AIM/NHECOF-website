import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import {
  getArticleBySlug,
  getApprovedArticles,
  getFallbackRelated,
} from '@/features/nutrition/queries'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { absoluteUrl } from '@/lib/seo/url'
import { ArticleJsonLd } from '@/lib/seo/jsonLd'
import { personProfileHref, relatedContentHref, relatedContentLabel } from '@/lib/seo/internalLinks'
import { SITE_DEFAULTS } from '@/lib/seo/defaults'
import { PageShell } from '@/components/layout/PageShell'
import { Link } from '@/components/ui/Link'
import { Card, CardBody, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Prose } from '@/components/ui/Prose'
import { Figure } from '@/components/ui/Figure'
import { Callout } from '@/components/ui/Callout'
import { ArticleToc } from '@/components/features/article/ArticleToc'
import { ShareButtons } from '@/components/features/article/ShareButtons'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { formatDateLong } from '@/lib/format'
import { PageViewEvent } from '@/components/analytics/PageViewEvent'
import { urlFor } from '@/lib/sanity/client'

export const revalidate = 3600

export async function generateStaticParams() {
  try {
    const { articles } = await getApprovedArticles(undefined, undefined, undefined, 1, 1000)
    return articles.map((article) => ({ slug: article.slug.current }))
  } catch {
    return []
  }
}

interface PageProps {
  params: Promise<{ slug: string }>
}

function formatDate(dateStr: string): string {
  return formatDateLong(dateStr)
}

function estimateReadingTime(body?: unknown[]): number {
  if (!body || body.length === 0) return 1
  const words = JSON.stringify(body).split(/\s+/).length
  return Math.max(1, Math.round(words / 200))
}

function safeImageSrc(image: { asset?: { _ref?: string } } | undefined): string | undefined {
  if (!image?.asset?._ref) return undefined
  try {
    return urlFor(image).width(1200).auto('format').url()
  } catch {
    return undefined
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticleBySlug(slug)
  // Signal not-found during the metadata phase. The app-level `loading.tsx`
  // opens a Suspense boundary that flushes the response head as 200 before the
  // page component resolves, so a `notFound()` thrown only from the page body
  // would render the 404 UI inside a 200 response. Metadata is resolved before
  // that flush, so throwing here is what makes the status a real 404.
  if (!article) notFound()
  const base = buildMetadata({
    path: `/nutrition/articles/${slug}`,
    fallbackTitle: article.title,
    fallbackDescription: article.summary,
    seo: article.seo,
    image: article.featuredImage,
    ogImage: absoluteUrl(`/api/og/article/${slug}`),
    type: 'article',
  })
  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      type: 'article',
      publishedTime: article.publishedAt,
      ...(article.lastReviewedAt ? { modifiedTime: article.lastReviewedAt } : {}),
      ...(article.categories?.[0] ? { section: article.categories[0].title } : {}),
    },
  }
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  const article = await getArticleBySlug(slug)

  if (!article) notFound()

  const imageUrl = safeImageSrc(article.featuredImage)
  const readingTime = estimateReadingTime(article.body as unknown[])
  const siteBase = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const shareUrl = `${siteBase}/nutrition/articles/${slug}`

  // Editor picks first, then a safe category fallback (never implying treatment).
  const editorRelated = article.relatedContent ?? []
  const fallback =
    editorRelated.length < 4
      ? await getFallbackRelated(
          article,
          [article._id, ...editorRelated.map((item) => item._id)],
          4 - editorRelated.length,
        )
      : []
  const seen = new Set<string>()
  const related = [...editorRelated, ...fallback]
    .filter((item) => {
      if (seen.has(item._id)) return false
      seen.add(item._id)
      return true
    })
    .slice(0, 4)

  const correctionHref = `/contact?subject=${encodeURIComponent('Report a correction')}&message=${encodeURIComponent(shareUrl)}`

  return (
    <PageShell
      title={article.title}
      eyebrow="Nutrition Hub"
      description={article.summary}
      breadcrumbs={generateBreadcrumbs(`/nutrition/articles/${slug}`)}
      sidebar={<ArticleToc />}
    >
      {/*
        Only the slug, reviewer presence and reading time are sent. The article
        title and summary are deliberately excluded: they are editorial content,
        and an analytics vendor has no need to hold a copy of a health claim.
      */}
      <PageViewEvent
        event="article_viewed"
        properties={{
          slug,
          hasReviewer: Boolean(article.reviewer),
          readingTimeMinutes: readingTime,
        }}
      />
      <article className="max-w-prose">
        <ArticleJsonLd
          title={article.title}
          url={absoluteUrl(`/nutrition/articles/${slug}`)}
          description={article.summary}
          datePublished={article.publishedAt}
          dateModified={article.lastReviewedAt}
          author={
            article.author
              ? {
                  name: article.author.name,
                  profileHref: personProfileHref(article.author),
                  qualifications: article.author.qualifications,
                  role: 'Author',
                }
              : { name: SITE_DEFAULTS.organisationName }
          }
          reviewer={
            article.reviewer
              ? {
                  name: article.reviewer.name,
                  profileHref: personProfileHref(article.reviewer),
                  qualifications: article.reviewer.qualifications,
                  role: 'Reviewer',
                }
              : undefined
          }
          section={article.categories?.[0]?.title}
        />
        <header className="mb-8">
          {article.categories && article.categories.length > 0 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {article.categories.map((cat) => (
                <Badge key={cat._id} variant="leaf">
                  {cat.title}
                </Badge>
              ))}
            </div>
          ) : null}

          {article.audiences && article.audiences.length > 0 ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {article.audiences.map((a) => (
                <Badge key={a} variant="default">
                  {a}
                </Badge>
              ))}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-500">
            {article.author ? (
              <span>
                By <span className="font-medium text-ink-700">{article.author.name}</span>
                {article.author.qualifications ? (
                  <span className="text-ink-400"> — {article.author.qualifications}</span>
                ) : null}
              </span>
            ) : null}
            <time dateTime={article.publishedAt}>Published {formatDate(article.publishedAt)}</time>
            {article.lastReviewedAt ? (
              <time dateTime={article.lastReviewedAt}>
                Updated {formatDate(article.lastReviewedAt)}
              </time>
            ) : null}
            <span>{readingTime} min read</span>
          </div>
        </header>

        {imageUrl ? (
          <Figure
            src={imageUrl}
            image={article.featuredImage}
            alt={article.featuredImage?.alt ?? article.title}
            caption={article.featuredImage?.caption}
            credit={article.featuredImage?.credit}
            decorative={article.featuredImage?.decorative}
            consentStatus={article.featuredImage?.consentStatus ?? 'pending'}
            containsMinors={article.featuredImage?.containsMinors}
            className="mb-8"
          />
        ) : null}

        {article.keyTakeaways && article.keyTakeaways.length > 0 ? (
          <Callout variant="info" heading="Key Takeaways" className="mb-8">
            <ul className="list-disc list-inside space-y-1">
              {article.keyTakeaways.map((takeaway, i) => (
                <li key={i}>{takeaway}</li>
              ))}
            </ul>
          </Callout>
        ) : null}

        {article.body ? (
          <Prose value={article.body} references={article.references} className="mb-10" />
        ) : null}

        <div className="mb-10 border-t border-paper-200 pt-6">
          <ShareButtons title={article.title} shareUrl={shareUrl} />
        </div>

        {article.references && article.references.length > 0 ? (
          <section className="mb-10" aria-labelledby="references-heading">
            <h2
              id="references-heading"
              className="font-display text-xl font-semibold text-ink-900 mb-4"
            >
              References
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-ink-600">
              {article.references.map((ref, i) => (
                <li key={i} id={`reference-${i + 1}`} className="scroll-mt-24">
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-leaf-700"
                    >
                      {ref.title}
                    </a>
                  ) : (
                    ref.title
                  )}
                  {ref.publisher ? <span> — {ref.publisher}</span> : null}
                  {ref.accessedAt ? <span> (accessed {formatDate(ref.accessedAt)})</span> : null}
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <Callout variant="disclaimer" heading="Medical disclaimer" className="mb-8">
          <p>
            This article is for educational purposes only and does not replace professional medical
            advice. Consult a qualified healthcare provider for personalised guidance.
          </p>
        </Callout>

        {article.reviewer ? (
          <section
            className="mb-10 rounded-lg border border-ink-100 bg-white p-5"
            aria-label="Reviewer"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Reviewed by
            </p>
            <p className="mt-1 text-sm text-ink-800">
              <span className="font-semibold">{article.reviewer.name}</span>
              {article.reviewer.qualifications ? (
                <span className="text-ink-500"> — {article.reviewer.qualifications}</span>
              ) : null}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
              {article.lastReviewedAt ? (
                <span>Last reviewed: {formatDate(article.lastReviewedAt)}</span>
              ) : null}
              {article.nextReviewAt ? (
                <span>Next review due: {formatDate(article.nextReviewAt)}</span>
              ) : null}
            </div>
            <p className="mt-3">
              <Link href={correctionHref} variant="branded" className="text-sm">
                Report a correction
              </Link>
            </p>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="border-t border-paper-200 pt-8" aria-labelledby="related-heading">
            <h2
              id="related-heading"
              className="font-display text-xl font-semibold text-ink-900 mb-6"
            >
              Related Content
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {related.map((item) => {
                const href = relatedContentHref(item)
                const typeLabel = relatedContentLabel(item)
                if (!href || !typeLabel) return null
                return (
                  <Link key={item._id} href={href} className="group block">
                    <Card className="h-full transition-shadow group-hover:shadow-md">
                      <CardBody>
                        <Badge
                          variant={item._type === 'article' ? 'leaf' : 'palm'}
                          className="mb-2"
                        >
                          {typeLabel}
                        </Badge>
                        <CardTitle className="text-base group-hover:text-leaf-700 transition-colors">
                          {item.title}
                        </CardTitle>
                      </CardBody>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>
        ) : null}
      </article>
    </PageShell>
  )
}
