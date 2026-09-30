import { test, expect } from '@playwright/test'

/**
 * Forms e2e (plan §14). Runs against the dev server in test mode:
 * - Turnstile is stubbed by the client widget (TURNSTILE_TEST_TOKEN) because no
 *   NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.
 * - Email delivery is simulated on the server (no RESEND_API_KEY).
 */

test.describe('Outreach request form', () => {
  test('guides a valid request through all steps to a success panel', async ({ page }) => {
    await page.goto('/request-an-outreach')

    await expect(page.getByRole('heading', { level: 1, name: /request an outreach/i })).toBeVisible()

    // --- Step 1: About you ---
    await page.getByLabel(/organisation or community name/i).fill('Okpanam Community Youth Group')
    await page.getByLabel(/contact person's name/i).fill('Adaeze Okonkwo')
    await page.getByLabel(/contact person's role/i).fill('Youth coordinator')
    await page.getByLabel(/email address/i).fill('adaeze.okonkwo@example.com')
    await page.getByLabel(/telephone/i).fill('0803 123 4567')
    await page.getByRole('button', { name: 'Continue' }).click()

    // --- Step 2: Your community ---
    await expect(page.getByText(/step 2 of 4/i)).toBeVisible()
    await page.getByLabel(/community name/i).fill('Okpanam')
    await page.getByLabel(/local government area/i).fill('Oshimili North')
    await page.getByLabel(/state/i).selectOption({ label: 'Delta' })
    await page.getByLabel(/estimated audience size/i).selectOption({ label: '101–300' })
    await page.getByLabel(/who do you want to reach/i).selectOption({ label: 'Pregnant & nursing women' })
    await page.getByLabel(/venue availability/i).selectOption({ label: 'Venue secured' })
    await page.getByRole('button', { name: 'Continue' }).click()

    // --- Step 3: What you need ---
    await expect(page.getByText(/step 3 of 4/i)).toBeVisible()
    await page.getByLabel(/main health or nutrition concerns/i).fill('Anaemia screening and nutrition talks')
    await page.getByLabel(/preferred date or date range/i).fill('A Saturday in November')
    await page.getByLabel(/type of support requested/i).selectOption({ label: 'Health screening' })
    await page.getByLabel(/anything else we should know/i).fill('We can host up to 200 participants.')
    await page.getByRole('button', { name: 'Continue' }).click()

    // --- Review ---
    await expect(page.getByText(/review your request/i)).toBeVisible()
    await expect(page.getByText('Adaeze Okonkwo (Youth coordinator)')).toBeVisible()
    await expect(page.getByText('Okpanam, Oshimili North, Delta')).toBeVisible()

    await page.getByRole('checkbox', { name: /i agree to the privacy policy/i }).check()
    await page.getByRole('button', { name: 'Submit request' }).click()

    await expect(page.getByText(/thank you.{0,3}we received/i)).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/^Reference number:/i)).toBeVisible()
  })

  test('rejects a request when the review consent is not ticked', async ({ page }) => {
    await page.goto('/request-an-outreach')

    await page.getByLabel(/organisation or community name/i).fill('Okpanam Community Youth Group')
    await page.getByLabel(/contact person's name/i).fill('Adaeze Okonkwo')
    await page.getByLabel(/contact person's role/i).fill('Youth coordinator')
    await page.getByLabel(/email address/i).fill('adaeze.okonkwo@example.com')
    await page.getByLabel(/telephone/i).fill('0803 123 4567')
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByLabel(/community name/i).fill('Okpanam')
    await page.getByLabel(/local government area/i).fill('Oshimili North')
    await page.getByLabel(/state/i).selectOption({ label: 'Delta' })
    await page.getByLabel(/estimated audience size/i).selectOption({ label: '101–300' })
    await page.getByLabel(/who do you want to reach/i).selectOption({ label: 'Pregnant & nursing women' })
    await page.getByLabel(/venue availability/i).selectOption({ label: 'Venue secured' })
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByLabel(/main health or nutrition concerns/i).fill('Anaemia screening and nutrition talks')
    await page.getByLabel(/preferred date or date range/i).fill('A Saturday in November')
    await page.getByLabel(/type of support requested/i).selectOption({ label: 'Health screening' })
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByRole('button', { name: 'Submit request' }).click()

    await expect(page.getByText(/you must agree to the privacy policy to continue/i).first()).toBeVisible()
    await expect(page.getByText(/thank you.{0,3}we received/i)).toHaveCount(0)
  })

  test('rejects a filled honeypot as spam without exposing the block', async ({ page }) => {
    await page.goto('/request-an-outreach')

    await page.getByLabel(/organisation or community name/i).fill('Okpanam Community Youth Group')
    await page.getByLabel(/contact person's name/i).fill('Adaeze Okonkwo')
    await page.getByLabel(/contact person's role/i).fill('Youth coordinator')
    await page.getByLabel(/email address/i).fill('adaeze.okonkwo@example.com')
    await page.getByLabel(/telephone/i).fill('0803 123 4567')
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByLabel(/community name/i).fill('Okpanam')
    await page.getByLabel(/local government area/i).fill('Oshimili North')
    await page.getByLabel(/state/i).selectOption({ label: 'Delta' })
    await page.getByLabel(/estimated audience size/i).selectOption({ label: '101–300' })
    await page.getByLabel(/who do you want to reach/i).selectOption({ label: 'Pregnant & nursing women' })
    await page.getByLabel(/venue availability/i).selectOption({ label: 'Venue secured' })
    await page.getByRole('button', { name: 'Continue' }).click()

    await page.getByLabel(/main health or nutrition concerns/i).fill('Anaemia screening and nutrition talks')
    await page.getByLabel(/preferred date or date range/i).fill('A Saturday in November')
    await page.getByLabel(/type of support requested/i).selectOption({ label: 'Health screening' })
    await page.getByRole('button', { name: 'Continue' }).click()

    // A real bot usually fills every visible (and hidden) field. The honeypot
    // field is hidden, so set it via React's own value setter (a bare
    // `input.value = ...` bypasses React's tracked state and can be lost).
    await page.locator('input[name="website"]').evaluate((el) => {
      const input = el as HTMLInputElement
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call(input, 'http://spam.example.com')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })

    await page.getByRole('checkbox', { name: /i agree to the privacy policy/i }).check()
    await page.getByRole('button', { name: 'Submit request' }).click()

    // Indistinguishable from a validation failure, but no success panel.
    await expect(page.getByText(/thank you.{0,3}we received/i)).toHaveCount(0)
  })
})