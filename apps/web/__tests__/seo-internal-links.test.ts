import { describe, it, expect } from 'vitest'
import {
  CONTENT_ROUTES,
  CONTENT_TYPE_LABELS,
  contentPath,
  relatedContentHref,
  relatedContentLabel,
  personProfileHref,
  FOUNDER_PROFILE_ANCHOR,
} from '../src/lib/seo/internalLinks'
import { generateBreadcrumbs } from '../src/lib/generateBreadcrumbs'
import { STATIC_SITEMAP_ROUTES } from '../src/lib/seo/sitemap'
import { STATIC_REDIRECTS } from '../src/lib/seo/redirects'

describe('contentPath', () => {
  it('maps each content type onto the real App Router hierarchy', () => {
    expect(contentPath('article', 'iron')).toBe('/nutrition/articles/iron')
    expect(contentPath('foodProfile', 'garri')).toBe('/nutrition/foods/garri')
    expect(contentPath('outreach', 'lafia')).toBe('/outreaches/lafia')
    expect(contentPath('resource', 'plate-guide')).toBe('/resources/plate-guide')
    expect(contentPath('program', 'school-outreach')).toBe('/what-we-do/school-outreach')
  })

  it('accepts both a bare slug string and a Sanity slug object', () => {
    expect(contentPath('article', 'iron')).toBe(contentPath('article', { current: 'iron' }))
  })

  it('returns null for unknown types, missing slugs and empty slugs', () => {
    expect(contentPath('person', 'ada')).toBeNull()
    expect(contentPath('article', '')).toBeNull()
    expect(contentPath('article', { current: '' })).toBeNull()
    expect(contentPath(null, 'iron')).toBeNull()
    expect(contentPath('article', null)).toBeNull()
  })

  it('never produces a /people path, which does not exist in version one', () => {
    for (const type of Object.keys(CONTENT_ROUTES)) {
      const path = contentPath(type, 'someone')
      expect(path).not.toContain('/people/')
    }
  })
})

describe('relatedContentHref', () => {
  it('resolves editor-picked and fallback related items', () => {
    expect(relatedContentHref({ _type: 'article', slug: { current: 'iron' } })).toBe(
      '/nutrition/articles/iron',
    )
    expect(relatedContentHref({ _type: 'foodProfile', slug: { current: 'uguu' } })).toBe(
      '/nutrition/foods/uguu',
    )
  })

  it('returns null rather than a broken link for an unroutable item', () => {
    expect(relatedContentHref({ _type: 'mystery', slug: 'x' })).toBeNull()
    expect(relatedContentHref({ _type: 'article', slug: '' })).toBeNull()
  })
})

describe('relatedContentLabel', () => {
  it('labels each routable content type', () => {
    expect(relatedContentLabel({ _type: 'article' })).toBe('Article')
    expect(relatedContentLabel({ _type: 'foodProfile' })).toBe('Food Profile')
    expect(relatedContentLabel({ _type: 'outreach' })).toBe('Outreach')
    expect(relatedContentLabel({ _type: 'resource' })).toBe('Resource')
  })

  it('returns null for unknown types so no card renders a wrong label', () => {
    expect(relatedContentLabel({ _type: 'mystery' })).toBeNull()
  })

  it('exposes a label for every type that has a route', () => {
    for (const type of Object.keys(CONTENT_ROUTES)) {
      expect(CONTENT_TYPE_LABELS[type as keyof typeof CONTENT_TYPE_LABELS]).toBeTruthy()
    }
  })
})

describe('personProfileHref', () => {
  it('returns the About founder anchor for the founder', () => {
    expect(personProfileHref({ isFounder: true })).toBe(FOUNDER_PROFILE_ANCHOR)
  })

  it('returns undefined for everyone without a public profile', () => {
    expect(personProfileHref({ isFounder: false, slug: 'ada-obi' })).toBeUndefined()
    expect(personProfileHref({})).toBeUndefined()
    expect(personProfileHref(null)).toBeUndefined()
  })

  it('only ever returns an in-site path, never a 404 route', () => {
    for (const person of [{ isFounder: true }, { isFounder: false }, {}]) {
      const href = personProfileHref(person)
      if (href) expect(href.startsWith('/about#')).toBe(true)
    }
  })
})

describe('breadcrumb structure mirrors the URL hierarchy', () => {
  it('rebuilds the parent path for every ancestor and drops it on the leaf', () => {
    const crumbs = generateBreadcrumbs('/nutrition/articles/iron')
    expect(crumbs.map((c) => c.href)).toEqual(['/', '/nutrition', '/nutrition/articles', undefined])
    expect(crumbs.map((c) => c.label)).toEqual([
      'Home',
      'Nutrition Hub',
      'Articles',
      'Iron',
    ])
  })

  it('produces a hierarchy consistent with contentPath for every content type', () => {
    for (const type of Object.keys(CONTENT_ROUTES)) {
      const path = contentPath(type, 'sample-slug')!
      const crumbs = generateBreadcrumbs(path, { 'sample-slug': 'Sample' })
      // Every crumb except the last must be a real, clickable ancestor URL.
      for (const crumb of crumbs.slice(0, -1)) {
        expect(crumb.href).toBeTruthy()
        expect(path.startsWith(crumb.href!)).toBe(true)
      }
      expect(crumbs[crumbs.length - 1].href).toBeUndefined()
    }
  })

  it('returns an empty trail for the homepage', () => {
    expect(generateBreadcrumbs('/')).toEqual([])
  })
})

describe('static routes and redirects stay consistent with the URL hierarchy', () => {
  it('maps every Sanity _type in the Studio slug guard to a real route prefix', () => {
    // The Studio guard is keyed by _type; these must match CONTENT_ROUTES.
    expect(Object.keys(CONTENT_ROUTES).sort()).toEqual(
      ['article', 'foodProfile', 'outreach', 'program', 'resource'].sort(),
    )
  })

  it('keeps every static redirect internal and a 301', () => {
    for (const redirect of STATIC_REDIRECTS) {
      expect(redirect.statusCode).toBe(301)
      expect(redirect.source.startsWith('/')).toBe(true)
      expect(redirect.destination.startsWith('/')).toBe(true)
      expect(redirect.source).not.toBe(redirect.destination)
    }
  })

  it('does not list internal-only routes in the sitemap', () => {
    for (const route of STATIC_SITEMAP_ROUTES) {
      expect(route.path).not.toContain('/styleguide')
      expect(route.path).not.toContain('/api/')
      expect(route.path).not.toContain('/preview')
    }
  })
})
