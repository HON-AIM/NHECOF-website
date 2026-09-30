import { test, expect } from '@playwright/test'

interface QuoteOfDayResponse {
  slot: 'scheduled' | 'evergreen' | null
  day: string
  quote: {
    _id: string
    text: string
    attribution: string
    topic?: string | null
    sourceUrl?: string | null
    sharingPermitted: boolean
  } | null
}

test.describe('Daily quote API', () => {
  test('returns an approved quote of the day in Africa/Lagos', async ({ request }) => {
    const response = await request.get('/api/quote')
    expect(response.status()).toBe(200)
    expect(response.headers()['cache-control'] ?? '').toMatch(/s-maxage=\d+/)
    const payload = (await response.json()) as QuoteOfDayResponse
    expect(['scheduled', 'evergreen']).toContain(payload.slot)
    expect(payload.day).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(payload.quote?.text.length ?? 0).toBeGreaterThan(10)
    expect(payload.quote?.attribution.length ?? 0).toBeGreaterThan(0)
  })

  test('never returns an unreviewed or inactive quote', async ({ request }) => {
    const response = await request.get('/api/quote')
    const payload = (await response.json()) as QuoteOfDayResponse
    const text = payload.quote?.text ?? ''
    expect(text).not.toContain('Draft quote that must never be shown')
    expect(text).not.toContain('unapproved')
  })

  test('serves the quote-of-the-day card image', async ({ page }) => {
    const response = await page.request.get('/api/og/quote')
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type'] ?? '').toContain('image/png')
    const body = await response.body()
    expect(body.byteLength).toBeGreaterThan(10_000)
  })
})

test.describe('Daily quote on the homepage', () => {
  test('renders the same quote returned by the API', async ({ page, request }) => {
    const apiResponse = await request.get('/api/quote')
    const payload = (await apiResponse.json()) as QuoteOfDayResponse
    expect(payload.quote).not.toBeNull()

    await page.goto('/')
    const section = page.getByRole('region', { name: 'Quote of the day' })
    await expect(section).toBeVisible()
    await expect(section.getByText(payload.quote!.text)).toBeVisible()
    await expect(section.getByText(`— ${payload.quote!.attribution}`)).toBeVisible()
  })

  test('share menu appears only when sharing is permitted', async ({ page, request }) => {
    const apiResponse = await request.get('/api/quote')
    const payload = (await apiResponse.json()) as QuoteOfDayResponse
    expect(payload.quote).not.toBeNull()

    await page.goto('/')
    const section = page.getByRole('region', { name: 'Quote of the day' })
    await expect(section).toBeVisible()

    const shareButton = section.getByRole('button', { name: 'Share' })
    if (payload.quote!.sharingPermitted) {
      await expect(shareButton).toBeVisible()
      await shareButton.click()
      const whatsapp = page.getByRole('link', { name: 'Share on WhatsApp' })
      await expect(whatsapp).toBeVisible()
      await expect(whatsapp).toHaveAttribute('href', /wa\.me/)
      await expect(page.getByRole('link', { name: 'Share on Facebook' })).toBeVisible()
      await expect(page.getByRole('button', { name: 'Copy link' })).toBeVisible()
    } else {
      await expect(shareButton).toHaveCount(0)
    }
  })
})