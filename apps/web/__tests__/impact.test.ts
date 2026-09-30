import { describe, expect, it } from 'vitest'
import type { ImpactRecordSource } from '@/features/impact/aggregate'
import {
  CUMULATIVE_METRIC_DEFS,
  computeCumulativeImpacts,
  selectPublishableImages,
  selectConsentedTestimonials,
  sortMilestones,
  geographicTally,
  sortOutreachList,
} from '@/features/impact/aggregate'
import {
  fixtureOutreaches,
  fixtureImpactMetrics,
  fixtureMilestones,
} from '@/lib/content/fixtures'

function verifiedRecord(date: string, patch: Partial<ImpactRecordSource> = {}): ImpactRecordSource {
  return { date, status: 'completed', verified: true, ...patch }
}

describe('computeCumulativeImpacts (sum / as-of / unverified-hidden)', () => {
  it('sums attendance and screened across verified completed records', () => {
    const records = [
      verifiedRecord('2025-01-10', { attendance: 120, screened: 100 }),
      verifiedRecord('2025-03-05', { attendance: 80, screened: 80 }),
    ]
    const stats = computeCumulativeImpacts(records)
    expect(stats.find((s) => s.key === 'peopleReached')?.value).toBe(200)
    expect(stats.find((s) => s.key === 'peopleScreened')?.value).toBe(180)
    expect(stats.find((s) => s.key === 'outreachEvents')?.value).toBe(2)
  })

  it('sets asOf to the newest contributing record', () => {
    const stats = computeCumulativeImpacts([
      verifiedRecord('2025-01-10', { attendance: 10 }),
      verifiedRecord('2025-09-30', { attendance: 20 }),
    ])
    expect(stats.find((s) => s.key === 'peopleReached')?.asOf).toBe('2025-09-30')
  })

  it('counts distinct states and communities only', () => {
    const records = [
      verifiedRecord('2025-01-10', { location: { community: 'Bodija', state: 'Oyo' } }),
      verifiedRecord('2025-02-10', { location: { community: 'Bodija', state: 'Oyo' } }),
      verifiedRecord('2025-03-10', { location: { state: 'Lagos', lga: 'Surulere' } }),
    ]
    const stats = computeCumulativeImpacts(records)
    expect(stats.find((s) => s.key === 'communitiesServed')?.value).toBe(2)
    expect(stats.find((s) => s.key === 'statesServed')?.value).toBe(2)
  })

  it('never lets an unverified record contribute a figure', () => {
    const stats = computeCumulativeImpacts([
      { date: '2025-01-10', status: 'completed', verified: false, attendance: 9999, screened: 9999 },
      { date: '2025-02-10', status: 'completed', attendance: 9999 },
    ])
    expect(stats.find((s) => s.key === 'peopleReached')?.value).toBeNull()
    expect(stats.find((s) => s.key === 'outreachEvents')?.value).toBeNull()
    expect(stats.find((s) => s.key === 'peopleReached')?.asOf).toBeNull()
  })

  it('treats upcoming events as contributing nothing', () => {
    const stats = computeCumulativeImpacts([
      { date: '2026-05-16', status: 'upcoming', attendance: 500 },
    ])
    expect(stats.every((s) => s.value === null)).toBe(true)
  })

  it('yields null values (the [PLACEHOLDER] signal) when data is missing', () => {
    expect(computeCumulativeImpacts([]).every((s) => s.value === null)).toBe(true)
  })

  it('defines one canonical stat per cumulative key with a label and optional unit', () => {
    expect(CUMULATIVE_METRIC_DEFS).toHaveLength(5)
    expect(CUMULATIVE_METRIC_DEFS.map((d) => d.label)).toEqual([
      'People Reached',
      'People Screened',
      'Communities Served',
      'States Reached',
      'Outreaches Completed',
    ])
  })
})

