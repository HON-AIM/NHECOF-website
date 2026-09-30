import { describe, it, expect } from 'vitest'
import type { Metadata } from 'next'
import { buildMetadata } from '../src/lib/seo/buildMetadata'
import { getSiteUrl } from '../src/lib/seo/url'
import type { SeoMeta } from '../src/features/home/queries'

const base = getSiteUrl()

function firstImageUrl(meta: Metadata): string | undefined {
  const images = meta.openGraph?.images
  if (!images) return undefined
  const first = Array.isArray(images) ? images[0] : undefined
  if (typeof first === 'string') return first
  if (first instanceof URL) return first.href
  const url = first?.url
  return typeof url === 'string' ? url : url?.href
}

function robotsOf(meta: Metadata): { index?: boolean; follow?: boolean } {
  return typeof meta.robots === 'object' ? (meta.robots as { index?: boolean; follow?: boolean }) : {}
}

describe('buildMetadata', () => {
  it('returns a unique title, description and canonical URL', () => {
    const meta = buildMetadata({
      path: '/about',
      fallbackTitle: 'About NHECOF',
      fallbackDescription: 'Our mission and story.',
    })
    expect(meta.title).toBe('About NHECOF')
    expect(meta.description).toBe('Our mission and story.')
    expect(meta.alternates?.canonical).toBe(`${base}/about`)
  })

  it('lets the document seo object override the fallbacks', () => {
    const seo: SeoMeta = {
      title: 'SEO title override',
      description: 'SEO description override',
    }
    const meta = buildMetadata({
      path: '/nutrition/articles/iron',
      fallbackTitle: 'Fallback title',
      fallbackDescription: 'Fallback description',
      seo,
    })
    expect(meta.title).toBe('SEO title override')
    expect(meta.description).toBe('SEO description override')
  })

  it('emits the organisational site name and en_NG locale in open graph', () => {
    const meta = buildMetadata({ path: '/', fallbackTitle: 'Home' })
    expect(meta.openGraph?.siteName).toBe(
      'NutriHealth Education and Community Outreach Foundation',
    )
    expect(meta.openGraph?.locale).toBe('en_NG')
    expect(meta.openGraph?.url).toBe(`${base}/`)
  })

  it('uses an explicit ogImage URL when provided', () => {
    const meta = buildMetadata({
      path: '/nutrition/articles/iron',
      fallbackTitle: 'Iron',
      ogImage: `${base}/api/og/article/iron`,
    })
    expect(firstImageUrl(meta)).toBe(`${base}/api/og/article/iron`)
  })

  it('falls back to the branded OG card for public pages without an image', () => {
    const meta = buildMetadata({ path: '/privacy', fallbackTitle: 'Privacy Policy' })
    expect(firstImageUrl(meta)).toBe(`${base}/api/og/brand`)
  })

  it('does not emit an OG image for noindex internal pages', () => {
    const meta = buildMetadata({
      path: '/styleguide',
      fallbackTitle: 'Styleguide',
      noindex: true,
    })
    expect(firstImageUrl(meta)).toBeUndefined()
  })

  it('enables indexing by default and disables it for noindex pages', () => {
    const indexable = buildMetadata({ path: '/about', fallbackTitle: 'About' })
    expect(robotsOf(indexable).index).toBe(true)

    const internal = buildMetadata({
      path: '/styleguide',
      fallbackTitle: 'Styleguide',
      noindex: true,
    })
    expect(robotsOf(internal).index).toBe(false)
    expect(robotsOf(internal).follow).toBe(false)
  })

  it('supports absolute titles that bypass the layout template', () => {
    const meta = buildMetadata({
      path: '/',
      fallbackTitle: 'NHECOF',
      titleAbsolute: true,
    })
    expect(meta.title).toEqual({ absolute: 'NHECOF' })
    expect(meta.openGraph?.title).toBe('NHECOF')
  })

  it('emits summary_large_image on twitter when an OG image exists', () => {
    const meta = buildMetadata({
      path: '/about',
      fallbackTitle: 'About',
      ogImage: `${base}/api/og/brand`,
    })
    const twitter = meta.twitter as { card?: string; title?: string } | undefined
    expect(twitter?.card).toBe('summary_large_image')
    expect(twitter?.title).toBe('About')
  })
})