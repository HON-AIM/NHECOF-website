import { describe, expect, it } from 'vitest'
import {
  daysSinceEpoch,
  getQuoteOfDay,
  msUntilNextZonedMidnight,
  zonedDayKey,
  type QuoteCandidate,
} from '@/features/daily-quotes/getQuoteOfDay'

const TZ = 'Africa/Lagos' // UTC+1, no daylight saving

function quote(id: string, patch: Partial<QuoteCandidate> = {}): QuoteCandidate {
  return { _id: id, text: `"${id}"`, attribution: 'NHECOF', active: true, reviewStatus: 'approved', ...patch }
}

const l = (iso: string): Date => new Date(iso)

describe('zonedDayKey (Africa/Lagos, UTC+1)', () => {
  it('maps UTC to the Lagos calendar date', () => {
    expect(zonedDayKey(l('2025-06-01T00:00:00Z'), TZ)).toBe('2025-06-01')
    expect(zonedDayKey(l('2025-06-01T12:00:00Z'), TZ)).toBe('2025-06-01')
    expect(zonedDayKey(l('2025-06-01T23:00:00Z'), TZ)).toBe('2025-06-02')
  })

  it('treats a Lagos midnight (23:00Z previous day) as the new day', () => {
    expect(zonedDayKey(l('2025-05-31T23:00:00Z'), TZ)).toBe('2025-06-01')
    expect(zonedDayKey(l('2025-05-31T22:59:59Z'), TZ)).toBe('2025-05-31')
  })
})

describe('getQuoteOfDay eligibility', () => {
  it('ignores inactive and unreviewed quotes even when scheduled', () => {
    const quotes = [
      quote('q1', { startDate: '2025-06-01', active: false }),
      quote('q2', { startDate: '2025-06-01', reviewStatus: 'draft' }),
      quote('q3', { startDate: '2025-06-01', reviewStatus: 'submitted' }),
      quote('q4', { startDate: '2025-06-01' }),
    ]
    const result = getQuoteOfDay(quotes, l('2025-06-01T12:00:00Z'), TZ)
    expect(result?.quote._id).toBe('q4')
    expect(result?.slot).toBe('scheduled')
  })

  it('returns null when no candidate exists (empty pool and no schedules)', () => {
    expect(getQuoteOfDay([], l('2025-06-01T12:00:00Z'), TZ)).toBeNull()
    expect(
      getQuoteOfDay([quote('x', { startDate: '2024-01-01', endDate: '2024-01-02' })], l('2025-06-01T12:00:00Z'), TZ),
    ).toBeNull()
  })
})

describe('getQuoteOfDay scheduled windows (Lagos vs UTC boundaries)', () => {
  it('shows a quote on its single scheduled day across the full Lagos day', () => {
    const quotes = [quote('q-day', { startDate: '2025-06-01', endDate: '2025-06-01' })]
    expect(getQuoteOfDay(quotes, l('2025-05-31T23:00:00Z'), TZ)?.quote._id).toBe('q-day') // 00:00 Lagos Jun 1
    expect(getQuoteOfDay(quotes, l('2025-06-01T22:59:59Z'), TZ)?.quote._id).toBe('q-day') // 23:59:59 Lagos Jun 1
    expect(getQuoteOfDay(quotes, l('2025-06-01T23:00:00Z'), TZ)).toBeNull() // 00:00 Lagos Jun 2 — already past
    expect(getQuoteOfDay(quotes, l('2025-06-02T00:00:00Z'), TZ)).toBeNull() // 01:00 Lagos Jun 2 — already past
  })

  it('honours startDate/endDate inclusivity in Lagos calendar days', () => {
    const quotes = [quote('q-window', { startDate: '2025-06-01', endDate: '2025-06-15' })]
    // 22:59:59Z 2025-05-31 is still 2025-05-31 in Lagos → not yet started
    expect(getQuoteOfDay(quotes, l('2025-05-31T22:59:59Z'), TZ)).toBeNull()
    // 23:59:59Z 2025-05-31 is 00:59 on 2025-06-01 in Lagos → inside the window
    expect(getQuoteOfDay(quotes, l('2025-05-31T23:59:59Z'), TZ)?.quote._id).toBe('q-window')
    // 00:00Z 2025-06-01 is inside the window
    expect(getQuoteOfDay(quotes, l('2025-06-01T00:00:00Z'), TZ)?.quote._id).toBe('q-window')
    // End date inclusive: 23:00Z 2025-06-15 is already Jun 16 in Lagos → expired
    expect(getQuoteOfDay(quotes, l('2025-06-15T23:00:00Z'), TZ)).toBeNull()
    // But 12:00Z on the 15th is still within the window
    expect(getQuoteOfDay(quotes, l('2025-06-15T12:00:00Z'), TZ)?.quote._id).toBe('q-window')
  })

  it('picks the latest startDate among overlapping schedules, then alphabetical id', () => {
    const quotes = [
      quote('a', { startDate: '2025-05-20' }),
      quote('d', { startDate: '2025-06-01' }),
      quote('c', { startDate: '2025-06-01' }),
    ]
    const result = getQuoteOfDay(quotes, l('2025-06-05T12:00:00Z'), TZ)
    expect(result?.quote._id).toBe('c') // latest start, then alphabetical: c before d
    expect(result?.slot).toBe('scheduled')
  })

  it('does not surface a scheduled quote outside its window on its start day', () => {
    const quotes = [quote('q1', { startDate: '2025-06-01', endDate: '2025-06-10' })]
    expect(getQuoteOfDay(quotes, l('2025-05-31T22:59:59Z'), TZ)).toBeNull() // Lagos May 31 23:59:59
    expect(getQuoteOfDay(quotes, l('2025-05-25T12:00:00Z'), TZ)).toBeNull()
    expect(getQuoteOfDay(quotes, l('2025-05-31T23:00:00Z'), TZ)?.quote._id).toBe('q1') // Lagos Jun 1 00:00
  })
})

