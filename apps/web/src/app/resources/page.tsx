import type { Metadata } from 'next'
import { getResources, languageLabel, formatBytes, RESOURCE_TYPE_LABELS, RESOURCE_TYPES, type ResourceDoc } from '@/features/resources/queries'
import { PageShell } from '@/components/layout/PageShell'
import { Container } from '@/components/ui/Container'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { formatDateShort } from '@/lib/format'
import { ResourcesArchive, type ResourceArchiveItem } from './ResourcesArchive'
import { ResourcesFilterEnhancer } from './ResourcesFilterEnhancer'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Nutrition Resources',
  description:
    'Download free guides, infographics, reports and fact sheets from NHECOF — practical nutrition knowledge for Nigerian families and communities.',
  alternates: {
    canonical: '/resources',
  },
}

function formatShortDate(dateStr: string): string {
  return formatDateShort(dateStr)
}

function fileMeta(resource: ResourceDoc): string {
  const parts: string[] = []
  if (resource.fileExtension) parts.push(resource.fileExtension.toUpperCase())
  const size = formatBytes(resource.fileSizeBytes)
  if (size) parts.push(size)
  parts.push(languageLabel(resource.language))
  return parts.join(' · ')
}

export default async function ResourcesPage() {
  const all = await getResources()

  const items: ResourceArchiveItem[] = all.map((r) => ({
    id: r._id,
    title: r.title,
    slug: r.slug,
    description: r.description ?? null,
    type: r.type,
    topics: r.categories.map((c) => c.slug),
    audiences: r.audiences,
    fileMeta: fileMeta(r),
    dateLabel: `Published ${formatShortDate(r.publishedAt)}`,
  }))

  const typeOptions = RESOURCE_TYPES.map((value) => ({
    value,
    label: RESOURCE_TYPE_LABELS[value],
    count: all.filter((r) => r.type === value).length,
  })).filter((o) => o.count > 0)

  const topicMap = new Map<string, { value: string; label: string; count: number }>()
  for (const r of all) {
    for (const c of r.categories) {
      const entry = topicMap.get(c.slug) ?? { value: c.slug, label: c.title, count: 0 }
      entry.count += 1
      topicMap.set(c.slug, entry)
    }
  }
  const topicOptions = [...topicMap.values()].sort((a, b) => a.label.localeCompare(b.label))

  const audienceOptions = [...new Set(all.flatMap((r) => r.audiences))]
    .map((value) => ({
      value,
      label: value.replace(/-/g, ' '),
      count: all.filter((r) => r.audiences.includes(value)).length,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  return (
    <PageShell
      title="Nutrition Resources"
      eyebrow="Resources"
      description="Free guides, infographics and fact sheets to support healthier choices — in English and Nigerian languages."
      breadcrumbs={generateBreadcrumbs('/resources')}
    >
      <Container>
        <ResourcesArchive
          items={items}
          typeOptions={typeOptions}
          topicOptions={topicOptions}
          audienceOptions={audienceOptions}
        />
        <ResourcesFilterEnhancer />
      </Container>
    </PageShell>
  )
}