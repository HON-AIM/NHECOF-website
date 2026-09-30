import NextImage from 'next/image'
import { urlFor } from '@/lib/sanity/client'
import { cn } from '@/lib/cn'

/**
 * Minimal shape of a Sanity image value. Fields beyond `asset` are optional
 * and used only for alt/caption/consent metadata by callers.
 */
export interface ResponsiveImageSource {
  asset?: { _ref?: string }
}

export interface ResponsiveImageProps {
  /** Pre-resolved CDN URL (sanity). When omitted it is built from `image`. */
  src?: string
  /** Sanity image value — used to resolve/verify the source and LQIP. */
  image?: ResponsiveImageSource
  alt: string
  decorative?: boolean
  /** <img sizes> hint — must reflect the rendered CSS width. */
  sizes?: string
  /** CSS aspect ratio when > 0, e.g. "4/3". Ignored in `fill` mode. */
  ratio?: string
  /** Intrinsic width in CSS pixels used to derive srcset + CLS-safe box. */
  displayWidth?: number
  /**
   * When true the image absolutely fills its nearest positioned ancestor
   * (the caller must provide one, e.g. an `aspect-[16/10] relative` box),
   * matching the `<img fill>` layout.
   */
  fill?: boolean
  /** Set only for the LCP image (home hero); everything else stays lazy. */
  priority?: boolean
  /** Extra classes on the <img> element. */
  className?: string
  /** Disable the blur-up LQIP (e.g. for images without an asset). */
  noBlur?: boolean
}

function parseRatio(ratio: string | undefined): number | undefined {
  if (!ratio) return undefined
  const [w, h] = ratio.split('/').map((part) => parseFloat(part))
  if (!w || !h || Number.isNaN(w) || Number.isNaN(h)) return undefined
  return w / h
}

function resolveSource(src: string | undefined, image: ResponsiveImageSource | undefined): string | undefined {
  if (src) return src
  if (image?.asset?._ref) {
    try {
      return urlFor(image).auto('format').url()
    } catch {
      return undefined
    }
  }
  return undefined
}

function resolveLqip(image: ResponsiveImageSource | undefined): string | undefined {
  if (!image?.asset?._ref) return undefined
  try {
    return urlFor(image).width(16).quality(20).auto('format').url()
  } catch {
    return undefined
  }
}

/**
 * Responsive Sanity image rendered through next/image: AVIF/WebP srcsets via
 * the custom Sanity loader, lazy by default (priority only for LCP), explicit
 * aspect ratio to prevent layout shift, and a blur-up LQIP from the same CDN.
 *
 * Returns null when no usable source exists (callers render a fallback).
 */
export function ResponsiveImage({
  src,
  image,
  alt,
  decorative = false,
  sizes,
  ratio = '4/3',
  displayWidth = 1200,
  fill = false,
  priority = false,
  className,
  noBlur = false,
}: ResponsiveImageProps) {
  const finalSrc = resolveSource(src, image)
  if (!finalSrc) return null

  const blurDataURL = noBlur ? undefined : resolveLqip(image)
  const common = {
    src: finalSrc,
    alt: decorative ? '' : alt,
    'aria-hidden': decorative ? true : undefined,
    sizes: sizes ?? '(min-width: 640px) 640px, 100vw',
    priority,
    placeholder: blurDataURL ? ('blur' as const) : ('empty' as const),
    blurDataURL,
    className: cn('object-cover', className),
  }

  if (fill) {
    return <NextImage {...common} fill />
  }

  const aspect = parseRatio(ratio)
  const width = displayWidth
  const height = aspect ? Math.max(1, Math.round(width / aspect)) : Math.round(width * 0.75)

  return (
    <NextImage
      {...common}
      width={width}
      height={height}
      style={aspect ? { aspectRatio: ratio } : undefined}
    />
  )
}