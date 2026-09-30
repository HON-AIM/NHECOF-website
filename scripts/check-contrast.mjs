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
  ['ink-400', 'paper-50', false, 'Placeholder text (ink-400 on paper-50)', true],
  ['ink-400', 'paper-100', false, 'Placeholder text (ink-400 on paper-100)'],
  ['ink-500', 'paper-100', false, 'Muted caption (ink-500 on paper-100)'],

  // White text on brand colours
  ['#ffffff', 'leaf-700', false, 'White on leaf-700 (buttons)'],
  ['#ffffff', 'leaf-900', false, 'White on leaf-900'],
  ['#ffffff', 'leaf-950', false, 'White on leaf-950'],
  ['#ffffff', 'palm-600', false, 'White on palm-600 (action buttons)'],
  ['#ffffff', 'palm-700', false, 'White on palm-700'],
  ['#ffffff', 'palm-900', false, 'White on palm-900'],
  ['#ffffff', 'zobo-600', false, 'White on zobo-600'],
  ['#ffffff', 'zobo-700', false, 'White on zobo-700'],
  ['#ffffff', 'zobo-900', false, 'White on zobo-900'],
  ['#ffffff', 'ink-900', false, 'White on ink-900'],
  ['#ffffff', 'ink-800', false, 'White on ink-800'],

  // Brand text on white / paper backgrounds
  ['leaf-700', 'paper-50', false, 'Leaf-700 on paper-50 (links)'],
  ['leaf-700', '#ffffff', false, 'Leaf-700 on white'],
  ['leaf-800', 'paper-50', false, 'Leaf-800 on paper-50'],
  ['leaf-900', 'paper-50', false, 'Leaf-900 on paper-50'],
  ['palm-600', 'paper-50', false, 'Palm-600 on paper-50 (action text)'],
  ['palm-700', 'paper-50', false, 'Palm-700 on paper-50'],
  ['palm-900', 'paper-50', false, 'Palm-900 on paper-50'],
  ['zobo-600', 'paper-50', false, 'Zobo-600 on paper-50 (caution text)'],
  ['zobo-700', 'paper-50', false, 'Zobo-700 on paper-50'],
  ['zobo-900', 'paper-50', false, 'Zobo-900 on paper-50'],

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

  // UI elements: borders on backgrounds
  ['ink-200', 'paper-50', false, 'Border (ink-200 on paper-50)', false, true],
  ['ink-300', 'paper-50', false, 'Border subtle (ink-300 on paper-50)', false, true],
  ['leaf-300', 'paper-50', false, 'Focus ring (leaf-300 on paper-50)', false, true],

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
