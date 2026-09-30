import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PageShell } from '@/components/layout/PageShell'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { Container } from '@/components/ui/Container'
import { renderMarkdown } from '@/lib/markdown'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/editorial-policy',
    fallbackTitle: 'Editorial Policy',
    fallbackDescription:
      'How NHECOF creates, reviews, and publishes content on its website, including evidence standards, content safeguards, and our corrections process.',
  })
}

function readEditorialPolicy(): string {
  try {
    return readFileSync(join(process.cwd(), '../../docs/editorial-policy.md'), 'utf8')
  } catch {
    return ''
  }
}

export default async function EditorialPolicyPage() {
  const source = readEditorialPolicy()

  return (
    <PageShell
      title="Editorial Policy"
      description="How NHECOF creates, reviews, and publishes content on its website."
      breadcrumbs={generateBreadcrumbs('/editorial-policy')}
    >
      <Container>
        {source ? (
          renderMarkdown(source)
        ) : (
          <p>Our editorial policy is being prepared. Please check back soon.</p>
        )}
      </Container>
    </PageShell>
  )
}