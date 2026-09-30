import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Mobile sheet navigation — keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/')
  })

  test('hamburger button is visible and focusable', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: 'Open menu' })
    await expect(hamburger).toBeVisible()
    await hamburger.focus()
    await expect(hamburger).toBeFocused()
  })

  test('opens sheet on click, focus moves to close button', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: 'Open menu' })
    await hamburger.click()
    const dialog = page.getByRole('dialog', { name: /navigation menu/i })
    await expect(dialog).toBeVisible()
    const closeButton = page.getByRole('button', { name: 'Close menu' })
    await expect(closeButton).toBeFocused()
  })

  test('ESC closes the sheet and returns focus to hamburger', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: 'Open menu' })
    await hamburger.click()
    await expect(page.getByRole('dialog')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog')).not.toBeVisible()
    await expect(hamburger).toBeFocused()
  })

  test('Tab is trapped inside the sheet', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: 'Open menu' })
    await hamburger.click()
    const dialog = page.getByRole('dialog', { name: /navigation menu/i })
    await expect(dialog).toBeVisible()

    // Get all focusable elements inside the sheet
    const focusableCount = await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]')
      if (!dialog) return 0
      return dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ).length
    })
    expect(focusableCount).toBeGreaterThan(0)

    // Tab through all elements — focus should stay inside dialog
    for (let i = 0; i < focusableCount + 3; i++) {
      await page.keyboard.press('Tab')
      const focusedEl = await page.evaluate(() => {
        const el = document.activeElement
        return {
          tag: el?.tagName,
          inDialog: !!el?.closest('[role="dialog"]'),
        }
      })
      expect(focusedEl.inDialog).toBe(true)
    }
  })

  test('all nav links have min 44px touch target', async ({ page }) => {
    const hamburger = page.getByRole('button', { name: 'Open menu' })
    await hamburger.click()

    const navLinks = page.getByRole('dialog').getByRole('link')
    const count = await navLinks.count()
    for (let i = 0; i < count; i++) {
      const box = await navLinks.nth(i).boundingBox()
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44)
      }
    }
  })
})

test.describe('Layout — no horizontal scroll', () => {
  const viewports = [
    { width: 360, height: 800, name: '360px' },
    { width: 390, height: 844, name: '390px' },
    { width: 768, height: 1024, name: '768px' },
    { width: 1280, height: 900, name: '1280px' },
    { width: 1440, height: 900, name: '1440px' },
  ]

  for (const vp of viewports) {
    test(`stable at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      await page.goto('/')
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1)
    })
  }
})

test.describe('Layout — axe clean', () => {
  test('homepage has no axe violations', async ({ page }) => {
    await page.goto('/')
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
})
