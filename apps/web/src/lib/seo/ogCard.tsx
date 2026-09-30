import { ImageResponse } from 'next/og'
import { loadFraunces } from './fonts'
import {
  BrandOgTemplate,
  OG_WIDTH,
  OG_HEIGHT,
  type BrandOgTemplateProps,
} from './ogTemplate'

export const OG_CACHE_HEADERS = {
  'content-type': 'image/png',
  'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
}

/**
 * Render a branded Open Graph card (plan §12.3). Photo fetch (via satori) can
 * fail on a CDN hiccup, so the card is first attempted with the image and
 * falls back to the typographic template — single-source rendering means both
 * paths stay on brand.
 */
export async function ogCard(
  options: Omit<BrandOgTemplateProps, 'imageSrc'> & { imageSrc?: string },
): Promise<ImageResponse> {
  const fonts = await loadFraunces()
  const { imageSrc, ...rest } = options

  const render = (withImage: boolean): ImageResponse =>
    new ImageResponse(
      <BrandOgTemplate {...rest} imageSrc={withImage ? imageSrc : undefined} />,
      {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        fonts: fonts ?? undefined,
        headers: OG_CACHE_HEADERS,
      },
    )

  try {
    return render(Boolean(imageSrc))
  } catch {
    return render(false)
  }
}