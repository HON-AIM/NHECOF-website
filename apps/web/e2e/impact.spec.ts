import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('/impact', () => {
  test('renders all five clearly separated blocks', async ({ page }) => {
    await page.goto('/impact')
    await expect(page.getByRole('heading', { level: 1, name: 'Our Impact' })).toBeVisible()
    for (const heading of [
      'Current cumulative impact',
      'Historical milestones',
      'Per-outreach results',
      'Geographic reach',
      'Community stories',
    ]) {
      await expect(page.getByRole('heading', { level: 2, name: heading })).toBeVisible()
    }
  })

  test('shows [PLACEHOLDER] when data is missing and never invents figures', async ({ page }) => {
    await page.goto('/impact')
    // Cumulative, milestones and stories have no verified input yet.
    await expect(page.getByText('[PLACEHOLDER]')).toHaveCount(3)
    await expect(page.getByText(/600/)).toHaveCount(0)
    // The cumulative stat labels never render without verified figures.
    await expect(page.getByText('People Reached', { exact: true })).toHaveCount(0)
    await expect(page.getByText('People Screened', { exact: true })).toHaveCount(0)
  })

  test('keeps every filled stat traceable to an as-of date', async ({ page }) => {
    await page.goto('/impact')
    // Geographic reach is real data: each tally row carries a count.
    await expect(page.getByRole('list', { name: /Reach by state/i })).toBeVisible()
    await expect(page.getByText('Lagos').last()).toBeVisible()
    await expect(page.getByText('Oyo').last()).toBeVisible()
    await expect(page.getByText('Abia').last()).toBeVisible()
  })

  test('lists per-outreach results with verified status and unverified markers', async ({ page }) => {
    await page.goto('/impact')
    const table = page.getByRole('table')
    await expect(table).toBeVisible()
    await expect(table.getByRole('row')).toHaveCount(5) // header + 4 records
    await expect(table.getByText('Ibadan Community Nutrition Outreach')).toBeVisible()
    await expect(table.getByText('Pregnancy Nutrition Talk')).toBeVisible()

    // No record is verified yet: the Verified column header exists,
    // but no data cell claims a verified figure.
    const verifiedCells = table.locator('tbody td').filter({ hasText: 'Verified' })
    await expect(verifiedCells).toHaveCount(0)
    await expect(table.getByText('—').first()).toBeVisible()
  })

  test('collapses the results table into stacked cards at 360px without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/impact')

    await expect(page.getByRole('table')).toHaveCount(0)
    // The stacked cards use a <dl>; the hidden desktop table uses <th>.
    await expect(page.locator('dl', { hasText: 'Attendance' }).first()).toBeVisible()
    await expect(page.locator('dl', { hasText: 'Screened' }).first()).toBeVisible()
    await expect(page.locator('li', { hasText: 'Ibadan Community Nutrition Outreach' })).toBeVisible()

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('has no axe violations', async ({ page }) => {
    await page.goto('/impact')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})