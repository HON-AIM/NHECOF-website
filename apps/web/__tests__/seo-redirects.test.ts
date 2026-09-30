import { describe, it, expect } from 'vitest'
import {
  STATIC_REDIRECTS,
  toNextRedirect,
  normalizeRedirectDocs,
  type RedirectDoc,
} from '../src/lib/seo/redirects'

describe('toNextRedirect', () => {
  it('maps a 301 document to a 301 redirect', () => {
    const redirect = toNextRedirect({ from: '/old', to: '/new', statusCode: 301 })
    expect(redirect).toEqual({
      source: '/old',
      destination: '/new',
      statusCode: 301,
    })
  })

  it('passes a 302 document through as a 302', () => {
    const redirect = toNextRedirect({ from: '/temp', to: '/now', statusCode: 302 })
    expect(redirect.statusCode).toBe(302)
  })

  it('defaults to a 301 when statusCode is missing', () => {
    expect(toNextRedirect({ from: '/a', to: '/b' }).statusCode).toBe(301)
  })

  it('never uses `permanent`, which would emit a 308 instead of the required 301', () => {
    const redirect = toNextRedirect({ from: '/old', to: '/new' }) as unknown as Record<string, unknown>
    expect(redirect).not.toHaveProperty('permanent')
    expect(redirect.statusCode).toBe(301)
  })
})

describe('STATIC_REDIRECTS', () => {
  it('keeps the legacy /policies paths pointing at the new policy pages', () => {
    const sources = STATIC_REDIRECTS.map((r) => r.source)
    expect(sources).toContain('/policies/editorial')
    expect(sources).toContain('/policies/privacy')
    expect(sources).toContain('/policies/medical-disclaimer')
    for (const redirect of STATIC_REDIRECTS) {
      expect(redirect.statusCode).toBe(301)
      expect(redirect.source).toMatch(/^\//)
      expect(redirect.destination).toMatch(/^\//)
    }
  })
})

describe('normalizeRedirectDocs', () => {
  it('adds a leading slash to bare paths and defaults the status code', () => {
    const docs: RedirectDoc[] = [{ from: 'old-path', to: 'new-path' }]
    expect(normalizeRedirectDocs(docs)).toEqual([
      { from: '/old-path', to: '/new-path', statusCode: 301 },
    ])
  })

  it('drops empty or self-referencing redirects', () => {
    const docs: RedirectDoc[] = [
      { from: '', to: '/new' },
      { from: '/new', to: '/new' },
      { from: '/a', to: '/b', statusCode: 301 },
    ]
    expect(normalizeRedirectDocs(docs)).toEqual([
      { from: '/a', to: '/b', statusCode: 301 },
    ])
  })
})