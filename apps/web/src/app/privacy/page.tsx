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
    path: '/privacy',
    fallbackTitle: 'Privacy Policy',
    fallbackDescription:
      "How NHECOF collects, uses, stores, and protects your personal information under Nigeria's Data Protection Act 2023 (NDPA 2023).",
  })
}

export default async function PrivacyPolicyPage() {
  const siteSettings = await getSiteSettings()
  const contactEmail = siteSettings?.contact?.email
  const registration = siteSettings?.registration

  const hasRegistration =
    Boolean(registration?.body) || Boolean(registration?.number) || Boolean(registration?.year)

  return (
    <PageShell
      title="Privacy Policy"
      description="How NHECOF handles your personal information, your rights under the NDPA 2023, and how to request removal."
      breadcrumbs={generateBreadcrumbs('/privacy')}
    >
      <Container>
        <Callout variant="warning">
          <p>Requires review by a qualified legal adviser before launch</p>
        </Callout>

        <h2>Who We Are</h2>
        <p>
          NutriHealth Education and Community Outreach Foundation (NHECOF) is a not-for-profit
          foundation focused on nutrition education and preventive health in Nigeria. NHECOF is the
          data controller responsible for the personal information described in this notice. This
          notice explains what we collect through this website, why we collect it, how long we keep
          it, and how you can ask us to remove it.
        </p>
        {hasRegistration ? (
          <p>
            Registered with {registration?.body}
            {registration?.number ? ` under registration number ${registration.number}` : ''}
            {registration?.year ? ` in ${registration.year}` : ''}.
          </p>
        ) : null}

        <h2>Our Legal Framework</h2>
        <p>
          NHECOF handles personal information in accordance with{' '}
          <strong>Nigeria&apos;s Data Protection Act 2023 (the &ldquo;DPA 2023&rdquo;)</strong> and
          the implementing regulations of the Nigeria Data Protection Commission (NDPC).
        </p>

        <h2>Information We Collect and Why</h2>
        <p>
          We collect only the minimum information needed to respond to you. Each form on this
          website collects specific information for a specific purpose:
        </p>
        <ul>
          <li>
            <strong>Contact form</strong> — name, email, optional telephone, subject and message.
            Collected so we can reply to your enquiry and route it to the right person.
          </li>
          <li>
            <strong>Partnership enquiry form</strong> — organisation name, contact person, contact
            details, partnership interest, and proposed collaboration. Collected to evaluate and
            respond to partnership requests.
          </li>
          <li>
            <strong>Outreach request form</strong> — organisation or community name, contact
            person&apos;s details, community/LGA/state, audience size, target audience, health
            concerns, preferred dates, venue availability, and the type of support requested.
            Collected to plan and arrange a community outreach visit.
          </li>
          <li>
            <strong>Newsletter subscription</strong> — email address only. Collected solely to send
            the educational newsletter you have asked to receive. (Not yet active on this website.)
          </li>
          <li>
            <strong>Website analytics</strong> — anonymous, aggregated usage information. Collected
            to understand how the site is used so we can improve it. No personal identifiers are
            retained.
          </li>
        </ul>
        <p>
          We do not collect medical histories, screening results, or other sensitive health data
          through these forms. Please do not include such details in your messages.
        </p>

        <h2>Legal Basis for Processing</h2>
        <p>We process personal information under the DPA 2023 on the following bases:</p>
        <ul>
          <li>
            <strong>Consent</strong> — where you submit a form or subscribe to a newsletter, you
            consent to the information being used for that stated purpose.
          </li>
          <li>
            <strong>Legitimate interest</strong> — for responding to genuine enquiries and for
            anonymous analytics, where our interests do not override your rights and freedoms.
          </li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>Your information is used only to:</p>
        <ul>
          <li>respond to enquiries and partnership requests;</li>
          <li>plan and arrange community outreach visits;</li>
          <li>send newsletters you have subscribed to; and</li>
          <li>improve the website through anonymised analytics.</li>
        </ul>

        <h2>Data Retention</h2>
        <p>We keep your information only as long as necessary for the purpose it was collected:</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-ink-200 text-left">
                <th className="py-2 pr-4 font-semibold text-ink-900">Information</th>
                <th className="py-2 font-semibold text-ink-900">Retention period</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-ink-100">
                <td className="py-2 pr-4 align-top"><strong>Contact form data</strong></td>
                <td className="py-2 align-top">2 years after the last contact</td>
              </tr>
              <tr className="border-b border-ink-100">
                <td className="py-2 pr-4 align-top"><strong>Partnership enquiry data</strong></td>
                <td className="py-2 align-top">3 years after the last contact</td>
              </tr>
              <tr className="border-b border-ink-100">
                <td className="py-2 pr-4 align-top"><strong>Outreach request data</strong></td>
                <td className="py-2 align-top">3 years after the last contact</td>
              </tr>
              <tr className="border-b border-ink-100">
                <td className="py-2 pr-4 align-top"><strong>Newsletter data</strong></td>
                <td className="py-2 align-top">Until you unsubscribe</td>
              </tr>
              <tr className="border-b border-ink-100">
                <td className="py-2 pr-4 align-top"><strong>Website analytics</strong></td>
                <td className="py-2 align-top">Anonymised and aggregated; no personal identifiers retained</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm text-ink-600">
          These periods are working defaults subject to the final review of this notice.
        </p>

        <h2>Your Rights Under the DPA 2023</h2>
        <p>You have the following rights in relation to your personal information:</p>
        <ul>
          <li><strong>Right of access</strong> — to see the information we hold about you;</li>
          <li><strong>Right to rectification</strong> — to correct inaccurate or incomplete information;</li>
          <li><strong>Right to erasure</strong> — to ask us to delete your information;</li>
          <li><strong>Right to object</strong> — to object to processing based on legitimate interest; and</li>
          <li>
            <strong>Right to data portability</strong> — to receive your information in a
            structured, machine-readable format.
          </li>
        </ul>

        <h2>How to Request Removal</h2>
        {contactEmail ? (
          <p>
            To exercise any of these rights, email{' '}
            <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link> with the subject line{' '}
            <strong>&quot;Data Removal Request&quot;</strong>. We will respond within the timeframes
            required by the DPA 2023.
          </p>
        ) : (
          <p>
            To exercise any of these rights, use our{' '}
            <NextLink href="/contact" className="text-leaf-700 underline underline-offset-2 hover:text-leaf-800">
              contact page
            </NextLink>{' '}
            with the subject line <strong>&quot;Data Removal Request&quot;</strong>. We will respond
            within the timeframes required by the DPA 2023.
          </p>
        )}

        <h2>Data Security</h2>
        <p>
          We apply reasonable technical and organisational measures to protect your information from
          loss, misuse, unauthorised access, alteration, and disclosure. These include restricted
          access to personal data, secure form handling, and regular review of our storage practices.
        </p>

        <h2>Third-Party Sharing</h2>
        <p>
          We do not sell, rent, or trade your personal information. We share information with third
          parties <strong>only</strong> where we have your explicit consent, or where we are legally
          obliged to do so.
        </p>

        <h2>Cookies and Analytics</h2>
        <p>
          This website uses privacy-conscious analytics to understand aggregate usage. Where cookies
          or local storage are used, they are limited to what is necessary for the site to function
          and do not identify you personally. You may disable cookies in your browser settings; the
          site will continue to function.
        </p>

        <h2>Children&apos;s Privacy</h2>
        <p>
          We do not knowingly collect personal information from children without a parent or
          guardian&apos;s consent. Where outreach content involves minors, consent is managed as set
          out in our editorial and image consent policies.
        </p>

        <h2>Changes to This Notice</h2>
        <p>
          We may update this notice from time to time. When we do, we will revise the date on this
          page. Significant changes will be highlighted where reasonably possible.
        </p>

        <h2>Contact</h2>
        <p>
          For any privacy questions, or to make a request under the DPA 2023:{' '}
          {contactEmail ? (
            <Link href={`mailto:${contactEmail}`}>{contactEmail}</Link>
          ) : (
            <NextLink href="/contact" className="text-leaf-700 underline underline-offset-2 hover:text-leaf-800">
              use our contact page
            </NextLink>
          )}
          .
        </p>
      </Container>
    </PageShell>
  )
}