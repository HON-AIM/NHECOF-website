import type { Metadata } from 'next'
import { getSiteSettings } from '@/lib/sanity/queries'
import { PageShell } from '@/components/layout/PageShell'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { Container } from '@/components/ui/Container'
import { Callout } from '@/components/ui/Callout'
import { Link } from '@/components/ui/Link'
import { ContactPanel } from './ContactPanel'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with NHECOF with questions, feedback, or partnership enquiries. We aim to respond within 2-3 business days.',
  alternates: {
    canonical: '/contact',
  },
}

interface ContactPageProps {
  searchParams: never
}

export default async function ContactPage(_props: ContactPageProps) {
  const siteSettings = await getSiteSettings()
  const contact = siteSettings?.contact

  const whatsappNumber = siteSettings?.socialLinks?.whatsapp ?? contact?.phone

  return (
    <PageShell title="Contact Us" breadcrumbs={generateBreadcrumbs('/contact')}>
      <Container width="prose">
        <div className="space-y-10">
          {/* 1. Intro */}
          <p className="text-ink-600">
            We'd like to hear from you — whether you have a question, feedback, an idea for an
            outreach, or something else entirely. Our team will get back to you.
          </p>

          {/* 2. Contact details */}
          <section aria-labelledby="contact-details" className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-ink-900" id="contact-details">
              Contact details
            </h2>
            <dl className="divide-y divide-ink-100 border-y border-ink-100">
              {contact?.email && (
                <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-6">
                  <dt className="text-sm font-semibold text-ink-500">Email</dt>
                  <dd>
                    <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
                  </dd>
                </div>
              )}
              {contact?.phone && (
                <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-6">
                  <dt className="text-sm font-semibold text-ink-500">Phone</dt>
                  <dd>
                    <Link href={`tel:${contact.phone.replace(/[^+0-9]/g, '')}`}>
                      {contact.phone}
                    </Link>
                  </dd>
                </div>
              )}
              {contact?.address && (
                <div className="grid gap-1 py-4 sm:grid-cols-[7rem_1fr] sm:gap-6">
                  <dt className="text-sm font-semibold text-ink-500">Address</dt>
                  <dd className="text-ink-600">{contact.address}</dd>
                </div>
              )}
            </dl>
          </section>

          {/* 3. WhatsApp click-to-chat */}
          {whatsappNumber && (
            <section aria-labelledby="whatsapp" className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-ink-900" id="whatsapp">
                WhatsApp
              </h2>
              <p className="text-ink-600">
                For quick questions, start a chat on{' '}
                <Link
                  href={`https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </Link>
                .
              </p>
            </section>
          )}

          {/* 4. Response time */}
          <Callout variant="info">
            <p className="text-info-dark">We aim to respond within 2-3 business days.</p>
          </Callout>

          {/* 5. Form slot */}
          <section aria-labelledby="contact-form" className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-ink-900" id="contact-form">
              Send us a message
            </h2>
            {/* No Suspense boundary: ContactPanel no longer uses
                useSearchParams(), so the form ships in the first paint. */}
            <ContactPanel />
          </section>

          {/* 6. Urgent matters */}
          <Callout variant="caution">
            For urgent health concerns, please contact a qualified healthcare provider directly.
          </Callout>
        </div>
      </Container>
    </PageShell>
  )
}