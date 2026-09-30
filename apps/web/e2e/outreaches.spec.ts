import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const CARD_LINK = 'main ul li a[href^="/outreaches/"]'

test.describe('/outreaches archive', () => {
  test('lists upcoming first, then completed newest-first', async ({ page }) => {
    await page.goto('/outreaches')
    await expect(page.getByRole('heading', { level: 1, name: /Outreaches & Community Activities/i })).toBeVisible()

    const titles = await page.locator(CARD_LINK).allTextContents()
    expect(titles).toHaveLength(4)
    expect(titles[0]).toContain('Pregnancy Nutrition Talk')
    expect(titles[1]).toContain('Surulere')
    expect(titles[2]).toContain('Aba')
    expect(titles[3]).toContain('Ibadan')
  })

  test('shows place · date and one tangible outcome on cards when data allows', async ({ page }) => {
    await page.goto('/outreaches')
    const surulere = page.locator('li', { hasText: 'Surulere' })
    await expect(surulere.getByRole('heading', { name: /Community Nutrition Screening — Surulere, Lagos/i })).toBeVisible()
    // The "place · date" line is the only paragraph containing the separator.
    const placeLine = surulere.locator('p').filter({ hasText: '·' }).first()
    await expect(placeLine).toContainText('Surulere, Lagos')
    await expect(placeLine).toContainText('14 Feb 2026')

    // No invented outcomes: fixture records carry no attendance/screened yet.
    await expect(page.getByText(/people attended/i)).toHaveCount(0)
  })

  test('filters by year via the URL, preserving other params between links', async ({ page }) => {
    await page.goto('/outreaches?year=2026')
    await expect(page.getByText('3 outreaches found')).toBeVisible()
    await expect(page.getByRole('link', { name: /Ibadan/ })).toHaveCount(0)
    await expect(page.getByRole('link', { name: /Aba/ })).toBeVisible()
    // Wait for the dev server to finish hydrating before the client-side
    // navigation, otherwise a slow concurrent compile can drop the transition.
    await page.waitForLoadState('networkidle')

    await page.getByRole('link', { name: 'Lagos', exact: true }).click()
    await expect(page).toHaveURL(/\?year=2026&state=Lagos/)
    await expect(page.getByText('1 outreach found')).toBeVisible()
    await expect(page.getByRole('link', { name: /Surulere/ })).toBeVisible()
    await expect(page.getByRole('link', { name: /Aba/ })).toHaveCount(0)
  })

  test('filters by state and programme from the URL', async ({ page }) => {
    await page.goto('/outreaches?state=Kano')
    await expect(page.getByRole('heading', { name: /Pregnancy Nutrition Talk/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Surulere/ })).toHaveCount(0)

    await page.goto('/outreaches?programme=food-safety')
    await expect(page.getByRole('heading', { name: /Aba/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /Surulere/ })).toHaveCount(0)
  })

  test('marks the active filter with aria-current within each group', async ({ page }) => {
    await page.goto('/outreaches?state=Lagos')
    const stateGroup = page.getByRole('group', { name: 'State' })
    const yearGroup = page.getByRole('group', { name: 'Year' })
    await expect(stateGroup.getByRole('link', { name: 'Lagos', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    )
    // The state's "All" is not current; the year "All" still is.
    await expect(stateGroup.getByRole('link', { name: 'All', exact: true })).not.toHaveAttribute(
      'aria-current',
      'true',
    )
    await expect(yearGroup.getByRole('link', { name: 'All', exact: true })).toHaveAttribute(
      'aria-current',
      'true',
    )
  })

  test('shows an empty state when no outreach matches', async ({ page }) => {
    await page.goto('/outreaches?state=Zamfara')
    await expect(page.getByRole('heading', { name: /No outreaches match these filters/i })).toBeVisible()
  })

  test('has no axe violations', async ({ page }) => {
    await page.goto('/outreaches')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('has no horizontal scroll at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/outreaches')
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})

test.describe('/outreaches/[slug] detail', () => {
  test('renders the completed case study without invented figures', async ({ page }) => {
    await page.goto('/outreaches/ibadan-community-nutrition-outreach')
    await expect(page.getByRole('heading', { level: 1, name: /Ibadan Community Nutrition Outreach/i })).toBeVisible()
    await expect(page.getByText(/Completed/i)).toBeVisible()
    await expect(page.getByText(/Ibadan North, Oyo/i)).toBeVisible()
    await expect(page.getByText(/at Bodija Community Hall/i)).toBeVisible()
    await expect(page.getByText(/28 December 2025/i)).toBeVisible()

    // Not a verified record yet — nothing may claim verified figures.
    await expect(page.getByText('Verified record')).toHaveCount(0)
    await expect(page.getByText(/Total attendance/i)).toHaveCount(0)
    await expect(page.getByText(/Photo gallery/i)).toHaveCount(0)
    await expect(page.getByText(/What people said/i)).toHaveCount(0)
  })

  test('renders summary and only permitted sections for the upcoming event', async ({ page }) => {
    await page.goto('/outreaches/pregnancy-nutrition-talk-kano')
    await expect(page.getByRole('heading', { level: 1, name: /Pregnancy Nutrition Talk/i })).toBeVisible()
    await expect(page.getByText('Upcoming', { exact: true })).toBeVisible()
    await expect(page.getByText(/Kano Municipal, Kano/i)).toBeVisible()
    await expect(page.getByText('16 May 2026')).toBeVisible()
    await expect(page.getByText(/Target population/i)).toHaveCount(0)
  })

  test('emits BreadcrumbList and Event JSON-LD only for the upcoming event', async ({ page }) => {
    await page.goto('/outreaches/ibadan-community-nutrition-outreach')
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(ld.join(' ')).toContain('"@type":"BreadcrumbList"')
    expect(ld.join(' ')).not.toContain('EventScheduled')

    await page.goto('/outreaches/pregnancy-nutrition-talk-kano')
    const ldUpcoming = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(ldUpcoming.join(' ')).toContain('"@type":"Event"')
    expect(ldUpcoming.join(' ')).toContain('EventScheduled')
    expect(ldUpcoming.join(' ')).toContain('2026-05-16')
  })

  test('returns not-found for an unknown slug', async ({ page }) => {
    const response = await page.goto('/outreaches/not-a-real-outreach')
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible()
      expect(response?.status()).toBe(404)
  })

  test('has no axe violations', async ({ page }) => {
    await page.goto('/outreaches/ibadan-community-nutrition-outreach')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })

  test('has no horizontal scroll at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/outreaches/pregnancy-nutrition-talk-kano')
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})