import type { ImageLoaderProps } from 'next/image'

// Custom Next.js image loader for Sanity-resolved images.
// The `src` passed to <Image> is a cdn.sanity.io URL (optionally with params);
// this loader rewrites it into a fresh, format-negotiable, width-based URL so
// Next can generate an AVIF/WebP srcset across device/image breakpoints.
const SANITY_HOSTS = new Set(['cdn.sanity.io'])

export default function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  let url: URL
  try {
    url = new URL(src)
  } catch {
    return src
  }

  if (SANITY_HOSTS.has(url.hostname)) {
    url.searchParams.set('w', String(width))
    url.searchParams.set('q', String(quality ?? 75))
    url.searchParams.set('auto', 'format')
    // Keep the crop/rect params set by @sanity/image-url; drop params that
    // would conflict with Next's own width/format negotiation.
    url.searchParams.delete('fit')
    url.searchParams.delete('dpr')
    url.searchParams.delete('fm')
    return url.toString()
  }

  return src
}