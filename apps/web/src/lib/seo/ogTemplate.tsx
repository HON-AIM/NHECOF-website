import type { ReactElement } from 'react'
import { wrapText } from './fonts'

/**
 * Shared branded Open Graph template (plan §12.3).
 *
 * Used by the dynamic `/api/og/article|food|outreach/[slug]` routes and the
 * static `/api/og/brand` fallback. A cleared photo (consent-gated upstream) is
 * shown as a leaf-cut circular image; without a photo the template falls back
 * to a typographic card that is still on-brand.
 */

export const OG_WIDTH = 1200
export const OG_HEIGHT = 630
export const OG_BRAND = 'NHECOF'

export const OG_PALETTE = {
  background: '#fbf6ec',
  ink: '#22201c',
  brand: '#1f5a3f',
  accent: '#c75b1a',
  muted: '#6e675b',
  faint: '#857f77',
}

export interface BrandOgTemplateProps {
  title: string
  eyebrow: string
  note?: string
  imageSrc?: string
  titleFontSize?: number
}

export function BrandOgTemplate({
  title,
  eyebrow,
  note,
  imageSrc,
  titleFontSize = 56,
}: BrandOgTemplateProps): ReactElement {
  const lines = wrapText(title, titleFontSize === 56 ? 34 : 40, 4)
  const hasImage = Boolean(imageSrc)

  return (
    <div
      style={{
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: OG_PALETTE.background,
        padding: '72px 80px',
        gap: 64,
      }}
    >
      {/* Left: brand, accent rule, title, note */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontFamily: 'sans-serif',
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: OG_PALETTE.brand,
          }}
        >
          {`${OG_BRAND} · ${eyebrow}`}
        </div>

        <div
          style={{
            width: 84,
            height: 6,
            backgroundColor: OG_PALETTE.accent,
            borderRadius: 999,
            marginTop: 28,
            marginBottom: 40,
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
          }}
        >
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: i === 0 && lines.length > 1 ? titleFontSize + 6 : titleFontSize,
                fontWeight: 500,
                lineHeight: 1.1,
                color: OG_PALETTE.ink,
              }}
            >
              {line}
            </div>
          ))}
        </div>

        {note ? (
          <div
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 26,
              fontStyle: 'italic',
              color: OG_PALETTE.muted,
              marginTop: 36,
            }}
          >
            {note}
          </div>
        ) : null}
      </div>

      {/* Right: leaf-cut photo when a cleared image exists */}
      {hasImage ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 320,
            height: 320,
            borderRadius: '50%',
            overflow: 'hidden',
            border: `14px solid ${OG_PALETTE.brand}`,
            backgroundColor: '#e7ddc9',
            flexShrink: 0,
          }}
        >
          <img
            src={imageSrc!}
            alt=""
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      ) : null}
    </div>
  )
}