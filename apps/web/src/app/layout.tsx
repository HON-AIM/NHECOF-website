import type { Metadata } from 'next'
import { Fraunces, Figtree } from 'next/font/google'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { DraftModeBanner } from '@/components/layout/DraftModeBanner'
import { OrganizationJsonLd } from '@/lib/seo/jsonLd'
import { absoluteUrl } from '@/lib/seo/url'
import { getSiteSettings } from '@/lib/sanity/queries'
import { isDraftModeEnabled } from '@/lib/sanity/fetch'
import { AnalyticsScript } from '@/lib/analytics/AnalyticsScript'
import { SentryProvider } from '@/lib/monitoring/SentryProvider'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
})

const figtree = Figtree({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-figtree',
  display: 'swap',
})

const BASE_METADATA: Metadata = {
  title: {
    default: 'NHECOF — NutriHealth Education and Community Outreach Foundation',
    template: '%s | NHECOF',
  },
  description:
    'Making reliable nutrition knowledge and preventive health support accessible to Nigerian communities.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  ),
  openGraph: {
    locale: 'en_NG',
    siteName: 'NutriHealth Education and Community Outreach Foundation',
  },
  twitter: {
    card: 'summary_large_image',
  },
  // A file in /public is served, but browsers only auto-request /favicon.ico —
  // an SVG favicon needs an explicit declaration or it is never requested.
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
}

/**
 * Root metadata, with an indexing guard for previews.
 *
 * `robots.txt` already keeps preview *deployments* out of the index via
 * `isSiteLive()`. This handles the other case: an editor enabling draft mode on
 * the production domain, where a draft URL is served under the real hostname.
 * A `noindex` meta tag is emitted for that request only, so an unreviewed
 * draft cannot be indexed by following a preview link.
 */
export async function generateMetadata(): Promise<Metadata> {
  if (!(await isDraftModeEnabled())) return BASE_METADATA

  return {
    ...BASE_METADATA,
    robots: { index: false, follow: false, nocache: true },
  }
}

function socialLinks(settings: {
  socialLinks?: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    youtube?: string
    whatsapp?: string
  }
}): string[] {
  const links = settings.socialLinks ?? {}
  return [links.facebook, links.twitter, links.instagram, links.linkedin, links.youtube, links.whatsapp]
    .filter((url): url is string => Boolean(url))
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()

  return (
    <html lang="en-NG" className={`${fraunces.variable} ${figtree.variable}`}>
      <body>
        <OrganizationJsonLd
          name={settings?.organisationName || 'NHECOF — NutriHealth Education and Community Outreach Foundation'}
          url={absoluteUrl('/')}
          logoUrl={absoluteUrl('/nhecof-logo.png')}
          sameAs={settings ? socialLinks(settings) : undefined}
        />
        <a
          href="#main-content"
          className="skip-to-content sr-only"
        >
          Skip to content
        </a>
        <DraftModeBanner />
        <Header />
        <main id="main-content" role="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <AnalyticsScript />
        <SentryProvider />
      </body>
    </html>
  )
}