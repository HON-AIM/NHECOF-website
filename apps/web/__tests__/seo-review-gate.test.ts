import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { getArticleBySlug, getApprovedArticles, getFoodProfileBySlug } from '../src/features/nutrition/queries'
import { getSitemap } from '../src/lib/seo/sitemap'
import { getSiteUrl } from '../src/lib/seo/url'
import { fixtureArticles } from '../src/lib/content/fixtures'

const base = getSiteUrl()
const DRAFT_SLUG = 'unreviewed-hypertension-draft'

/**
 * Acceptance criterion: an unreviewed article URL must 404 and must be absent
 * from the sitemap. The page calls notFound() whenever its query returns null,
 * so "query returns null" is what produces the 404 status.
 */
describe('unreviewed content is not publicly reachable', () => {
  it('the dataset actually contains an unreviewed draft to guard against', () => {
    const draft = fixtureArticles().find((a) => a.slug.current === DRAFT_SLUG)
    expect(draft, 'a draft fixture is required for this test to be meaningful').toBeDefined()
    expect(draft?.reviewStatus).toBe('draft')
  })

  it('getArticleBySlug returns null for an unreviewed article, forcing a 404', async () => {
    const article = await getArticleBySlug(DRAFT_SLUG)
    expect(article).toBeNull()
  })

  it('an unknown slug also returns null so the route 404s rather than erroring', async () => {
    expect(await getArticleBySlug('no-such-article-xyz')).toBeNull()
  })

  it('never lists an unreviewed article in the published archive', async () => {
    const { articles } = await getApprovedArticles(undefined, undefined, undefined, 1, 1000)
    expect(articles.every((a) => a.reviewStatus === 'approved')).toBe(true)
    expect(articles.map((a) => a.slug.current)).not.toContain(DRAFT_SLUG)
  })

  it('is absent from the generated sitemap', async () => {
    const urls = (await getSitemap()).map((entry) => entry.url)
    expect(urls).not.toContain(`${base}/nutrition/articles/${DRAFT_SLUG}`)
  })

  it('does not make the draft discoverable through the food-profile route', async () => {
    expect(await getFoodProfileBySlug(DRAFT_SLUG)).toBeNull()
  })
})

describe('approved content stays reachable', () => {
  it('resolves an approved article and lists it in the sitemap', async () => {
    const article = await getArticleBySlug('balanced-nigerian-plate')
    expect(article).not.toBeNull()
    const urls = (await getSitemap()).map((entry) => entry.url)
    expect(urls).toContain(`${base}/nutrition/articles/balanced-nigerian-plate`)
  })
})

/**
 * Structural guard for a bug that silently broke every 404 in the app.
 *
 * A `loading.tsx` in a directory (or any ancestor) that wraps a dynamic route
 * opens a Suspense boundary. Next.js then flushes the response head as 200
 * before the page component resolves, so a `notFound()` thrown afterwards can
 * no longer change the status: the 404 UI renders inside a 200 response.
 * Verified in production build — with the root loading.tsx present every
 * missing and unreviewed URL answered 200; with it removed they answer 404.
 */
describe('no streaming loading boundary above dynamic routes', () => {
  const appDir = resolve(__dirname, '..', 'src', 'app')

  function findDirWithSegment(dir: string, segment: string): string | null {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const child = join(dir, entry.name)
      if (entry.name === segment) return child
      const found = findDirWithSegment(child, segment)
      if (found) return found
    }
    return null
  }

  it('finds the dynamic article route (test setup sanity check)', () => {
    expect(findDirWithSegment(appDir, '[slug]')).not.toBeNull()
  })

  it('has no loading.tsx in the app root or in any ancestor of a dynamic route', () => {
    const dynamicRoutes = findAllDirWithSegment(appDir, '[slug]')
    expect(dynamicRoutes.length).toBeGreaterThan(0)

    for (const routeDir of dynamicRoutes) {
      let current = routeDir
      while (true) {
        expect(
          existsSync(join(current, 'loading.tsx')),
          `loading.tsx in ${relative(appDir, current) || 'src/app'} streams the response head as 200, ` +
            `which prevents the dynamic route ${relative(appDir, routeDir)} from ever returning a real 404`,
        ).toBe(false)

        if (current === appDir) break
        const parent = resolve(current, '..')
        if (parent === current) break
        current = parent
      }
    }
  })

  it('has no loading.tsx in the app root at all', () => {
    expect(existsSync(join(appDir, 'loading.tsx'))).toBe(false)
  })
})

function findAllDirWithSegment(dir: string, segment: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (entry.name === 'node_modules') continue
    const child = join(dir, entry.name)
    if (entry.name === segment) acc.push(child)
    findAllDirWithSegment(child, segment, acc)
  }
  return acc
}