describe('getQuoteOfDay evergreen pool', () => {
  it('is deterministic within a day and stable across times of day', () => {
    const pool = [quote('e1'), quote('e2'), quote('e3')]
    const morningResult = getQuoteOfDay(pool, l('2025-06-01T00:30:00Z'), TZ)
    const eveningResult = getQuoteOfDay(pool, l('2025-06-01T20:00:00Z'), TZ)
    expect(morningResult?.quote._id).toBe(eveningResult?.quote._id)
    expect(morningResult?.slot).toBe('evergreen')
  })

  it('advances the index by one whole day (and checks leap-day epoch math)', () => {
    const pool = [quote('a'), quote('b')]
    const day1 = getQuoteOfDay(pool, l('2020-02-29T12:00:00Z'), TZ) // leap day 2020 → epoch day 59
    const day2 = getQuoteOfDay(pool, l('2020-03-01T12:00:00Z'), TZ)
    expect(daysSinceEpoch('2020-02-29')).toBe(59)
    expect(daysSinceEpoch('2020-03-01')).toBe(60)
    const base1 = daysSinceEpoch('2020-02-29') % 2
    const base2 = daysSinceEpoch('2020-03-01') % 2
    expect(day1?.quote._id).toBe(base1 === 0 ? 'a' : 'b')
    expect(day2?.quote._id).toBe(base2 === 0 ? 'a' : 'b')
    expect(day1?.quote._id).not.toBe(day2?.quote._id)
  })

  it('changes pick when the pool changes mid-day, but stays date-determinate for the same pool', () => {
    const poolAB = [quote('a'), quote('b')]
    const poolA = [quote('a')]
    const now = l('2025-09-15T14:00:00Z')
    const first = getQuoteOfDay(poolAB, now, TZ)
    const second = getQuoteOfDay(poolAB, l('2025-09-15T20:00:00Z'), TZ)
    expect(first?.quote._id).toBe(second?.quote._id) // same pool, same day → same quote
    const only = getQuoteOfDay(poolA, now, TZ)
    expect(only?.quote._id).toBe('a')
    // re-adding the same pool returns to the deterministic pick
    expect(getQuoteOfDay(poolAB, now, TZ)?.quote._id).toBe(first?.quote._id)
  })

  it('uses eligible evergreen quotes with a future end date and skips expired ones', () => {
    const pool = [
      quote('expired', { endDate: '2025-08-01' }),
      quote('active', { endDate: '2025-12-31' }),
      quote('forever'),
    ]
    const result = getQuoteOfDay(pool, l('2025-09-15T12:00:00Z'), TZ)
    expect(result?.quote._id).not.toBe('expired')
    expect(['active', 'forever']).toContain(result?.quote._id)
  })
})

describe('msUntilNextZonedMidnight', () => {
  it('counts seconds until the next Lagos midnight', () => {
    const ttl = msUntilNextZonedMidnight(l('2025-06-01T10:00:00Z'), TZ)
    expect(ttl).toBe(13 * 60 * 60 * 1000) // Lagos 11:00 → next midnight at 23:00Z
  })

  it('returns ~1 day when just past a Lagos midnight', () => {
    const ttl = msUntilNextZonedMidnight(l('2025-06-01T23:01:00Z'), TZ)
    expect(ttl).toBeGreaterThan(23 * 60 * 60 * 1000)
    expect(ttl).toBeLessThanOrEqual(24 * 60 * 60 * 1000)
  })
})