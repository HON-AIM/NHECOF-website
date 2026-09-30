import { z } from 'zod'

// ── Schemas ────────────────────────────────────────────────────────────────────

/**
 * Required in production, optional in local dev and E2E.
 *
 * The form code has two deliberate, tested paths for email delivery and bot
 * protection: a real one (Resend + Turnstile verification) and a simulated one
 * used by `e2e/forms.spec.ts`. The simulated path is selected by the *absence*
 * of these variables, so a schema that hard-required them made the documented
 * E2E mode unrunnable — the dev server could not boot without credentials that
 * exist precisely so it does not send real mail.
 *
 * Gating on `NODE_ENV === 'production'` keeps the safety property that matters:
 * a Vercel Preview and Production deploy both run as `production`, so a
 * missing Resend key or Turnstile secret still fails fast there and loudly.
 * Only a developer machine and the CI test server get the relaxed schema.
 */
const isProduction = process.env.NODE_ENV === 'production'

/** Required in production, tolerated elsewhere. */
const productionOnly = <T extends z.ZodTypeAny>(schema: T) =>
  isProduction ? schema : schema.optional()

export const serverEnvSchema = z.object({
  SANITY_API_READ_TOKEN: z.string().min(1, 'Sanity API read token is required'),
  SANITY_REVALIDATE_SECRET: z.string().min(1, 'Sanity revalidation secret is required'),
  // Gates /api/draft/enable. Server-only and separate from the revalidate
  // secret so that leaking one (e.g. in a webhook payload screenshot) does not
  // also expose draft access.
  SANITY_PREVIEW_SECRET: z.string().min(1).optional(),
  RESEND_API_KEY: productionOnly(z.string().min(1, 'Resend API key is required')),
  CONTACT_RECIPIENT_EMAIL: z.string().email('Contact recipient must be a valid email'),
  OUTREACH_RECIPIENT_EMAIL: z.string().email('Outreach recipient must be a valid email'),
  PARTNERSHIP_RECIPIENT_EMAIL: z.string().email('Partnership recipient must be a valid email'),
  TURNSTILE_SECRET_KEY: productionOnly(z.string().min(1, 'Turnstile secret key is required')),
  UPSTASH_REDIS_REST_URL: z.string().url('Upstash Redis URL must be valid'),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1, 'Upstash Redis token is required'),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_ENVIRONMENT: z.string().min(1).optional(),
  SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
  // Public client-side equivalents. Only read when set; the SDK is lazy-loaded
  // so an unset DSN costs nothing and contacts nothing.
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_ENVIRONMENT: z.string().min(1).optional(),
  NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE: z.coerce.number().min(0).max(1).optional(),
  // Hostname of the chosen privacy-conscious analytics property, e.g.
  // 'nhecof.org'. Used to build the Content-Security-Policy allowlist so the
  // policy and the tracker cannot drift apart.
  NEXT_PUBLIC_ANALYTICS_HOST: z.string().min(1).optional(),
  NEXT_PUBLIC_ANALYTICS_PROVIDER: z
    .enum(['cloudflare', 'plausible', 'umami', 'none'])
    .optional()
    .default('none'),
  // Optional: email sender + delivery-failure fallback contact details
  FORMS_EMAIL_FROM: z.string().min(1).optional(),
  CONTACT_FALLBACK_EMAIL: z.string().email().optional(),
  CONTACT_FALLBACK_PHONE: z.string().min(1).optional(),
  CONTACT_FALLBACK_WHATSAPP: z.string().min(1).optional(),
})

export const publicEnvSchema = z.object({
  // Absent in local dev and E2E so the site serves bundled fixtures and the
  // Turnstile widget renders its stub. Required in production.
  NEXT_PUBLIC_SANITY_PROJECT_ID: productionOnly(z.string().min(1, 'Sanity project ID is required')),
  NEXT_PUBLIC_SANITY_DATASET: productionOnly(z.string().min(1, 'Sanity dataset is required')),
  NEXT_PUBLIC_SANITY_API_VERSION: z.string().min(1, 'Sanity API version is required'),
  NEXT_PUBLIC_SITE_URL: z.string().url('Site URL must be valid'),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: productionOnly(z.string().min(1, 'Turnstile site key is required')),
  NEXT_PUBLIC_ENABLE_PROGRAMME_DETAILS: z.enum(['true', 'false']).optional(),
  NEXT_PUBLIC_IS_LIVE: z.coerce.boolean().default(false),
})

// ── Types ──────────────────────────────────────────────────────────────────────

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type PublicEnv = z.infer<typeof publicEnvSchema>
export type Env = ServerEnv & PublicEnv

// ── Validation ─────────────────────────────────────────────────────────────────
// Lazy validation: runs on first call, then cached. Layout/page never call this,
// so `pnpm dev` starts fine without .env on a fresh clone.

let _cachedServerEnv: ServerEnv | null = null
let _cachedPublicEnv: PublicEnv | null = null
let _cachedEnv: Env | null = null

function formatZodErrors(error: z.ZodError, label: string): string[] {
  return error.issues.map(
    (issue) => `  ${label} ${issue.path.join('.')}: ${issue.message}`,
  )
}

export function getServerEnv(): ServerEnv {
  if (_cachedServerEnv) return _cachedServerEnv
  const result = serverEnvSchema.safeParse(process.env)
  if (!result.success) {
    const errors = formatZodErrors(result.error, 'SERVER')
    throw new Error(
      `Invalid server environment variables:\n${errors.join('\n')}\n\nCopy .env.example to .env and fill in the values.`,
    )
  }
  _cachedServerEnv = result.data
  return _cachedServerEnv
}

export function getPublicEnv(): PublicEnv {
  if (_cachedPublicEnv) return _cachedPublicEnv
  const result = publicEnvSchema.safeParse(process.env)
  if (!result.success) {
    const errors = formatZodErrors(result.error, 'PUBLIC')
    throw new Error(
      `Invalid public environment variables:\n${errors.join('\n')}\n\nCopy .env.example to .env and fill in the values.`,
    )
  }
  _cachedPublicEnv = result.data
  return _cachedPublicEnv
}

export function getEnv(): Env {
  if (_cachedEnv) return _cachedEnv
  if (typeof window !== 'undefined') {
    throw new Error('getEnv() can only be called on the server. Use getPublicEnv() in client components.')
  }
  const server = getServerEnv()
  const pub = getPublicEnv()
  _cachedEnv = { ...server, ...pub }
  return _cachedEnv
}
