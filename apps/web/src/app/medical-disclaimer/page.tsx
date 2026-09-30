import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import NextLink from 'next/link'
import { getSiteSettings } from '@/lib/sanity/queries'
import { PageShell } from '@/components/layout/PageShell'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { Container } from '@/components/ui/Container'
import { Callout } from '@/components/ui/Callout'
import { Link } from '@/components/ui/Link'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/medical-disclaimer',
    fallbackTitle: 'Medical Disclaimer',
    fallbackDescription:
      'NHECOF content is provided for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.',
  })
}

export default async function MedicalDisclaimerPage() {
  const siteSettings = await getSiteSettings()
  const contactEmail = siteSettings?.contact?.email

  return (
    <PageShell
      title="Medical Disclaimer"
      description="Please read this disclaimer carefully before relying on any information on this website."
      breadcrumbs={generateBreadcrumbs('/medical-disclaimer')}
    >
      <Container>
        <p>
          The content published on this website by NutriHealth Education and Community Outreach
          Foundation (NHECOF) is provided for <strong>educational purposes only</strong>. It is the
          result of the editorial process described in our{' '}
          <Link href="/editorial-policy">Editorial Policy</Link> and reflects information that is
          believed to be accurate and evidence-based at the time of writing.
        </p>

        <h2>Not Medical Advice</h2>
        <p>
          Nothing on this website, including articles, food profiles, outreach materials, or
          newsletter content, constitutes medical advice. Information here should never be treated
          as a diagnosis of, or a prescription for, any condition.
        </p>

        <h2>Not a Substitute for Professional Care</h2>
        <p>
          NHECOF content is <strong>not a substitute</strong> for professional medical advice,
          diagnosis, or treatment. Always seek the guidance of a qualified healthcare provider with
          any questions you have about a medical condition or the health of yourself or your family.
          Never disregard professional medical advice or delay seeking it because of something you
          have read on this website.
        </p>

        <h2>In an Emergency</h2>
        <Callout variant="caution" heading="Do not delay urgent care">
          <p>
            If you or someone you know is experiencing a medical emergency, stop using this website
            and contact the appropriate emergency services or go to the nearest hospital immediately.
          </p>
          <p className="mt-2">
            In Nigeria, dial <strong>112</strong> (the public safety answering point) or your local
            emergency number for assistance.
          </p>
        </Callout>

        <h2>Content Limitations</h2>
        <p>NHECOF does not, through this website or any related activity:</p>
        <ul>
          <li><strong>Diagnose</strong> any health condition;</li>
          <li><strong>Treat</strong> or manage any illness or injury; or</li>
          <li>
            <strong>Prescribe</strong> or recommend specific doses of any medication, supplement, or
            remedy.
          </li>
        </ul>
        <p>
          You remain responsible for your own health decisions. Content on this site may not apply
          to your personal circumstances, and individual results and needs vary.
        </p>

        <h2>External Links</h2>
        <p>
          This website may link to external websites for reference purposes. NHECOF does not control,
          endorse, or take responsibility for the content, accuracy, or privacy practices of external
          sites. A link to a third-party site does not imply that NHECOF verifies or vouches for the
          information found there.
        </p>

        <h2>Questions</h2>
        {contactEmail ? (
          <p>
            If you have questions about this disclaimer, contact us at{' '}
            <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link>.
          </p>
        ) : (
          <p>
            If you have questions about this disclaimer, use our{' '}
            <NextLink href="/contact" className="text-leaf-700 underline underline-offset-2 hover:text-leaf-800">
              contact page
            </NextLink>{' '}
            to reach us.
          </p>
        )}
      </Container>
    </PageShell>
  )
}