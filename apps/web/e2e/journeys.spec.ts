import { test, expect } from '@playwright/test'

test.describe('Nutrition Hub journeys', () => {
  test('homepage featured article opens its full article page', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: 'Featured knowledge' })).toBeVisible({
      timeout: 30000,
    })

    const featuredLink = page.getByRole('link', {
      name: 'First Foods: Introducing Solid Foods to Your Baby',
    })
    await expect(featuredLink.first()).toBeVisible()
    await featuredLink.first().click()

    await page.waitForURL(/\/nutrition\/articles\/introducing-solid-foods/, {
      timeout: 20000,
    })
    await expect(
      page.getByRole('heading', {
        name: 'First Foods: Introducing Solid Foods to Your Baby',
        level: 1,
      })
    ).toBeVisible()

    // Full article chrome: on-page table of contents and references
    await expect(page.getByRole('navigation', { name: /on this page/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'References', level: 2 })).toBeVisible()
  })

  test('server search page query opens the matching result', async ({ page }) => {
    await page.goto('/nutrition/search')
    await page.getByPlaceholder(/search articles and foods/i).fill('moringa')
    await page.getByRole('button', { name: 'Search', exact: true }).click()

    await page.waitForURL(/q=moringa/, { timeout: 20000 })
    const result = page.getByRole('link', { name: /moringa/i })
    await expect(result.first()).toBeVisible()
    await result.first().click()

    await page.waitForURL(/\/nutrition\/foods\/moringa/, { timeout: 20000 })
    await expect(
      page.getByRole('heading', { name: 'Moringa (Zogale)', level: 1 })
    ).toBeVisible()
  })

  test('food profiles archive filters by food group', async ({ page }) => {
    await page.goto('/nutrition/foods?group=vegetables-leaves')
    await expect(page.getByRole('heading', { name: 'Nigerian Food Profiles' })).toBeVisible()

    await expect(page.getByRole('link', { name: /jute leaves/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /brown beans/i })).toHaveCount(0)

    const count = page.getByText(/food profiles? found/i)
    await expect(count.first()).toBeVisible()
  })
})