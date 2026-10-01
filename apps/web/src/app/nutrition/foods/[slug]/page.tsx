import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getFoodProfileBySlug, getFallbackRelated } from '@/features/nutrition/queries'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { absoluteUrl } from '@/lib/seo/url'
import { relatedContentHref } from '@/lib/seo/internalLinks'
import { PageShell } from '@/components/layout/PageShell'
import { Link } from '@/components/ui/Link'
import { Badge } from '@/components/ui/Badge'
import { Prose } from '@/components/ui/Prose'
import { Figure } from '@/components/ui/Figure'
import { Callout } from '@/components/ui/Callout'
import { ShareButtons } from '@/components/features/article/ShareButtons'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { formatDateLong } from '@/lib/format'
import { urlFor } from '@/lib/sanity/client'
import { PageViewEvent } from '@/components/analytics/PageViewEvent'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

function formatDate(dateStr: string): string {
  return formatDateLong(dateStr)
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
  const profile = await getFoodProfileBySlug(slug)
  // See the article route: throwing here (metadata phase) is what produces a
  // real 404 status despite the app-level loading.tsx Suspense boundary.
  if (!profile) notFound()
  return buildMetadata({
    path: `/nutrition/foods/${slug}`,
    fallbackTitle: profile.title,
    fallbackDescription: profile.summary,
    seo: profile.seo,
    image: profile.featuredImage,
    ogImage: absoluteUrl(`/api/og/food/${slug}`),
  })
}

