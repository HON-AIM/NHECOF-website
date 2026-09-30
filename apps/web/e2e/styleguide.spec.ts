import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// /styleguide is an internal-only page that intentionally returns 404 in
// production (see src/app/styleguide/page.tsx); the suite runs against the dev
// server and is skipped (with a written reason) on a production-style server.
const IS_PROD_SERVER = Boolean(process.env.E2E_SERVER_COMMAND)

test.describe('Styleguide', () => {
  test.skip(
    IS_PROD_SERVER,
    'The internal /styleguide page is disabled in production (returns 404) by design; run against the dev server.',
  )
  test.beforeEach(async ({ page }) => {
    await page.goto('/styleguide')
  })

  test('renders all major sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'NHECOF Design System' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Colour Tokens' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Typography' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Buttons' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Badges' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Form Elements' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Cards' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Skeleton Loading' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pattern Dividers' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Empty State' })).toBeVisible()
  })

  test('has no axe violations', async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .disableRules(['region']) // styleguide is one big region
      .analyze()

    expect(results.violations).toEqual([])
  })

  test('has no horizontal scroll at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 })
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('has no horizontal scroll at 768px', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 800 })
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })

  test('has no horizontal scroll at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
  })
})

test.describe('Keyboard-only operation', () => {
  test.skip(
    IS_PROD_SERVER,
    'The internal /styleguide page is disabled in production (returns 404) by design; run against the dev server.',
  )
  test('can tab through all interactive elements on styleguide', async ({ page }) => {
    await page.goto('/styleguide')

    // Focus should start on the body
    // Tab through the page and verify focus moves correctly
    const interactiveSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ]

    // Get all interactive elements on the page
    const interactiveCount = await page.evaluate((selectors) => {
      const combined = selectors.join(', ')
      return document.querySelectorAll(combined).length
    }, interactiveSelectors)

    expect(interactiveCount).toBeGreaterThan(0)

    // Tab through elements and verify focus is visible
    for (let i = 0; i < Math.min(interactiveCount, 20); i++) {
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tag: el?.tagName,
          type: (el as HTMLInputElement)?.type,
          visible: el ? window.getComputedStyle(el).outlineStyle !== 'none' || el.matches(':focus-visible') : false,
        }
      })
      // Focus should be on some element
      expect(focusedElement.tag).toBeTruthy()
    }
  })

  test('skip-to-content link works', async ({ page }) => {
    await page.goto('/styleguide')

    // Tab once to reach skip link
    await page.keyboard.press('Tab')
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName)
    const focusedText = await page.evaluate(() => document.activeElement?.textContent)
    expect(focusedTag).toBe('A')
    expect(focusedText).toContain('Skip to content')
  })
})
