import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const PUBLIC_PAGES: Array<{ path: string; heading: string }> = [
  { path: '/about', heading: 'About NHECOF' },
  { path: '/what-we-do', heading: 'What We Do' },
  { path: '/get-involved', heading: 'Get Involved' },
  { path: '/partner', heading: 'Partner With Us' },
  { path: '/contact', heading: 'Contact Us' },
  { path: '/editorial-policy', heading: 'Editorial Policy' },
  { path: '/medical-disclaimer', heading: 'Medical Disclaimer' },
  { path: '/privacy', heading: 'Privacy Policy' },
]

for (const { path, heading } of PUBLIC_PAGES) {
  test.describe(`${path}`, () => {
    test('renders with the correct heading and a unique page title', async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible()
      const title = await page.title()
      expect(title.trim().length).toBeGreaterThan(0)
      expect(title).toContain('NHECOF')
    })

    test('has no axe violations', async ({ page }) => {
      await page.goto(path)
      const results = await new AxeBuilder({ page }).analyze()
      expect(results.violations).toEqual([])
    })

    test('has no horizontal scroll at 360px', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 })
      await page.goto(path)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
    })
  })
}

test.describe('Contact subject preselection', () => {
  test('highlights the preselected subject from the URL', async ({ page }) => {
    await page.goto('/contact?subject=Volunteering')
    await expect(page.getByText(/Subject: Volunteering/i)).toBeVisible()
  })

  test('renders without a subject when parameter is absent', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.getByText(/Subject: Volunteering/i)).toHaveCount(0)
  })
})

test.describe('Get Involved volunteer CTA', () => {
  test('opens contact with the Volunteering subject preselected', async ({ page }) => {
    await page.goto('/get-involved')
    const volunteer = page.getByRole('link', { name: 'Volunteer with us' })
    await expect(volunteer).toHaveAttribute('href', '/contact?subject=Volunteering')
  })
})

test.describe('What We Do detail route (disabled behind flag)', () => {
  test('serves the not-found page while the detail route is disabled', async ({ page }) => {
    const response = await page.goto('/what-we-do/community-nutrition-education')
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible()
      expect(response?.status()).toBe(404)
  })
})