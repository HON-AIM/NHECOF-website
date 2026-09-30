/**
 * Client Secrets Check Script
 *
 * Scans the built Next.js client bundle (.next/static) for server-only secret
 * environment variable names. A secret name present in a client bundle means
 * it was inlined into browser-served code — a leak. Public `NEXT_PUBLIC_*`
 * variables are expected in the client and are excluded from the scan.
 *
 * Exit code 1 = secret names found in client output (blocks prod build)
 * Exit code 0 = clean
 *
 * Usage:
 *   node scripts/check-client-secrets.mjs
 *
 * The build script must run this AFTER `next build`. Wired as `check:client-secrets`
 * and invoked from the root `build` script.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const WORKSPACE = join(import.meta.dirname, '..')
const STATIC_DIR = join(WORKSPACE, 'apps', 'web', '.next', 'static')

/**
 * Server-only secret env names. Add any NEW backend credential here so a
 * future inlining is caught at build time. The allow-list below are safe to
 * ship to browsers.
 */
const SECRET_PATTERNS = [
  { pattern: /RESEND_API_KEY/g, label: 'RESEND_API_KEY' },
  { pattern: /TURNSTILE_SECRET_KEY/g, label: 'TURNSTILE_SECRET_KEY' },
  { pattern: /UPSTASH_REDIS_REST_TOKEN/g, label: 'UPSTASH_REDIS_REST_TOKEN' },
  { pattern: /UPSTASH_REDIS_REST_URL/g, label: 'UPSTASH_REDIS_REST_URL' },
  { pattern: /CONTACT_RECIPIENT_EMAIL/g, label: 'CONTACT_RECIPIENT_EMAIL' },
  { pattern: /OUTREACH_RECIPIENT_EMAIL/g, label: 'OUTREACH_RECIPIENT_EMAIL' },
  { pattern: /PARTNERSHIP_RECIPIENT_EMAIL/g, label: 'PARTNERSHIP_RECIPIENT_EMAIL' },
  { pattern: /FORMS_EMAIL_FROM/g, label: 'FORMS_EMAIL_FROM' },
]

function walk(dir) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walk(fullPath))
    } else {
      results.push(fullPath)
    }
  }
  return results
}

function main() {
  if (!existsSync(STATIC_DIR)) {
    console.error(
      `❌ No client build found at ${relative(WORKSPACE, STATIC_DIR)}. Run \`pnpm build\` (which runs \`next build\`) first.`,
    )
    process.exit(1)
  }

  const files = walk(STATIC_DIR)
  const findings = []

  for (const file of files) {
    // Skip source maps' embedded sources (they mirror the pre-build src).
    let content = readFileSync(file, 'utf-8')
    if (file.endsWith('.map')) {
      try {
        content = JSON.parse(content).sourcesContent?.join('\n') ?? content
      } catch {
        continue
      }
    }

    const rel = relative(WORKSPACE, file)
    for (const { pattern, label } of SECRET_PATTERNS) {
      pattern.lastIndex = 0
      if (pattern.test(content)) {
        findings.push({ file: rel, label })
      }
    }
  }

  if (findings.length === 0) {
    console.log('✅ No server-only secrets found in the client bundle. Safe for production.')
    process.exit(0)
  }

  console.error('')
  console.error(`❌ Server-only secret(s) reached the client bundle — build blocked:`)
  console.error('')
  for (const f of findings) {
    console.error(`  ${f.file}  [${f.label}]`)
  }
  console.error('')
  console.error(
    'Server-side credentials must only be read inside route handlers / server modules,',
  )
  console.error('never via process.env in a file that the browser bundle imports.',
  )
  console.error('To bypass (not recommended), set SKIP_CLIENT_SECRETS_CHECK=true.')

  process.exit(1)
}

if (process.env.SKIP_CLIENT_SECRETS_CHECK === 'true') {
  console.log('⏭  Client secrets check skipped (SKIP_CLIENT_SECRETS_CHECK=true)')
  process.exit(0)
}

main()