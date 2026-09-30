// ── Object types ──────────────────────────────────────────────────────────────
import { seo } from './objects/seo'
import { cta } from './objects/cta'
import { image } from './objects/image'
import { citation } from './objects/citation'
import { authorReviewerAttribution } from './objects/authorReviewerAttribution'
import { location } from './objects/location'
import { impactResult } from './objects/impactResult'
import { contactDetails } from './objects/contactDetails'
import { reviewRecord } from './objects/reviewRecord'
import { portableText } from './objects/portableText'

// ── Document types ────────────────────────────────────────────────────────────
import { siteSettings } from './documents/siteSettings'
import { homepage } from './documents/homepage'
import { page } from './documents/page'
import { article } from './documents/article'
import { foodProfile } from './documents/foodProfile'
import { quote } from './documents/quote'
import { outreach } from './documents/outreach'
import { program } from './documents/program'
import { person } from './documents/person'
import { impactMetric } from './documents/impactMetric'
import { impactMilestone } from './documents/impactMilestone'
import { resource } from './documents/resource'
import { partner } from './documents/partner'
import { category } from './documents/category'
import { event } from './documents/event'
import { redirect } from './documents/redirect'

export const schemaTypes = [
  // Objects
  seo,
  cta,
  image,
  citation,
  authorReviewerAttribution,
  location,
  impactResult,
  contactDetails,
  reviewRecord,
  portableText,
  // Documents
  siteSettings,
  homepage,
  page,
  article,
  foodProfile,
  quote,
  outreach,
  program,
  person,
  impactMetric,
  impactMilestone,
  resource,
  partner,
  category,
  event,
  redirect,
]
