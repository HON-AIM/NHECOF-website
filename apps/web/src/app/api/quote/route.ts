import { unstable_cache } from 'next/cache'
import { NextResponse } from 'next/server'
import { fetchDailyQuote } from '@/features/daily-quotes/quotes'
import { msUntilNextZonedMidnight, zonedDayKey, type QuoteCandidate } from '@/features/daily-quotes/getQuoteOfDay'
import { CACHE_TAGS } from '@/lib/sanity/tags'
import { isDraftModeEnabled } from '@/lib/sanity/fetch'

const QUOTE_TZ = 'Africa/Lagos'

function serializeQuote(quote: QuoteCandidate): QuoteCandidate {
  return {
    _id: quote._id,
    text: quote.text,
    attribution: quote.attribution,
    topic: quote.topic ?? null,
    sourceUrl: quote.sourceUrl ?? null,
    sharingPermitted: quote.sharingPermitted === true,
  }
}

const cachedDailyQuote = unstable_cache(
  async () => buildPayload(),
  ['daily-quote'],
  // Must match CACHE_TAGS.quotes. A drift here means an editor's quote
  // publish never reaches the live site.
  { revalidate: 3600, tags: [CACHE_TAGS.quotes, CACHE_TAGS.homepage] },
)

async function buildPayload() {
  const result = await fetchDailyQuote()
  return {
    slot: result?.slot ?? null,
    quote: result ? serializeQuote(result.quote) : null,
    day: zonedDayKey(new Date(), QUOTE_TZ),
  }
}

export async function GET() {
  const now = new Date()
  const isPreview = await isDraftModeEnabled()

  // The Data Cache is not bypassed by draft mode, so a draft preview would
  // otherwise be shown yesterday's published quote. Read through in a draft.
  const payload = isPreview ? await buildPayload() : await cachedDailyQuote()

  const maxAge = Math.max(60, Math.floor(msUntilNextZonedMidnight(now, QUOTE_TZ) / 1000))

  return NextResponse.json(payload, {
    headers: {
      // A draft response must never be stored by a CDN or the browser.
      ...(isPreview
        ? { 'Cache-Control': 'private, no-store' }
        : { 'Cache-Control': `public, s-maxage=${maxAge}, stale-while-revalidate=3600` }),
    },
  })
}