describe('consent gating', () => {
  it('publishes only images with cleared consent and an asset ref', () => {
    const usable = selectPublishableImages([
      { consentStatus: 'cleared', asset: { _ref: 'image-a' } },
      { consentStatus: 'cleared', asset: { _ref: 'image-b' } },
      { consentStatus: 'pending', asset: { _ref: 'image-c' } },
      { consentStatus: 'not-for-publication', asset: { _ref: 'image-d' } },
      { consentStatus: 'cleared' },
    ])
    expect(usable.map((i) => i.asset?._ref)).toEqual(['image-a', 'image-b'])
  })

  it('withholds photos of minors unless guardian consent is recorded', () => {
    expect(
      selectPublishableImages([
        { consentStatus: 'cleared', asset: { _ref: 'a' }, containsMinors: true },
      ]),
    ).toEqual([])
    expect(
      selectPublishableImages([
        { consentStatus: 'cleared', asset: { _ref: 'a' }, containsMinors: true, guardianConsentRecorded: true },
      ]),
    ).toHaveLength(1)
    expect(
      selectPublishableImages([
        { consentStatus: 'cleared', asset: { _ref: 'a' }, containsMinors: false },
      ]),
    ).toHaveLength(1)
  })

  it('returns nothing silently when accepted images are absent', () => {
    expect(selectPublishableImages(undefined)).toEqual([])
    expect(selectPublishableImages([])).toEqual([])
  })

  it('keeps only testimonials with permission, a quote and an attribution', () => {
    const kept = selectConsentedTestimonials([
      { quote: 'Life-changing.', attribution: 'Amina, Bodija', consentObtained: true },
      { quote: 'Not consented.', attribution: 'A', consentObtained: false },
      { quote: '', attribution: 'A', consentObtained: true },
      { quote: 'No attribution.', consentObtained: true },
      { quote: 'No flag.', attribution: 'A' },
    ])
    expect(kept).toHaveLength(1)
    expect(kept[0].quote).toBe('Life-changing.')
  })
})

describe('structure helpers', () => {
  it('sorts milestones oldest first, breaking ties by order', () => {
    const sorted = sortMilestones([
      { _id: 'a', title: 'B', date: '2024-01-01', description: '', order: 1 },
      { _id: 'c', title: 'A', date: '2023-01-01', description: '' },
      { _id: 'b', title: 'D', date: '2024-01-01', description: '', order: 0 },
    ])
    expect(sorted.map((m) => m.title)).toEqual(['A', 'D', 'B'])
  })

  it('tallies completed outreach events per state, largest first', () => {
    const tally = geographicTally([
      verifiedRecord('2025-01-10', { location: { state: 'Oyo' } }),
      verifiedRecord('2025-02-10', { location: { state: 'Lagos' } }),
      verifiedRecord('2025-03-10', { location: { state: 'Lagos' } }),
      { date: '2026-05-16', status: 'upcoming', location: { state: 'Kano' } },
      verifiedRecord('2025-04-10', {}),
    ])
    expect(tally).toEqual([
      { state: 'Lagos', count: 2 },
      { state: 'Oyo', count: 1 },
    ])
  })

  it('orders the archive as upcoming-first, then completed newest-first', () => {
    const ordered = sortOutreachList([
      { date: '2026-01-17', status: 'completed', title: 'old' },
      { date: '2026-05-16', status: 'upcoming', title: 'later upcoming' },
      { date: '2026-02-14', status: 'completed', title: 'new' },
      { date: '2026-03-01', status: 'upcoming', title: 'soon upcoming' },
    ])
    expect(ordered.map((o) => o.title)).toEqual([
      'soon upcoming',
      'later upcoming',
      'new',
      'old',
    ])
  })
})

describe('content fixtures (phase-5 ground rule: nothing invented)', () => {
  it('remains unverified and unmetrical until real records exist', () => {
    expect(fixtureOutreaches()).toHaveLength(4)
    expect(fixtureOutreaches().every((o) => !o.verifiedByOutreachManager)).toBe(true)
    expect(fixtureImpactMetrics()).toEqual([])
    expect(fixtureMilestones()).toEqual([])
    expect(computeCumulativeImpacts(fixtureOutreaches()).every((s) => s.value === null)).toBe(true)
  })

  it('records the 28 Dec 2025 Ibadan case study with empty data fields', () => {
    const ibadan = fixtureOutreaches().find((o) => o._id === 'outreach-ibadan-case-study')
    expect(ibadan).toBeDefined()
    expect(ibadan?.date).toBe('2025-12-28')
    expect(ibadan?.location?.state).toBe('Oyo')
    expect(ibadan?.venue).toBe('Bodija Community Hall')
    expect(ibadan?.attendance).toBeUndefined()
    expect(ibadan?.screened).toBeUndefined()
    expect(ibadan?.results).toBeUndefined()
  })
})