import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import NextLink from 'next/link'
import {
  getFounder,
  getTeamAndAdvisers,
  getSiteSettings,
} from '@/lib/sanity/queries'
import { PageShell } from '@/components/layout/PageShell'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { Prose } from '@/components/ui/Prose'
import { Link } from '@/components/ui/Link'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Callout } from '@/components/ui/Callout'
import { PersonCard } from '@/components/ui/PersonCard'
import { LeafCutFrame } from '@/components/ui/LeafCutFrame'
import { ResponsiveImage } from '@/components/ui/ResponsiveImage'
import { urlFor } from '@/lib/sanity/client'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/about',
    fallbackTitle: 'About NHECOF',
    fallbackDescription:
      'Learn about NHECOF — the NutriHealth Education and Community Outreach Foundation: our founding story, mission, vision, values, founder, team, advisers and governance.',
  })
}

const VALUES = [
  // DEVELOPER DEFAULT — replace with CMS content
  'Community-led and community-grounded',
  'Evidence-based nutrition education',
  'Accessible, preventive health support for all',
  'Respect and dignity in every interaction',
  'Sustainability through local partnerships',
]

const OBJECTIVES = [
  // DEVELOPER DEFAULT — replace with CMS content
  'Provide reliable nutrition knowledge in everyday language',
  'Deliver reachable education and screening outreaches',
  'Support families in making healthier food decisions',
  'Work with partners, schools and communities across Nigeria',
]

function roleLabel(role: string | undefined): string {
  if (!role) return ''
  return role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ')
}

