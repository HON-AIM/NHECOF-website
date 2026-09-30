#!/usr/bin/env node
/**
 * Dependency-audit gate.
 *
 * Runs `pnpm audit` across the workspace and decides whether the result should
 * fail the build, using the reviewed exception list in
 * `security/audit-exceptions.json`.
 *
 * Why not just `pnpm audit --prod --audit-level high`
 * ----------------------------------------------------
 * A gate that cannot pass gets disabled, and a disabled gate protects nothing.
 * The advisories still outstanding all live in `apps/studio`'s dependency tree
 * (the Sanity framework's own build tooling), which is deployed as a static
 * bundle and therefore never reaches a browser or a server. Refusing to ship
 * until Sanity publishes a fix would mean shipping nothing.
 *
 * So the gate distinguishes the two surfaces and is strict where it matters:
 *  - `apps/web` is the deployed server. ANY high or critical advisory there
 *    fails the build. There are no exceptions permitted for this scope, which
 *    is why the list has none.
 *  - `apps/studio` advisories must be individually reviewed, listed with an
 *    owner and a rationale, and re-triaged on a schedule.
 *
 * The gate also fails on:
 *  - an exception whose `reviewBy` date has passed (stops exceptions becoming
 *    permanent, which is how real vulnerabilities get normalised);
 *  - an exception that no longer matches a reported advisory (stale exception —
 *    usually a sign someone copied a rationale without checking);
 *  - an exception with an unrecognised `scope`.
 *
 * Exit codes: 0 pass, 1 fail.
 *
 * Usage:
 *   node scripts/audit-gate.mjs              # audit and gate
 *   node scripts/audit-gate.mjs --report-only # never fail (for reporting)
 */

import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const REPORT_ONLY = process.argv.includes('--report-only')
const SERVER_SCOPE = 'apps/web'
const BLOCKING_SEVERITIES = new Set(['critical', 'high'])
const SEVERITY_ORDER = ['critical', 'high', 'moderate', 'low']

const exceptionsPath = resolve('security/audit-exceptions.json')
const outputPath = resolve('quality-results/dependency-audit.md')

/* ── Load reviewed exceptions ─────────────────────────────────────────────── */

function loadExceptions() {
  let parsed
  try {
    parsed = JSON.parse(readFileSync(exceptionsPath, 'utf8'))
  } catch (error) {
    console.error(`[audit-gate] cannot read ${exceptionsPath}: ${error.message}`)
    process.exit(1)
  }

  const today = new Date().toISOString().slice(0, 10)
  const problems = []
  const valid = []

  for (const entry of parsed.exceptions ?? []) {
    for (const field of ['id', 'module', 'severity', 'reason', 'owner', 'reviewBy']) {
      if (!entry[field]) problems.push(`exception ${entry.id ?? '(no id)'} is missing "${field}"`)
    }
    if (entry.scope && entry.scope !== SERVER_SCOPE) {
      if (entry.scope !== 'apps/studio') {
        problems.push(`exception ${entry.id} has an unrecognised scope "${entry.scope}"`)
      }
    } else if (!entry.scope) {
      // An exception with no scope applies everywhere, which would let someone
      // excuse an advisory in the deployed server. Make that explicit instead.
      problems.push(
        `exception ${entry.id} has no "scope". Add "scope": "${SERVER_SCOPE}" to excuse a web advisory deliberately, or "apps/studio".`,
      )
    }

    if (entry.reviewBy && entry.reviewBy < today) {
      problems.push(
        `exception ${entry.id} (${entry.module}) passed its reviewBy date of ${entry.reviewBy}. Re-triage it: fix the dependency, or re-review and move reviewBy forward with a note.`,
      )
    }
    valid.push(entry)
  }

  return { exceptions: valid, problems }
}

/* ── Run the audit ────────────────────────────────────────────────────────── */

function runAudit() {
  try {
    const stdout = execFileSync('pnpm', ['audit', '--prod', '--json'], {
      encoding: 'utf8',
      maxBuffer: 32 * 1024 * 1024,
      // pnpm exits non-zero when advisories are found; the JSON is still valid.
      stdio: ['ignore', 'pipe', 'pipe'],
      // Required on Windows, where pnpm is a .cmd/.ps1 shim that cannot be
      // spawned directly. The arguments are static, so there is no injection
      // surface from a shell here.
      shell: process.platform === 'win32',
    })
    return parseJson(stdout)
  } catch (error) {
    // Non-zero exit still carries JSON on stdout.
    if (error.stdout) {
      try {
        return parseJson(error.stdout)
      } catch {
        /* fall through */
      }
    }
    // A network or registry failure must not be reported as "clean".
    console.error('[audit-gate] could not run `pnpm audit`.')
    console.error(String(error.stderr || error.message).slice(0, 800))
    process.exit(1)
  }
}

function parseJson(raw) {
  let text = typeof raw === 'string' ? raw : String(raw)
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1)
  return JSON.parse(text)
}

/* ── Evaluate ─────────────────────────────────────────────────────────────── */

const { exceptions, problems } = loadExceptions()
const report = runAudit()

