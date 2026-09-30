/**
 * `pnpm validate:content` — content-consistency gate (plan §6.7 / phase 5).
 *
 * Cross-checks that stored cumulative-impact figures equal the sum of the
 * published, verified outreach records they represent. In fixture mode it runs
 * the bundled demo data; when Sanity credentials are present it validates the
 * live dataset instead.
 */

import { describe, expect, it } from 'vitest'
import { createClient } from '@sanity/client'
import { hasSanityConfig } from '@/lib/content/dataSource'
import {
  fixtureOutreaches,
  fixtureImpactMetrics,
} from '@/lib/content/fixtures'
import {
  crossCheckCumulativeTotals,
  normalizeMetricLabel,
} from '@/features/impact/validate'
import { CUMULATIVE_METRIC_DEFS, type ImpactRecordSource } from '@/features/impact/aggregate'

describe('metric-label normalisation', () => {
  it('maps display labels onto canonical keys for reconciliation', () => {
    for (const def of CUMULATIVE_METRIC_DEFS) {
      expect(normalizeMetricLabel(def.label).length).toBeGreaterThan(0)
    }
    expect(normalizeMetricLabel('People Reached!')).toBe('peoplereached')
  })
})

describe('crossCheckCumulativeTotals', () => {
  it('passes when stored totals equal the reconciliation sum', () => {
    const records: ImpactRecordSource[] = [
      { date: '2025-01-10', status: 'completed', verified: true, attendance: 120, screened: 100 },
      { date: '2025-02-10', status: 'completed', verified: true, attendance: 80, screened: 80 },
    ]
    const stored = [
      { label: 'People Reached', value: 200, asOf: '2025-02-10', basis: 'computed' },
      { label: 'People Screened', value: 180, asOf: '2025-02-10', basis: 'computed' },
      { label: 'Outreaches Completed', value: 2, asOf: '2025-02-10', basis: 'computed' },
    ]
    expect(crossCheckCumulativeTotals(records, stored)).toEqual([])
  })

  it('reports a mismatch between a stored total and the record sum', () => {
    const records: ImpactRecordSource[] = [
      { date: '2025-01-10', status: 'completed', verified: true, attendance: 127 },
    ]
    const stored = [{ label: 'People Reached', value: 600, asOf: '2025-01-10' }]
    const errors = crossCheckCumulativeTotals(records, stored)
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('600')
    expect(errors[0]).toContain('127')
  })

  it('does not flag totals it cannot reconcile (no verified records yet)', () => {
    const records: ImpactRecordSource[] = [
      { date: '2025-01-10', status: 'completed', verified: false, attendance: 9999 },
    ]
    expect(crossCheckCumulativeTotals(records, [{ label: 'People Reached', value: 9999, asOf: '2025-01-10' }])).toEqual([])
  })

  it('flags a manual total that is missing its verifier or as-of date', () => {
    const records: ImpactRecordSource[] = [
      { date: '2025-01-10', status: 'completed', verified: true, attendance: 50 },
    ]
    const errors = crossCheckCumulativeTotals(records, [
      { label: 'People Reached', value: 50, asOf: '2025-01-10', basis: 'manual' },
      { label: 'Outreaches Completed', value: 1, basis: 'computed' },
    ])
    expect(errors).toEqual(
      expect.arrayContaining([
        expect.stringContaining('missing its verifier'),
        expect.stringContaining('missing its as-of date'),
      ]),
    )
  })
})

describe('pnpm validate:content against the content source', () => {
  it('passes for the bundled fixtures (no invented figures)', () => {
    expect(crossCheckCumulativeTotals(fixtureOutreaches(), fixtureImpactMetrics())).toEqual([])
  })

  it.skipIf(!hasSanityConfig())('passes for the live Sanity dataset', async () => {
    const docs = await fetchLiveImpactData()
    const errors = crossCheckCumulativeTotals(docs.records, docs.storedMetrics)
    expect(errors, errors.join('\n')).toEqual([])
  })
})

/** Reads the raw outreach + impactMetric documents when Sanity is configured. */
async function fetchLiveImpactData(): Promise<{
  records: ImpactRecordSource[]
  storedMetrics: Array<{ label: string; value: number; asOf?: string; basis?: string; verifiedBy?: string }>
}> {
  const dataless = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? '2025-01-01',
    useCdn: false,
  })

  const [outreaches, metrics] = await Promise.all([
    dataless.fetch<
      Array<{
        date: string
        status: string
        verifiedByOutreachManager?: boolean
        attendance?: number
        screened?: number
      }>
    >('*[_type == "outreach"] { date, status, verifiedByOutreachManager, attendance, screened }'),
    dataless.fetch<
      Array<{ label: string; value: number; asOf?: string; basis?: string; verifiedBy?: string }>
    >('*[_type == "impactMetric"] { label, value, asOf, basis, verifiedBy }'),
  ])

  return {
    records: outreaches
      .filter((o) => o.status === 'completed' || o.status === 'upcoming')
      .map((o) => ({
        date: o.date,
        status: o.status === 'completed' ? ('completed' as const) : ('upcoming' as const),
        verified: o.verifiedByOutreachManager === true,
        attendance: o.attendance,
        screened: o.screened,
      })),
    storedMetrics: metrics
      .filter((m) => Boolean(m.label) && typeof m.value === 'number')
      .map((m) => ({
        label: m.label,
        value: m.value,
        asOf: m.asOf,
        basis: m.basis,
        verifiedBy: m.verifiedBy,
      })),
  }
}