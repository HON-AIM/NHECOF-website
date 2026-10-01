#!/usr/bin/env node

/**
 * WCAG AA Contrast Checker for NHECOF Design Tokens
 *
 * Reads tokens.css, extracts intended text/background colour pairs,
 * computes relative luminance and contrast ratios, and fails if any
 * pair is below 4.5:1 (normal text) or 3:1 (large text / UI components).
 *
 * Usage: node scripts/check-contrast.mjs
 * (or: pnpm check:contrast)
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tokensPath = resolve(__dirname, '../apps/web/src/styles/tokens.css')

let tokensRaw
try {
  tokensRaw = readFileSync(tokensPath, 'utf-8')
} catch {
  // Try alternative path (running from root)
  try {
    tokensRaw = readFileSync(resolve(__dirname, 'apps/web/src/styles/tokens.css'), 'utf-8')
  } catch {
    console.error(`Could not read tokens.css at ${tokensPath}`)
    process.exit(1)
  }
}

// ── Parse CSS custom properties ──────────────────────────────────────────────
const colorVars = new Map()
const varRegex = /--color-([\w\\.-]+):\s*([^;]+)/g
let match
while ((match = varRegex.exec(tokensRaw)) !== null) {
  const name = match[1].replace(/\\\./g, '.')
  const value = match[2].trim()
  colorVars.set(`--color-${name}`, value)
}

function hexToRgb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const num = parseInt(hex, 16)
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function relativeLuminance({ r, g, b }) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relativeLuminance(rgb1)
  const l2 = relativeLuminance(rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

// ── Intended colour pairs ────────────────────────────────────────────────────
// Text colour on background colour: [textVar, bgVar, isLargeText, label]
const pairs = [
  // Body text
  ['ink-900', 'paper-50', false, 'Body text (ink-900 on paper-50)'],
  ['ink-900', 'paper-100', false, 'Body text (ink-900 on paper-100)'],
  ['ink-900', 'paper-200', false, 'Body text (ink-900 on paper-200)'],
  ['ink-800', 'paper-50', false, 'Body text secondary (ink-800 on paper-50)'],
  ['ink-700', 'paper-50', false, 'Muted text (ink-700 on paper-50)'],
  ['ink-500', 'paper-50', false, 'Subtle text (ink-500 on paper-50)'],
  // Placeholder/muted copy uses ink-400, the lightest text-permitted step
  // (4.98:1 on paper-50, 4.81:1 on paper-100).
  ['ink-400', 'paper-50', false, 'Placeholder text (ink-400 on paper-50)'],
  ['ink-400', 'paper-100', false, 'Placeholder text (ink-400 on paper-100)'],
  // paper-200 is a mid-tone surface: ink-400 (4.1:1) and ink-500 (4.2:1) both
  // fall short there, so muted copy steps up to ink-600. Same for darker surfaces.
  ['ink-600', 'paper-200', false, 'Placeholder text (ink-600 on paper-200)'],
  ['ink-500', 'paper-100', false, 'Muted caption (ink-500 on paper-100)'],

  // White text on brand colours.
  // Clay is the CTA colour, so it carries white text at AA.
  ['#ffffff', 'leaf-700', false, 'White on leaf-700 (buttons)'],
  ['#ffffff', 'leaf-900', false, 'White on leaf-900'],
  ['#ffffff', 'leaf-950', false, 'White on leaf-950'],
  ['#ffffff', 'clay-600', false, 'White on clay-600 (PRIMARY CTA)'],
  ['#ffffff', 'clay-700', false, 'White on clay-700'],
  ['#ffffff', 'clay-900', false, 'White on clay-900'],
  // Gold is a HIGHLIGHT, not a CTA. white-on-gold-600 is 3.7:1 and cannot take
  // body text; gold-700 (4.7:1) is the floor if white text is ever needed.
  ['#ffffff', 'gold-700', false, 'White on gold-700 (gold floor for white text)'],
  ['#ffffff', 'gold-800', false, 'White on gold-800'],
  ['#ffffff', 'gold-900', false, 'White on gold-900'],
  ['#ffffff', 'ink-900', false, 'White on ink-900'],
  ['#ffffff', 'ink-800', false, 'White on ink-800'],

  // Brand text on white / paper backgrounds
  ['leaf-700', 'paper-50', false, 'Leaf-700 on paper-50 (links)'],
  ['leaf-700', '#ffffff', false, 'Leaf-700 on white'],
  ['leaf-800', 'paper-50', false, 'Leaf-800 on paper-50'],
  ['leaf-900', 'paper-50', false, 'Leaf-900 on paper-50'],
  ['clay-600', 'paper-50', false, 'Clay-600 on paper-50 (action text)'],
  ['clay-700', 'paper-50', false, 'Clay-700 on paper-50'],
  ['clay-900', 'paper-50', false, 'Clay-900 on paper-50'],
  // Gold as TEXT on paper: gold-600 (3.4:1) and gold-700 (4.3:1) both fail AA at
  // normal size. gold-800 is the floor for gold body text; 600/700 are large-text
  // or rule accents only, asserted below at the 3:1 threshold.
  ['gold-800', 'paper-50', false, 'Gold-800 on paper-50 (gold body text)'],
  ['gold-900', 'paper-50', false, 'Gold-900 on paper-50'],
  ['gold-600', 'paper-50', true, 'Gold-600 on paper-50 (LARGE text/rule only)'],
  ['gold-600', 'paper-100', true, 'Gold-600 on paper-100 (LARGE text/rule only)'],

  // Highlight and callout surfaces: ink on the pale tints, never gold on gold.
  ['ink-900', 'gold-100', false, 'Ink-900 on gold-100 (quote block)'],
  ['ink-900', 'gold-50', false, 'Ink-900 on gold-50 (quote block, subtle)'],
  ['ink-700', 'gold-100', false, 'Ink-700 on gold-100'],
  ['ink-900', 'clay-100', false, 'Ink-900 on clay-100 (callout)'],
  ['ink-900', 'leaf-100', false, 'Ink-900 on leaf-100'],
  // Badge surfaces
  ['gold-800', 'gold-100', false, 'Gold-800 on gold-100 (gold badge)'],
  ['clay-800', 'clay-100', false, 'Clay-800 on clay-100 (clay badge)'],
  ['leaf-800', 'leaf-100', false, 'Leaf-800 on leaf-100 (leaf badge)'],

  // Headings
  ['ink-900', 'paper-50', true, 'Heading on paper-50 (large text)'],
  ['leaf-700', 'paper-50', true, 'Leaf heading on paper-50 (large text)'],

  // Semantic colours
  ['success', '#ffffff', false, 'Success text on white'],
  ['success-dark', 'paper-50', false, 'Success dark on paper-50'],
  ['warning', '#ffffff', false, 'Warning text on white'],
  ['warning-dark', 'paper-50', false, 'Warning dark on paper-50'],
  ['error', '#ffffff', false, 'Error text on white'],
  ['error-dark', 'paper-50', false, 'Error dark on paper-50'],
  ['info', '#ffffff', false, 'Info text on white'],
  ['info-dark', 'paper-50', false, 'Info dark on paper-50'],

  // UI elements: borders on backgrounds.
  // ink-100/200/300 are DECORATIVE ONLY — all fall below 3:1 on paper and are
  // never used for text. ink-400 is the floor for meaningful borders.
  ['ink-400', 'paper-50', false, 'Border floor (ink-400 on paper-50)', false, true],
  ['leaf-300', 'paper-50', false, 'Focus ring (leaf-300 on paper-50)', false, true],
  ['leaf-400', 'paper-50', false, 'Border (leaf-400 on paper-50)', false, true],

  // Leaf buttons pressed/hover states
  ['leaf-600', 'paper-50', false, 'Leaf-600 on paper-50'],
  ['leaf-500', 'paper-50', false, 'Leaf-500 on paper-50'],
]

function resolveColor(value) {
  if (value.startsWith('#')) return hexToRgb(value)
  const varName = value.startsWith('[') ? value.slice(1, -1) : `--color-${value}`
  const hex = colorVars.get(varName)
  if (!hex) return null
  if (hex.startsWith('#')) return hexToRgb(hex)
  // Handle var() references
  const innerMatch = hex.match(/var\(([^)]+)\)/)
  if (innerMatch) {
    const innerHex = colorVars.get(innerMatch[1])
    if (innerHex && innerHex.startsWith('#')) return hexToRgb(innerHex)
  }
  return null
}

// ── Check pairs ──────────────────────────────────────────────────────────────
const THRESHOLD_NORMAL = 4.5
const THRESHOLD_LARGE = 3.0
const THRESHOLD_UI = 3.0

let failures = 0
let passes = 0
let warnings = 0
const results = []

for (const [textName, bgName, isLarge, label, isWarning, isUI] of pairs) {
  const textRgb = resolveColor(textName)
  const bgRgb = resolveColor(bgName)

  if (!textRgb) {
    console.warn(`  ⚠ Could not resolve text colour: ${textName}`)
    warnings++
    continue
  }
  if (!bgRgb) {
    console.warn(`  ⚠ Could not resolve background colour: ${bgName}`)
    warnings++
    continue
  }

  const ratio = contrastRatio(textRgb, bgRgb)
  const threshold = isLarge || isUI ? THRESHOLD_LARGE : THRESHOLD_NORMAL
  const passesRatio = ratio >= threshold

  if (passesRatio) {
    passes++
    results.push({ label, ratio, threshold, pass: true })
  } else {
    failures++
    results.push({ label, ratio, threshold, pass: false })
  }
}

// ── Report ───────────────────────────────────────────────────────────────────
console.log('\n┌──────────────────────────────────────────────────────────────┐')
console.log('│           NHECOF WCAG AA Contrast Report                     │')
console.log('├──────────────────────────────────────────────────────────────┤')

for (const { label, ratio, threshold, pass } of results) {
  const status = pass ? '✓' : '✗'
  const thresholdLabel = threshold === THRESHOLD_LARGE ? '3:1' : '4.5:1'
  const ratioStr = ratio.toFixed(2).padStart(5)
  const line = `│ ${status}  ${ratioStr}:1 (≥${thresholdLabel})  ${label}`
  console.log(line.padEnd(63) + '│')
}

console.log('├──────────────────────────────────────────────────────────────┤')
console.log(`│  ${passes} passed, ${failures} failed, ${warnings} warnings`.padEnd(63) + '│')
console.log('└──────────────────────────────────────────────────────────────┘')

if (failures > 0) {
  console.error(`\n❌ ${failures} colour pair(s) below WCAG AA threshold.\n`)
  process.exit(1)
} else {
  console.log(`\n✅ All ${passes} colour pairs pass WCAG AA contrast requirements.\n`)
  process.exit(0)
}
