import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import NextLink from 'next/link'
import { getSiteSettings } from '@/lib/sanity/queries'
import { PageShell } from '@/components/layout/PageShell'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { Container } from '@/components/ui/Container'
import { Link } from '@/components/ui/Link'
import { Button } from '@/components/ui/Button'
import { Callout } from '@/components/ui/Callout'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/get-involved',
    fallbackTitle: 'Get Involved',
    fallbackDescription:
      'Volunteer, partner, or host an NHECOF outreach and help make reliable nutrition knowledge accessible to Nigerian communities.',
  })
}

const VOLUNTEER_ROLES = [
  {
    name: 'Community outreach',
    description:
      'Help plan and run nutrition education sessions, screenings, and awareness activities in communities across Nigeria.',
  },
  {
    name: 'Translation',
    description:
      'Translate NHECOF materials into Nigerian languages so that reliable nutrition knowledge reaches more people.',
  },
  {
    name: 'Content review',
    description:
      'Review articles, factsheets, and social media posts for accuracy, clarity, and tone alongside health professionals.',
  },
  {
    name: 'Event support',
    description:
      'Assist with logistics, registration, and coordination at outreach events, workshops, and partner activities.',
  },
  {
    name: 'Data collection',
    description:
      'Gather and record feedback and impact data during outreaches to help the foundation learn and improve.',
  },
] as const

export default async function GetInvolvedPage() {
  const siteSettings = await getSiteSettings()

  return (
    <PageShell title="Get Involved" breadcrumbs={generateBreadcrumbs('/get-involved')}>
      <Container width="prose">
        <div className="space-y-12">
          {/* 1. Who can volunteer */}
          <section aria-labelledby="who-can-volunteer" id="volunteer" className="scroll-mt-24 space-y-3">
            <h2 className="font-display text-2xl font-semibold text-ink-900" id="who-can-volunteer">
              Who can volunteer
            </h2>
            <div className="rounded-xl border-2 border-dashed border-ink-200 bg-paper-100 p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-ink-400">
                Placeholder content — to be replaced with final copy
              </p>
              <p className="mt-3 text-ink-700">
                We welcome volunteers with backgrounds in nutrition and dietetics, public health,
                medicine and nursing, health education and communication, community development, and
                event coordination — students, new graduates, and experienced professionals alike.
              </p>
            </div>
            <Button variant="secondary" asChild>
              <NextLink href="/contact?subject=Volunteering">Volunteer with us</NextLink>
            </Button>
          </section>

          {/* 2. Suitable roles */}
          <section aria-labelledby="suitable-roles" className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900" id="suitable-roles">
              Suitable roles
            </h2>
            <ul className="divide-y divide-ink-100 border-y border-ink-100">
              {VOLUNTEER_ROLES.map((role) => (
                <li key={role.name} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                  <h3 className="font-display text-lg font-semibold text-ink-900">{role.name}</h3>
                  <p className="text-ink-600">{role.description}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Partnership opportunities */}
          <section aria-labelledby="partnership" className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900" id="partnership">
              Partnership opportunities
            </h2>
            <p className="text-ink-600">
              We partner with schools, health facilities, community groups, and other organisations
              to bring reliable nutrition and preventive health education to more people. If your
              organisation shares this mission, find out <Link href="/partner">how we partner</Link>
              .
            </p>
            <Button variant="primary" asChild>
              <NextLink href="/partner">Partner with us</NextLink>
            </Button>
          </section>

          {/* 4. Hosting or requesting an outreach */}
          <section aria-labelledby="request-an-outreach" className="space-y-4">
            <h2
              className="font-display text-2xl font-semibold text-ink-900"
              id="request-an-outreach"
            >
              Hosting or requesting an outreach
            </h2>
            <p className="text-ink-600">
              Communities — schools, churches, mosques, market associations, women's groups, and
              more — can request a visit from the NHECOF team. Tell us about your community and the
              topics you want to cover, and we will work with you to plan a session that fits.
            </p>
            <Button variant="secondary" asChild>
              <NextLink href="/request-an-outreach">Request an outreach</NextLink>
            </Button>
          </section>

          {/* 5. Future support */}
          <section aria-labelledby="future-support" id="future-support" className="scroll-mt-24 space-y-3">
            <h2 className="font-display text-2xl font-semibold text-ink-900" id="future-support">
              Future support
            </h2>
            <Callout variant="info" heading="Donations are not yet open">
              <p className="text-info-dark">
                The foundation is working towards offering a safe and transparent way to accept
                financial support, and this section will be updated with details once it launches.
                No payment facility is available on this website at the moment.
              </p>
            </Callout>
          </section>

          {/* 6. Bottom CTA */}
          <section
            aria-labelledby="get-involved-cta"
            className="rounded-xl border border-ink-100 bg-paper-100 p-8 text-center"
          >
            <h2 className="font-display text-2xl font-semibold text-ink-900" id="get-involved-cta">
              Ready to get involved?
            </h2>
            <p className="mt-2 text-ink-600">
              Tell us what you would like to help with — we would love to hear from you.
            </p>
            <div className="mt-5">
              <Button variant="primary" size="lg" asChild>
                <NextLink href="/contact">Contact us</NextLink>
              </Button>
            </div>
            {siteSettings?.contact?.email && (
              <p className="mt-4 text-sm text-ink-500">
                Prefer to write?{' '}
                <Link href={`mailto:${siteSettings.contact.email}`}>
                  {siteSettings.contact.email}
                </Link>
              </p>
            )}
          </section>
        </div>
      </Container>
    </PageShell>
  )
}
