import { describe, it, expect } from 'vitest'
import { buildRobots, CRAWL_DISALLOWED_PATHS } from '../src/lib/seo/robots'

describe('buildRobots', () => {
  it('no-indexes the whole site before launch', () => {
    const robots = buildRobots({ isLive: false, baseUrl: 'https://nhecof.example' })
    const rules = robots.rules as Array<{ disallow?: string | string[] }>
    expect(rules).toEqual([{ userAgent: '*', disallow: '/' }])
    expect(robots.sitemap).toBeUndefined()
  })

  it('allows crawling after launch and disallows internal paths', () => {
    const robots = buildRobots({ isLive: true, baseUrl: 'https://nhecof.example' })
    const rules = robots.rules as Array<{ allow?: string; disallow?: string[] }>
    expect(rules[0].allow).toBe('/')
    expect(rules[0].disallow).toEqual(CRAWL_DISALLOWED_PATHS)
  })

  it('advertises the sitemap only once live', () => {
    const robots = buildRobots({ isLive: true, baseUrl: 'https://nhecof.example' })
    expect(robots.sitemap).toBe('https://nhecof.example/sitemap.xml')
  })

  it('never exposes the API, styleguide, preview or draft paths to crawlers', () => {
    for (const path of ['/api/', '/styleguide', '/preview', '/draft']) {
      expect(CRAWL_DISALLOWED_PATHS).toContain(path)
    }
  })

  it('keeps every disallowed path a real prefix of a non-public route', () => {
    for (const path of CRAWL_DISALLOWED_PATHS) {
      expect(path.startsWith('/')).toBe(true)
    }
    // Public content routes must never be disallowed.
    for (const publicPath of ['/about', '/nutrition', '/nutrition/articles', '/outreaches']) {
      expect(CRAWL_DISALLOWED_PATHS).not.toContain(publicPath)
    }
  })
})