import { test, expect } from '@playwright/test'
import { mkdirSync, statSync } from 'node:fs'
import path from 'node:path'

/**
 * Visual snapshots per key template at every supported viewport width. Images
 * are written to quality-results/screenshots as regression artifacts for the
 * visual quality gate (plan §10.4). Route templates cover the sticky-header
 * pages where layout is most likely to break.
 */

const ARTIFACTS_ROOT = path.resolve(process.cwd(), '..', '..', 'quality-results')
const SHOT_DIR = path.join(ARTIFACTS_ROOT, 'screenshots')

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'about', path: '/about' },
  { name: 'impact', path: '/impact' },
  { name: 'nutrition-hub', path: '/nutrition' },
  { name: 'article', path: '/nutrition/articles/introducing-solid-foods' },
  { name: 'food-profile', path: '/nutrition/foods/jute-leaves' },
  { name: 'outreaches', path: '/outreaches' },
  { name: 'outreach-detail', path: '/outreaches/pregnancy-nutrition-talk-kano' },
  { name: 'resources', path: '/resources' },
]

const VIEWPORTS = [
  { name: '360', width: 360, height: 800 },
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1280', width: 1280, height: 720 },
  { name: '1440', width: 1440, height: 900 },
]

for (const viewport of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`screenshot: ${route.name} @${viewport.name}px`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(route.path, { waitUntil: 'networkidle' })
      await page.waitForTimeout(300)

      mkdirSync(SHOT_DIR, { recursive: true })
      const file = path.join(SHOT_DIR, `${route.name}--${viewport.width}.png`)
      await page.screenshot({ path: file, fullPage: true })
      expect(statSync(file).size, `screenshot file should be non-trivial: ${file}`).toBeGreaterThan(10_000)
    })
  }
}