const advisories = Object.values(report.advisories ?? {}).map((advisory) => {
  const paths = advisory.findings?.[0]?.paths ?? []
  const topLevelScopes = [...new Set(paths.map((p) => p.split('>')[0]))]
  return {
    id: advisory.github_advisory_id ?? advisory.url ?? 'unknown',
    module: advisory.module_name,
    severity: advisory.severity,
    title: advisory.title ?? advisory.findings?.[0]?.title ?? '',
    patched: advisory.patched_versions ?? 'unknown',
    paths,
    topLevelScopes,
    // A scope is "server" if any path runs through apps/web.
    inServer: topLevelScopes.some((scope) => scope.startsWith(SERVER_SCOPE)),
  }
})

const matched = new Set()
const blocking = []
const unexcepted = []

for (const advisory of advisories) {
  // Collect *all* matching exceptions rather than the first. A module can have
  // several advisories under one exception (decompress) and several exceptions
  // under one module (adm-zip); taking only the first would mark the second
  // exception stale even though it does describe a real advisory.
  const matches = exceptions.filter(
    (e) => scopeMatches(e, advisory) && identityMatches(e, advisory),
  )

  if (matches.length > 0) {
    for (const match of matches) matched.add(match.id)
    continue
  }

  if (BLOCKING_SEVERITIES.has(advisory.severity)) {
    if (advisory.inServer) blocking.push(advisory)
    else unexcepted.push(advisory)
  }
}

/**
 * An exception only excuses advisories from the surface it was written for.
 * A Studio exception must not silently excuse a server advisory, which is how
 * a reviewed exception turns into an unreviewed one.
 */
function scopeMatches(exception, advisory) {
  if (exception.scope === SERVER_SCOPE) return advisory.inServer
  if (exception.scope === 'apps/studio') return !advisory.inServer
  // A missing scope was already reported as a problem above.
  return true
}

function identityMatches(exception, advisory) {
  return exception.id === advisory.id || exception.module === advisory.module
}

// Exceptions that no longer correspond to a reported advisory.
const staleExceptions = exceptions.filter((e) => !matched.has(e.id))

/* ── Report ───────────────────────────────────────────────────────────────── */

const failed = blocking.length > 0 || problems.length > 0 || (!REPORT_ONLY && unexcepted.length > 0)

const lines = [
  '# Dependency audit',
  '',
  `Run: \`node scripts/audit-gate.mjs\` · ${new Date().toISOString()}`,
  '',
  `**Result: ${failed ? 'FAIL' : 'PASS'}**`,
  '',
  `Blocking scope: \`${SERVER_SCOPE}\` (the deployed server) — no exceptions permitted.`,
  '',
  '## Blocking (high/critical in the deployed server)',
  '',
  blocking.length
    ? ['| Advisory | Module | Severity | Patched in |', '|---|---|---|---|', ...blocking.map((a) => `| ${a.id} | \`${a.module}\` | ${a.severity} | ${a.patched} |`)].join('\n')
    : '_None._',
  '',
  '## Reported but not blocking',
  '',
  '| Advisory | Module | Severity | Scope | Patched in |',
  '|---|---|---|---|---|',
  ...advisories
    .filter((a) => !blocking.includes(a))
    .sort(
      (a, b) =>
        SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) ||
        a.module.localeCompare(b.module),
    )
    .map((a) => `| ${a.id} | \`${a.module}\` | ${a.severity} | ${a.topLevelScopes.join(', ')} | ${a.patched} |`),
  '',
  '## Reviewed exceptions',
  '',
  exceptions.length
    ? ['| Advisory | Module | Severity | Scope | Fix available | Review by |', '|---|---|---|---|---|---|', ...exceptions.map((e) => `| ${e.id} | \`${e.module}\` | ${e.severity} | ${e.scope ?? 'unset'} | ${e.fixAvailable ? 'yes' : 'no'} | ${e.reviewBy} |`)].join('\n')
    : '_None._',
  '',
]

if (staleExceptions.length) {
  lines.push('### Stale exceptions', '', ...staleExceptions.map((e) => `- ${e.id} (\`${e.module}\`) is no longer reported — remove it or correct its id.`), '')
}

if (problems.length) {
  lines.push('### Exception-list problems', '', ...problems.map((p) => `- ${p}`), '')
}

lines.push(
  '## How to add an exception',
  '',
  '1. Confirm the advisory is genuinely unreachable in production.',
  '2. Add an entry to `security/audit-exceptions.json` with a reason, an owner,',
  '   a `reviewBy` date at most 90 days out, and `scope`.',
  '3. Never add an exception scoped to `apps/web` without a written rationale',
  '   in the pull request.',
  '',
)

mkdirSync(dirname(outputPath), { recursive: true })
writeFileSync(outputPath, lines.join('\n'))

console.log(`[audit-gate] advisories: ${advisories.length}`)
console.log(`[audit-gate] blocking (${SERVER_SCOPE}): ${blocking.length}`)
console.log(`[audit-gate] reviewed exceptions matched: ${matched.size}/${exceptions.length}`)
if (staleExceptions.length) console.log(`[audit-gate] stale exceptions: ${staleExceptions.length}`)
for (const problem of problems) console.log(`[audit-gate] PROBLEM: ${problem}`)
if (!REPORT_ONLY && unexcepted.length) {
  console.log(`[audit-gate] unexcepted high/critical outside ${SERVER_SCOPE}: ${unexcepted.length}`)
  for (const a of unexcepted) console.log(`[audit-gate]   ${a.severity} ${a.module} (${a.id})`)
}
console.log(`[audit-gate] report: ${outputPath}`)
console.log(`[audit-gate] ${failed ? 'FAIL' : 'PASS'}`)

process.exit(failed ? 1 : 0)
