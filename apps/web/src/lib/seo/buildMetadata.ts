import type { Metadata } from 'next'
import type { SeoMeta, SanityImage } from '@/features/home/queries'
import {
  selectPublishableImages,
  type ConsentImage,
} from '@/features/impact/aggregate'
import { urlFor } from '@/lib/sanity/client'
import { absoluteUrl } from './url'
import { SITE_DEFAULTS } from './defaults'

/**
 * Resolve a publishable Open Graph image URL from a Sanity image.
 *
 * Only images with cleared consent and an asset reference are eligible — the
 * same consent gate used for on-page photos. Fails silently when Sanity is
 * not configured (fixture mode) so metadata building never throws.
 */
export function resolveMetaImage(image?: SanityImage | ConsentImage | null): string | undefined {
  if (!image?.asset?._ref) return undefined
  const [cleared] = selectPublishableImages([image])
  if (!cleared?.asset?._ref) return undefined
  try {
    return urlFor(cleared).width(SITE_DEFAULTS.ogWidth).auto('format').url()
  } catch {
    return undefined
  }
}

export interface BuildMetadataOptions {
  /** Site path, e.g. "/about" or "/nutrition/articles/iron". */
  path: string
  /** Page-specific title used when `seo` has no title override. */
  fallbackTitle: string
  /** Page-specific description used when `seo` has no description override. */
  fallbackDescription?: string
  /** Document SEO override (from the `seo` object in Sanity). */
  seo?: SeoMeta | null
  /** Publishable content image, used when no SEO image is set. */
  image?: SanityImage | ConsentImage | null
  /** Explicit Open Graph image URL (e.g. a dynamic /api/og/... route). */
  ogImage?: string
  /** Block indexing/archiving (styleguide, preview pages). */
  noindex?: boolean
  /** Open Graph type. */
  type?: 'website' | 'article'
  /** Site name shown in the OG card. Defaults to the organisation name. */
  siteName?: string
  /**
   * When true the title is emitted as an absolute value, bypassing the root
   * layout title template (e.g. the homepage full organisation name).
   */
  titleAbsolute?: boolean
}

/**
 * Build typed Next.js metadata for a route (plan §3.2 / §12.1).
 *
 * Produces: unique title, description, canonical URL, Open Graph, Twitter
 * card and robots directives. When a document provides no SEO override the
 * page-specific fallback (and finally site-level defaults) are used. A
 * branded `/api/og/brand` card is used as the Open Graph fallback for all
 * public pages so every route shares a shareable image.
 */
export function buildMetadata(options: BuildMetadataOptions): Metadata {
  const {
    path,
    fallbackTitle,
    fallbackDescription,
    seo,
    image,
    ogImage,
    noindex = false,
    type = 'website',
    siteName,
    titleAbsolute = false,
  } = options

  const resolvedTitle = seo?.title?.trim() || fallbackTitle
  const title: Metadata['title'] = titleAbsolute ? { absolute: resolvedTitle } : resolvedTitle
  const description =
    seo?.description?.trim() ||
    fallbackDescription?.trim() ||
    SITE_DEFAULTS.description

  const metaImage =
    ogImage ||
    resolveMetaImage(seo?.ogImage) ||
    resolveMetaImage(image) ||
    (noindex ? undefined : absoluteUrl('/api/og/brand'))

  const canonical = absoluteUrl(path)

  const openGraph: NonNullable<Metadata['openGraph']> = {
    title: resolvedTitle,
    description,
    url: canonical,
    siteName: siteName ?? SITE_DEFAULTS.organisationName,
    type,
    locale: SITE_DEFAULTS.locale,
    images: metaImage
      ? [
          {
            url: metaImage,
            width: SITE_DEFAULTS.ogWidth,
            height: SITE_DEFAULTS.ogHeight,
            alt: resolvedTitle,
          },
        ]
      : undefined,
  }

  const twitter: NonNullable<Metadata['twitter']> = {
    card: metaImage ? 'summary_large_image' : 'summary',
    title: resolvedTitle,
    description,
    images: metaImage ? [metaImage] : undefined,
  }

  const robots: Metadata['robots'] = noindex
    ? { index: false, follow: false, googleBot: { index: false, follow: false } }
    : { index: true, follow: true }

  return {
    title,
    description,
    alternates: { canonical },
    openGraph,
    twitter,
    robots,
  }
}