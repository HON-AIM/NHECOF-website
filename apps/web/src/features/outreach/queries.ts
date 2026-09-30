import type { PortableTextBlock } from '@portabletext/types'
import type { QueryParams } from '@sanity/client'
import { sanityFetch } from '@/lib/sanity/fetch'
import { CACHE_TAGS } from '@/lib/sanity/tags'
import type { SanityImage, SanitySlug } from '@/features/home/queries'
import { useContentFixtures } from '@/lib/content/dataSource'
import { fixtureOutreaches, type FixtureOutreach } from '@/lib/content/fixtures'
import { sortOutreachList } from '@/features/impact/aggregate'

export interface OutreachResultItem {
  label: string
  value: string
}

export interface OutreachTestimonial {
  quote: string
  attribution: string
  consentObtained?: boolean
}

export interface OutreachVolunteer {
  name: string
  role?: string
  qualifications?: string
}

export interface OutreachPartner {
  name: string
  slug: string
  logo?: SanityImage
  website?: string
  type?: string
}

export interface OutreachRelatedResource {
  title: string
  slug: string
  type?: string
  description?: string
  externalUrl?: string
  fileUrl?: string
}

export interface OutreachDoc {
  _id: string
  title: string
  slug: SanitySlug
  theme: string
  date: string
  summary: string
  venue?: string
  location?: { community?: string; lga?: string; state?: string }
  objectives?: PortableTextBlock[]
  targetPopulation?: string
  activities?: PortableTextBlock[]
  attendance?: number
  screened?: number
  results?: OutreachResultItem[]
  volunteers?: OutreachVolunteer[]
  partners?: OutreachPartner[]
  outcomes?: PortableTextBlock[]
  followUp?: string
  images?: SanityImage[]
  testimonials?: OutreachTestimonial[]
  relatedResource?: OutreachRelatedResource
  status: 'upcoming' | 'completed'
  verified: boolean
}

export interface OutreachFilters {
  year?: string
  state?: string
  programme?: string
}

export interface OutreachFilterOptions {
  years: string[]
  states: string[]
  programmes: string[]
}

async function safeFetch<T>(query: string, fallback: T, params?: QueryParams): Promise<T> {
  try {
    return await sanityFetch<T>(query, params ?? {}, {
      tags: [CACHE_TAGS.outreaches, CACHE_TAGS.impact, CACHE_TAGS.homepage],
    })
  } catch {
    return fallback
  }
}

/** URL-safe programme slug derived from the outreach theme (matches `?programme=`). */
export function programmeSlug(theme: string): string {
  return theme
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function adaptOutreach(o: FixtureOutreach): OutreachDoc {
  return {
    _id: o._id,
    title: o.title,
    slug: { _type: 'slug', current: o.slug.current },
    theme: o.theme,
    date: o.date,
    summary: o.summary,
    venue: o.venue,
    location: o.location,
    objectives: o.objectives,
    targetPopulation: o.targetPopulation,
    activities: o.activities,
    attendance: o.attendance,
    screened: o.screened,
    results: o.results?.map((r) => ({ label: r.label, value: String(r.value) })),
    volunteers: o.volunteers,
    partners: o.partners as OutreachPartner[] | undefined,
    outcomes: o.outcomes,
    followUp: o.followUp,
    images: (o.images ?? []) as SanityImage[],
    testimonials: o.testimonials,
    relatedResource: o.relatedResource,
    status: o.status,
    verified: o.verifiedByOutreachManager === true,
  }
}

function matchesFilters(o: { date: string; location?: { state?: string }; theme: string }, filters: OutreachFilters): boolean {
  if (filters.year && !o.date.startsWith(filters.year)) return false
  if (filters.state && o.location?.state !== filters.state) return false
  if (filters.programme && programmeSlug(o.theme) !== filters.programme) return false
  return true
}

const OUTREACH_PROJECTION = `
  _id,
  title,
  slug,
  theme,
  date,
  summary,
  venue,
  location,
  objectives,
  targetPopulation,
  activities,
  attendance,
  screened,
  results,
  "volunteers": volunteers[]->{
    name,
    "role": coalesce(role, ""),
    "qualifications": coalesce(qualifications, ""),
  },
  "partners": partners[]->{ name, slug, logo, website, type },
  outcomes,
  followUp,
  images,
  testimonials,
  "relatedResource": relatedResource->{
    title,
    slug,
    type,
    description,
    externalUrl,
    "fileUrl": file.asset->url,
  },
  status,
  "verified": verifiedByOutreachManager == true,
`

export async function getApprovedOutreaches(
  filters: OutreachFilters = {},
): Promise<{ outreaches: OutreachDoc[]; total: number }> {
  if (useContentFixtures()) {
    const items = sortOutreachList(
      fixtureOutreaches()
        .filter((o) => o.status === 'upcoming' || o.status === 'completed')
        .filter((o) => matchesFilters(o, filters)),
    )
    return { outreaches: items.map(adaptOutreach), total: items.length }
  }

  const params: QueryParams = {}
  const conds = ['_type == "outreach"', 'status in ["upcoming", "completed"]']
  if (filters.year) {
    conds.push('date >= $yearStart && date < $yearEnd')
    params.yearStart = `${filters.year}-01-01`
    params.yearEnd = `${Number(filters.year) + 1}-01-01`
  }
  if (filters.state) {
    conds.push('location.state == $state')
    params.state = filters.state
  }
  if (filters.programme) {
    conds.push('string::lower(theme) match $programme')
    params.programme = `*${filters.programme.replace(/-/g, ' ')}*`
  }

  // Fetch newest (incl. upcoming, future-dated) records first so the slice
  // keeps upcoming events in the window, then apply the canonical archive
  // order in JS to mirror `sortOutreachList` in the fixture branch.
  const items = await safeFetch<OutreachDoc[]>(
    `*[${conds.join(' && ')}] | order(date desc) [0...200]{
      ${OUTREACH_PROJECTION}
    }`,
    [],
    params,
  )

  const sorted = items.sort((a, b) => {
    if (a.status !== b.status) return a.status === 'upcoming' ? -1 : 1
    return a.status === 'upcoming'
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date)
  })

  return { outreaches: sorted, total: sorted.length }
}

export async function getOutreachBySlug(slug: string): Promise<OutreachDoc | null> {
  if (useContentFixtures()) {
    const found = fixtureOutreaches().find(
      (o) => o.slug.current === slug && (o.status === 'upcoming' || o.status === 'completed'),
    )
    return found ? adaptOutreach(found) : null
  }
  return safeFetch<OutreachDoc | null>(
    `*[_type == "outreach" && slug.current == $slug && status in ["upcoming", "completed"]][0]{
      ${OUTREACH_PROJECTION}
    }`,
    null,
    { slug },
  )
}

export async function getOutreachFilterOptions(): Promise<OutreachFilterOptions> {
  const all = await getApprovedOutreaches()
  const years = [...new Set(all.outreaches.map((o) => o.date.slice(0, 4)))]
    .filter(Boolean)
    .sort((a, b) => b.localeCompare(a))
  const states = [...new Set(all.outreaches.map((o) => o.location?.state))]
    .map((s) => s?.trim())
    .filter((s): s is string => Boolean(s))
    .sort((a, b) => a.localeCompare(b))
  const programmes = [...new Set(all.outreaches.map((o) => programmeSlug(o.theme)))]
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
  return { years, states, programmes }
}