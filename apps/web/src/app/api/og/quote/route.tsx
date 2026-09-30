import { ImageResponse } from 'next/og'
import { fetchDailyQuote } from '@/features/daily-quotes/quotes'
import { msUntilNextZonedMidnight, zonedDayKey } from '@/features/daily-quotes/getQuoteOfDay'
import { loadFraunces, wrapText } from '@/lib/seo/fonts'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const QUOTE_TZ = 'Africa/Lagos'
const BRAND = 'NHECOF'
const WIDTH = 1200
const HEIGHT = 630

const TOPIC_LABELS: Record<string, string> = {
  nutrition: 'Nutrition',
  'healthy-living': 'Healthy Living',
  'maternal-health': 'Maternal Health',
  'child-nutrition': 'Child Nutrition',
  'food-safety': 'Food Safety',
  'general-wellness': 'General Wellness',
}

export async function GET() {
  const result = await fetchDailyQuote(new Date())
  const fonts = await loadFraunces()

  const lines = result ? wrapText(result.quote.text, 46, 6) : ['Good nutrition is the foundation of good health.']
  const attribution = result ? result.quote.attribution : BRAND
  const topic = result?.quote.topic ? TOPIC_LABELS[result.quote.topic] ?? null : null

  const today = zonedDayKey(new Date(), QUOTE_TZ)

  const quoteBlock =
    result === null ? null : (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 48, maxWidth: 1020 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {lines.map((line, i) => (
            <div
              key={i}
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: i === 0 && lines.length > 1 ? 52 : 60,
                fontWeight: 500,
                lineHeight: 1.12,
                color: '#22201c',
              }}
            >
              {line}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start' }}>
          <div
            style={{
              fontFamily: 'Fraunces, Georgia, serif',
              fontSize: 40,
              fontWeight: 500,
              fontStyle: 'italic',
              color: '#1f5a3f',
            }}
          >
            {`— ${attribution}`}
          </div>
          {topic ? (
            <div
              style={{
                fontFamily: 'sans-serif',
                fontSize: 22,
                fontWeight: 600,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: '#ffffff',
                backgroundColor: '#2b7050',
                padding: '8px 20px',
                borderRadius: 999,
              }}
            >
              {topic}
            </div>
          ) : null}
        </div>
      </div>
    )

  return new ImageResponse(
    (
      <div
        style={{
          width: WIDTH,
          height: HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#fbf6ec',
          padding: '64px 72px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: 'uppercase',
              color: '#1f5a3f',
            }}
          >
            {`${BRAND} · Quote of the Day`}
          </div>
          <div
            style={{
              fontFamily: 'sans-serif',
              fontSize: 22,
              color: '#6e675b',
            }}
          >
            {today}
          </div>
        </div>
        <div
          style={{
            width: 84,
            height: 6,
            backgroundColor: '#c75b1a',
            borderRadius: 999,
            marginTop: 28,
            marginBottom: 52,
          }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 48, flex: 1 }}>
          {quoteBlock ?? (
            <div
              style={{
                fontFamily: 'Fraunces, Georgia, serif',
                fontSize: 60,
                fontWeight: 500,
                lineHeight: 1.15,
                color: '#22201c',
                maxWidth: 1000,
              }}
            >
              Good nutrition is the foundation of good health.
            </div>
          )}
        </div>
        <div
          style={{
            fontFamily: 'sans-serif',
            fontSize: 18,
            color: '#857f77',
          }}
        >
          NutriHealth Education and Community Outreach Foundation
        </div>
      </div>
    ),
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: fonts ?? undefined,
      headers: {
        'content-type': 'image/png',
        'Cache-Control': `public, s-maxage=${Math.max(60, Math.floor(msUntilNextZonedMidnight(new Date(), QUOTE_TZ) / 1000))}, stale-while-revalidate=3600`,
      },
    },
  )
}