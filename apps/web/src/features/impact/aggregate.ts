/**
 * Impact metrics engine — canonical, pure logic shared by every data source.
 *
 * Rules enforced here (plan §6.7 / §12.2, phase-5 exit criterion):
 * - Cumulative totals are DERIVED from published, verified outreach records.
 *   Nothing is invented: a figure is `null` (renders as [PLACEHOLDER]) until at
 *   least one verified completed record contributes a value.
 * - Every displayed number carries an `asOf` date (the newest contributing
 *   record). Unverified records never contribute.
 * - Consent gates for photos and testimonials live here so they behave
 *   identically in fixture mode and Sanity mode.
 *
 * The GROQ aggregates in `features/impact/queries.ts` mirror these numbers for
 * the live Sanity dataset, and `pnpm validate:content`
 * (`__tests__/content-consistency.test.ts`) recomputes them from raw records
 * and fails when stored totals contradict the record sums.
 */

export interface ImpactRecordSource {
  date: string
  status: 'upcoming' | 'completed'
  verified?: boolean
  attendance?: number
  screened?: number
  location?: { community?: string; lga?: string; state?: string }
}

export interface ImpactStat {
  key: string
  label: string
  value: number | null
  asOf: string | null
  basis: 'computed'
  unit?: string
}

export const CUMULATIVE_KEYS = [
  'peopleReached',
  'peopleScreened',
  'communitiesServed',
  'statesServed',
  'outreachEvents',
] as const

export type CumulativeKey = (typeof CUMULATIVE_KEYS)[number]

export const CUMULATIVE_METRIC_DEFS: Array<{
  key: CumulativeKey
  label: string
  unit?: string
}> = [
  { key: 'peopleReached', label: 'People Reached', unit: 'people' },
  { key: 'peopleScreened', label: 'People Screened', unit: 'people' },
  { key: 'communitiesServed', label: 'Communities Served' },
  { key: 'statesServed', label: 'States Reached' },
  { key: 'outreachEvents', label: 'Outreaches Completed' },
]

function verifiedCompleted(records: ImpactRecordSource[]): ImpactRecordSource[] {
  return records.filter((r) => r.status === 'completed' && r.verified)
}

function maxDate(records: ImpactRecordSource[]): string | null {
  if (records.length === 0) return null
  return records.reduce((latest, r) => (r.date > latest ? r.date : latest), records[0].date)
}

function sumOrNull(values: number[]): number | null {
  return values.length > 0 ? values.reduce((a, b) => a + b, 0) : null
}

/** Distinct non-empty values in source order. */
function distinctOrNull(values: string[]): number | null {
  const set = new Set(values.filter((v) => v && v.trim() !== ''))
  return set.size > 0 ? set.size : null
}

/** Compute the canonical cumulative metrics from outreach records. */
export function computeCumulativeImpacts(
  records: ImpactRecordSource[],
): ImpactStat[] {
  const contributed = verifiedCompleted(records)
  const asOf = maxDate(contributed)

  const attendance = sumOrNull(contributed.map((r) => r.attendance).filter((n): n is number => typeof n === 'number'))
  const screened = sumOrNull(contributed.map((r) => r.screened).filter((n): n is number => typeof n === 'number'))
  const communities = distinctOrNull(
    contributed.map((r) => r.location?.community || r.location?.lga || ''),
  )
  const states = distinctOrNull(
    contributed.map((r) => r.location?.state || ''),
  )
  const events = contributed.length > 0 ? contributed.length : null

  const values: Record<CumulativeKey, number | null> = {
    peopleReached: attendance,
    peopleScreened: screened,
    communitiesServed: communities,
    statesServed: states,
    outreachEvents: events,
  }

  return CUMULATIVE_METRIC_DEFS.map((def) => ({
    key: def.key,
    label: def.label,
    value: values[def.key],
    asOf,
    basis: 'computed',
    unit: def.unit,
  }))
}

/* ── Consent gating ─────────────────────────────────────────────────────── */

export interface ConsentImage {
  consentStatus?: 'cleared' | 'pending' | 'not-for-publication'
  containsMinors?: boolean
  guardianConsentRecorded?: boolean
  asset?: { _ref?: string }
  alt?: string
  caption?: string
  credit?: string
  decorative?: boolean
}

/**
 * Photos publish only when consent is cleared AND (no minors OR guardian
 * consent on file). Unusable images are omitted silently — never a placeholder.
 */
export function selectPublishableImages(images: ConsentImage[] | undefined): ConsentImage[] {
  if (!images?.length) return []
  return images.filter(
    (img) =>
      img.consentStatus === 'cleared' &&
      Boolean(img.asset?._ref) &&
      (!img.containsMinors || img.guardianConsentRecorded === true),
  )
}

export interface ConsentTestimonial {
  quote?: string
  attribution?: string
  consentObtained?: boolean
}

export function selectConsentedTestimonials(
  testimonials: ConsentTestimonial[] | undefined,
): ConsentTestimonial[] {
  if (!testimonials?.length) return []
  return testimonials.filter(
    (t) => t.consentObtained === true && Boolean(t.quote?.trim()) && Boolean(t.attribution?.trim()),
  )
}

/* ── Structure helpers ──────────────────────────────────────────────────── */

export interface ImpactMilestoneSource {
  _id: string
  title: string
  date: string
  description: string
  order?: number
}

/** Dated timeline, oldest to newest (plan 6.7). */
export function sortMilestones(milestones: ImpactMilestoneSource[] | undefined): ImpactMilestoneSource[] {
  if (!milestones?.length) return []
  return [...milestones].sort(
    (a, b) => a.date.localeCompare(b.date) || (a.order ?? 0) - (b.order ?? 0),
  )
}

/** Geographic reach: simple per-state outreach tally (map seam can extend this). */
export function geographicTally(records: ImpactRecordSource[]): Array<{ state: string; count: number }> {
  const counts = new Map<string, number>()
  for (const r of records) {
    if (r.status !== 'completed') continue
    const state = r.location?.state
    if (!state) continue
    counts.set(state, (counts.get(state) ?? 0) + 1)
  }
  return Array.from(counts.entries())
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count || a.state.localeCompare(b.state))
}

/** Archive order: upcoming first (soonest first), then completed (most recent first). */
export function sortOutreachList<T extends { date: string; status: 'upcoming' | 'completed' }>(
  records: T[],
): T[] {
  if (!records?.length) return []
  return [...records].sort((a, b) => {
    if (a.status !== b.status) return a.status === 'upcoming' ? -1 : 1
    return a.status === 'upcoming'
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date)
  })
}