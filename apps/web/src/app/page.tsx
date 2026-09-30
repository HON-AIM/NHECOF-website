import type { Metadata } from 'next'
import { getHomepageData } from '@/features/home/queries'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { getSiteUrl } from '@/lib/seo/url'
import { SITE_DEFAULTS } from '@/lib/seo/defaults'
import { Hero } from '@/features/home/Hero'
import { DailyQuote } from '@/features/daily-quotes/DailyQuote'
import { ImpactSnapshot } from '@/features/home/ImpactSnapshot'
import { WhatWeDo } from '@/features/home/WhatWeDo'
import { FeaturedKnowledge } from '@/features/home/FeaturedKnowledge'
import { RecentOutreach } from '@/features/home/RecentOutreach'
import { UpcomingActivity } from '@/features/home/UpcomingActivity'
import { Participation } from '@/features/home/Participation'
import { Newsletter } from '@/features/home/Newsletter'

export const revalidate = 3600

export async function generateMetadata(): Promise<Metadata> {
  const { homepage, ogImageSrc } = await getHomepageData()

  const title =
    homepage?.seo?.title ||
    'NHECOF — NutriHealth Education and Community Outreach Foundation'
  const description =
    homepage?.seo?.description ||
    'Making reliable nutrition knowledge and preventive health support accessible to Nigerian communities.'
  const baseUrl = getSiteUrl()

  const base = buildMetadata({
    path: '/',
    seo: homepage?.seo,
    fallbackTitle: title,
    fallbackDescription: description,
    image: homepage?.heroImage,
    titleAbsolute: true,
  })

  const images = [
    ...(ogImageSrc ? [{ url: ogImageSrc, width: SITE_DEFAULTS.ogWidth, height: SITE_DEFAULTS.ogHeight }] : []),
    { url: `${baseUrl}/api/og/quote`, width: SITE_DEFAULTS.ogWidth, height: SITE_DEFAULTS.ogHeight, alt: 'NHECOF quote of the day' },
  ]

  return {
    ...base,
    openGraph: {
      ...base.openGraph,
      title,
      description,
      images,
    },
  }
}

export default async function HomePage() {
  const {
    homepage,
    heroImageSrc,
    impactMetrics,
    programmes,
    article,
    foodProfile,
    outreach,
    upcoming,
  } = await getHomepageData()

  const newsletterEnabled =
    process.env.NEWSLETTER_ENABLED === 'true'

  return (
    <>
      {/* 1. Hero — answers: who, what, what next */}
      <Hero
        headline={homepage?.headline}
        subheadline={homepage?.subheadline}
        heroImage={homepage?.heroImage}
        heroImageSrc={heroImageSrc}
        primaryCta={homepage?.primaryCta}
        secondaryCta={homepage?.secondaryCta}
      />

      {/* 2. Daily Quote — approved quotes only; hidden when none exist */}
      <DailyQuote />

      {/* 3. Impact Snapshot — verified metrics only */}
      <ImpactSnapshot
        heading={homepage?.impactSection?.heading}
        description={homepage?.impactSection?.description}
        metrics={impactMetrics}
      />

      {/* 4. What We Do — editorial numbered list */}
      <WhatWeDo programmes={programmes} />

      {/* 5. Featured Knowledge — article + food profile */}
      <FeaturedKnowledge article={article} foodProfile={foodProfile} />

      {/* 6. Recent Outreach — latest completed */}
      <RecentOutreach outreach={outreach} />

      {/* 7. Upcoming Activity — only renders with valid data */}
      <UpcomingActivity activity={upcoming} />

      {/* 8. Participation — three paths */}
      <Participation
        heading={homepage?.ctaSection?.heading}
        description={homepage?.ctaSection?.description}
        actions={homepage?.ctaSection?.actions}
      />

      {/* 9. Newsletter — conditional on env flag */}
      <Newsletter enabled={newsletterEnabled} />
    </>
  )
}