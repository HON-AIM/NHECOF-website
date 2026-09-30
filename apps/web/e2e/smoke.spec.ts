import { test, expect } from '@playwright/test'

test('homepage loads with correct title', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
  await expect(page).toHaveTitle(/NHECOF/)
})

test('missing page returns 404', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist')
    // A genuine 404 status is part of the acceptance criteria, so assert it
    // rather than accepting a 200 that merely renders the not-found page.
    await expect(page.getByRole('heading', { name: /page not found/i })).toBeVisible()
    expect(response?.status()).toBe(404)
})

test('skip-to-content link is accessible', async ({ page }) => {
  await page.goto('/')
  const skipLink = page.getByRole('link', { name: /skip to content/i })
  // It should exist but be visually hidden
  await expect(skipLink).toHaveCount(1)
})
