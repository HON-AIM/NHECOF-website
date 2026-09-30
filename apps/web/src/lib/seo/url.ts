/**
 * Canonical URL helpers (plan §12).
 *
 * All absolute URLs used in metadata, Open Graph and structured data resolve
 * through these functions so the site URL is defined in exactly one place.
 */

const DEFAULT_SITE_URL = 'http://localhost:3000'

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '')
}

/** Absolute URL for a path (or the bare site URL when path is empty). */
export function absoluteUrl(path?: string): string {
  const base = getSiteUrl()
  if (!path) return base
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}