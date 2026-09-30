import NextLink from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/cn'

/* ────────────────────────────────────────────────────────────────────────────
   Types — loose so the footer renders gracefully with partial data
   ──────────────────────────────────────────────────────────────────────────── */

interface SocialLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
  whatsapp?: string
}

interface Contact {
  email?: string
  phone?: string
  address?: string
}

interface FooterProps {
  organisationName?: string
  tagline?: string
  socialLinks?: SocialLinks
  contact?: Contact
}

/* ────────────────────────────────────────────────────────────────────────────
   Social icon helpers
   ──────────────────────────────────────────────────────────────────────────── */

function SocialIcon({ platform }: { platform: string }) {
  const paths: Record<string, React.ReactNode> = {
    facebook: (
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    ),
    twitter: (
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    ),
    instagram: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="17.5" cy="6.5" r="1.5" />
      </>
    ),
    linkedin: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
    youtube: (
      <>
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
        <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" />
      </>
    ),
    whatsapp: (
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    ),
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5"
    >
      {paths[platform] ?? null}
    </svg>
  )
}

const SOCIAL_PLATFORMS: Array<{ key: keyof SocialLinks; label: string }> = [
  { key: 'facebook', label: 'Facebook' },
  { key: 'twitter', label: 'X / Twitter' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'youtube', label: 'YouTube' },
]

const POLICY_LINKS = [
  { label: 'Editorial Policy', href: '/editorial-policy' },
  { label: 'Medical Disclaimer', href: '/medical-disclaimer' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Contact Us', href: '/contact' },
] as const

const EXPLORE_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About NHECOF', href: '/about' },
  { label: 'What We Do', href: '/what-we-do' },
  { label: 'Nutrition Hub', href: '/nutrition' },
  { label: 'Our Impact', href: '/impact' },
] as const

const GET_INVOLVED_LINKS = [
  { label: 'Request an Outreach', href: '/request-an-outreach' },
  { label: 'Partner With Us', href: '/partner' },
  { label: 'Volunteer', href: '/get-involved#volunteer' },
  { label: 'Support Our Work', href: '/get-involved#future-support' },
] as const

/* ────────────────────────────────────────────────────────────────────────────
   Footer component
   ──────────────────────────────────────────────────────────────────────────── */

export function Footer({
  organisationName,
  tagline,
  socialLinks,
  contact,
}: FooterProps) {
  const displayName = organisationName || 'NHECOF'
  const whatsAppNumber = socialLinks?.whatsapp
  const hasSocialLinks = socialLinks && SOCIAL_PLATFORMS.some((p) => socialLinks[p.key])

  return (
    <footer role="contentinfo" className="border-t border-paper-200 bg-paper-100">
      <div className="mx-auto max-w-[var(--width-broad)] px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: About */}
          <div>
            <NextLink
              href="/"
              className="flex h-9 w-fit items-center"
              aria-label={`${displayName} — Home`}
            >
              <Image
                src="/nhecof-logo.png"
                alt=""
                width={600}
                height={171}
                sizes="135px"
                className="h-full w-auto"
              />
            </NextLink>
            {tagline && (
              <p className="mt-2 text-sm text-ink-600">{tagline}</p>
            )}
            <p className="mt-3 text-xs leading-relaxed text-ink-500">
              Committed to making reliable nutrition knowledge and preventive health support
              accessible to Nigerian communities.
            </p>
            {contact?.address && (
              <address className="mt-3 not-italic text-xs text-ink-500">
                {contact.address}
              </address>
            )}
          </div>

          {/* Column 2: Explore */}
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Explore</h2>
            <ul className="mt-3 space-y-2">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <NextLink
                    href={link.href}
                    className={cn(
                      'text-sm text-ink-600 transition-colors hover:text-leaf-700',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
                    )}
                  >
                    {link.label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Get involved */}
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Get involved</h2>
            <ul className="mt-3 space-y-2">
              {GET_INVOLVED_LINKS.map((link) => (
                <li key={link.href}>
                  <NextLink
                    href={link.href}
                    className={cn(
                      'text-sm text-ink-600 transition-colors hover:text-leaf-700',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
                    )}
                  >
                    {link.label}
                  </NextLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Policies */}
          <div>
            <h2 className="text-sm font-semibold text-ink-900">Policies</h2>
            <ul className="mt-3 space-y-2">
              {POLICY_LINKS.map((link) => (
                <li key={link.href}>
                  <NextLink
                    href={link.href}
                    className={cn(
                      'text-sm text-ink-600 transition-colors hover:text-leaf-700',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
                    )}
                  >
                    {link.label}
                  </NextLink>
                </li>
              ))}
            </ul>

            {/* Social links */}
            {hasSocialLinks && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold text-ink-500">Follow us</p>
                <div className="flex items-center gap-3">
                  {SOCIAL_PLATFORMS.map(({ key, label }) => {
                    const url = socialLinks?.[key]
                    if (!url) return null
                    return (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                      className={cn(
                        // `inline-flex min-h-6 items-center` keeps footer nav
                        // targets at the WCAG 2.2 24 px minimum (2.5.8).
                        'inline-flex min-h-6 items-center text-sm text-ink-600 transition-colors hover:text-leaf-700',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
                      )}
                      >
                        <SocialIcon platform={key} />
                      </a>
                    )
                  })}
                </div>
              </div>
            )}

            {/* WhatsApp click-to-chat */}
            {whatsAppNumber && (
              <a
                href={`https://wa.me/${whatsAppNumber.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'mt-3 inline-flex items-center gap-2 rounded-lg border border-ink-100 bg-white px-3 py-2 text-sm text-ink-700 transition-colors hover:bg-leaf-50 hover:text-leaf-800',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
                )}
              >
                <SocialIcon platform="whatsapp" />
                Chat on WhatsApp
              </a>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-ink-100 pt-6">
          <p className="text-xs text-ink-400">
            &copy; {new Date().getFullYear()} {displayName} — NutriHealth Education
            and Community Outreach Foundation
          </p>
          <p className="mt-2 text-xs leading-relaxed text-ink-400">
            Educational content only. Not a substitute for professional medical
            care.
          </p>
        </div>
      </div>
    </footer>
  )
}