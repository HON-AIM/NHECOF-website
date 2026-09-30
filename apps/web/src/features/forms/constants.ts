/* ────────────────────────────────────────────────────────────────────────────
   Form constants: option lists shared by schemas, page metadata and the
   multi-step outreach wizard.
   ──────────────────────────────────────────────────────────────────────────── */

/** Contact form subject options (plan §9.1 includes Volunteering + corrections). */
export const CONTACT_SUBJECTS = [
  'General enquiry',
  'Report a correction',
  'Volunteering',
  'Partnership',
  'Media',
  'Feedback',
  'Data removal request',
  'Other',
] as const

/** All 36 Nigerian states plus the Federal Capital Territory (plan §9.1). */
export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
  'FCT (Abuja)',
] as const

/** Contact subjects that map to a specific page route via ?subject=… */
export const SUBJECT_PREFILL: Record<string, string> = {
  volunteering: 'Volunteering',
  'report-a-correction': 'Report a correction',
  data: 'Data removal request',
  partnership: 'Partnership',
}

/** Max JSON body size for form submissions (bytes), enforced by the routes. */
export const MAX_FORM_BODY_BYTES = 50_000

/** Rate limit: submissions per hour per form per IP hash (plan §9.2). */
export const FORM_RATE_LIMIT = {
  max: 5,
  windowSeconds: 60 * 60,
} as const

/** Delivery record retention in days (documented 90-day retention job). */
export const DELIVERY_RECORD_RETENTION_DAYS = 90

/**
 * Fixed token used by the Turnstile test mode.
 * The client _widget_ emits this exact token when no site key is configured
 * (development/e2e), and the server accepts it only while in test mode
 * (no secret key / not live). Real deployments never see this token because
 * the real Turnstile script always issues a genuinely challenging token.
 */
export const TURNSTILE_TEST_TOKEN = 'nhecof-test-token'

/**
 * Honeypot field name. It is registered on every client schema (hidden field)
 * and re-checked on the server. Legit human users never see or touch it.
 */
export const HONEYPOT_FIELD = 'website'