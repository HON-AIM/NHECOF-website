import { describe, it, expect } from 'vitest'

describe('env schemas', () => {
  it('serverEnvSchema validates all expected keys', async () => {
    const { serverEnvSchema } = await import('../src/env')
    const keys = Object.keys(serverEnvSchema.shape)
    expect(keys).toContain('SANITY_API_READ_TOKEN')
    expect(keys).toContain('SANITY_REVALIDATE_SECRET')
    expect(keys).toContain('RESEND_API_KEY')
    expect(keys).toContain('CONTACT_RECIPIENT_EMAIL')
    expect(keys).toContain('OUTREACH_RECIPIENT_EMAIL')
    expect(keys).toContain('PARTNERSHIP_RECIPIENT_EMAIL')
    expect(keys).toContain('TURNSTILE_SECRET_KEY')
    expect(keys).toContain('UPSTASH_REDIS_REST_URL')
    expect(keys).toContain('UPSTASH_REDIS_REST_TOKEN')
    expect(keys).toContain('SENTRY_DSN')
  })

  it('publicEnvSchema validates all expected keys', async () => {
    const { publicEnvSchema } = await import('../src/env')
    const keys = Object.keys(publicEnvSchema.shape)
    expect(keys).toContain('NEXT_PUBLIC_SANITY_PROJECT_ID')
    expect(keys).toContain('NEXT_PUBLIC_SANITY_DATASET')
    expect(keys).toContain('NEXT_PUBLIC_SANITY_API_VERSION')
    expect(keys).toContain('NEXT_PUBLIC_SITE_URL')
    expect(keys).toContain('NEXT_PUBLIC_TURNSTILE_SITE_KEY')
    expect(keys).toContain('NEXT_PUBLIC_IS_LIVE')
  })

  it('publicEnvSchema defaults NEXT_PUBLIC_IS_LIVE to false', async () => {
    const { publicEnvSchema } = await import('../src/env')
    const result = publicEnvSchema.safeParse({
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'test',
      NEXT_PUBLIC_SANITY_DATASET: 'test',
      NEXT_PUBLIC_SANITY_API_VERSION: 'test',
      NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'test',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.NEXT_PUBLIC_IS_LIVE).toBe(false)
    }
  })

  /**
   * The form code selects its simulated email/bot-protection path by the
   * *absence* of RESEND_API_KEY and TURNSTILE_SECRET_KEY (see e2e/forms.spec.ts).
   * If the schema hard-required them, the dev server could not boot without real
   * credentials — which is exactly what the E2E run exists to avoid. These
   * tests pin that behaviour so it cannot regress silently.
   */
  describe('development and E2E tolerance', () => {
    const isProduction = process.env.NODE_ENV === 'production'

    it('accepts a complete server environment', async () => {
      const { serverEnvSchema } = await import('../src/env')
      const result = serverEnvSchema.safeParse({
        SANITY_API_READ_TOKEN: 'test',
        SANITY_REVALIDATE_SECRET: 'test',
        RESEND_API_KEY: 'test',
        CONTACT_RECIPIENT_EMAIL: 'test@example.com',
        OUTREACH_RECIPIENT_EMAIL: 'test@example.com',
        PARTNERSHIP_RECIPIENT_EMAIL: 'test@example.com',
        TURNSTILE_SECRET_KEY: 'test',
        UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
        UPSTASH_REDIS_REST_TOKEN: 'test',
      })
      expect(result.success).toBe(true)
    })

    it.runIf(!isProduction)(
      'omitting Resend and Turnstile is allowed outside production',
      async () => {
        const { serverEnvSchema } = await import('../src/env')
        const result = serverEnvSchema.safeParse({
          SANITY_API_READ_TOKEN: 'test',
          SANITY_REVALIDATE_SECRET: 'test',
          CONTACT_RECIPIENT_EMAIL: 'test@example.com',
          OUTREACH_RECIPIENT_EMAIL: 'test@example.com',
          PARTNERSHIP_RECIPIENT_EMAIL: 'test@example.com',
          UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
          UPSTASH_REDIS_REST_TOKEN: 'test',
        })
        expect(
          result.success,
          `expected the simulated-delivery environment to validate: ${JSON.stringify(
            result.success ? {} : result.error.issues,
          )}`,
        ).toBe(true)
      },
    )

    it.runIf(!isProduction)('omitting the Sanity and Turnstile public keys is allowed', async () => {
      const { publicEnvSchema } = await import('../src/env')
      const result = publicEnvSchema.safeParse({
        NEXT_PUBLIC_SANITY_API_VERSION: '2024-01-01',
        NEXT_PUBLIC_SITE_URL: 'http://localhost:3000',
      })
      expect(result.success).toBe(true)
    })

    it('always requires the Sanity read token and revalidation secret', async () => {
      // These are security-critical and must never be relaxed: without them the
      // preview is unauthenticated and the webhook accepts forged requests.
      const { serverEnvSchema } = await import('../src/env')
      for (const key of ['SANITY_API_READ_TOKEN', 'SANITY_REVALIDATE_SECRET']) {
        const result = serverEnvSchema.safeParse({
          SANITY_API_READ_TOKEN: 'test',
          SANITY_REVALIDATE_SECRET: 'test',
          CONTACT_RECIPIENT_EMAIL: 'test@example.com',
          OUTREACH_RECIPIENT_EMAIL: 'test@example.com',
          PARTNERSHIP_RECIPIENT_EMAIL: 'test@example.com',
          UPSTASH_REDIS_REST_URL: 'https://test.upstash.io',
          UPSTASH_REDIS_REST_TOKEN: 'test',
          [key]: undefined,
        })
        expect(result.success, `${key} must remain required`).toBe(false)
      }
    })
  })
})
