import { test, expect, type Page } from '@playwright/test'

/**
 * Third-party/network hygiene (audit: Turnstile is forms-route-local; Sentry is
 * not installed; fonts are self-hosted via next/font).
 *
 * - Any request leaving the origin must hit the allowlist below.
 * - No analytics/tracker/Sentry payloads anywhere.
 * - Cloudflare Turnstile is fetched only on the three form routes, and only in
 *   real mode (NEXT_PUBLIC_TURNSTILE_SITE_KEY set). In test mode the widget
 *   mounts a stub with no external script.
 */

test.setTimeout(90_000)

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'https://cdn.sanity.io',
  'https://challenges.cloudflare.com',
  'https://www.google.com',
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
]

const FORM_ROUTES = ['/contact', '/partner', '/request-an-outreach']
const NON_FORM_ROUTES = ['/', '/impact', '/nutrition', '/about', '/resources']

function isExternal(url: string): string | null {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === 'data:' || parsed.protocol === 'file:') return null
    return parsed.origin
  } catch {
    return null
  }
}

/** Collect external origins + tracker markers during a single navigation. */
async function scanPage(page: Page, path: string) {
  const origins = new Set<string>()
  const turnstileHit = { fired: false }
  const listener = (request: { url: () => string }) => {
    const origin = isExternal(request.url())
    if (origin) {
      origins.add(origin)
      if (origin.includes('challenges.cloudflare.com')) turnstileHit.fired = true
    }
  }
  page.on('request', listener)
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  // Give client hydration a beat so widget-injected scripts register.
  await page.waitForTimeout(1200)
  page.off('request', listener)

  const scriptSrcs = await page.evaluate(() => Array.from(document.scripts).map((s) => s.src))
  const stubNote = await page.evaluate(() =>
    Array.from(document.querySelectorAll('p[role="note"]')).some((p) =>
      /form protection test mode/i.test(p.textContent || ''),
    ),
  )
  return { origins, scriptSrcs, turnstileHit, stubNote }
}

for (const path of [...NON_FORM_ROUTES, ...FORM_ROUTES]) {
  test(`third-party allowlist holds on ${path}`, async ({ page }) => {
    const { origins, scriptSrcs } = await scanPage(page, path)
    const offenders = [...origins].filter((origin) => !ALLOWED_ORIGINS.includes(origin))
    expect(offenders, `off-origin requests on ${path}: ${offenders.join(', ')}`).toEqual([])

    const flagged = scriptSrcs.filter((src) => /sentry|googletagmanager|gtag|fullstory|mixpanel|amplitude/.test(src))
    expect(flagged, `tracker scripts on ${path}`).toEqual([])
  })
}

test('no Sentry globals on any page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(800)
  expect(await page.evaluate(() => typeof (window as { Sentry?: unknown }).Sentry)).toBe('undefined')
})

test('Turnstile stays route-local: never fetched off the form routes', async ({ page }) => {
  for (const path of NON_FORM_ROUTES) {
    const { turnstileHit } = await scanPage(page, path)
    expect(turnstileHit.fired, `Turnstile harness fetched on ${path}, outside the form routes`).toBe(false)
  }

  const realMode = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
  for (const path of FORM_ROUTES) {
    const { turnstileHit, stubNote } = await scanPage(page, path)
    if (realMode) {
      expect(turnstileHit.fired, `Turnstile script expected on ${path} (real mode)`).toBe(true)
      continue
    }
    expect(turnstileHit.fired, `Turnstile script must not load on ${path} in test mode`).toBe(false)
    // /request-an-outreach mounts the widget only on its final review step, so
    // its stub note is not in the DOM at initial load (exercised by Journey 4's
    // wizard flow instead). /contact and /partner mount it immediately.
    if (path !== '/request-an-outreach') {
      expect(stubNote, `test-mode Turnstile stub should be present on ${path}`).toBe(true)
    }
  }
})