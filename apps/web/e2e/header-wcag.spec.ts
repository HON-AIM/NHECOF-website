import { test, expect, type Page } from '@playwright/test'

// WCAG 2.2 checks scoped to the sticky header and page navigation:
//  - 2.5.8 Target Size (Minimum): every interactive header control ≥ 24×24 px
//  - 2.4.11 Focus Not Obscured (Minimum): focused content is not covered by
//    the sticky header after scrolling
//  - skip-link moves focus into the main landmark
//  - the search field keeps a visible keyboard focus indicator

async function visibleHeaderControls(page: Page) {
  return page.$$eval('header a, header button', (els) =>
    els
      .filter((el) => {
        const rect = el.getBoundingClientRect()
        const style = getComputedStyle(el)
        return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
      })
      .map((el) => {
        const rect = el.getBoundingClientRect()
        return {
          label: (el.getAttribute('aria-label') || el.textContent?.trim() || el.getAttribute('href') || '')!.slice(0, 60),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        }
      }),
  )
}

test('header interactive targets meet WCAG 2.2 Target Size (Minimum ≥ 24×24)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')
  const controls = await visibleHeaderControls(page)
  expect(controls.length, 'expected header controls to be present').toBeGreaterThan(0)
  const undersized = controls.filter((c) => c.width < 24 || c.height < 24)
  expect(undersized).toEqual([])
})

test('skip link is keyboard-reachable and moves focus into the main landmark', async ({ page }) => {
  await page.goto('/')
  await page.keyboard.press('Tab')
  const skipVisible = await page.evaluate(() => {
    const link = document.querySelector('.skip-to-content') as HTMLElement | null
    if (!link) return false
    const rect = link.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  })
  expect(skipVisible, 'skip link should be visible on first Tab').toBe(true)

  await page.keyboard.press('Enter')
  await page.waitForURL(/#main-content/)

  const focusLanded = await page.evaluate(() => {
    const main = document.getElementById('main-content')
    return document.activeElement === main
  })
  expect(focusLanded, 'focus should move into <main id="main-content">').toBe(true)
})

test('focused content is not obscured by the sticky header after scrolling (WCAG 2.4.11)', async ({ page }) => {
  await page.goto('/nutrition')
  const focusedObscureable = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll('#main-content a, #main-content button'),
    ).filter((el) => (el.getBoundingClientRect().width || el.getBoundingClientRect().height) > 0).length,
  )
  expect(focusedObscureable).toBeGreaterThan(0)

  // Walk several links at the top of the main content: focus, bring into view,
  // and confirm the sticky header does not cover the component's focus point.
  const results = await page.evaluate(() => {
    const main = document.getElementById('main-content')!
    const focusables = Array.from(main.querySelectorAll('a, button')).filter((el) => {
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0
    })
    const obscured: Array<{ target: string; at: string }> = []
    for (const el of focusables.slice(0, 12)) {
      ;(el as HTMLElement).focus()
      el.scrollIntoView({ block: 'center' })
      const r = el.getBoundingClientRect()
      if (r.top >= r.bottom) continue
      // Sample the element's centre only — tall elements legitimately extend
      // past the viewport edges, so top/bottom in-axis points are meaningless.
      const point = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      if (point.y < 0 || point.y > window.innerHeight) continue
      const atPoint = document.elementFromPoint(point.x, point.y)
      const hit = atPoint === el || el.contains(atPoint)
      if (!hit) {
        obscured.push({
          target: (el.getAttribute('href') || el.textContent?.trim() || '')!.slice(0, 50),
          at: `x=${Math.round(point.x)} y=${Math.round(point.y)}`,
        })
      }
    }
    return obscured
  })
  expect(results).toEqual([])
})

test('search dialog input keeps a visible focus indicator', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Open search' }).first().click()
  const input = page.getByRole('combobox', { name: 'Search the Nutrition Hub' })
  await expect(input).toBeVisible()
  await input.focus()
  const outlineVisible = await input.evaluate((el) => {
    const style = getComputedStyle(el)
    return style.outlineStyle !== 'none' && style.outlineWidth !== '0px'
  })
  expect(outlineVisible, 'focused search input should have a non-none outline').toBe(true)
})

test('mobile sheet surfaces an aria-modal dialog and inert background', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 })
  await page.goto('/')
  await page.getByRole('button', { name: 'Open menu' }).click()
  const dialog = page.getByRole('dialog', { name: 'Navigation menu' })
  await expect(dialog).toBeVisible()
  await expect(dialog).toHaveAttribute('aria-modal', 'true')

  const mainInert = await page.evaluate(() => {
    const main = document.getElementById('main-content')
    return main ? main.hasAttribute('inert') : false
  })
  expect(mainInert, 'main content should be inert while the sheet is open').toBe(true)

  await page.keyboard.press('Escape')
  await expect(dialog).toBeHidden()
})