export default async function FoodProfilePage({ params }: PageProps) {
  const { slug } = await params
  const profile = await getFoodProfileBySlug(slug)

  if (!profile) notFound()

  const imageUrl = safeImageSrc(profile.featuredImage)
  const siteBase = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const shareUrl = `${siteBase}/nutrition/foods/${slug}`
  const correctionHref = `/contact?subject=${encodeURIComponent('Report a correction')}&message=${encodeURIComponent(shareUrl)}`

  const related = await getFallbackRelated(
    { _id: profile._id, categories: profile.categories ?? [] },
    [profile._id],
    3,
  )

  const quickFacts = (
    <div className="rounded-xl border border-ink-100 bg-white p-5">
      <h2 className="mb-3 font-display text-lg font-semibold text-ink-900">Quick facts</h2>
      {profile.nutrients && profile.nutrients.length > 0 ? (
        <dl className="space-y-3">
          {profile.nutrients.map((nutrient, i) => (
            <div key={i}>
              <dt className="text-sm font-medium text-ink-700">{nutrient.name}</dt>
              <dd className="text-ink-600">
                {nutrient.amount ? (
                  <span className="block text-base font-semibold text-clay-700">
                    {nutrient.amount}
                  </span>
                ) : null}
                {nutrient.note ? (
                  <span className="block text-xs text-ink-500">{nutrient.note}</span>
                ) : null}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="text-sm text-ink-500">Nutrient details will be listed here.</p>
      )}
      {profile.portionContext ? (
        <p className="mt-4 border-t border-ink-100 pt-3 text-sm text-ink-600">
          <span className="font-medium text-ink-700">Portion tip:</span> {profile.portionContext}
        </p>
      ) : null}
    </div>
  )

  return (
    <PageShell
      title={profile.title}
      eyebrow="Food Profile"
      description={profile.summary}
      breadcrumbs={generateBreadcrumbs(`/nutrition/foods/${slug}`)}
      sidebar={quickFacts}
    >
      <PageViewEvent event="food_profile_viewed" properties={{ slug }} />
      <article className="max-w-prose">
        <header className="mb-8">
          {profile.scientificName ? (
            <p className="text-sm italic text-ink-500 mb-2">{profile.scientificName}</p>
          ) : null}
          {profile.aliases && profile.aliases.length > 0 ? (
            <p className="text-sm text-ink-500 mb-4">
              Also known as: <span className="italic">{profile.aliases.join(', ')}</span>
            </p>
          ) : null}
          {profile.categories && profile.categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.categories.map((cat) => (
                <Badge key={cat._id} variant="clay">
                  {cat.title}
                </Badge>
              ))}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-4 text-sm text-ink-500">
            {profile.author ? (
              <span>
                By <span className="font-medium text-ink-700">{profile.author.name}</span>
                {profile.author.qualifications ? (
                  <span className="text-ink-400"> — {profile.author.qualifications}</span>
                ) : null}
              </span>
            ) : null}
            {profile.publishedAt ? (
              <time dateTime={profile.publishedAt}>
                Published {formatDate(profile.publishedAt)}
              </time>
            ) : null}
            {profile.lastReviewedAt ? (
              <time dateTime={profile.lastReviewedAt}>
                Updated {formatDate(profile.lastReviewedAt)}
              </time>
            ) : null}
          </div>
        </header>

        {imageUrl ? (
          <Figure
            src={imageUrl}
            image={profile.featuredImage}
            alt={profile.featuredImage?.alt ?? profile.title}
            caption={profile.featuredImage?.caption}
            credit={profile.featuredImage?.credit}
            decorative={profile.featuredImage?.decorative}
            consentStatus={profile.featuredImage?.consentStatus ?? 'pending'}
            containsMinors={profile.featuredImage?.containsMinors}
            className="mb-8"
          />
        ) : null}

        {profile.description && profile.description.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">
              Description &amp; Common Uses
            </h2>
            <Prose value={profile.description} references={profile.references} />
          </section>
        ) : null}

        {profile.benefits && profile.benefits.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">May Support</h2>
            <Prose value={profile.benefits} references={profile.references} />
          </section>
        ) : null}

        {profile.preparation && profile.preparation.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">
              Healthy Preparation Options
            </h2>
            <Prose value={profile.preparation} references={profile.references} />
          </section>
        ) : null}

        {profile.portionContext ? (
          <section className="mb-10">
            <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">
              Practical Portion Context
            </h2>
            <p className="text-ink-700 leading-relaxed">{profile.portionContext}</p>
          </section>
        ) : null}

        <Callout variant="caution" heading="Cautions &amp; Allergies" className="mb-10">
          <p>{profile.cautions}</p>
        </Callout>

        {profile.myths && profile.myths.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">
              Common Myths or Misconceptions
            </h2>
            <Prose value={profile.myths} references={profile.references} />
          </section>
        ) : null}

        {profile.mealIdeas && profile.mealIdeas.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-3 font-display text-xl font-semibold text-ink-900">
              Affordable Meal Ideas
            </h2>
            <Prose value={profile.mealIdeas} references={profile.references} />
          </section>
        ) : null}

        <div className="mb-10 border-t border-paper-200 pt-6">
          <ShareButtons title={profile.title} shareUrl={shareUrl} />
        </div>

        {profile.references && profile.references.length > 0 ? (
          <section className="mb-10" aria-labelledby="references-heading">
            <h2
              id="references-heading"
              className="mb-4 font-display text-xl font-semibold text-ink-900"
            >
              Sources &amp; References
            </h2>
            <ol className="list-decimal list-inside space-y-3 text-sm text-ink-600">
              {profile.references.map((ref, i) => (
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
            This food profile is for educational purposes only and does not replace professional
            medical or dietary advice. If you have health conditions or allergies, consult a
            qualified healthcare provider.
          </p>
        </Callout>

        {profile.reviewer ? (
          <section
            className="mb-10 rounded-lg border border-ink-100 bg-white p-5"
            aria-label="Reviewer"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">
              Reviewed by
            </p>
            <p className="mt-1 text-sm text-ink-800">
              <span className="font-semibold">{profile.reviewer.name}</span>
              {profile.reviewer.qualifications ? (
                <span className="text-ink-500"> — {profile.reviewer.qualifications}</span>
              ) : null}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500">
              {profile.lastReviewedAt ? (
                <span>Last reviewed: {formatDate(profile.lastReviewedAt)}</span>
              ) : null}
              {profile.nextReviewAt ? (
                <span>Next review due: {formatDate(profile.nextReviewAt)}</span>
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
          <section className="mb-10" aria-label="Related content">
            <h2 className="font-display text-lg font-semibold text-ink-900">Keep exploring</h2>
            <ul className="mt-3 space-y-2">
              {related.map((item) => {
                const href = relatedContentHref(item)
                if (!href) return null
                return (
                  <li key={item._id}>
                    <Link href={href}>{item.title}</Link>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : null}
      </article>
    </PageShell>
  )
}
