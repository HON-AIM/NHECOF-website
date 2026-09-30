import { test, expect } from '@playwright/test'

test.describe('Nutrition Hub', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/nutrition')
    await expect(page).toHaveTitle(/Nutrition Hub/)
    await expect(page.getByRole('heading', { name: 'Nutrition Hub' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'All Articles' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Nigerian Food Profiles' })).toBeVisible()
  })

  test('articles archive loads with filter controls', async ({ page }) => {
    await page.goto('/nutrition/articles')
    await expect(page.getByRole('heading', { name: 'Nutrition Articles' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'All' }).first()).toBeVisible()
    await expect(page.getByText(/articles found/i).first()).toBeVisible()
  })

  test('food profiles archive loads with filter controls', async ({ page }) => {
    await page.goto('/nutrition/foods')
    await expect(page.getByRole('heading', { name: 'Nigerian Food Profiles' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'All' }).first()).toBeVisible()
    await expect(page.getByText(/food profiles? found/i).first()).toBeVisible()
  })

  test('search page shows empty state then returns results with query', async ({ page }) => {
    await page.goto('/nutrition/search')
    const input = page.getByPlaceholder(/search articles and foods/i)
    await expect(input).toBeVisible()
    await expect(page.getByRole('heading', { name: /type a keyword/i })).toBeVisible()

    await input.fill('moringa')
    await Promise.all([
      page.waitForURL(/q=moringa/, { timeout: 20000 }),
      page.getByRole('button', { name: 'Search', exact: true }).click(),
    ])
  })

  test('command palette is diacritic-insensitive ("efo" finds Jute Leaves)', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Open search' }).click()

    const dialog = page.getByRole('dialog', { name: /search the nutrition hub/i })
    await dialog
      .getByRole('combobox', { name: 'Search the Nutrition Hub' })
      .fill('efo')

    const option = dialog.getByRole('option', { name: /jute leaves/i })
    await expect(option).toBeVisible({ timeout: 20000 })
    await option.click()

    await page.waitForURL(/\/nutrition\/foods\/jute-leaves/, { timeout: 20000 })
    await expect(
      page.getByRole('heading', { name: 'Jute Leaves (Ewedu)', level: 1 })
    ).toBeVisible()
  })
})