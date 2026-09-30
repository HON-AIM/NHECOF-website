import type { BreadcrumbItem } from '@/components/ui/Breadcrumbs'

/* ────────────────────────────────────────────────────────────────────────────
   Segment-to-label mapping for nested routes.
   Extend this map as new routes are added.
   ──────────────────────────────────────────────────────────────────────────── */

const SEGMENT_LABELS: Record<string, string> = {
  about: 'About',
  'what-we-do': 'What We Do',
  nutrition: 'Nutrition Hub',
  basics: 'Nutrition Basics',
  'food-groups': 'Food Groups & Composition',
  'life-stages': 'Life Stages',
  conditions: 'Health Conditions',
  'healthy-living': 'Healthy Living',
  'food-safety': 'Food Safety',
  'myths-facts': 'Myths & Facts',
  impact: 'Our Impact',
  outreaches: 'Outreaches',
  'get-involved': 'Get Involved',
  partner: 'Partner With Us',
  volunteer: 'Volunteer',
  donate: 'Donate',
  'request-an-outreach': 'Request an Outreach',
  'editorial-policy': 'Editorial Policy',
  'medical-disclaimer': 'Medical Disclaimer',
  privacy: 'Privacy Policy',
  policies: 'Policies',
  editorial: 'Editorial Policy',
  contact: 'Contact Us',
  articles: 'Articles',
  'food-profiles': 'Food Profiles',
  resources: 'Resources',
  programmes: 'Programmes',
}

/**
 * Generate breadcrumb items from a pathname.
 *
 * @param pathname — e.g. "/nutrition/life-stages"
 * @param overrides — optional segment-to-label overrides (e.g. dynamic slugs)
 * @returns Array of BreadcrumbItem with href for all but the last
 */
export function generateBreadcrumbs(
  pathname: string,
  overrides?: Record<string, string>,
): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return []

  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/' }]

  let accumulatedPath = ''

  for (const segment of segments) {
    accumulatedPath += `/${segment}`

    const label =
      overrides?.[segment] ??
      SEGMENT_LABELS[segment] ??
      decodeURIComponent(segment)
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase())

    items.push({ label, href: accumulatedPath })
  }

  // Remove href from last item (current page)
  const last = items[items.length - 1]
  if (last) last.href = undefined

  return items
}
