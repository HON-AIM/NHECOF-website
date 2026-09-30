import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import NextLink from 'next/link'
import { getAllProgrammes } from '@/lib/sanity/queries'
import { programmeDetailRoutesEnabled } from '@/lib/features'
import { PageShell } from '@/components/layout/PageShell'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { Container } from '@/components/ui/Container'
import { Link } from '@/components/ui/Link'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/what-we-do',
    fallbackTitle: 'What We Do',
    fallbackDescription:
      'An overview of NHECOF’s structured programmes bringing nutrition education and preventive health support directly to Nigerian communities.',
  })
}

export default async function WhatWeDoPage() {
  const [programmes, detailRoutesEnabled] = await Promise.all([
    getAllProgrammes(),
    Promise.resolve(programmeDetailRoutesEnabled()),
  ])

  return (
    <PageShell
      title="What We Do"
      description="NHECOF works through structured programmes that bring nutrition education and preventive health support directly to communities."
      breadcrumbs={generateBreadcrumbs('/what-we-do')}
    >
      {programmes.length === 0 ? (
        <Container width="wide">
          <section aria-labelledby="programmes-empty" className="py-12">
            <h2
              id="programmes-empty"
              className="font-display text-xl font-semibold text-ink-900 md:text-2xl"
            >
              Programmes
            </h2>
            <p className="mt-3 text-ink-600">
              Our programme details are on their way — please check back soon.
            </p>
          </section>
        </Container>
      ) : (
        <Container width="wide">
          <div className="divide-y divide-ink-100">
            {programmes.map((programme, index) => {
              const detailPath = `/what-we-do/${programme.slug.current}`
              const titleHref = detailRoutesEnabled ? detailPath : undefined
              const firstOutreach = programme.relatedOutreaches?.[0]
              const seeInActionHref = detailRoutesEnabled
                ? detailPath
                : firstOutreach
                  ? `/outreaches/${firstOutreach.slug.current}`
                  : undefined

              return (
                <section key={programme._id} className="py-8 first:pt-0 last:pb-0">
                  <p
                    aria-hidden="true"
                    className="font-display text-sm font-bold tracking-wide text-leaf-700"
                  >
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-semibold text-ink-900 md:text-2xl">
                    {titleHref ? (
                      <Link href={titleHref} variant="subtle" className="hover:text-leaf-700">
                        {programme.title}
                      </Link>
                    ) : (
                      programme.title
                    )}
                  </h2>
                  <p className="mt-2 max-w-prose leading-relaxed text-ink-600">
                    {programme.summary}
                  </p>
                  {programme.targetAudience ? (
                    <p className="mt-3">
                      <Badge variant="leaf">{programme.targetAudience}</Badge>
                    </p>
                  ) : null}
                  {programme.relatedOutreaches && programme.relatedOutreaches.length > 0 ? (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-ink-500">
                        Related outreaches
                      </h3>
                      <ul className="mt-2 space-y-1">
                        {programme.relatedOutreaches.map((outreach) => (
                          <li key={outreach.slug.current}>
                            <Link href={`/outreaches/${outreach.slug.current}`}>
                              {outreach.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {seeInActionHref ? (
                    <div className="mt-4">
                      <Button asChild size="sm" variant="quiet">
                        <NextLink href={seeInActionHref}>See it in action</NextLink>
                      </Button>
                    </div>
                  ) : null}
                </section>
              )
            })}
          </div>
        </Container>
      )}
    </PageShell>
  )
}