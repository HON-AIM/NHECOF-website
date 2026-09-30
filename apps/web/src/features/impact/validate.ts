/**
 * Content validation — the logic behind `pnpm validate:content`.
 *
 * Cross-checks that any stored cumulative-impact figure equals the sum of the
 * published, verified outreach records it claims to represent (plan §6.7 and
 * phase-5 exit criterion). Mismatches fail the check so CI blocks publishing
 * unreconciled numbers.
 */

import {
  computeCumulativeImpacts,
  CUMULATIVE_METRIC_DEFS,
  type ImpactRecordSource,
} from './aggregate'

export interface StoredMetricLike {
  label: string
  value: number
  asOf?: string
  basis?: string
  verifiedBy?: string
}

/** Normalise a metric label for reconciliation ("People Reached" → "peoplereached"). */
export function normalizeMetricLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z]/g, '')
}

/** Return a list of human-readable problems (empty = consistent). */
export function crossCheckCumulativeTotals(
  records: ImpactRecordSource[],
  stored: StoredMetricLike[],
): string[] {
  const computed = computeCumulativeImpacts(records)
  const byKey = new Map(CUMULATIVE_METRIC_DEFS.map((def) => [normalizeMetricLabel(def.label), def]))
  const byLabel = new Map(computed.map((stat) => [normalizeMetricLabel(stat.label), stat]))
  const errors: string[] = []

  for (const metric of stored) {
    const key = normalizeMetricLabel(metric.label)
    if (!byKey.has(key)) continue // not a cumulative total we reconcile
    const canonical = byLabel.get(key)
    if (!canonical || canonical.value == null) continue // no verified records to compare against

    if (metric.value !== canonical.value) {
      errors.push(
        `"${metric.label}" is stored as ${metric.value} but the sum of verified outreach records is ${canonical.value} (as of ${canonical.asOf ?? 'unknown'}).`,
      )
    }
    if (metric.basis === 'manual' && !metric.verifiedBy) {
      errors.push(`Manual metric "${metric.label}" is missing its verifier.`)
    }
    if (!metric.asOf) {
      errors.push(`Cumulative metric "${metric.label}" is missing its as-of date.`)
    }
  }

  return errors
}