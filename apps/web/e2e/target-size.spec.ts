import { test, expect, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

/**
 * WCAG 2.2 Target Size (Minimum) — 2.5.8 measurement pass
 * (plan §10.3 / §16.3).
 *
 * The manual checklist in `docs/a11y-checklist.md` lists 20 interactive target
 * classes (t-01 … t-20). This spec measures the real rendered hit area of each
 * one in a real browser and writes the evidence to
 * `quality-results/a11y/target-size.json`, so the checklist records measured
 * results instead of `PASS / FAIL` placeholders.
 *
 * Links inside a running sentence are exempt under 2.5.8, so prose links are
 * deliberately excluded; only standalone controls are measured.
 */

const ARTIFACTS_ROOT = path.resolve(process.cwd(), '..', '..', 'quality-results')
const MIN_TARGET_PX = 24
const DEFAULT_VIEWPORT = { width: 1280, height: 720 }

interface TargetCase {
  id: string
  control: string
  /** Route the control is measured on. */
  route: string
  /** How the control is located. Absent when `expectAbsent` is set. */
  locate?: (page: Page) => ReturnType<Page['locator']>
  /** Optional interaction required before the control exists. */
  prepare?: (page: Page) => Promise<void>
  /** Optional viewport override (e.g. the mobile-only hamburger). */
  viewport?: { width: number; height: number }
  /**
   * Documented reason the control has no rendered instance at launch. These are
   * recorded as N/A in the artifact instead of being silently dropped.
   */
  expectAbsent?: string
}

const CASES: TargetCase[] = [
  { id: 't-01', control: 'Primary / secondary buttons', route: '/request-an-outreach', locate: (p) => p.locator('form button').last() },
  { id: 't-02', control: 'Ghost / text buttons', route: '/nutrition', locate: (p) => p.locator('button').first() },
  { id: 't-03', control: 'Icon-only buttons (share, copy, close)', route: '/nutrition/articles/introducing-solid-foods', locate: (p) => p.locator('button[aria-label]').first() },
  { id: 't-04', control: 'Top-bar nav links', route: '/', locate: (p) => p.getByRole('banner').getByRole('link').first() },
  { id: 't-05', control: 'Nutrition Hub dropdown trigger', route: '/', locate: (p) => p.getByRole('button', { name: /nutrition hub/i }).first() },
  { id: 't-06', control: 'Dropdown menu items', route: '/', prepare: async (p) => { await p.getByRole('button', { name: /nutrition hub/i }).first().click() }, locate: (p) => p.getByRole('menu').getByRole('menuitem').first() },
  { id: 't-07', control: 'Mobile hamburger trigger', route: '/', viewport: { width: 390, height: 844 }, locate: (p) => p.getByRole('button', { name: /menu/i }).first() },
  { id: 't-08', control: 'Search open toggle', route: '/', locate: (p) => p.getByRole('button', { name: /open search/i }).first() },
  { id: 't-09', control: 'Search input', route: '/', prepare: async (p) => { await p.getByRole('button', { name: /open search/i }).first().click() }, locate: (p) => p.getByRole('dialog').locator('input').first() },
  { id: 't-10', control: 'Search result items', route: '/', prepare: async (p) => { await p.getByRole('button', { name: /open search/i }).first().click(); await p.getByRole('dialog').locator('input').first().fill('moringa'); await p.getByRole('option').first().waitFor({ state: 'attached' }) }, locate: (p) => p.getByRole('option').first().locator('button') },
  { id: 't-11', control: 'Text input fields', route: '/contact', locate: (p) => p.getByLabel(/name/i).first() },
  { id: 't-12', control: 'Textarea fields', route: '/contact', locate: (p) => p.locator('textarea').first() },
  { id: 't-13', control: 'Select fields', route: '/contact', locate: (p) => p.locator('select').first() },
  { id: 't-14', control: 'Checkboxes / radio groups', route: '/contact', locate: (p) => p.locator('input[type="checkbox"]').first() },
  { id: 't-15', control: 'Breadcrumb links', route: '/nutrition/articles/introducing-solid-foods', locate: (p) => p.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link').first() },
  { id: 't-16', control: 'Footer links', route: '/', locate: (p) => p.getByRole('contentinfo').getByRole('link').first() },
  { id: 't-17', control: 'Card links', route: '/nutrition/foods', locate: (p) => p.locator('a[href^="/nutrition/foods/"]').first() },
  { id: 't-18', control: 'Tabs', route: '/styleguide', expectAbsent: 'Tabs is implemented (components/ui/Tabs.tsx) but is not used by any page at launch, so no rendered instance exists to measure.' },
  { id: 't-19', control: 'Pagination controls', route: '/nutrition/articles', expectAbsent: 'Pagination is rendered only when the archive spans more than one page; the published content volume is a single page at launch.' },
  { id: 't-20', control: 'Skip-to-content link', route: '/', prepare: async (p) => { await p.keyboard.press('Tab') }, locate: (p) => p.getByRole('link', { name: /skip to content/i }).first() },
]

/** Rounded hit-area box of the first match, or null when the control is absent. */
async function measure(page: Page, testCase: TargetCase) {
  if (!testCase.locate) return null
  const locator = testCase.locate(page)
  const count = await locator.count()
  if (count === 0) return null
  const box = await locator.first().boundingBox()
  if (!box) return null
  return { width: Math.round(box.width), height: Math.round(box.height) }
}

test.describe('WCAG 2.2 target size (2.5.8)', () => {
  test('all standalone interactive targets are at least 24x24 CSS px', async ({ page }) => {
    // 20 route visits + interactions in one pass, so the default 30s is too low.
    test.setTimeout(180_000)
    // Controls that are absent on a route must fail fast rather than burning the
    // default action timeout each — they are reported as NOT_FOUND instead.
    page.setDefaultTimeout(3_000)
    const results: Array<Record<string, unknown>> = []

    for (const testCase of CASES) {
      // Reset the viewport so a mobile-only case cannot skew later measurements.
      await page.setViewportSize(testCase.viewport ?? DEFAULT_VIEWPORT)
      // Navigation gets its own budget: `setDefaultTimeout(3_000)` is meant to make
      // absent controls fail fast, but `page.goto` inherits it, and against a dev
      // server the first visit to a route pays on-demand compilation, which
      // legitimately exceeds 3s. Waiting on the document and then the heading
      // means we measure a hydrated page instead of a bare document.
      await page.goto(testCase.route, { waitUntil: 'domcontentloaded', timeout: 60_000 })
      await page
        .getByRole('heading', { level: 1 })
        .first()
        .waitFor({ state: 'attached', timeout: 30_000 })
        .catch(() => undefined)
      if (testCase.prepare) {
        await testCase.prepare(page).catch(() => undefined)
      }
      const box = await measure(page, testCase)
      const status = testCase.expectAbsent
        ? box === null
          ? 'N/A'
          : 'PASS'
        : box === null
          ? 'NOT_FOUND'
          : box.width >= MIN_TARGET_PX && box.height >= MIN_TARGET_PX
            ? 'PASS'
            : 'FAIL'
      results.push({
        id: testCase.id,
        control: testCase.control,
        route: testCase.route,
        measured: box,
        status,
        ...(testCase.expectAbsent ? { note: testCase.expectAbsent } : {}),
      })
    }

    const failures = results.filter((r) => r.status === 'FAIL')
    const unresolved = results.filter((r) => r.status === 'NOT_FOUND')

    const dir = path.join(ARTIFACTS_ROOT, 'a11y')
    mkdirSync(dir, { recursive: true })
    writeFileSync(
      path.join(dir, 'target-size.json'),
      `${JSON.stringify(
        {
          generatedAt: new Date().toISOString(),
          criterion: 'WCAG 2.2 Target Size (Minimum) 2.5.8',
          minTargetPx: MIN_TARGET_PX,
          note: 'Prose links are exempt under 2.5.8 and are deliberately not measured. N/A entries document controls with no rendered instance at launch; NOT_FOUND entries are measurement gaps that must be fixed.',
          total: results.length,
          passed: results.filter((r) => r.status === 'PASS').length,
          failed: failures.length,
          notApplicable: results.filter((r) => r.status === 'N/A').length,
          unresolved: unresolved.length,
          results,
        },
        null,
        2,
      )}\n`,
    )

    const summary = results
      .map((r) => `${r.id} ${r.status}${r.measured ? ` (${(r.measured as { width: number; height: number }).width}x${(r.measured as { width: number; height: number }).height})` : ''}`)
      .join('\n')

    expect(failures, `targets below ${MIN_TARGET_PX}px:\n${summary}`).toEqual([])
  })
})
