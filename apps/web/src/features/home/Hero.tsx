import NextLink from 'next/link'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Figure } from '@/components/ui/Figure'
import { ctaToButtonVariant } from './ctaVariant'
import type { SanityImage } from './queries'

/*
  HEADLINE OPTIONS — pick one, delete the rest:

  OPTION A (recommended — active, community-forward):
    "Stronger communities through
     better nutrition knowledge"

  OPTION B (evidence-led, credibility-first):
    "Evidence-based nutrition guidance
     for every Nigerian community"

  OPTION C (outcome-focused, urgent):
    "Closing the nutrition knowledge
     gap across Nigeria"

  The current placeholder below is a clearly-marked dev default
  and must fail the production placeholder check.
*/

interface HeroProps {
  headline?: string
  subheadline?: string
  heroImage?: SanityImage
  /** Resolved CDN URL of the hero image (computed in the query layer). */
  heroImageSrc?: string
  primaryCta?: { label: string; url: string; variant?: string }
  secondaryCta?: { label: string; url: string; variant?: string }
}

const PLACEHOLDER_HEADLINE = 'Stronger communities through better nutrition knowledge'
const PLACEHOLDER_SUBHEADLINE =
  'NHECOF makes reliable, evidence-based nutrition knowledge accessible to Nigerian communities — from market stalls to health centres.'

function PhotoPending() {
  return (
    <div className="relative flex aspect-[4/3] items-center justify-center rounded-xl border-2 border-dashed border-ink-200 bg-paper-100">
      <div className="text-center">
        <p className="text-sm font-medium text-ink-400">Photo pending</p>
        <p className="mt-1 text-xs text-ink-500">
          Authentic outreach photo to be added by the content team
        </p>
      </div>
    </div>
  )
}

export function Hero({
  headline,
  subheadline,
  heroImage,
  heroImageSrc,
  primaryCta,
  secondaryCta,
}: HeroProps) {
  const resolvedHeadline = headline || PLACEHOLDER_HEADLINE
  const resolvedSubheadline = subheadline || PLACEHOLDER_SUBHEADLINE
  const resolvedPrimary = primaryCta || {
    label: 'Explore the Nutrition Hub',
    url: '/nutrition',
  }
  const resolvedSecondary = secondaryCta || {
    label: 'Request an outreach',
    url: '/request-an-outreach',
  }

  return (
    <section aria-labelledby="hero-heading" className="bg-paper-50">
      <Container width="wide" className="py-12 md:py-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          {/* Left — copy */}
          <div>
            <h1
              id="hero-heading"
              className="font-display text-3xl font-bold leading-tight tracking-tight text-ink-900 sm:text-4xl md:text-5xl"
            >
              {resolvedHeadline}
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-relaxed text-ink-600">
              {resolvedSubheadline}
            </p>

            {/* Trust line */}
            <p className="mt-4 text-sm text-ink-400">
              Every health article is written and reviewed by qualified
              professionals.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                variant={ctaToButtonVariant(resolvedPrimary.variant, 'primary')}
                size="lg"
                asChild
              >
                <NextLink href={resolvedPrimary.url}>
                  {resolvedPrimary.label}
                </NextLink>
              </Button>
              <Button
                variant={ctaToButtonVariant(resolvedSecondary.variant, 'secondary')}
                size="lg"
                asChild
              >
                <NextLink href={resolvedSecondary.url}>
                  {resolvedSecondary.label}
                </NextLink>
              </Button>
            </div>
          </div>

          {/* Right — leaf-cut authentic outreach photo with a field-note caption */}
          <div>
            {heroImage && heroImage.consentStatus === 'cleared' && heroImageSrc ? (
              <Figure
                src={heroImageSrc}
                image={heroImage}
                alt={heroImage.alt || ''}
                caption={heroImage.caption}
                credit={heroImage.credit}
                decorative={heroImage.decorative}
                consentStatus="cleared"
                containsMinors={heroImage.containsMinors}
                priority
              />
            ) : (
              <PhotoPending />
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
