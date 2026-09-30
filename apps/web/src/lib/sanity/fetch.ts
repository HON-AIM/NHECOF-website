/**
 * The single fetch chokepoint for Sanity content.
 *
 * Every query in the app goes through `sanityFetch` so that two guarantees
 * hold everywhere:
 *
 *  1. **Caching is explicit.** Each call declares a cache tag from
 *     `lib/sanity/tags.ts`. Without this, `revalidateTag()` in the webhook has
 *     nothing to invalidate and an editor's publish would stay invisible until
 *     the time-based `revalidate` window expired.
 *  2. **Drafts are opt-in and server-only.** When draft mode is enabled the
 *     helper switches to the preview client, which requires
 *     `SANITY_API_READ_TOKEN` (a server-only variable, never `NEXT_PUBLIC_`).
 *     Public visitors can never reach draft content because the token is not
 *     shipped to the browser and the draft cookie can only be set through a
 *     secret-gated route.
 */

import { draftMode } from 'next/headers'
import { client, previewClient } from './client'
import { CACHE_TAGS, type CacheTag } from './tags'

export interface SanityFetchOptions {
  /** Cache tags to register on the Next.js data-cache entry. */
  tags?: CacheTag[]
  /**
   * Time-based revalidation in seconds. Acts as a safety net behind the
   * webhook, so a missed webhook still self-heals.
   */
  revalidate?: number
  /**
   * Force draft reads on or off. Normally left undefined so draft mode decides.
   * Set `false` for content that must never show an unpublished revision (for
   * example anything that feeds the sitemap or robots output).
   */
  preview?: boolean
  /** Force a fetch even when a cached copy exists (used by draft mode). */
  noStore?: boolean
}

export type QueryParams = Record<string, unknown>

/** Default window when a caller does not specify one. */
const DEFAULT_REVALIDATE = 3600

/**
 * Read draft mode without exploding outside a request scope.
 *
 * `draftMode()` throws in unit tests, in `next.config.ts` (which runs outside
 * the Next runtime) and in plain node scripts. In every one of those contexts
 * "draft mode is off" is the correct answer, so degrade instead of failing.
 */
export async function isDraftModeEnabled(): Promise<boolean> {
  try {
    const store = await draftMode()
    return store.isEnabled
  } catch {
    return false
  }
}

export async function sanityFetch<T>(
  query: string,
  params?: QueryParams,
  options: SanityFetchOptions = {},
): Promise<T> {
  const { tags = [CACHE_TAGS.sitemap], revalidate = DEFAULT_REVALIDATE, preview, noStore } = options

  const draftEnabled = preview ?? (await isDraftModeEnabled())

  if (draftEnabled) {
    // Draft reads must never be cached, and must never carry a tag — a stale
    // draft could otherwise be served to the next visitor.
    return previewClient.fetch<T>(query, params ?? {}, { cache: 'no-store' })
  }

  return client.fetch<T>(query, params ?? {}, {
    next: noStore
      ? { revalidate: 0 }
      : { tags: [...tags], revalidate },
  })
}
