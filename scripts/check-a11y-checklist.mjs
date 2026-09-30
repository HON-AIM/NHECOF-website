#!/usr/bin/env node
/**
 * Verifies docs/a11y-checklist.md is exhaustive and up to date:
 *  - lists every shared component,
 *  - contains all 20 WCAG 2.2 target-size rows (t-01 … t-20),
 *  - has a designated regression-status line.
 */
import { readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DOC = path.join(ROOT, 'docs', 'a11y-checklist.md')

const SHARED_COMPONENTS = [
  'Header',
  'Footer',
  'AnnouncementBar',
  'PageShell',
  'Breadcrumbs',
  'Button',
  'Link',
  'Card',
  'ArticleCard',
  'OutreachCard',
  'ProgramCard',
  'FoodCard',
  'ResourceCard',
  'PersonCard',
  'Stat',
  'Badge',
  'Heading',
  'Eyebrow',
  'Container',
  'Section',
  'Skeleton',
  'EmptyState',
  'Accordion',
  'Tabs',
  'Dialog',
  'Sheet',
  'Toast',
  'Pagination',
  'Prose',
  'Figure',
  'ResponsiveImage',
  'LeafCutFrame',
  'PatternDivider',
  'NutritionSearchDialog',
  'ShareButtons',
  'ArticleToc',
  'ErrorSummary',
  'Input',
  'Textarea',
  'Select',
  'Checkbox',
  'RadioGroup',
  'Label',
  'Field',
  'HelpText',
]

const TARGET_ROWS = Array.from({ length: 20 }, (_, i) => `t-${String(i + 1).padStart(2, '0')}`)

if (!existsSync(DOC)) {
  console.error(`[a11y-checklist] missing ${DOC}`)
  process.exit(1)
}

const text = readFileSync(DOC, 'utf8')

const missingComponents = SHARED_COMPONENTS.filter((c) => !text.includes(c))
const missingTargetRows = TARGET_ROWS.filter((t) => !text.includes(t))
const hasStatusLine = /REGRESSION-STATUS:\s*(?:PASS|FAIL|UNCERTAIN)/.test(text)

let failed = false
if (missingComponents.length > 0) {
  failed = true
  console.error(`[a11y-checklist] shared components missing from checklist: ${missingComponents.join(', ')}`)
}
if (missingTargetRows.length > 0) {
  failed = true
  console.error(`[a11y-checklist] target-size rows missing: ${missingTargetRows.join(', ')}`)
}
if (!hasStatusLine) {
  failed = true
  console.error('[a11y-checklist] no auto-marked REGRESSION-STATUS line present.')
}

if (failed) process.exit(1)
console.log(`[a11y-checklist] OK — ${SHARED_COMPONENTS.length} components, 20 target rows, status line present.`)