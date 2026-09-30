import { ogCard } from '@/lib/seo/ogCard'

export const runtime = 'nodejs'

/**
 * Static branded Open Graph fallback used by every public page that has
 * neither content image nor SEO image (plan §12.3).
 */
export async function GET() {
  return ogCard({
    eyebrow: 'Nutrition for life',
    title: 'Reliable nutrition knowledge for every Nigerian community',
    note: 'NutriHealth Education and Community Outreach Foundation',
  })
}