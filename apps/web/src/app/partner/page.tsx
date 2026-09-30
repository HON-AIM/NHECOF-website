import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { getSiteSettings } from '@/lib/sanity/queries'
import { PageShell } from '@/components/layout/PageShell'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { Container } from '@/components/ui/Container'
import { Callout } from '@/components/ui/Callout'
import { PartnershipForm } from '@/features/forms/PartnershipForm'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/partner',
    fallbackTitle: 'Partner With Us',
    fallbackDescription:
      'Institutions, health facilities, media, and communities can partner with NHECOF to bring reliable nutrition and preventive health education to more Nigerians.',
  })
}

const PARTNER_TYPES = [
  {
    name: 'Institutions',
    description:
      'Universities, schools, and research organisations that host sessions, contribute expertise, or support programme design.',
  },
  {
    name: 'Health facilities',
    description:
      'Primary health centres, hospitals, and clinics that bring verified nutrition guidance closer to patients and communities.',
  },
  {
    name: 'Media',
    description:
      'Radio, television, print, and online publishers that amplify accurate health messaging to wider audiences.',
  },
  {
    name: 'Communities',
    description:
      'Community groups, faith-based organisations, market associations, and cooperatives that open doors and mobilise members.',
  },
] as const

export default async function PartnerPage() {
  const siteSettings = await getSiteSettings()

  const email = siteSettings?.contact?.email
  const phone = siteSettings?.contact?.phone
  const whatsapp = siteSettings?.socialLinks?.whatsapp ?? phone

  return (
    <PageShell title="Partner With Us" breadcrumbs={generateBreadcrumbs('/partner')}>
      <Container width="prose">
        <div className="space-y-12">
          {/* 1. Intro */}
          <div className="rounded-xl border border-ink-100 bg-paper-100 p-6">
            <p className="text-ink-700">
              NHECOF partners with organisations and communities to bring reliable nutrition and
              preventive health education to more Nigerians. If your work overlaps with ours, we
              would love to explore how we can collaborate.
            </p>
          </div>

          {/* 2. Types of partners */}
          <section aria-labelledby="partner-types" className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900" id="partner-types">
              Types of partners
            </h2>
            <ul className="divide-y divide-ink-100 border-y border-ink-100">
              {PARTNER_TYPES.map((type) => (
                <li key={type.name} className="grid gap-1 py-4 sm:grid-cols-[9rem_1fr] sm:gap-6">
                  <h3 className="font-display text-lg font-semibold text-ink-900">{type.name}</h3>
                  <p className="text-ink-600">{type.description}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* 3. Benefits of partnership */}
          <section aria-labelledby="partner-benefits" className="space-y-3">
            <h2 className="font-display text-2xl font-semibold text-ink-900" id="partner-benefits">
              Benefits of partnership
            </h2>
            <div className="rounded-xl border border-ink-100 bg-paper-100 p-6">
              <p className="text-ink-700">
                Partners gain access to credible, professionally reviewed content; co-branded
                programmes and materials; NHECOF's network of qualified health professionals; and a
                measurable path to community impact.
              </p>
            </div>
          </section>

          {/* 4. Form slot */}
          <section aria-labelledby="partner-form" className="space-y-4">
            <h2 className="font-display text-2xl font-semibold text-ink-900" id="partner-form">
              Start the conversation
            </h2>
            <PartnershipForm />
          </section>

          {/* 5. Alternative contact */}
          {(phone || whatsapp) && (
            <section aria-labelledby="alternative-contact" className="space-y-3">
              <h2
                className="font-display text-2xl font-semibold text-ink-900"
                id="alternative-contact"
              >
                Alternative contact
              </h2>
              <ul className="space-y-2 text-ink-600">
                {phone && (
                  <li>
                    Call or text us on{' '}
                    <a
                      href={`tel:${phone.replace(/[^+0-9]/g, '')}`}
                      className="text-leaf-700 underline underline-offset-2 hover:text-leaf-800"
                    >
                      {phone}
                    </a>
                  </li>
                )}
                {whatsapp && (
                  <li>
                    Prefer instant messaging?{' '}
                    <a
                      href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-leaf-700 underline underline-offset-2 hover:text-leaf-800"
                    >
                      Chat with us on WhatsApp
                    </a>
                  </li>
                )}
                {email && (
                  <li>
                    Or email{' '}
                    <a
                      href={`mailto:${email}`}
                      className="text-leaf-700 underline underline-offset-2 hover:text-leaf-800"
                    >
                      {email}
                    </a>
                  </li>
                )}
              </ul>
            </section>
          )}

          {/* 6. Response time */}
          <Callout variant="info">
            <p className="text-info-dark">We typically respond within 2-3 business days.</p>
          </Callout>
        </div>
      </Container>
    </PageShell>
  )
}
