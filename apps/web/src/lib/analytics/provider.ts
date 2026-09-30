/**
 * Analytics transport (no React).
 *
 * Provider decision
 * -----------------
 * Three credible options were considered. The recommendation is
 * **Cloudflare Web Analytics**, configured by default, with Plausible and Umami
 * supported by flipping one environment variable.
 *
 * | Provider | Cost | Cookies / consent | Data residency | Custom events | Fits NHECOF? |
 * |---|---|---|---|---|---|
 * | Cloudflare Web Analytics | Free, unlimited | None, cookieless, no consent banner | Cloudflare (global) | Yes | **Yes** — NHECOF already depends on Cloudflare for Turnstile, so there is no new vendor, no new contract and no additional data processor to disclose. |
 * | Plausible | Free to 10k pageviews/mo, then from ~$9/mo per 10k | None, cookieless | EU or self-host by default | Yes | Viable; strongest privacy reputation and simplest hosted setup. Costs money once traffic grows and adds a second analytics vendor. |
 * | Umami | Free if self-hosted; ~$20/mo hosted | None, cookieless | **Under NHECOF's control** if self-hosted | Yes | Best privacy and full data ownership, but self-hosting adds a database, backups and uptime monitoring — real ongoing cost for a small NGO. |
 *
 * Trade-off accepted by choosing Cloudflare: the data sits with Cloudflare, so
 * NHECOF cannot query it directly and cannot fully delete it. In exchange there
 * is no cost, no vendor negotiation and no extra privacy disclosure. If raw
 * data ownership is needed later, switching to self-hosted Umami is a
 * configuration change, not a code change.
 *
 * Custom events
 * -------------
 * Cloudflare Web Analytics measures page views only; it exposes no public
 * custom-event API. Rather than pretend otherwise, every provider's custom
 * events are relayed through NHECOF's own `/api/analytics` endpoint, which
 * validates the event against the schema, forwards to the vendor when the
 * vendor accepts custom events (Plausible, Umami), and for Cloudflare records
 * the event server-side only. The client never speaks to a vendor directly for
 * custom events, so the schema is enforced in one place and a new call site
 * cannot invent an event or smuggle free text into a log.
 *
 * Every event is passed through `sanitiseEvent` before transmission, so a
 * search box can never leak a query string and a new call site cannot invent an
 * event name.
 */

import { sanitiseEvent, type AnalyticsEventName } from './events'

export type AnalyticsProviderName = 'cloudflare' | 'plausible' | 'umami' | 'none'

declare global {
  interface Window {
    plausible?: (event: string, options?: { props?: Record<string, unknown> }) => void
    umami?: { track: (event: string, data?: Record<string, unknown>) => void }
  }
}

export function getProvider(): AnalyticsProviderName {
  const value = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER
  return value === 'cloudflare' || value === 'plausible' || value === 'umami' ? value : 'none'
}

export function getAnalyticsHost(): string | undefined {
  return process.env.NEXT_PUBLIC_ANALYTICS_HOST
}

/** External script URL for the configured provider, or null when disabled. */
export function getScriptUrl(): string | null {
  const host = getAnalyticsHost()
  switch (getProvider()) {
    case 'cloudflare':
      return 'https://static.cloudflareinsights.com/beacon.min.js'
    case 'plausible':
      return host ? `https://${host.replace(/^https?:\/\//, '')}/js/script.js` : null
    case 'umami':
      return host ? `${host.replace(/\/$/, '')}/script.js` : null
    default:
      return null
  }
}

/** First-party endpoint that validates and relays custom events. */
const RELAY_ENDPOINT = '/api/analytics'

/**
 * Send one event. Safe to call from anywhere: invalid events are dropped rather
 * than thrown, so a tracking bug can never break a render or a form.
 */
export function track(event: string, properties: Record<string, unknown> = {}): void {
  if (typeof window === 'undefined') return

  const sanitised = sanitiseEvent(event, properties)
  if (!sanitised) return

  // A single path for every provider. Sending to the vendor from here would
  // mean the schema is only enforced in the browser, where it can be edited,
  // and would put third-party origins in the client for no benefit.
  const body = JSON.stringify({ name: sanitised.name, properties: sanitised.properties })

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(RELAY_ENDPOINT, new Blob([body], { type: 'application/json' }))
      return
    }
    void fetch(RELAY_ENDPOINT, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {
      // Analytics must never surface an error to a visitor.
    })
  } catch {
    // Ignore: a blocked or failing analytics request is not the visitor's problem.
  }
}

/** True when a provider is configured, so callers can skip no-op tracking. */
export function isAnalyticsEnabled(): boolean {
  return getProvider() !== 'none'
}

export type { AnalyticsEventName }
