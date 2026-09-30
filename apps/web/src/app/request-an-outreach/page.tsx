import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { PageShell } from '@/components/layout/PageShell'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { Container } from '@/components/ui/Container'
import { Callout } from '@/components/ui/Callout'
import { OutreachRequestForm } from '@/features/forms/OutreachRequestForm'

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/request-an-outreach',
    fallbackTitle: 'Request an Outreach',
    fallbackDescription:
      'Tell NHECOF about your community and the health topics you want to cover, and we will work with you to plan an outreach that fits.',
  })
}

export default async function RequestAnOutreachPage() {
  return (
    <PageShell
      title="Request an Outreach"
      description="Tell us about your community, the people you want to reach, and what you'd like covered. We'll plan a session that fits your group — no medical history or sensitive personal information is needed."
      breadcrumbs={generateBreadcrumbs('/request-an-outreach')}
    >
      <Container width="prose">
        <div className="space-y-8">
          <OutreachRequestForm />

          <Callout variant="disclaimer">
            <p>
              We only collect the details you share so we can plan and arrange this outreach, and we
              never request medical histories. Consent to our{' '}
              <a href="/privacy" className="text-leaf-700 underline underline-offset-2 hover:text-leaf-800">
                Privacy Policy
              </a>{' '}
              is required before submitting, so you stay in control of your information.
            </p>
          </Callout>
        </div>
      </Container>
    </PageShell>
  )
}