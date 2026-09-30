#!/usr/bin/env node
/**
 * Lighthouse quality gate (plan §13 / §16).
 *
 * Audits the key templates against Hard-Check thresholds (Slow 4G, mid-range
 * mobile emulation):
 *   performance   ≥ 90
 *   accessibility ≥ 100
 *   best-practices ≥ 95
 *   seo           ≥ 100
 *
 * Writes full reports + a summary to quality-results/lighthouse/ and exits
 * non-zero when a threshold is missed. Point it at a running server with
 * LIGHTHOUSE_BASE_URL (default http://localhost:3000).
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const BASE_URL = process.env.LIGHTHOUSE_BASE_URL || 'http://localhost:3000'
const OUT_DIR = path.join(ROOT, 'quality-results', 'lighthouse')
const DEFAULT_THRESHOLDS = { performance: 90, accessibility: 100, 'best-practices': 95, seo: 100 }
// Lighthouse scores vary by roughly +/-5 between identical runs; score the median
// of 3 so the gate reflects the page rather than the sampling noise.
const RUNS = Number(process.env.LH_RUNS ?? 3)
const THRESHOLDS = Object.fromEntries(
  Object.entries(DEFAULT_THRESHOLDS).map(([key, value]) => [
    key,
    Number(process.env[`LH_${key.toUpperCase().replace(/-/g, '_')}`]) || value,
  ]),
)

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'contact', path: '/contact' },
  { name: 'nutrition-hub', path: '/nutrition' },
  { name: 'article', path: '/nutrition/articles/introducing-solid-foods' },
  { name: 'outreach', path: '/outreaches/pregnancy-nutrition-talk-kano' },
  { name: 'resources', path: '/resources' },
]

mkdirSync(OUT_DIR, { recursive: true })

async function run() {
  let lighthouse

  try {
    lighthouse = (await require('lighthouse')).default
  } catch {
    console.error('[lighthouse] package missing — run: pnpm add -D -w lighthouse chrome-launcher')
    process.exit(1)
  }

  // Resolve a Chrome executable: CHROME_PATH → chrome-launcher default → Playwright's Chromium.
  const chromePath = process.env.CHROME_PATH
  let executablePath = chromePath
  if (!executablePath) {
    try {
      const chromeLauncher = require('chrome-launcher')
      executablePath = chromeLauncher.ChromeLauncher.getInstallations()[0]
    } catch {
      executablePath = undefined
    }
  }
  if (!executablePath) {
    try {
      // Playwright is installed under apps/web/node_modules/@playwright/test.
      const playwright = require(path.join(ROOT, 'apps', 'web', 'node_modules', '@playwright/test'))
      executablePath = playwright.chromium?.executablePath?.()
    } catch {
      executablePath = undefined
    }
  }
  if (!executablePath) {
    console.error('[lighthouse] no Chrome found — set CHROME_PATH, or run: pnpm add -D -w chrome-launcher')
    process.exit(1)
  }

  let chromeLauncherModule
  try {
    chromeLauncherModule = require('chrome-launcher')
  } catch {
    console.error('[lighthouse] chrome-launcher package missing — run: pnpm add -D -w chrome-launcher')
    process.exit(1)
  }

  // Launch headless Chrome with an ephemeral remote-debugging port for Lighthouse.
  const launched = await chromeLauncherModule.launch({
    chromePath: executablePath,
    chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu'],
    port: 0,
  })

  const flags = {
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    output: 'json',
    port: launched.port,
  }

  const config = {
    extends: 'lighthouse:default',
    settings: {
      formFactor: 'mobile',
      screenEmulation: { mobile: true, width: 360, height: 640, deviceScaleFactor: 2 },
      throttling: { rttMs: 150, throughputKbps: 1638.4, cpuSlowdownMultiplier: 4 },
    },
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    thresholds: THRESHOLDS,
    runsPerRoute: RUNS,
    scoring: 'median',
    pages: [],
    passed: true,
  }

  /**
   * Lighthouse scores carry a documented margin of error of roughly +/-5, so a
   * single sample against a hard threshold is a flaky gate by construction.
   * Following Lighthouse's own guidance we run each route RUNS times and score
   * the median; min/max are kept in the summary so the spread stays visible.
   */
  const median = (values) => {
    const sorted = [...values].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2)
  }

  try {
    for (const route of ROUTES) {
      const url = `${BASE_URL}${route.path}`
      const perRun = []

      for (let run = 1; run <= RUNS; run += 1) {
        console.log(`[lighthouse] auditing ${url} (run ${run}/${RUNS})`)
        const result = await lighthouse(url, flags, config)
        const report = JSON.parse(result.report)
        perRun.push(
          Object.fromEntries(
            Object.entries(report.categories).map(([key, category]) => [
              key,
              Math.round((category.score ?? 0) * 100),
            ]),
          ),
        )
        // Keep the report of the median-scoring run for downstream inspection.
        const reports = (perRun.reports ??= [])
        reports.push(report)
      }

      const scores = Object.fromEntries(
        Object.keys(THRESHOLDS).map((key) => [key, median(perRun.map((s) => s[key]))]),
      )
      const spread = Object.fromEntries(
        Object.keys(THRESHOLDS).map((key) => {
          const values = perRun.map((s) => s[key])
          return [key, { min: Math.min(...values), max: Math.max(...values) }]
        }),
      )
      const routeOk = Object.entries(THRESHOLDS).every(
        ([key, threshold]) => scores[key] >= threshold,
      )
      if (!routeOk) summary.passed = false

      const reports = perRun.reports ?? []
      const medianReport = reports[median(reports.map((_, i) => i))] ?? reports[0]
      writeFileSync(path.join(OUT_DIR, `${route.name}.json`), JSON.stringify(medianReport, null, 2))
      summary.pages.push({ name: route.name, url, scores, spread, runs: perRun, passed: routeOk })
      console.log(
        `[lighthouse] ${route.name}: ` +
          Object.entries(scores).map(([k, v]) => `${k}=${v}`).join(' ') +
          ` ${routeOk ? 'PASS' : 'FAIL'}` +
          ` (runs: ${perRun.map((s) => s.performance).join('/')} perf, spread ${spread.performance.min}-${spread.performance.max})`,
      )
    }

    writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2))
  } finally {
    try {
      await launched.kill().catch(() => {})
    } catch {
      // Windows can fail to remove chrome-launcher's temp dir after the
      // browser is already dead; this teardown is best-effort only.
    }
  }

  if (!summary.passed) {
    console.error('[lighthouse] thresholds missed — see quality-results/lighthouse/summary.json')
    process.exit(1)
  }
  console.log(`[lighthouse] OK — all ${ROUTES.length} routes above thresholds.`)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})