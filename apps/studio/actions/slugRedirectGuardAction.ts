import { createClient } from '@sanity/client'
import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

/**
 * Slug change redirect guard (plan §10).
 *
 * When an already-published document's slug is renamed in a draft, this action
 * lets editors auto-create a permanent `redirect` document (old slug → new
 * slug) so existing links and search engines keep working. It is a separate
 * menu action and does not replace the publish action.
 */

/**
 * Route prefix per Sanity `_type` so redirects target the real public URL.
 *
 * Keys must match the schema names exactly — an unmatched type silently gets
 * no redirect action, so a typo here loses old links without any error.
 * `person` is intentionally absent: version one has no person page (the founder
 * lives inside `/about`), so there is no public URL to redirect.
 */
const TYPE_ROUTES: Record<string, string> = {
  article: '/nutrition/articles',
  foodProfile: '/nutrition/foods',
  outreach: '/outreaches',
  resource: '/resources',
  program: '/what-we-do',
}

function slugCurrent(doc: unknown): string | undefined {
  const slug = (doc as Record<string, unknown> | null | undefined)?.slug as
    { current?: string } | undefined
  return typeof slug?.current === 'string' && slug.current ? slug.current : undefined
}

export const slugRedirectGuardAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { type, draft, published } = props

  const basePath = TYPE_ROUTES[type]
  if (!basePath) return null

  if (!draft || !published) return null

  const oldSlug = slugCurrent(published)
  const newSlug = slugCurrent(draft)
  if (!oldSlug || !newSlug || oldSlug === newSlug) return null

  const token = process.env.SANITY_STUDIO_WRITE_TOKEN
  if (!token) return null

  const from = `${basePath}/${oldSlug}`
  const to = `${basePath}/${newSlug}`

  return {
    label: 'Create redirect for renamed slug',
    icon: () => null,
    title: `Create a permanent redirect from "${from}" to "${to}" so existing links keep working after publishing.`,
    onHandle: async () => {
      const client = createClient({
        projectId:
          process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '',
        dataset:
          process.env.SANITY_STUDIO_DATASET ||
          process.env.NEXT_PUBLIC_SANITY_DATASET ||
          'production',
        apiVersion: '2023-01-01',
        token,
        useCdn: false,
      })

      await client.create({
        _type: 'redirect',
        from,
        to,
        statusCode: 301,
        note: `Auto-created by Studio: ${type} slug "${oldSlug}" renamed to "${newSlug}". Keep until search engines re-index (at least 2-3 months).`,
      })
    },
  }
}
