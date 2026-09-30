/**
 * Site-wide constants used as SEO fallbacks (plan §12.3).
 *
 * These mirror the `siteSettings` document in Sanity. They are used whenever a
 * document carries no SEO override and no live `siteSettings` record exists
 * (e.g. fixture mode). Live `siteSettings` values win when present.
 */

export const SITE_DEFAULTS = {
  name: 'NHECOF',
  organisationName: 'NutriHealth Education and Community Outreach Foundation',
  description:
    'Making reliable nutrition knowledge and preventive health support accessible to Nigerian communities.',
  locale: 'en_NG',
  ogWidth: 1200,
  ogHeight: 630,
} as const