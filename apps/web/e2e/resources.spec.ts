import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Resources archive', () => {
  test('lists all fixture resources', async ({ page }) => {
    await page.goto('/resources')
    await expect(page.getByRole('heading', { level: 1, name: 'Nutrition Resources' })).toBeVisible()
    await expect(page.getByRole('status')).toHaveText('5 resources available')
    await expect(
      page.getByRole('link', { name: /A Practical Guide to Food Portions for Nigerian Families/ }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /Iron-Rich Foods at a Glance/ }),
    ).toBeVisible()
  })

  test('filters by type, topic and audience via URL', async ({ page }) => {
    await page.goto('/resources?type=guide')
    await expect(page.getByRole('status')).toHaveText('1 resource found')
    await expect(
      page.getByRole('link', { name: /A Practical Guide to Food Portions for Nigerian Families/ }),
    ).toBeVisible()
    await expect(page.getByRole('link', { name: /Iron-Rich Foods at a Glance/ })).toHaveCount(0)

    await page.goto('/resources?topic=anaemia')
    await expect(
      page.getByRole('link', { name: /Iron-Rich Foods at a Glance/ }),
    ).toBeVisible()
    await expect(
      page.getByRole('link', { name: /Keep Food Safe: Market to Kitchen/ }),
    ).toHaveCount(0)

    await page.goto('/resources?audience=health-workers')
    await expect(
      page.getByRole('link', { name: /Breastfeeding in Nigeria: What the Evidence Says/ }),
    ).toBeVisible()
  })

  test('filter chips navigate and mark the active filter', async ({ page }) => {
    await page.goto('/resources')
    const guideChip = page.getByRole('link', { name: 'Guide (1)' })
    await guideChip.click()
    await expect(page).toHaveURL(/\/resources\?type=guide/)
    await expect(page.getByRole('link', { name: 'Guide (1)' })).toHaveAttribute('aria-current', 'true')
  })

  test('archive has no axe violations and no horizontal scroll at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    await page.goto('/resources')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})

test.describe('Resource detail page', () => {
  test('renders the resource with metadata and a download button', async ({ page }) => {
    await page.goto('/resources/portions-guide-nigerian-families')
    await expect(
      page.getByRole('heading', { level: 1, name: 'A Practical Guide to Food Portions for Nigerian Families' }),
    ).toBeVisible()
    const download = page.getByRole('link', { name: /Download resource/ })
    await expect(download).toHaveAttribute(
      'href',
      '/resources/portions-guide-nigerian-families/download',
    )
    await expect(page.getByText('PDF · 205 KB · English')).toBeVisible()
  })

  test('serves a 404 for an unknown slug', async ({ page }) => {
    const response = await page.goto('/resources/does-not-exist')
      expect(response?.status()).toBe(404)
  })

  test('detail page has no axe violations', async ({ page }) => {
    await page.goto('/resources/portions-guide-nigerian-families')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})

test.describe('Resource download works with JavaScript disabled', () => {
  test.use({ javaScriptEnabled: false })

  test('redirects to the PDF file', async ({ page }) => {
    const response = await page.request.get('/resources/portions-guide-nigerian-families/download', {
      maxRedirects: 3,
    })
    expect(response.url().endsWith('sample-portion-guide.pdf')).toBe(true)
    expect(response.status()).toBe(200)
    expect(response.headers()['content-type'] ?? '').toBe('application/pdf')
    const body = await response.body()
    expect(body.byteLength).toBeGreaterThan(1000)
  })
})

test.describe('Resource search discoverability', () => {
  test('resources appear in the nutrition hub search results', async ({ page }) => {
    await page.goto('/nutrition/search?q=portions')
    await expect(
      page.getByRole('link', { name: /A Practical Guide to Food Portions for Nigerian Families/ }),
    ).toBeVisible()
    await expect(page.getByText('Resource', { exact: true })).toBeVisible()
  })
})