import { TURNSTILE_TEST_TOKEN } from '@/features/forms/constants'

/**
 * Server-side Cloudflare Turnstile verification (plan §9.2).
 *
 * Test mode: when `TURNSTILE_SECRET_KEY` is absent (development/e2e, no live
 * env), the server accepts exactly the fixed test token produced by the
 * client widget in test mode. This keeps journeys green before credentials
 * exist while failing closed on any other token.
 *
 * Live mode: verifies the token against Cloudflare's siteverify endpoint.
 * The remote IP is passed through so Cloudflare can bind the challenge.
 */
export async function verifyTurnstileToken(token: string | null | undefined, ip: string): Promise<boolean> {
  if (!token) return false

  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret) {
    return token === TURNSTILE_TEST_TOKEN
  }

  try {
    const form = new URLSearchParams()
    form.set('secret', secret)
    form.set('response', token)
    form.set('remoteip', ip)
    form.set('idempotency_key', `${ip}:${Date.now()}`)

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
    })

    if (!response.ok) return false

    const payload = (await response.json()) as {
      success: boolean
      'error-codes'?: string[]
    }

    return payload.success === true
  } catch {
    // Network failure must never accidentally accept a challenge.
    return false
  }
}