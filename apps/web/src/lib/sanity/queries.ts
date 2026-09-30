import type { QueryParams } from '@sanity/client'
import type { PortableTextBlock } from '@portabletext/types'
import { sanityFetch } from '@/lib/sanity/fetch'
import { CACHE_TAGS, type CacheTag } from '@/lib/sanity/tags'
import type { SanityImage, SanitySlug, SeoMeta } from '@/features/home/queries'

/* ────────────────────────────────────────────────────────────────────────────
   Types
   ──────────────────────────────────────────────────────────────────────────── */

export interface PersonDoc {
  _id: string
  name: string
  slug: SanitySlug
  role: string
  qualifications?: string
  specialisation?: string
  photo?: SanityImage
  bio?: PortableTextBlock[]
  contact?: { email?: string; phone?: string; website?: string }
  isFounder?: boolean
  founderStatement?: string
  founderMotivation?: string
  professionalLinks?: Array<{ label: string; url: string }>
}

export interface ProgramDoc {
  _id: string
  title: string
  slug: SanitySlug
  summary: string
  description?: PortableTextBlock[]
  targetAudience?: string
  order?: number
  relatedOutreaches?: Array<{ title: string; slug: SanitySlug; date: string; status: string }>
}

export interface PageDoc {
  _id: string
  title: string
  slug: SanitySlug
  body?: PortableTextBlock[]
  featuredImage?: SanityImage
  seo?: SeoMeta
  publishedAt?: string
}

export interface SiteSettingsDoc {
  organisationName?: string
  tagline?: string
  contact?: { email?: string; phone?: string; address?: string; website?: string }
  socialLinks?: Record<string, string>
  medicalDisclaimer?: string
  editorialPolicy?: string
  registration?: { body?: string; number?: string; year?: string }
}

/* ────────────────────────────────────────────────────────────────────────────
   Safe fetch wrapper
   ──────────────────────────────────────────────────────────────────────────── */

async function safeFetch<T>(
  query: string,
  fallback: T,
  params?: QueryParams,
  tags: CacheTag[] = [CACHE_TAGS.siteSettings, CACHE_TAGS.homepage, CACHE_TAGS.navigation],
): Promise<T> {
  try {
    return await sanityFetch<T>(query, params ?? {}, { tags })
  } catch {
    return fallback
  }
}

/* ────────────────────────────────────────────────────────────────────────────
   Queries
   ──────────────────────────────────────────────────────────────────────────── */

export async function getSiteSettings(): Promise<SiteSettingsDoc | null> {
  return safeFetch<SiteSettingsDoc | null>(
    `*[_type == "siteSettings"][0]{
      organisationName,
      tagline,
      contact,
      socialLinks,
      medicalDisclaimer,
      editorialPolicy,
      registration,
    }`,
    null,
  )
}

export async function getFounder(): Promise<PersonDoc | null> {
  return safeFetch<PersonDoc | null>(
    `*[_type == "person" && isFounder == true][0]{
      _id, name, slug, role, qualifications, specialisation,
      photo, bio, contact,
      isFounder,
      founderStatement, founderMotivation,
      professionalLinks,
    }`,
    null,
  )
}

export async function getTeamAndAdvisers(): Promise<PersonDoc[]> {
  return safeFetch<PersonDoc[]>(
    `*[_type == "person" && isFounder != true && role in ["team", "adviser", "outreach-manager"]] | order(name asc){
      _id, name, slug, role, qualifications, specialisation, photo, bio,
    }`,
    [],
    // A person document is rendered as an author/reviewer byline on articles,
    // food profiles and outreach records.
    [CACHE_TAGS.articles, CACHE_TAGS.foods, CACHE_TAGS.outreaches, CACHE_TAGS.homepage, CACHE_TAGS.navigation],
  )
}

export async function getAllProgrammes(): Promise<ProgramDoc[]> {
  return safeFetch<ProgramDoc[]>(
    `*[_type == "program"] | order(order asc, _createdAt asc){
      _id, title, slug, summary, description, targetAudience, order,
      "relatedOutreaches": *[_type == "outreach" && references(^._id)] | order(date desc) [0...3]{
        title, slug, date, status
      },
    }`,
    [],
  )
}

export async function getProgrammeBySlug(slug: string): Promise<ProgramDoc | null> {
  return safeFetch<ProgramDoc | null>(
    `*[_type == "program" && slug.current == $slug][0]{
      _id, title, slug, summary, description, targetAudience, order,
      "relatedOutreaches": *[_type == "outreach" && references(^._id)] | order(date desc){
        title, slug, date, status, summary,
      },
    }`,
    null,
    { slug },
  )
}

export async function getPageBySlug(slug: string): Promise<PageDoc | null> {
  return safeFetch<PageDoc | null>(
    `*[_type == "page" && slug.current == $slug][0]{
      _id, title, slug, body, featuredImage, seo, publishedAt,
    }`,
    null,
    { slug },
  )
}
