import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getAllProgrammes, getProgrammeBySlug } from '@/lib/sanity/queries'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { programmeDetailRoutesEnabled } from '@/lib/features'
import { PageShell } from '@/components/layout/PageShell'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Link } from '@/components/ui/Link'
import { Prose } from '@/components/ui/Prose'

export const revalidate = 3600

interface ProgrammePageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  if (!programmeDetailRoutesEnabled()) return []
  const programmes = await getAllProgrammes()
  return programmes.map((programme) => ({ slug: programme.slug.current }))
}

export async function generateMetadata({ params }: ProgrammePageProps): Promise<Metadata> {
  const { slug } = await params
  if (!programmeDetailRoutesEnabled()) return {}
  const programme = await getProgrammeBySlug(slug)
  // See the article route: throwing here (metadata phase) is what produces a
  // real 404 status despite the app-level loading.tsx Suspense boundary.
  if (!programme) notFound()
  return buildMetadata({
    path: `/what-we-do/${slug}`,
    fallbackTitle: programme.title,
    fallbackDescription: programme.summary,
  })
}

export default async function ProgrammePage({ params }: ProgrammePageProps) {
  if (!programmeDetailRoutesEnabled()) notFound()

  const { slug } = await params
  const programme = await getProgrammeBySlug(slug)

  if (!programme) notFound()

  return (
    <PageShell
      title={programme.title}
      description={programme.summary}
      breadcrumbs={generateBreadcrumbs('/what-we-do', { [slug]: programme.title })}
    >
      <Container width="wide">
        <div className="space-y-8">
          {programme.targetAudience ? (
            <p>
              <Badge variant="leaf">{programme.targetAudience}</Badge>
            </p>
          ) : null}
          {programme.description ? <Prose value={programme.description} /> : null}
          {programme.relatedOutreaches && programme.relatedOutreaches.length > 0 ? (
            <div>
              <h2 className="font-display text-lg font-semibold text-ink-900">
                Related outreaches
              </h2>
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
          <p>
            <Link href="/what-we-do" variant="branded">
              ← Back to What We Do
            </Link>
          </p>
        </div>
      </Container>
    </PageShell>
  )
}