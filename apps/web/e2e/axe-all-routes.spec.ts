import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

// axe against EVERY route template at both the narrowest supported width and a
// desktop width, per the accessibility strategy. Violation summaries are
// written to quality-results/axe/routes.json for the quality report.

const ARTIFACTS_ROOT = path.resolve(process.cwd(), '..', '..', 'quality-results')

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'what-we-do', path: '/what-we-do' },
  { name: 'get-involved', path: '/get-involved' },
  { name: 'impact', path: '/impact' },
  { name: 'contact', path: '/contact' },
  { name: 'partner', path: '/partner' },
  { name: 'request-an-outreach', path: '/request-an-outreach' },
  { name: 'resources', path: '/resources' },
  { name: 'resource-detail', path: '/resources/portions-guide-nigerian-families' },
  { name: 'nutrition-hub', path: '/nutrition' },
  { name: 'articles', path: '/nutrition/articles' },
  { name: 'article-detail', path: '/nutrition/articles/introducing-solid-foods' },
  { name: 'foods', path: '/nutrition/foods' },
  { name: 'food-detail', path: '/nutrition/foods/jute-leaves' },
  { name: 'search', path: '/nutrition/search' },
  { name: 'outreaches', path: '/outreaches' },
  { name: 'outreach-detail', path: '/outreaches/ibadan-community-nutrition-outreach' },
  { name: 'not-found', path: '/this-route-does-not-exist' },
]

const VIEWPORTS = [
  { name: '360', width: 360, height: 800 },
  { name: '1280', width: 1280, height: 720 },
]

const collected: Array<{
  route: string
  viewport: string
  violations: Array<{ id: string; impact: string | null | undefined; help: string; nodes: number; targets: string[] }>
}> = []

for (const viewport of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`axe has no violations: ${route.name} @${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(route.path, { waitUntil: 'load' })

      // The app shell hydrates shortly after a 404/soft render; wait for the
      // page h1 so axe scans the hydrated document (mirrors the other axe specs).
      await page.getByRole('heading', { level: 1 }).first().waitFor({ timeout: 20_000 })

      const results = await new AxeBuilder({ page }).analyze()
      if (results.violations.length > 0) {
        collected.push({
          route: route.path,
          viewport: viewport.name,
          violations: results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            help: v.help,
            nodes: v.nodes.length,
            targets: v.nodes.flatMap((n) => n.target.filter((t): t is string => typeof t === 'string')),
          })),
        })
      }

      expect(
        results.violations,
        `axe violations on ${route.path} @${viewport.name}px:\n` +
          JSON.stringify(
            results.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.map((n) => n.target) })),
            null,
            2,
          ),
      ).toEqual([])
    })
  }
}

test.afterAll(() => {
  const dir = path.join(ARTIFACTS_ROOT, 'axe')
  mkdirSync(dir, { recursive: true })
  writeFileSync(
    path.join(dir, 'routes.json'),
    JSON.stringify({ routeTemplates: ROUTES.length, viewports: VIEWPORTS.length, violations: collected }, null, 2),
  )
})