/**
 * Redirect resolution (plan §10 / §12.1).
 *
 * Static redirects are wired directly; `redirect` documents from Sanity are
 * fetched at build/revalidation time and applied as permanent (301) redirects.
 * The Studio guards slug changes with a matching warning (see the studio
 * `slugRedirectGuardAction`).
 */

export interface RedirectDoc {
  from: string
  to: string
  statusCode?: number
}

export interface NextRedirect {
  source: string
  destination: string
  /**
   * Next.js maps `permanent: true` to a 308, which preserves the request
   * method. The spec calls for 301s, so we emit an explicit `statusCode`
   * instead. `statusCode` and `permanent` are mutually exclusive in Next.js.
   */
  statusCode: number
}

export const STATIC_REDIRECTS: NextRedirect[] = [
  { source: '/policies/editorial', destination: '/editorial-policy', statusCode: 301 },
  { source: '/policies/medical-disclaimer', destination: '/medical-disclaimer', statusCode: 301 },
  { source: '/policies/privacy', destination: '/privacy', statusCode: 301 },
  { source: '/policies', destination: '/editorial-policy', statusCode: 301 },
]

/** Map a Sanity `redirect` document onto a Next.js redirect config entry. */
export function toNextRedirect(doc: RedirectDoc): NextRedirect {
  return {
    source: doc.from,
    destination: doc.to,
    statusCode: doc.statusCode ?? 301,
  }
}

function normalizePath(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''
  return trimmed.startsWith('/') ? trimmed : `/${trimmed}`
}

export function normalizeRedirectDocs(docs: RedirectDoc[]): RedirectDoc[] {
  return docs
    .map((doc) => ({
      from: normalizePath(doc.from),
      to: normalizePath(doc.to),
      statusCode: doc.statusCode ?? 301,
    }))
    .filter((doc) => doc.from && doc.to && doc.from !== doc.to)
}

/**
 * Fetch published `redirect` documents from Sanity. Returns an empty list when
 * Sanity is not configured or unreachable so local/build-time behaviour never
 * crashes. Called from `next.config.ts` at build time.
 */
export async function fetchSanityRedirectDocs(): Promise<RedirectDoc[]> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  if (!projectId || !dataset) return []

  try {
    const { createClient } = await import('@sanity/client')
    const client = createClient({
      projectId,
      dataset,
      apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-01-01',
      useCdn: false,
    })
    const docs = await client.fetch<RedirectDoc[]>(
      `*[_type == "redirect" && defined(from) && defined(to)]{ from, to, statusCode }`,
    )
    return normalizeRedirectDocs(docs)
  } catch {
    return []
  }
}