export default async function AboutPage() {
  const [founder, teamAndAdvisers, siteSettings] = await Promise.all([
    getFounder(),
    getTeamAndAdvisers(),
    getSiteSettings(),
  ])

  const breadcrumbs = generateBreadcrumbs('/about')

  const founderPhotoUrl = founder?.photo
    ? urlFor(founder.photo).width(800).auto('format').url()
    : undefined
  const founderPhotoAlt = founder?.photo?.alt ?? founder?.name
  const suggestedFounderLink = founder?.professionalLinks?.[0]

  const registration = siteSettings?.registration
  const hasRegistration =
    Boolean(registration?.body) || Boolean(registration?.number) || Boolean(registration?.year)

  const teamLimit = 20
  const shownPeople = teamAndAdvisers.slice(0, teamLimit)

  return (
    <PageShell
      title="About NHECOF"
      eyebrow="Who we are"
      description="The NutriHealth Education and Community Outreach Foundation works to make reliable nutrition knowledge and preventive health support accessible to Nigerian communities."
      breadcrumbs={breadcrumbs}
    >
      <div className="space-y-14 md:space-y-16">
        {/* 1. Organisational introduction & founding story */}
        <section aria-labelledby="intro-heading" className="space-y-10">
          <div>
            <h2
              id="intro-heading"
              className="font-display text-2xl font-semibold text-ink-900 md:text-3xl"
            >
              Organisational introduction
            </h2>
            <p className="mt-4 leading-relaxed text-ink-700">
              {/* DEVELOPER DEFAULT — replace with CMS content */}
              NHECOF is a non-profit foundation dedicated to making reliable nutrition knowledge
              and preventive health support practical, affordable and accessible to Nigerian
              communities — through education, community outreaches and trusted partnerships.
            </p>
          </div>

          <div>
            <h2
              id="story-heading"
              className="font-display text-2xl font-semibold text-ink-900 md:text-3xl"
            >
              Our founding story
            </h2>
            <p className="mt-4 leading-relaxed text-ink-700">
              {/* DEVELOPER DEFAULT — replace with CMS content */}
              NHECOF began with a simple observation: good nutrition knowledge too rarely reaches
              the communities that need it most. What started as a small group of nutritionists and
              health educators grew into a foundation committed to turning reliable information into
              everyday, preventive care.
            </p>
            <p className="mt-4 leading-relaxed text-ink-700">
              {/* DEVELOPER DEFAULT — replace with CMS content */}
              Today we work across Nigeria — through community outreaches, education programmes and
              trusted partnerships — to help families eat well, prevent disease and live healthier
              lives.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-ink-100 bg-paper-100 p-6">
              <h3 className="font-display text-lg font-semibold text-ink-900">Our mission</h3>
              <p className="mt-2 text-ink-700">
                {/* DEVELOPER DEFAULT — replace with CMS content */}
                To make reliable nutrition and preventive health support practical, affordable and
                accessible for every Nigerian community.
              </p>
            </div>
            <div className="rounded-lg border border-ink-100 bg-paper-100 p-6">
              <h3 className="font-display text-lg font-semibold text-ink-900">Our vision</h3>
              <p className="mt-2 text-ink-700">
                {/* DEVELOPER DEFAULT — replace with CMS content */}
                A Nigeria where every family has the knowledge and support to prevent
                nutrition-related illness and thrive.
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-display text-lg font-semibold text-ink-900">Our objectives</h3>
            <ul className="mt-3 list-disc space-y-2 pl-6 text-ink-700">
              {OBJECTIVES.map((objective) => (
                <li key={objective}>{objective}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* 2. Values — typographic list */}
        <section aria-labelledby="values-heading">
          <h2
            id="values-heading"
            className="font-display text-2xl font-semibold text-ink-900 md:text-3xl"
          >
            Our values
          </h2>
          <ol className="mt-6 space-y-3 list-none">
            {VALUES.map((value, index) => (
              <li key={value} className="flex items-baseline">
                <span className="font-display text-leaf-700 font-bold mr-3">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-ink-800">{value}</span>
              </li>
            ))}
          </ol>
        </section>

        {/* 3. Our Founder */}
        {founder ? (
          <section aria-labelledby="founder-heading">
            <h2
              id="founder-heading"
              className="font-display text-2xl font-semibold text-ink-900 md:text-3xl"
            >
              Our Founder
            </h2>
            <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start">
              <LeafCutFrame className="shrink-0">
                {founderPhotoUrl ? (
                  <ResponsiveImage
                    src={founderPhotoUrl}
                    image={founder?.photo}
                    alt={founderPhotoAlt ?? founder.name}
                    ratio="4/3"
                    displayWidth={800}
                    sizes="(min-width: 768px) 288px, 256px"
                    className="aspect-[4/3] w-64 object-cover md:w-72"
                  />
                ) : (
                  <div
                    className="flex aspect-[4/3] w-64 items-center justify-center bg-leaf-100 font-display text-6xl font-semibold text-leaf-700 md:w-72"
                    aria-label={founder.name}
                    role="img"
                  >
                    {founder.name.charAt(0)}
                  </div>
                )}
              </LeafCutFrame>

              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-semibold text-ink-900">{founder.name}</h3>
                {founder.role ? (
                  <Badge variant="leaf" className="mt-2">
                    {roleLabel(founder.role)}
                  </Badge>
                ) : null}
                {founder.qualifications ? (
                  <p className="mt-3 text-sm font-medium text-ink-600">
                    {founder.qualifications}
                  </p>
                ) : null}
                {founder.specialisation ? (
                  <p className="mt-1 text-sm text-ink-600">{founder.specialisation}</p>
                ) : null}

                {founder.founderMotivation ? (
                  <p className="mt-4 leading-relaxed text-ink-700">{founder.founderMotivation}</p>
                ) : null}

                {founder.bio && founder.bio.length > 0 ? (
                  <Prose value={founder.bio} className="mt-4" />
                ) : null}

                {founder.founderStatement ? (
                  <blockquote className="my-6 border-l-4 border-palm-600 pl-4 font-display text-lg italic leading-relaxed text-ink-700">
                    “{founder.founderStatement}”
                  </blockquote>
                ) : null}

                {suggestedFounderLink ? (
                  <div className="mt-6">
                    <Link
                      href={suggestedFounderLink.url}
                      variant="branded"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {suggestedFounderLink.label}
                    </Link>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        {/* 4. Team & Advisers — 0 to 20 people handled gracefully */}
        {shownPeople.length > 0 ? (
          <section aria-labelledby="team-heading">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2
                id="team-heading"
                className="font-display text-2xl font-semibold text-ink-900 md:text-3xl"
              >
                Team &amp; Advisers
              </h2>
              {teamAndAdvisers.length > teamLimit ? (
                <p className="text-sm text-ink-500">
                  Showing {teamLimit} of {teamAndAdvisers.length}
                </p>
              ) : null}
            </div>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {shownPeople.map((person) => (
                <PersonCard
                  key={person._id}
                  name={person.name}
                  role={person.role}
                  qualifications={person.qualifications}
                  specialisation={person.specialisation}
                  photoUrl={
                    person.photo
                      ? urlFor(person.photo).width(320).auto('format').url()
                      : undefined
                  }
                  photoAlt={person.photo?.alt}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* 5. Governance / registration — shown only when provided */}
        {hasRegistration ? (
          <section aria-labelledby="governance-heading">
            <h2
              id="governance-heading"
              className="font-display text-2xl font-semibold text-ink-900 md:text-3xl"
            >
              Governance &amp; Registration
            </h2>
            <Callout
              heading={registration?.body ?? 'Registration details'}
              className="mt-6"
            >
              <dl className="space-y-1 text-sm">
                {registration?.body ? (
                  <div>
                    <dt className="inline font-semibold text-ink-500">Registration body: </dt>
                    <dd className="inline">{registration.body}</dd>
                  </div>
                ) : null}
                {registration?.number ? (
                  <div>
                    <dt className="inline font-semibold text-ink-500">Registration number: </dt>
                    <dd className="inline">{registration.number}</dd>
                  </div>
                ) : null}
                {registration?.year ? (
                  <div>
                    <dt className="inline font-semibold text-ink-500">Registered: </dt>
                    <dd className="inline">{registration.year}</dd>
                  </div>
                ) : null}
              </dl>
            </Callout>
          </section>
        ) : null}

        {/* 6. CTA */}
        <section aria-labelledby="cta-heading">
          <Container width="full" className="px-0">
            <div className="rounded-xl border border-ink-100 bg-paper-100 p-8 text-center md:p-12">
              <h2
                id="cta-heading"
                className="font-display text-2xl font-semibold text-ink-900 md:text-3xl"
              >
                Work with us
              </h2>
              <p className="mx-auto mt-3 max-w-prose text-ink-700">
                {/* DEVELOPER DEFAULT — replace with CMS content */}
                Whether you represent an organisation, a school, a health facility or a community
                group, there is a way to work with NHECOF.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Button asChild variant="primary" size="lg">
                  <NextLink href="/partner">Partner with us</NextLink>
                </Button>
                <Button asChild variant="secondary" size="lg">
                  <NextLink href="/contact">Contact us</NextLink>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </div>
    </PageShell>
  )
}