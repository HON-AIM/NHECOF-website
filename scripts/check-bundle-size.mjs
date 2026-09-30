#!/usr/bin/env node
/**
 * Enforces per-route-type JavaScript budgets using the Next.js build manifest.
 *
 * Every static route in .next/build-manifest.json lists the JS chunk files it
 * needs on first load. We measure those chunks gzip-compressed (the actual
 * transfer size) and compare against the budgets below.
 *
 * Budgets (gzipped first-load JS):
 *   - content detail pages (article / food / outreach / resource / [slug]) ≤ 120 KB
 *   - all other pages (hub, home, archives, utilities)            ≤ 150 KB
 *
 * Writes quality-results/bundle.json and exits non-zero when a budget is hit.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { gzipSync } from 'node:zlib'
import path from 'node:path'

const ROOT = process.cwd()
const DEFAULT_BUILD_DIR = path.join(ROOT, 'apps', 'web', '.next')
const BUILD_DIR = process.env.BUILD_DIR || DEFAULT_BUILD_DIR
const OUT_DIR = path.join(ROOT, 'quality-results')
const OUT_FILE = path.join(OUT_DIR, 'bundle.json')

// App Router reports per-route chunks in app-build-manifest.json; the page
// router manifest (build-manifest.json) only carries /_app and /_error in
// App Router projects, so prefer the app one.
const APP_MANIFEST = path.join(BUILD_DIR, 'app-build-manifest.json')
const PAGE_MANIFEST = path.join(BUILD_DIR, 'build-manifest.json')

const CONTENT_BUDGET_BYTES = 120_000 // 120 KB gzipped
const OTHER_BUDGET_BYTES = 150_000 // 150 KB gzipped

const manifestFile = existsSync(APP_MANIFEST) ? APP_MANIFEST : PAGE_MANIFEST
if (!existsSync(manifestFile)) {
  console.error(`[bundle] build manifest not found: ${manifestFile}`)
  console.error('[bundle] run the production build first (`pnpm --filter web run build`).')
  process.exit(1)
}

const manifest = JSON.parse(readFileSync(manifestFile, 'utf8'))

/** Route keys often end in /page (route handlers in /route) — trim for display. */
function displayRoute(route) {
  const display = route.replace(/\/page$/, '').replace(/\/route$/, '')
  return display === '' ? '/' : display
}

/** Classify a route as a content detail page. */
function isContentPage(route) {
  const display = displayRoute(route)
  if (display === '/[slug]') return true
  return (
    display.startsWith('/nutrition/articles/') ||
    display.startsWith('/nutrition/foods/') ||
    display.startsWith('/outreaches/') ||
    display.startsWith('/resources/') ||
    display.startsWith('/what-we-do/') ||
    display.startsWith('/events/') ||
    (display.endsWith('/[slug]') && !display.startsWith('/api/'))
  )
}

function gzipSize(filePath) {
  if (!existsSync(filePath)) return { bytes: 0, missing: true }
  const buffer = readFileSync(filePath)
  return { bytes: gzipSync(buffer, { level: 9 }).byteLength, missing: false }
}

const CHUNK_ROOT = path.join(BUILD_DIR, 'static', 'chunks')

const pages = []
const failures = []
let totalChunks = 0
let totalMissing = 0

for (const [rawRoute, chunkPaths] of Object.entries(manifest.pages ?? {})) {
  const route = displayRoute(rawRoute)
  if (Array.isArray(chunkPaths) === false || chunkPaths.length === 0) continue
  if (route.startsWith('/api/') || route === '/_app' || route === '/_error') continue
  const chunks = []
  let routeBytes = 0
  for (const chunkPath of chunkPaths) {
    // App manifest uses "static/chunks/…" relative paths; the page router
    // manifest uses "/_next/static/chunks/…". Normalise both to the base name.
    const base = chunkPath.replace(/^\/_next\//, '').replace(/^static\//, '')
    const absPath = path.join(BUILD_DIR, 'static', base)
    const { bytes, missing } = gzipSize(absPath)
    totalChunks += 1
    if (missing) totalMissing += 1
    routeBytes += bytes
    chunks.push({ file: base, gzipBytes: bytes })
  }
  const kind = isContentPage(route) ? 'content' : 'other'
  const budget = kind === 'content' ? CONTENT_BUDGET_BYTES : OTHER_BUDGET_BYTES
  const ok = routeBytes <= budget
  pages.push({
    route,
    kind,
    gzipBytes: routeBytes,
    gzipKiB: Number((routeBytes / 1024).toFixed(1)),
    budgetKiB: budget / 1024,
    ok,
    chunks,
  })
  if (!ok) {
    failures.push({ route, kind, gzipKiB: Number((routeBytes / 1024).toFixed(1)) })
  }
}

pages.sort((a, b) => b.gzipBytes - a.gzipBytes)

const summary = {
  generatedAt: new Date().toISOString(),
  budgets: {
    contentKiB: CONTENT_BUDGET_BYTES / 1024,
    otherKiB: OTHER_BUDGET_BYTES / 1024,
  },
  chunkCount: totalChunks,
  missingChunks: totalMissing,
  pages,
  largestPages: pages.slice(0, 8).map(({ route, kind, gzipKiB }) => ({ route, kind, gzipKiB })),
  passed: failures.length === 0,
  failures,
}

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT_FILE, JSON.stringify(summary, null, 2))

console.log('[bundle] per-route first-load JS (gzip), largest 8:')
for (const page of pages.slice(0, 8)) {
  console.log(`  ${page.gzipKiB.toString().padStart(6)} KiB (${page.kind.padEnd(7)}) ${page.route}`)
}

if (totalMissing > 0) {
  console.warn(`[bundle] ${totalMissing} chunk file(s) missing from disk — sizes may be incomplete.`)
}

if (failures.length > 0) {
  console.error('[bundle] budgets EXCEEDED:')
  for (const failure of failures) {
    console.error(`  ${failure.gzipKiB} KiB content over budget on ${failure.route} (${failure.kind})`)
  }
  process.exit(1)
}

console.log(`[bundle] OK — ${pages.length} routes within budget. Summary: ${OUT_FILE}`)