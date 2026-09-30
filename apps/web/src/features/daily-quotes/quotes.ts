import { sanityFetch } from '@/lib/sanity/fetch'
import { CACHE_TAGS } from '@/lib/sanity/tags'
import { useContentFixtures } from '@/lib/content/dataSource'
import { fixtureQuotes } from '@/lib/content/fixtures'
import { getQuoteOfDay, type QuoteCandidate } from './getQuoteOfDay'

export interface QuoteDoc {
  _id: string
  text: string
  attribution: string
  sourceUrl?: string | null
  topic?: QuoteCandidate['topic']
  startDate?: string | null
  endDate?: string | null
  active: boolean
  reviewStatus: string
  sharingPermitted: boolean
}

/** Approved + active quotes only — unreviewed content is never publishable. */
export async function getEligibleQuotes(): Promise<QuoteDoc[]> {
  if (useContentFixtures()) {
    return fixtureQuotes()
      .filter((q) => q.reviewStatus === 'approved' && q.active !== false)
      .map((q) => ({
        _id: q._id,
        text: q.text,
        attribution: q.attribution,
        sourceUrl: q.sourceUrl,
        topic: q.topic,
        startDate: q.startDate,
        endDate: q.endDate,
        active: q.active !== false,
        reviewStatus: 'approved',
        sharingPermitted: q.sharingPermitted === true,
      }))
  }

  try {
    const rows = await sanityFetch<QuoteDoc[]>(
      `*[_type == "quote" && active == true && reviewStatus == "approved"]{
        _id, text, attribution, sourceUrl, topic, startDate, endDate,
        active, reviewStatus, sharingPermitted,
      }`,
      undefined,
      { tags: [CACHE_TAGS.quotes, CACHE_TAGS.homepage] },
    )
    return rows ?? []
  } catch {
    return []
  }
}

export async function fetchDailyQuote(
  now: Date = new Date(),
): Promise<{ quote: QuoteCandidate; slot: 'scheduled' | 'evergreen' } | null> {
  return getQuoteOfDay(await getEligibleQuotes(), now)
}