import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getResourceBySlug, languageLabel, formatBytes, RESOURCE_TYPE_LABELS } from '@/features/resources/queries'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { PageShell } from '@/components/layout/PageShell'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { formatDateLong } from '@/lib/format'

export const revalidate = 3600
export const dynamic = 'force-static'

interface PageProps {
  params: Promise<{ slug: string }>
}

function formatDate(dateStr: string): string {
  return formatDateLong(dateStr)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const resource = await getResourceBySlug(slug)
  // See the article route: throwing here (metadata phase) is what produces a
  // real 404 status despite the app-level loading.tsx Suspense boundary.
  if (!resource) notFound()
  return buildMetadata({
    path: `/resources/${slug}`,
    fallbackTitle: resource.title,
    fallbackDescription:
      resource.description ?? `Download a free ${RESOURCE_TYPE_LABELS[resource.type].toLowerCase()} from NHECOF.`,
  })
}

export default async function ResourceDetailPage({ params }: PageProps) {
  const { slug } = await params
  const resource = await getResourceBySlug(slug)
  if (!resource) notFound()

  const size = formatBytes(resource.fileSizeBytes)
  const fileMetaParts = [
    resource.fileExtension ? resource.fileExtension.toUpperCase() : null,
    size || null,
    languageLabel(resource.language),
  ].filter(Boolean)

  const metaRows: Array<{ label: string; value: string }> = [
    { label: 'Type', value: RESOURCE_TYPE_LABELS[resource.type] },
    { label: 'Format', value: fileMetaParts.join(' · ') },
    { label: 'Language', value: languageLabel(resource.language) },
    { label: 'Published', value: formatDate(resource.publishedAt) },
    resource.audiences.length > 0
      ? { label: 'Audience', value: resource.audiences.map((a) => a.replace(/-/g, ' ')).join(', ') }
      : { label: 'Audience', value: 'General public' },
  ]

  return (
    <PageShell
      title={resource.title}
      eyebrow="Resources"
      description={resource.description ?? undefined}
      breadcrumbs={generateBreadcrumbs(`/resources/${slug}`, { [slug]: resource.title })}
    >
      <Container width="prose">
        <article>
          <header className="mb-8">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge variant="leaf">{RESOURCE_TYPE_LABELS[resource.type]}</Badge>
              {resource.categories.map((category) => (
                <Badge key={category.slug} variant="default">
                  {category.title}
                </Badge>
              ))}
            </div>

            {resource.description ? (
              <p className="text-lg leading-relaxed text-ink-700">{resource.description}</p>
            ) : null}
          </header>

          <aside
            aria-label="Resource details and download"
            className="mb-10 rounded-xl border border-ink-100 bg-white p-6"
          >
            <h2 className="mb-5 font-display text-xl font-semibold text-ink-900">
              Resource details and download
            </h2>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {metaRows.map((row) => (
                <div key={row.label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-ink-500">{row.label}</dt>
                  <dd className="mt-1 text-sm text-ink-700">{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6">
              {resource.downloadUrl ? (
                <>
                  <a
                    href={`/resources/${resource.slug}/download`}
                    className="inline-flex items-center gap-2 rounded-md bg-leaf-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-leaf-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                      aria-hidden="true"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    Download resource
                  </a>
                  <p className="mt-3 text-xs text-ink-400">
                    Downloads work without JavaScript. Anonymous download counts help us improve.
                  </p>
                </>
              ) : (
                <p className="text-sm text-ink-500">
                  This resource is not available for download yet.
                </p>
              )}
            </div>
          </aside>
        </article>
      </Container>
    </PageShell>
  )
}