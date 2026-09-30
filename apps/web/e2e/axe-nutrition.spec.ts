import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

const NUTRITION_PAGES = [
  { path: '/nutrition', heading: 'Nutrition Hub' },
  { path: '/nutrition/articles', heading: 'Nutrition Articles' },
  { path: '/nutrition/articles/introducing-solid-foods', heading: 'First Foods' },
  { path: '/nutrition/foods', heading: 'Nigerian Food Profiles' },
  { path: '/nutrition/foods/jute-leaves', heading: 'Jute Leaves' },
]

for (const { path, heading } of NUTRITION_PAGES) {
  test(`has no axe violations: ${path}`, async ({ page }) => {
    await page.goto(path)
    await expect(page.getByRole('heading', { name: new RegExp(heading) })).toBeVisible({ timeout: 20000 })
    const results = await new AxeBuilder({ page }).analyze()
    expect(results.violations).toEqual([])
  })
}