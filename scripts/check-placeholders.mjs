/**
 * Placeholder Check Script
 *
 * Scans source files for developer placeholder markers that must be replaced
 * with real CMS content before production launch. Fails the build when any
 * placeholder remains.
 *
 * Exit code 1 = placeholders found (blocks prod build)
 * Exit code 0 = clean (no placeholders)
 *
 * Usage:
 *   node scripts/check-placeholders.mjs
 *
 * Added to package.json as `check:placeholders` and wired into the `build`
 * script via a prebuild hook.
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, extname } from 'node:path'

const ROOT = join(import.meta.dirname, '..', 'apps', 'web', 'src')

const PLACEHOLDER_PATTERNS = [
  { pattern: /DEVELOPER\s+DEFAULT/gi, label: 'DEVELOPER DEFAULT comment' },
  { pattern: /to be wired/gi, label: '"to be wired" marker' },
  { pattern: /to be (added|populated|replaced|implemented)/gi, label: '"to be [action]" marker' },
  { pattern: /Photo pending/gi, label: '"Photo pending" placeholder' },
  { pattern: /form slot — to be wired/gi, label: 'Form slot placeholder' },
  { pattern: /placeholder (content|text|copy)/gi, label: 'Placeholder content marker' },
  { pattern: /Requires review by a qualified legal adviser/gi, label: 'Legal review required note' },
  { pattern: /Contact form — to be wired/gi, label: 'Contact form placeholder' },
  { pattern: /Partnership enquiry form — to be wired/gi, label: 'Partnership form placeholder' },
  { pattern: /Newsletter form — to be wired/gi, label: 'Newsletter form placeholder' },
]

const SKIP_DIRS = new Set(['node_modules', '.next', '.sanity', 'dist', 'build'])
const SKIP_FILES = new Set(['check-placeholders.mjs'])

function walk(dir) {
  const results = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walk(fullPath))
    } else if (
      ['.ts', '.tsx', '.js', '.jsx'].includes(extname(entry.name)) &&
      !SKIP_FILES.has(entry.name)
    ) {
      results.push(fullPath)
    }
  }
  return results
}

function main() {
  const files = walk(ROOT)
  const findings = []

  for (const file of files) {
    const content = readFileSync(file, 'utf-8')
    const rel = relative(ROOT, file)
    const lines = content.split('\n')

    for (const { pattern, label } of PLACEHOLDER_PATTERNS) {
      for (let i = 0; i < lines.length; i++) {
        pattern.lastIndex = 0
        if (pattern.test(lines[i])) {
          findings.push({
            file: rel,
            line: i + 1,
            label,
            text: lines[i].trim().slice(0, 100),
          })
        }
      }
    }
  }

  if (findings.length === 0) {
    console.log('✅ No placeholders found. Safe for production.')
    process.exit(0)
  }

  console.error('')
  console.error(`❌ ${findings.length} placeholder(s) found — production build blocked:`)
  console.error('')

  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  [${f.label}]`)
    console.error(`    ${f.text}`)
  }

  console.error('')
  console.error(
    'Replace all placeholders with real content, then re-run the build.',
  )
  console.error(
    'To bypass (not recommended), set SKIP_PLACEHOLDER_CHECK=true.',
  )

  process.exit(1)
}

if (process.env.SKIP_PLACEHOLDER_CHECK === 'true') {
  console.log('⏭  Placeholder check skipped (SKIP_PLACEHOLDER_CHECK=true)')
  process.exit(0)
}

main()
