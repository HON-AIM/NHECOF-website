import { z } from 'zod'

/* ────────────────────────────────────────────────────────────────────────────
   Shared form schemas (plan §9.1).

   These single Zod schemas are the source of truth for BOTH the client
   (React Hook Form via `zodResolver`) and the server route handlers, so the
   browser and the server always validate the same rules.

   Telephone numbers are validated as Nigerian numbers in any of the three
   common formats (0803…, +234803…, 234803…) and normalised to E.164 (+234…).

   A hidden `website` honeypot field is present on every form. It is invisible
   to humans, so a real visitor always leaves it empty. If it arrives filled,
   the server treats the submission as spam.
   ──────────────────────────────────────────────────────────────────────────── */

import { CONTACT_SUBJECTS, NIGERIAN_STATES } from './constants'

/* ── Nigerian telephone ─────────────────────────────────────────────────────── */

/**
 * Zod string that validates a Nigerian phone number and normalises it to E.164.
 * Accepts `0803 123 4567`, `+2348031234567`, `2348031234567`, etc.
 * Returns an empty string for an empty input so callers can decide optionality.
 */
export const nigerianPhone = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const cleaned = value.replace(/[\s\-().]/g, '')
    if (cleaned === '') return ''

    if (!/^(\+?234|0)?[789][01]\d{8}$/.test(cleaned)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid Nigerian number, e.g. 0803 123 4567 or +2348031234567.',
      })
      return z.NEVER
    }

    const subscriber = cleaned.replace(/^0?(\+?234)?/, '')
    return `+234${subscriber.replace(/^0/, '')}`
  })

/** Optional Nigerian phone. Stored as E.164 (string) or absent. */
export const optionalNigerianPhone = z
  .union([z.literal(''), nigerianPhone])
  .optional()
  .transform((value) => (value && value !== '' ? value : undefined))

/** Required Nigerian phone (still normalised to E.164). */
export const requiredNigerianPhone = nigerianPhone.refine((value) => value !== '', {
  message: 'Enter a valid Nigerian number, e.g. 0803 123 4567 or +2348031234567.',
})

/* ── Shared field types ─────────────────────────────────────────────────────── */

export const email = z
  .string()
  .trim()
  .toLowerCase()
  .email('Enter a valid email address.')
  .max(120, 'Email must be under 120 characters.')

export const shortText = (label: string, { min = 2, max = 120 } = {}) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be under ${max} characters.`)

export const longText = (label: string, { min = 10, max = 4000 } = {}) =>
  z
    .string()
    .trim()
    .min(min, `${label} must be at least ${min} characters.`)
    .max(max, `${label} must be under ${max} characters.`)

/** Invisible honeypot. `optional()` so it never fails Zod — the server checks content. */
export const honeypot = z.string().trim().max(500).optional()

/** Privacy consent: must be explicitly ticked and linked to /privacy. */
export const consent = z.literal(true, {
  errorMap: () => ({ message: 'You must agree to the Privacy Policy to continue.' }),
})

/* ── General contact (plan §9.1) ────────────────────────────────────────────── */

export const contactSchema = z.object({
  name: shortText('Name', { min: 2, max: 100 }),
  email,
  telephone: optionalNigerianPhone,
  subject: z.enum(CONTACT_SUBJECTS),
  message: longText('Message', { min: 10, max: 4000 }),
  privacyConsent: consent,
  /** Optional source/referrer passed through the URL (?ref=…). */
  ref: z.string().trim().max(100).optional(),
  website: honeypot,
})

/* ── Outreach request (plan §9.1) ───────────────────────────────────────────── */

/** Field name lists per step, used for per-step validation in the wizard UI. */
export const OUTREACH_STEP_FIELDS: Record<number, string[]> = {
  1: ['organisationName', 'contactName', 'contactRole', 'email', 'telephone'],
  2: ['community', 'lga', 'state', 'audienceSize', 'targetAudience', 'venueAvailability'],
  3: ['healthConcerns', 'preferredDate', 'supportType'],
}

export const outreachRequestSchema = z.object({
  organisationName: shortText('Organisation or community name', { min: 2, max: 120 }),
  contactName: shortText('Contact person\u2019s name', { min: 2, max: 100 }),
  contactRole: shortText('Contact person\u2019s role', { min: 2, max: 100 }),
  email,
  telephone: requiredNigerianPhone,
  community: shortText('Community name', { min: 2, max: 120 }),
  lga: shortText('Local government area', { min: 2, max: 120 }),
  state: z.enum(NIGERIAN_STATES),
  audienceSize: z.enum(['Under 50', '50\u2013100', '101\u2013300', '301\u2013500', 'Over 500'] as const),
  targetAudience: z.enum(
    [
      'Women',
      'Men',
      'Children',
      'Adolescents',
      'Pregnant & nursing women',
      'Elderly',
      'People living with chronic conditions',
      'Mixed community',
      'Other',
    ] as const,
  ),
  venueAvailability: z.enum(
    [
      'Venue secured',
      'Venue likely available',
      'Need help finding a venue',
      'Not sure yet',
    ] as const,
  ),
  healthConcerns: longText('Main health or nutrition concerns', { min: 10, max: 2000 }),
  preferredDate: shortText('Preferred date or date range', { min: 3, max: 120 }),
  supportType: z.enum(
    [
      'Nutrition education session',
      'Health screening',
      'Training for health volunteers',
      'Educational materials',
      'Long-term programme support',
      'Other',
    ] as const,
  ),
  additionalInfo: z.string().trim().max(4000).optional(),
  privacyConsent: consent,
  website: honeypot,
})

/* ── Partnership enquiry (plan §9.1) ────────────────────────────────────────── */

export const partnershipSchema = z.object({
  organisation: shortText('Organisation name', { min: 2, max: 120 }),
  contactPerson: shortText('Contact person\u2019s name', { min: 2, max: 100 }),
  email,
  telephone: optionalNigerianPhone,
  partnershipInterest: z.enum(
    [
      'Host an outreach or programme',
      'Sponsor or fund a programme',
      'Provide venue or facilities',
      'Contribute expertise or professionals',
      'Media or communications partnership',
      'Research collaboration',
      'Distribute educational materials',
      'Other',
    ] as const,
  ),
  proposedContribution: longText('Proposed contribution or collaboration', { min: 10, max: 2000 }),
  message: z.string().trim().max(4000).optional(),
  privacyConsent: consent,
  website: honeypot,
})

/* ── Shared types (client + server) ─────────────────────────────────────────── */

export type ContactInput = z.input<typeof contactSchema>
export type ContactOutput = z.output<typeof contactSchema>
export type OutreachRequestInput = z.input<typeof outreachRequestSchema>
export type OutreachRequestOutput = z.output<typeof outreachRequestSchema>
export type PartnershipInput = z.input<typeof partnershipSchema>
export type PartnershipOutput = z.output<typeof partnershipSchema>

export type FormOutput = ContactOutput | OutreachRequestOutput | PartnershipOutput

/** The three live form types. The newsletter signup stays behind a flag. */
export const FORM_TYPES = ['contact', 'outreach-request', 'partnership'] as const
export type FormType = (typeof FORM_TYPES)[number]