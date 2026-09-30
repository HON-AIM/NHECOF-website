import type { QueryParams } from '@sanity/client'
import { sanityFetch } from '@/lib/sanity/fetch'
import { CACHE_TAGS } from '@/lib/sanity/tags'
import { useContentFixtures } from '@/lib/content/dataSource'
import {
  fixtureOutreaches,
  fixtureImpactMetrics,
  fixtureMilestones,
  type FixtureImpactMetric,
} from '@/lib/content/fixtures'
import {
  computeCumulativeImpacts,
  geographicTally,
  selectConsentedTestimonials,
  sortMilestones,
  sortOutreachList,
  type ImpactMilestoneSource,
  type ImpactStat,
} from './aggregate'

/* ────────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────────── */

export interface ImpactRow {
  _id: string
  title: string
  slug: string
  theme: string
  date: string
  status: 'upcoming' | 'completed'
  location?: { community?: string; lga?: string; state?: string }
  attendance?: number
  screened?: number
  verified: boolean
}

export interface ManualMetric {
  _id: string
  label: string
  value: number
  asOf: string
  verifiedBy: string
  unit?: string
  evidenceNote?: string
}

export interface ImpactStory {
  _id: string
  quote: string
  attribution: string
  sourceTitle?: string
}

export interface ImpactOverview {
  cumulative: ImpactStat[]
  manual: ManualMetric[]
  milestones: ImpactMilestoneSource[]
  perOutreach: ImpactRow[]
  geographic: Array<{ state: string; count: number }>
  stories: ImpactStory[]
}

/* ────────────────────────────────────────────────────────────────────────────
   GROQ — cumulative totals are computed from published, verified outreach
   documents (plan §6.7). The TS engine in `aggregate.ts` mirrors these numbers
   so the validator can cross-check stored totals against the record sums.
   ──────────────────────────────────────────────────────────────────────────── */

const VERIFIED_COMPLETED =
  '_type == "outreach" && status == "completed" && verifiedByOutreachManager == true'

const IMPACT_AGGREGATES = `{
  "peopleReached": sum(*[${VERIFIED_COMPLETED} && defined(attendance)].attendance),
  "peopleScreened": sum(*[${VERIFIED_COMPLETED} && defined(screened)].screened),
  "outreachEvents": count(*[${VERIFIED_COMPLETED}]),
  "asOf": max(*[${VERIFIED_COMPLETED}].date)
}`

interface GroqAggregates {
  peopleReached: number | null
  peopleScreened: number | null
  outreachEvents: number | null
  asOf: string | null
}

const MANUAL_METRICS = `
  *[_type == "impactMetric" && basis == "manual" && defined(verifiedBy) && defined(asOf)]
    | order(value desc) {
    _id,
    label,
    value,
    asOf,
    verifiedBy,
    unit,
    evidenceNote,
  }
`

const MILESTONES = `
  *[_type == "impactMilestone"] | order(date asc, order asc) {
    _id,
    title,
    date,
    description,
    order,
  }
`

const OUTREACH_ROWS = `
  *[_type == "outreach" && status in ["upcoming", "completed"]] {
    _id,
    title,
    "slug": slug.current,
    theme,
    date,
    status,
    attendance,
    screened,
    location,
    testimonials,
    "verified": verifiedByOutreachManager == true,
  }
`

async function safeFetch<T>(query: string, fallback: T, params?: QueryParams): Promise<T> {
  try {
    return await sanityFetch<T>(query, params ?? {}, {
      tags: [CACHE_TAGS.impact, CACHE_TAGS.outreaches, CACHE_TAGS.homepage],
    })
  } catch {
    return fallback
  }
}

function manualFromFixture(m: FixtureImpactMetric): ManualMetric | null {
  if (m.basis === 'manual' && m.verifiedBy && m.asOf) {
    return {
      _id: m._id,
      label: m.label,
      value: m.value,
      asOf: m.asOf,
      verifiedBy: m.verifiedBy,
      unit: m.unit,
      evidenceNote: m.evidenceNote,
    }
  }
  return null
}

export async function getImpactOverview(): Promise<ImpactOverview> {
  if (useContentFixtures()) {
    const records = fixtureOutreaches()
    const cumulative = computeCumulativeImpacts(records)
    const manual = fixtureImpactMetrics()
      .map(manualFromFixture)
      .filter((m): m is ManualMetric => m !== null)
    const milestones = sortMilestones(fixtureMilestones())
    const perOutreach = sortOutreachList(
      records.map((o) => ({
        _id: o._id,
        title: o.title,
        slug: o.slug.current,
        theme: o.theme,
        date: o.date,
        status: o.status,
        location: o.location,
        attendance: o.attendance,
        screened: o.screened,
        verified: o.verifiedByOutreachManager === true,
      })),
    )
    const stories = records
      .flatMap((o) =>
        selectConsentedTestimonials(o.testimonials).map((t) => ({
          _id: `${o._id}-${t.attribution}`,
          quote: t.quote ?? '',
          attribution: t.attribution ?? '',
          sourceTitle: o.title,
        })),
      )
      .filter((s) => s.quote && s.attribution)

    return {
      cumulative,
      manual,
      milestones,
      perOutreach,
      geographic: geographicTally(records),
      stories,
    }
  }

  const [aggregates, manual, milestones, rawRows] = await Promise.all([
    safeFetch<GroqAggregates>(
      IMPACT_AGGREGATES,
      { peopleReached: null, peopleScreened: null, outreachEvents: null, asOf: null },
    ),
    safeFetch<ManualMetric[]>(MANUAL_METRICS, []),
    safeFetch<ImpactMilestoneSource[]>(MILESTONES, []),
    safeFetch<
      Array<ImpactRow & { testimonials: Array<{ quote: string; attribution: string; consentObtained?: boolean }> }>
    >(OUTREACH_ROWS, []),
  ])

  const rows = sortOutreachList(rawRows)
  const tsStats = computeCumulativeImpacts(rows)

  // GROQ is the source of truth for the sums; the TS engine mirrors the
  // remainder so both stay consistent with the canonical spec.
  const cumulative: ImpactStat[] = tsStats.map((s) => {
    if (s.key === 'peopleReached' && aggregates.peopleReached != null) {
      return { ...s, value: aggregates.peopleReached, asOf: aggregates.asOf ?? s.asOf }
    }
    if (s.key === 'peopleScreened' && aggregates.peopleScreened != null) {
      return { ...s, value: aggregates.peopleScreened, asOf: aggregates.asOf ?? s.asOf }
    }
    if (s.key === 'outreachEvents' && aggregates.outreachEvents != null) {
      return { ...s, value: aggregates.outreachEvents, asOf: aggregates.asOf ?? s.asOf }
    }
    return s
  })

  const stories = rawRows
    .flatMap((o) =>
      selectConsentedTestimonials(o.testimonials).map((t) => ({
        _id: `${o._id}-${t.attribution}`,
        quote: t.quote ?? '',
        attribution: t.attribution ?? '',
        sourceTitle: o.title,
      })),
    )
    .filter((s) => s.quote && s.attribution)

  return {
    cumulative,
    manual,
    milestones: sortMilestones(milestones),
    perOutreach: rows,
    geographic: geographicTally(rows),
    stories,
  }
}