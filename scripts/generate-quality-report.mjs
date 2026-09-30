#!/usr/bin/env node
/**
 * Aggregates every quality artifact in quality-results/ into
 * docs/quality-report.md and auto-marks the REGRESSION-STATUS line in
 * docs/a11y-checklist.md.
 *
 * Gates evaluated: unit (vitest JSON) · e2e (Playwright JSON) · axe ·
 * lighthouse · bundle · contrast · placeholders (documented) · client secrets.
 *
 * Pass `--from-artifacts` in CI to skip re-running the cheap gate scripts
 * (expensive gates are always read from their artifacts).
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const FROM_ARTIFACTS = process.argv.includes('--from-artifacts')
const RESULTS = path.join(ROOT, 'quality-results')
const DOC = path.join(ROOT, 'docs', 'quality-report.md')
const CHECKLIST = path.join(ROOT, 'docs', 'a11y-checklist.md')

function readJson(file) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

function runGate(argv, { expectFailure = false } = {}) {
  try {
    const out = execFileSync(process.execPath, argv, { cwd: ROOT, encoding: 'utf8' }).trim()
    return { result: expectFailure ? 'FAIL' : 'PASS', note: out.split('\n').at(-1) ?? out, output: out }
  } catch (error) {
    const stderr = (error.stderr ?? '').toString().trim()
    return {
      result: expectFailure ? 'PASS' : 'FAIL',
      note: stderr.split('\n').at(-1) ?? `exited ${error.status}`,
      output: `${stderr}\n${(error.stdout ?? '').toString()}`,
    }
  }
}

// ── read artifacts ───────────────────────────────────────────────────────────
const vitestRaw = readJson(path.join(RESULTS, 'vitest', 'results.json'))
const playwright = readJson(path.join(RESULTS, 'playwright', 'results.json'))
const axe = readJson(path.join(RESULTS, 'axe', 'routes.json'))
const targetSize = readJson(path.join(RESULTS, 'a11y', 'target-size.json'))
const bundle = readJson(path.join(RESULTS, 'bundle.json'))
const lighthouse = readJson(path.join(RESULTS, 'lighthouse', 'summary.json'))

const gates = []
const metrics = []

// vitest
let unitSkipped = 0
if (vitestRaw) {
  const passed = vitestRaw.numPassedTests ?? 0
  const failed = vitestRaw.numFailedTests ?? 0
  // vitest reports skipped tests as "pending" in the JSON reporter.
  unitSkipped = vitestRaw.numPendingTests ?? vitestRaw.numSkippedTests ?? 0
  gates.push({ name: 'unit tests', result: failed === 0 ? 'PASS' : 'FAIL', note: `${passed} passed · ${failed} failed · ${unitSkipped} skipped` })
  metrics.push(['unit passed', String(passed)], ['unit failed', String(failed)], ['unit skipped', String(unitSkipped)])
} else {
  gates.push({ name: 'unit tests', result: 'PENDING', note: 'missing quality-results/vitest/results.json' })
}

// playwright
let playwrightSkipped = []
if (playwright) {
  const stats = playwright.stats ?? {}
  const expected = stats.expected ?? 0
  const unexpected = (stats.unexpected ?? 0) + (stats.flaky ?? 0)
  // The Playwright JSON reporter has no `total`; derive it from the four counters.
  const total = expected + (stats.skipped ?? 0) + (stats.unexpected ?? 0) + (stats.flaky ?? 0)

  // Tests are nested as suites[].specs[].tests[]; a skipped test carries its
  // written reason in annotations[].description.
  playwrightSkipped = []
  const walkSuites = (suite) => {
    for (const child of suite.suites ?? []) walkSuites(child)
    for (const spec of suite.specs ?? []) {
      for (const test of spec.tests ?? []) {
        const results = test.results ?? []
        const last = results.length > 0 ? results[results.length - 1] : null
        const status = last?.status ?? test.status
        if (status !== 'skipped') continue
        const reason =
          (test.annotations ?? []).find((a) => a.type === 'skip')?.description ??
          (spec.annotations ?? []).find((a) => a.type === 'skip')?.description ??
          (suite.annotations ?? []).find((a) => a.type === 'skip')?.description ??
          'no reason recorded'
        playwrightSkipped.push({
          file: String(spec.file ?? '').split(/[\\/]/).pop(),
          title: spec.title ?? test.title ?? '(untitled)',
          reason,
        })
      }
    }
  }
  for (const suite of playwright.suites ?? []) walkSuites(suite)

  gates.push({
    name: 'e2e (Playwright)',
    result: unexpected === 0 && total > 0 ? 'PASS' : 'FAIL',
    note: `${expected} passed · ${playwrightSkipped.length} skipped · ${unexpected} failed (${total} total)`,
  })
  metrics.push(
    ['e2e total', String(total)],
    ['e2e passed', String(expected)],
    ['e2e skipped', String(stats.skipped ?? 0)],
    ['e2e failed', String(unexpected)],
  )
} else {
  gates.push({ name: 'e2e (Playwright)', result: 'PENDING', note: 'missing quality-results/playwright/results.json — run pnpm e2e' })
}

// axe
if (axe) {
  const count = axe.violations?.length ?? 0
  const ids = [...new Set((axe.violations ?? []).flatMap((v) => (v.violations ?? []).map((x) => x.id)))]
  gates.push({ name: 'axe (all routes, 360+1280px)', result: count === 0 ? 'PASS' : 'FAIL', note: count === 0 ? `0 violations across ${axe.routeTemplates ?? '?'} route templates × ${axe.viewports ?? '?'} viewports` : `${count} violation group(s): ${ids.join(', ')}` })
} else {
  gates.push({ name: 'axe (all routes, 360+1280px)', result: 'PENDING', note: 'missing quality-results/axe/routes.json' })
}

// WCAG 2.2 target size (2.5.8), measured in-browser by e2e/target-size.spec.ts
if (targetSize) {
  const failed = targetSize.failed ?? 0
  const unresolved = targetSize.unresolved ?? 0
  const nA = targetSize.notApplicable ?? 0
  const passed = targetSize.passed ?? 0
  const result = failed === 0 && unresolved === 0 ? 'PASS' : 'FAIL'
  gates.push({
    name: 'WCAG 2.2 target size (2.5.8)',
    result,
    note: `${passed}/${targetSize.total ?? '?'} measured ≥ ${targetSize.minTargetPx ?? 24}px · ${failed} below minimum · ${unresolved} unresolved · ${nA} not applicable`,
  })
  metrics.push(['target size measured', String(passed)], ['target size below 24px', String(failed)])
} else {
  gates.push({ name: 'WCAG 2.2 target size (2.5.8)', result: 'PENDING', note: 'missing quality-results/a11y/target-size.json — run pnpm e2e' })
}

// bundle
if (bundle) {
  metrics.push(['bundled routes', String(bundle.pages?.length ?? 0)])
  gates.push({ name: 'JS bundle budgets', result: bundle.passed ? 'PASS' : 'FAIL', note: `${bundle.pages?.length ?? 0} routes checked · content ≤ ${bundle.budgets?.contentKiB} KiB gzip` })
} else {
  gates.push({ name: 'JS bundle budgets', result: 'PENDING', note: 'missing quality-results/bundle.json — build first, then pnpm check:bundle' })
}

// lighthouse
if (lighthouse) {
  gates.push({ name: 'lighthouse', result: lighthouse.passed ? 'PASS' : 'FAIL', note: `mobile (Slow 4G) · ${lighthouse.pages?.length ?? 0} routes · a11y ≥ ${lighthouse.thresholds?.accessibility}%${lighthouse.runsPerRoute > 1 ? ` · median of ${lighthouse.runsPerRoute} runs` : ''}` })
  metrics.push(['lighthouse routes', String(lighthouse.pages?.length ?? 0)])
} else {
  gates.push({ name: 'lighthouse', result: 'PENDING', note: 'missing quality-results/lighthouse/summary.json — run pnpm quality:lighthouse with a server up' })
}

// cheap gates (skipped in artifact mode)
const contrastGate = FROM_ARTIFACTS
  ? { name: 'contrast tokens', result: 'PENDING', note: 're-run locally: pnpm check:contrast' }
  : (() => { const r = runGate(['scripts/check-contrast.mjs']); return { name: 'contrast tokens', result: r.result, note: r.note } })()
// The placeholder scan is a real content gate: it FAILS while CMS copy is
// pending (plan Phase 9). It is reported truthfully as a failing *documented
// acceptance gap* and excluded from the regression verdict, so CI still fails
// on real regressions without being blocked on editorial sign-off.
const placeholdersGate = FROM_ARTIFACTS
  ? { name: 'placeholder scan', result: 'PENDING', note: 'expected to fail while CMS content is pending', documented: true }
  : (() => {
      const r = runGate(['scripts/check-placeholders.mjs'])
      if (r.result === 'PASS') return { name: 'placeholder scan', result: 'PASS', note: r.note, documented: true }
      // Report how many placeholders remain rather than the bypass hint.
      const count = (r.output ?? '')
        .split('\n')
        .filter((line) => /^\s+\S+:\d+\s+\[/.test(line)).length
      return {
        name: 'placeholder scan',
        result: 'FAIL',
        note: `${count} placeholder${count === 1 ? '' : 's'} pending editorial sign-off — documented acceptance gap (plan Phase 9)`,
        documented: true,
      }
    })()
const clientSecretsGate = FROM_ARTIFACTS
  ? { name: 'client secrets scan', result: 'PENDING', note: 're-run locally: pnpm check:client-secrets' }
  : (() => { const r = runGate(['scripts/check-client-secrets.mjs']); return { name: 'client secrets scan', result: r.result, note: r.note } })()
gates.push(contrastGate, placeholdersGate, clientSecretsGate)

// A gate run with a bypass flag set is not evidence — surface it so the report
// cannot silently certify a skipped check.
const bypasses = ['SKIP_PLACEHOLDER_CHECK', 'SKIP_CLIENT_SECRETS_CHECK'].filter((k) => process.env[k])
if (bypasses.length > 0) {
  console.warn(
    `[quality-report] WARNING: ${bypasses.join(', ')} set in the environment — related gate results are not trustworthy.`,
  )
}

/// ── verdict ─────────────────────────────────────────────────────────────────
const regressionGates = gates.filter((g) => !g.documented)
const documentedFailures = gates.filter((g) => g.documented && g.result === 'FAIL')
const verdict = regressionGates.some((g) => g.result === 'FAIL')
  ? 'FAIL'
  : regressionGates.some((g) => g.result === 'PENDING')
    ? 'UNCERTAIN'
    : 'PASS'

const stamp = new Date().toISOString()

const md = []
md.push('# Quality Report')
md.push('')
md.push(`_Generated ${new Date(stamp).toUTCString()} by \`scripts/generate-quality-report.mjs\`_`)
md.push('')
md.push(`**Regression gate: ${verdict}**`)
md.push('')
md.push('## Gates')
md.push('')
md.push('| Gate | Result | Note |')
md.push('| --- | --- | --- |')
for (const gate of gates) md.push(`| ${gate.name} | ${gate.result} | ${(gate.note ?? '').replace(/\|/g, '/')} |`)
md.push('')
if (metrics.length > 0) {
  md.push('## Metrics')
  md.push('')
  md.push('| Metric | Value |')
  md.push('| --- | --- |')
  for (const [k, v] of metrics) md.push(`| ${k} | ${v} |`)
  md.push('')
}

if (bundle?.largestPages?.length) {
  md.push('## Largest routes (first-load JS, gzip)')
  md.push('')
  md.push('| Route | Kind | KiB |')
  md.push('| --- | --- | --- |')
  for (const p of bundle.largestPages) md.push(`| \`${p.route}\` | ${p.kind} | ${p.gzipKiB} |`)
  md.push('')
}

if (lighthouse) {
  const runs = lighthouse.runsPerRoute ?? 1
  md.push(`## Lighthouse (mobile, Slow 4G)`)
  md.push('')
  if (runs > 1) {
    md.push(
      `Each route is audited **${runs} times** and scored on the **median**. Lighthouse scores carry a documented margin of error of about +/-5, so a single sample against a hard threshold is a flaky gate; the full spread is kept below so the noise stays visible rather than hidden.`,
    )
    md.push('')
  }
  md.push('| Route | Performance | Accessibility | SEO | Best-practices | Perf spread | Status |')
  md.push('| --- | --- | --- | --- | --- | --- | --- |')
  for (const p of lighthouse.pages ?? []) {
    const spread = p.spread?.performance
    const spreadCell = spread ? `${spread.min}–${spread.max}` : '-'
    md.push(`| ${p.name} | ${p.scores.performance ?? '-'} | ${p.scores.accessibility ?? '-'} | ${p.scores.seo ?? '-'} | ${p.scores['best-practices'] ?? '-'} | ${spreadCell} | ${p.passed ? 'PASS' : 'FAIL'} |`)
  }
  md.push('')
}

if (axe) {
  md.push('## axe violations')
  md.push('')
  if ((axe.violations ?? []).length === 0) {
    md.push('None across all routes at 360px and 1280px.')
  } else {
    md.push('| Route | Viewport | Rule | Help | Nodes |')
    md.push('| --- | --- | --- | --- | --- |')
    for (const v of axe.violations) {
      for (const violation of v.violations ?? []) {
        md.push(`| ${v.route} | ${v.viewport} | \`${violation.id}\` | ${violation.help} | ${violation.nodes} |`)
      }
    }
  }
  md.push('')
}

if (targetSize) {
  md.push('## WCAG 2.2 Target Size (Minimum) — 2.5.8')
  md.push('')
  md.push(
    `Measured in a real browser by \`e2e/target-size.spec.ts\`; minimum ${targetSize.minTargetPx}px. Prose links are exempt and are not measured.`,
  )
  md.push('')
  md.push('| # | Control | Route | Hit area (px) | Status |')
  md.push('| --- | --- | --- | --- | --- |')
  for (const r of targetSize.results ?? []) {
    const size = r.measured ? `${r.measured.width}×${r.measured.height}` : '—'
    const status = r.status === 'N/A' ? `**N/A** — ${r.note ?? ''}` : `**${r.status}**`
    md.push(`| ${r.id} | ${r.control} | \`${r.route}\` | ${size} | ${status.replace(/\|/g, '/')} |`)
  }
  md.push('')
}

md.push('## Skipped tests & written reasons')
md.push('')
md.push(`_Playwright: ${playwrightSkipped.length} skipped · Vitest: ${unitSkipped} skipped._`)
md.push('')
md.push('| Suite | Test | Written reason |')
md.push('| --- | --- | --- |')
for (const t of playwrightSkipped) {
  md.push(`| \`${t.file}\` | ${t.title} | ${t.reason.replace(/\|/g, '/')} |`)
}
if (unitSkipped > 0) {
  md.push(
    `| \`__tests__/content-consistency.test.ts\` | live Sanity dataset consistency | Requires a configured Sanity project (\`NEXT_PUBLIC_SANITY_PROJECT_ID\` + dataset). Guarded by \`it.skipIf(!hasSanityConfig())\`; it cannot validate a real dataset in an environment without credentials. |`,
  )
}
md.push('')

md.push('## Documented acceptance gaps (not code regressions)')
md.push('')
if (documentedFailures.length > 0) {
  for (const g of documentedFailures) md.push(`- **${g.name}** — ${g.note}`)
} else {
  md.push('- None. All documented acceptance gaps are currently clear.')
}
md.push(
  `- **Journey 6** (scripted Sanity publish) is environment-gated. The test performs a real create → publish → verify → delete cycle against the development dataset and is skipped here only because \`SANITY_API_WRITE_TOKEN\` / \`NEXT_PUBLIC_SANITY_PROJECT_ID\` / \`NEXT_PUBLIC_SANITY_DATASET\` are not configured in this environment.`,
)
md.push(
  '- **Styleguide suite** is skipped when the suite runs against a production-style server, because `/styleguide` intentionally returns 404 in production by design. Run `pnpm e2e` against the dev server to execute it.',
)
md.push('')
md.push(
  '> These gaps are excluded from the regression gate above so that CI still fails on real regressions. They must clear before launch (plan §20 Definition of Done).',
)
md.push('')
md.push('---')
md.push('')
md.push('**How to run:** `pnpm typecheck && pnpm lint && pnpm test && pnpm --filter web run build && pnpm e2e && pnpm quality:bundle && pnpm quality:lighthouse && pnpm quality:report`')

writeFileSync(DOC, md.join('\n'))

// ── auto-mark the a11y-checklist regression line ────────────────────────────
if (existsSync(CHECKLIST)) {
  const checklist = readFileSync(CHECKLIST, 'utf8')
  // Idempotent + global: strip any previously appended auto-marks so repeated
  // runs cannot accumulate timestamps, then stamp every occurrence.
  const cleaned = checklist.replace(/(\s*←\s*auto-marked[^\n]*?)+(?=\s*←\s*auto-marked)/g, '')
  const stamp_ = `← auto-marked ${new Date(stamp).toUTCString()}`
  const updated = cleaned.replace(
    /REGRESSION-STATUS:\s*(PASS|FAIL|UNCERTAIN)(\s*←\s*auto-marked[^\n]*)?/g,
    `REGRESSION-STATUS: ${verdict}  ${stamp_}`,
  )
  writeFileSync(CHECKLIST, updated)
}

console.log(`[quality-report] ${verdict} — wrote ${DOC}`)
process.exit(verdict === 'FAIL' ? 1 : 0)