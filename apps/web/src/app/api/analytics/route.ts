import { NextResponse } from 'next/server'

import { sanitiseEvent } from '@/lib/analytics/events'
import { getAnalyticsHost, getProvider } from '@/lib/analytics/provider'

export const dynamic = 'force-dynamic'

/**
 * First-party custom-event relay.
 *
 * Why this exists: Cloudflare Web Analytics, the default provider, measures
 * page views only and exposes no public custom-event API. Calling a function
 * that does not exist would have made the section 17 events silently vanish
 * while still appearing "wired up" in the code. So custom events are relayed
 * here instead, and the vendor — if it accepts custom events at all — is a
 * downstream detail of this one endpoint.
 *
 * Privacy properties, in order of importance:
 *  1. The event name must exist in the shared schema. An unknown event is a 400.
 *  2. Every property is re-sanitised **server-side**. The browser is not trusted
 *     to have done it, and this is the only place the schema is enforced for
 *     anything not page-view traffic.
 *  3. There is deliberately no free-text property type, so a query string, a
 *     name or a message cannot be smuggled in as a "string" field.
 *  4. No IP, user agent, referrer or session id is read or forwarded. Vercel
 *     still logs the request line; this handler adds nothing to it.
 *  5. Forwarding failures are swallowed: a visitor's form submission or page
 *     render must not fail because analytics is unreachable.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null

  if (typeof body?.name !== 'string') {
    return NextResponse.json({ ok: false, error: 'name is required' }, { status: 400 })
  }

  const properties =
    body.properties && typeof body.properties === 'object' && !Array.isArray(body.properties)
      ? (body.properties as Record<string, unknown>)
      : {}

  // Authoritative validation happens here, not in the browser.
  const sanitised = sanitiseEvent(body.name, properties)
  if (!sanitised) {
    return NextResponse.json({ ok: false, error: 'Unknown event' }, { status: 400 })
  }

  // Structured and greppable. Safe to log: enum/slug/number/boolean only.
  console.log(
    `[analytics] event=${sanitised.name} ${JSON.stringify(sanitised.properties)} provider=${getProvider()}`,
  )

  // Plausible and Umami both accept custom events. Cloudflare does not, so for
  // that provider the server log above is the record.
  const provider = getProvider()
  if ((provider === 'plausible' || provider === 'umami') && getAnalyticsHost()) {
    try {
      await forwardToProvider(provider, sanitised.name, sanitised.properties)
    } catch {
      // Already recorded locally; a vendor outage must not surface.
    }
  }

  // 204 must not carry a body; `NextResponse.json(..., { status: 204 })` throws.
  return new NextResponse(null, { status: 204 })
}

async function forwardToProvider(
  provider: 'plausible' | 'umami',
  name: string,
  properties: Record<string, string | number | boolean>,
): Promise<void> {
  const host = getAnalyticsHost() as string
  const base = host.replace(/\/$/, '').replace(/^https?:\/\//, '')

  // Umami accepts a POST to its own collect endpoint; Plausible's hosted
  // ingest endpoint is reached through its proxy path. Both are fire-and-forget.
  const url = provider === 'umami' ? `https://${base}/api/send` : `https://${base}/api/event`

  await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name, data: properties, props: properties }),
    signal: AbortSignal.timeout(3000),
  })
}
