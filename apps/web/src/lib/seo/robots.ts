import type { MetadataRoute } from 'next'
import { getSiteUrl } from './url'

/**
 * Routes that must never be crawled or indexed. Includes the API surface, the
 * design styleguide and any draft/preview paths (plan §12.1).
 */
export const CRAWL_DISALLOWED_PATHS = ['/api/', '/styleguide', '/preview', '/draft']

export interface RobotsOptions {
  /** True when the site is publicly launched (NEXT_PUBLIC_IS_LIVE). */
  isLive: boolean
  baseUrl?: string
}

/**
 * Build robots.txt output. Before launch the whole site is no-indexed; after
 * launch only internal, non-content paths are disallowed.
 */
export function buildRobots(options: RobotsOptions): MetadataRoute.Robots {
  const { isLive } = options
  const baseUrl = options.baseUrl ?? getSiteUrl()

  if (!isLive) {
    return {
      rules: [{ userAgent: '*', disallow: '/' }],
    }
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: CRAWL_DISALLOWED_PATHS,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}

/**
 * Resolve whether this deployment may be indexed.
 *
 * Three independent gates, all of which must pass. Any single one failing keeps
 * the whole site out of search results, which is the behaviour we want:
 *
 *  1. `NEXT_PUBLIC_IS_LIVE` — the deliberate launch flag. This is the "flip the
 *     noindex launch flag" step in the launch checklist.
 *  2. `VERCEL_ENV === 'production'` — structural safety net. A preview
 *     deployment physically cannot become indexable, even if someone
 *     accidentally sets the launch flag on the wrong environment. This is the
 *     single most valuable guard here, because preview URLs are shared and
 *     public while still being unlaunched.
 *  3. Not a Vercel branch build — a branch deployment inherits the preview
 *     environment's variables, but treating it as non-production keeps the rule
 *     obvious.
 *
 * `DISABLE_INDEXING` is an emergency override for "we are live but must be
 * de-indexed right now, without a redeploy".
 */
export function isSiteLive(): boolean {
  if (process.env.DISABLE_INDEXING === 'true') return false
  if (process.env.NEXT_PUBLIC_IS_LIVE !== 'true') return false

  const vercelEnv = process.env.VERCEL_ENV
  if (vercelEnv && vercelEnv !== 'production') return false

  // On a non-Vercel host (local dev, self-hosted) there is no VERCEL_ENV. The
  // explicit launch flag is then the only signal, which keeps local testing of
  // the robots output possible.
  return true
}