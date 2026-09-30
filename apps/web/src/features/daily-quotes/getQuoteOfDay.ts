/**
 * Pure, dependency-free selection of the "quote of the day".
 *
 * Rules (IMPLEMENTATION_PLAN §7.4 + Phase 6 exit criteria):
 *  1. Only `active` quotes that have been `approved` are eligible.
 *  2. A scheduled quote wins on the days its window covers
 *     (startDate <= today <= endDate, inclusive, in `tz` calendar days).
 *     Ties: latest `startDate` wins; identical start dates fall back to
 *     alphabetical `_id`.
 *  3. Otherwise a deterministic evergreen quote is drawn from the pool
 *     (eligible quotes without a start date, still within their end date):
 *     `index = whole days since 2020-01-01 (in `tz`) % pool.length`.
 *  4. Empty pool => null (callers render nothing).
 */
const DAY_MS = 86_400_000

export type QuoteTopic =
  | 'nutrition'
  | 'healthy-living'
  | 'maternal-health'
  | 'child-nutrition'
  | 'food-safety'
  | 'general-wellness'

export interface QuoteCandidate {
  _id: string
  text: string
  attribution: string
  topic?: QuoteTopic | null
  sourceUrl?: string | null
  startDate?: string | null
  endDate?: string | null
  active?: boolean
  reviewStatus?: string | null
  sharingPermitted?: boolean
}

export interface DailyQuoteResult {
  quote: QuoteCandidate
  slot: 'scheduled' | 'evergreen'
}

/** The calendar date (YYYY-MM-DD) in `tz` for a given instant. */
export function zonedDayKey(now: Date, tz: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const read = (type: Intl.DateTimeFormatPartTypes): number =>
    Number(parts.find((p) => p.type === type)?.value ?? 0)
  const year = String(read('year')).padStart(4, '0')
  const month = String(read('month')).padStart(2, '0')
  const day = String(read('day')).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Whole days between a YYYY-MM-DD key and 2020-01-01 (calendar, not wall-clock). */
export function daysSinceEpoch(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  const start = Date.UTC(2020, 0, 1)
  const value = Date.UTC(y, m - 1, d)
  return Math.round((value - start) / DAY_MS)
}

/** Milliseconds from `now` until the next midnight in `tz` (used for cache TTLs). */
export function msUntilNextZonedMidnight(now: Date, tz: string): number {
  const today = zonedDayKey(now, tz)
  const [y, m, d] = today.split('-').map(Number)
  const lower = Date.UTC(y, m - 1, d)
  let lo = lower
  let hi = lower + 48 * 60 * 60 * 1000
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2)
    if (zonedDayKey(new Date(mid), tz) > today) {
      hi = mid
    } else {
      lo = mid + 1
    }
  }
  return Math.max(0, lo - now.getTime())
}

function isEligible(quote: QuoteCandidate): boolean {
  return quote.active !== false && quote.reviewStatus === 'approved'
}

function byLatestStartThenId(a: QuoteCandidate, b: QuoteCandidate): number {
  const aStart = a.startDate ?? ''
  const bStart = b.startDate ?? ''
  if (aStart !== bStart) return aStart < bStart ? 1 : -1
  return a._id < b._id ? -1 : a._id > b._id ? 1 : 0
}

export function getQuoteOfDay(
  quotes: QuoteCandidate[],
  now: Date = new Date(),
  tz = 'Africa/Lagos',
): DailyQuoteResult | null {
  const today = zonedDayKey(now, tz)
  const eligible = quotes.filter(isEligible)

  const scheduled = eligible
    .filter((q) => q.startDate != null && q.startDate <= today && (q.endDate == null || q.endDate >= today))
    .sort(byLatestStartThenId)

  if (scheduled.length > 0) {
    return { quote: scheduled[0], slot: 'scheduled' }
  }

  const pool = eligible
    .filter((q) => q.startDate == null && (q.endDate == null || q.endDate >= today))
    .sort((a, b) => (a._id < b._id ? -1 : a._id > b._id ? 1 : 0))

  if (pool.length === 0) return null

  const index = ((daysSinceEpoch(today) % pool.length) + pool.length) % pool.length
  return { quote: pool[index], slot: 'evergreen' }
}