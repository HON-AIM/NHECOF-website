import { test, expect } from '@playwright/test'

test.describe('Header', () => {
  test('renders primary nav links', async ({ page }) => {
    await page.goto('/')
    const nav = page.getByRole('navigation', { name: /primary navigation/i })
    await expect(nav).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'About' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'What We Do' })).toBeVisible()
    await expect(nav.getByRole('button', { name: 'Nutrition Hub' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Our Impact' })).toBeVisible()
    await expect(nav.getByRole('link', { name: 'Get Involved' })).toBeVisible()
  })

  test('renders logo linking home', async ({ page }) => {
    await page.goto('/')
    const logo = page.getByRole('banner').getByRole('link', { name: /NHECOF.*Home/i })
    await expect(logo).toBeVisible()
    await expect(logo).toHaveAttribute('href', '/')
  })

  test('renders CTA button', async ({ page }) => {
    await page.goto('/')
    const cta = page.getByRole('link', { name: 'Request an Outreach' })
    // At least one CTA should exist (desktop or mobile)
    await expect(cta.first()).toBeVisible()
  })

  test('search button opens and closes the command palette', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    const trigger = page.getByRole('button', { name: 'Open search' })
    await expect(trigger.first()).toBeVisible()

    await trigger.first().click()
    const dialog = page.getByRole('dialog', { name: /search the nutrition hub/i })
    await expect(dialog).toBeVisible()
    await expect(
      dialog.getByRole('combobox', { name: 'Search the Nutrition Hub' })
    ).toBeVisible()

    await dialog.getByRole('combobox', { name: 'Search the Nutrition Hub' }).fill('')
    await page.keyboard.press('Escape')
    await expect(dialog).not.toBeVisible()

    // "/" keyboard shortcut reopens the palette
    await page.keyboard.press('/')
    await expect(page.getByRole('dialog', { name: /search the nutrition hub/i })).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('dialog', { name: /search the nutrition hub/i })).not.toBeVisible()
  })

  test('Nutrition Hub dropdown opens and lists topics', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    const trigger = page.getByRole('button', { name: 'Nutrition Hub' })
    await trigger.click()
    const menu = page.getByRole('menu', { name: /nutrition hub topics/i })
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'Nutrition Basics' })).toBeVisible()
    await expect(menu.getByRole('menuitem', { name: 'Myths & Facts' })).toBeVisible()
  })

  test('Nutrition Hub dropdown closes on Escape', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')
    const trigger = page.getByRole('button', { name: 'Nutrition Hub' })
    await trigger.click()
    await expect(page.getByRole('menu')).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(page.getByRole('menu')).not.toBeVisible()
  })
})

test.describe('Footer', () => {
  test('renders footer with 4 columns', async ({ page }) => {
    await page.goto('/')
    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
    await expect(footer.getByRole('heading', { name: 'Explore' })).toBeVisible()
    await expect(footer.getByRole('heading', { name: 'Get involved' })).toBeVisible()
    await expect(footer.getByRole('heading', { name: 'Policies' })).toBeVisible()
  })

  test('renders disclaimer', async ({ page }) => {
    await page.goto('/')
    const footer = page.getByRole('contentinfo')
    await expect(footer.getByText(/educational content only/i)).toBeVisible()
  })

  test('renders copyright', async ({ page }) => {
    await page.goto('/')
    const footer = page.getByRole('contentinfo')
    const year = new Date().getFullYear()
    await expect(footer.getByText(new RegExp(String(year)))).toBeVisible()
  })
})
