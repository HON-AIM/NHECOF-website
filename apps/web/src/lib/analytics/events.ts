/**
 * Analytics event vocabulary (plan §17).
 *
 * Every event is defined here as a schema, not a free-form string, so that:
 *  - the allowed properties are enumerable and reviewable;
 *  - `sanitiseEvent` can strip anything not in the schema;
 *  - an editor or developer cannot accidentally start sending personal data.
 *
 * Privacy rules enforced below
 * ----------------------------
 * 1. **No personal data, ever.** A search query is the main risk: someone may
 *    type a medical condition, a name, or a phone number into the search box.
 *    Queries are therefore truncated and scrubbed rather than forwarded raw.
 * 2. **No free-text fields.** Every property is an enum, a slug, a number or a
 *    boolean. There is deliberately no `string` property type.
 * 3. **Identifiers are content slugs, not user ids.** A slug is public in the
 *    URL; a user id is not.
 */

export type AnalyticsEventName =
  | 'article_viewed'
  | 'food_profile_viewed'
  | 'search_performed'
  | 'filter_applied'
  | 'resource_downloaded'
  | 'outreach_viewed'
  | 'outreach_request_completed'
  | 'partnership_enquiry_completed'
  | 'volunteer_interest'
  | 'newsletter_signup'

type PropertyType = 'slug' | 'enum' | 'number' | 'boolean'

interface PropertySpec {
  type: PropertyType
  /** Allowed values when type is 'enum'. */
  values?: readonly string[]
  maxLength?: number
}

export interface EventSpec {
  readonly properties: Readonly<Record<string, PropertySpec>>
}

const CONTENT_TYPES = ['article', 'foodProfile', 'outreach', 'resource', 'quote'] as const

export const ANALYTICS_EVENTS: Readonly<Record<AnalyticsEventName, EventSpec>> = {
  article_viewed: {
    properties: {
      slug: { type: 'slug' },
      hasReviewer: { type: 'boolean' },
      readingTimeMinutes: { type: 'number' },
      topic: { type: 'enum', values: ['basics', 'nigerian-foods', 'life-stage', 'conditions', 'healthy-living', 'food-safety', 'myths'] },
    },
  },
  food_profile_viewed: {
    properties: {
      slug: { type: 'slug' },
      foodGroup: { type: 'enum', values: ['staple', 'protein', 'vegetable', 'fruit', 'fat', 'dairy', 'legume', 'beverage', 'other'] },
    },
  },
  search_performed: {
    /*
     * `queryLength` and `resultCount` instead of the query text.
     *
     * This is the most important privacy decision in the whole analytics setup.
     * Nutrition searches can contain health conditions ("diabetes diet"), and
     * a raw query is both personal data and, in aggregate, a re-identification
     * risk for small communities. Length plus result count answers the
     * operational question ("is the index finding anything?") without recording
     * what people are looking for.
     */
    properties: {
      queryLength: { type: 'number' },
      resultCount: { type: 'number' },
      scope: { type: 'enum', values: ['nutrition', 'foods', 'articles', 'all'] },
      hadNoResults: { type: 'boolean' },
    },
  },
  filter_applied: {
    properties: {
      facet: { type: 'enum', values: ['topic', 'contentType', 'audience', 'condition', 'foodGroup', 'year', 'state', 'programme', 'sort'] },
      value: { type: 'enum', values: ['applied', 'cleared'] },
      resultCount: { type: 'number' },
    },
  },
  resource_downloaded: {
    properties: {
      slug: { type: 'slug' },
      resourceType: { type: 'enum', values: ['guide', 'infographic', 'report', 'toolkit', 'other'] },
      fileType: { type: 'enum', values: ['pdf', 'docx', 'xlsx', 'csv', 'other'] },
    },
  },
  outreach_viewed: {
    properties: {
      slug: { type: 'slug' },
      state: { type: 'enum', values: ['lagos', 'ogun', 'oyo', 'osun', 'kwara', 'fct', 'other'] },
      status: { type: 'enum', values: ['completed', 'upcoming'] },
    },
  },
  outreach_request_completed: {
    /*
     * Success is recorded as a form outcome, never the submitted content. No
     * community name, no contact person, no audience size — those arrive by
     * email and belong in the mailbox, not an analytics vendor.
     */
    properties: {
      supportType: { type: 'enum', values: ['outreach', 'screening', 'training', 'materials', 'other'] },
    },
  },
  partnership_enquiry_completed: {
    properties: {
      interest: { type: 'enum', values: ['funding', 'in-kind', 'research', 'referral', 'co-delivery', 'other'] },
    },
  },
  volunteer_interest: {
    properties: {
      role: { type: 'enum', values: ['nutritionist', 'clinician', 'logistics', 'admin', 'communications', 'other'] },
    },
  },
  newsletter_signup: {
    properties: {
      method: { type: 'enum', values: ['footer', 'article', 'homepage'] },
    },
  },
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const MAX_SLUG_LENGTH = 120

/**
 * Coerce and validate an event before it leaves the browser.
 *
 * Unknown event names are dropped entirely. Properties that are not in the
 * schema are dropped. Properties whose value fails validation are dropped
 * rather than coerced, so a bug shows up as missing data rather than as
 * corrupted data.
 */
export function sanitiseEvent(
  name: string,
  properties: Record<string, unknown> = {},
): { name: AnalyticsEventName; properties: Record<string, string | number | boolean> } | null {
  if (!isKnownEvent(name)) return null

  const spec = ANALYTICS_EVENTS[name]
  const out: Record<string, string | number | boolean> = {}

  for (const [key, raw] of Object.entries(properties)) {
    const propSpec = spec.properties[key]
    if (!propSpec) continue

    const value = coerce(propSpec, raw)
    if (value !== undefined) out[key] = value
  }

  return { name, properties: out }
}

function isKnownEvent(name: string): name is AnalyticsEventName {
  return Object.prototype.hasOwnProperty.call(ANALYTICS_EVENTS, name)
}

function coerce(
  spec: PropertySpec,
  raw: unknown,
): string | number | boolean | undefined {
  switch (spec.type) {
    case 'boolean':
      return typeof raw === 'boolean' ? raw : undefined

    case 'number':
      return typeof raw === 'number' && Number.isFinite(raw) ? raw : undefined

    case 'enum': {
      if (typeof raw !== 'string') return undefined
      if (!spec.values) return raw
      return spec.values.includes(raw) ? raw : undefined
    }

    case 'slug': {
      if (typeof raw !== 'string') return undefined
      const trimmed = raw.trim().toLowerCase()
      if (!trimmed || trimmed.length > (spec.maxLength ?? MAX_SLUG_LENGTH)) return undefined
      return SLUG_PATTERN.test(trimmed) ? trimmed : undefined
    }

    default:
      return undefined
  }
}

export const CONTENT_TYPE_VALUES = CONTENT_TYPES
