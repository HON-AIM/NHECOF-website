#!/usr/bin/env node
/**
 * Weekly content review reminder (NHECOF).
 *
 * Emails the content manager a list of Articles and Food Profiles whose
 * "Next Review Due" date has passed or falls due within the next 30 days.
 * The filter is identical to the Studio's own "Content Due for Review" list,
 * so the email and the sidebar always agree.
 *
 * Usage
 *   node scripts/send-review-reminders.mjs --dry-run
 *   node scripts/send-review-reminders.mjs --dataset=development
 *   node scripts/send-review-reminders.mjs --fixture          # no credentials needed
 *   node scripts/send-review-reminders.mjs --allow-production # opt-in to prod reads
 *
 * Modes
 *   --dry-run   Do everything except send. Renders the email and writes a
 *               preview to quality-results/review-reminder-preview.{txt,html}.
 *   --fixture   Run the whole pipeline against built-in sample rows instead of
 *               Sanity. Used by tests and for training new content managers.
 *
 * Required env (unless --dry-run/--fixture):
 *   SANITY_STUDIO_PROJECT_ID or NEXT_PUBLIC_SANITY_PROJECT_ID
 *   SANITY_API_READ_TOKEN                 read access to the dataset
 *   CONTENT_MANAGER_EMAIL                 who receives the reminder
 *   RESEND_API_KEY                        sending
 *   FORMS_EMAIL_FROM                      verified Resend sender
 *
 * Optional:
 *   SANITY_STUDIO_DATASET / SANITY_DATASET  defaults to `development`
 *   NEXT_PUBLIC_SITE_URL                    used to build links in the email
 *   LH_RUNS-equivalent override: REVIEW_REMINDER_WITHIN_DAYS
 *
 * Safety: the job refuses to read the `production` dataset unless
 * --allow-production is passed, so a misconfigured secret cannot mail
 * production review dates during a rehearsal.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  DUE_CONTENT_QUERY,
  REMINDER_TYPES,
  WITHIN_DAYS,
  collectDueContent,
  renderEmail,
  toIsoDate,
} from './lib/review-reminders.mjs'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = path.resolve(HERE, '..')
const REPO_ROOT = path.resolve(WEB_ROOT, '..', '..')
const OUT_DIR = path.join(REPO_ROOT, 'quality-results')

const argv = process.argv.slice(2)
const has = (flag) => argv.includes(flag)
const valueOf = (name) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : undefined
}

const DRY_RUN = has('--dry-run')
const FIXTURE = has('--fixture')
const ALLOW_PRODUCTION = has('--allow-production')
const withinDays = Number(valueOf('within-days') ?? process.env.REVIEW_REMINDER_WITHIN_DAYS ?? WITHIN_DAYS)

const dataset = valueOf('dataset') ?? process.env.SANITY_STUDIO_DATASET ?? process.env.SANITY_DATASET ?? 'development'
const projectId = process.env.SANITY_STUDIO_PROJECT_ID ?? process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

const today = toIsoDate(new Date())
const cutoff = toIsoDate(new Date(Date.parse(`${today}T00:00:00Z`) + withinDays * 86_400_000))

/** Sample rows so the pipeline can be demonstrated with no credentials at all. */
const FIXTURE_ROWS = [
  {
    _id: 'fixture-article-overdue',
    _type: 'article',
    title: 'SAMPLE — Understanding food labels',
    slug: 'understanding-food-labels',
    lastReviewedAt: '2025-06-01T09:00:00Z',
    nextReviewAt: '2025-09-01',
    reviewer: 'Sample Reviewer',
  },
  {
    _id: 'fixture-food-due-soon',
    _type: 'foodProfile',
    title: 'SAMPLE — Moringa leaves',
    slug: 'moringa-leaves',
    lastReviewedAt: '2026-01-10T09:00:00Z',
    nextReviewAt: cutoff,
    reviewer: 'Sample Reviewer',
  },
]

function fail(message) {
  console.error(`[review-reminders] ${message}`)
  process.exit(1)
}

function log(message) {
  console.log(`[review-reminders] ${message}`)
}

async function fetchFromSanity() {
  // Check the dangerous thing first, so the guard cannot be shadowed by an
  // unrelated missing credential.
  if (dataset === 'production' && !ALLOW_PRODUCTION) {
    fail('Refusing to read the production dataset without --allow-production. Rehearse against `development`.')
  }
  if (!projectId) {
    fail('SANITY_STUDIO_PROJECT_ID (or NEXT_PUBLIC_SANITY_PROJECT_ID) is not set. Use --fixture to run without Sanity.')
  }

  const { createClient } = await import('@sanity/client')
  const client = createClient({
    projectId,
    dataset,
    apiVersion: process.env.SANITY_STUDIO_API_VERSION ?? '2025-01-01',
    useCdn: false,
    token: process.env.SANITY_API_READ_TOKEN,
  })

  log(`querying Sanity project=${projectId} dataset=${dataset} cutoff=${cutoff}`)
  const rows = await client.fetch(DUE_CONTENT_QUERY, { types: REMINDER_TYPES, cutoff })
  log(`matched ${rows.length} approved item(s) with nextReviewAt <= ${cutoff}`)
  return rows
}

async function main() {
  log(`run date=${today} window=${withinDays}d mode=${FIXTURE ? 'fixture' : 'sanity'}${DRY_RUN ? ' (dry run)' : ''}`)

  const rows = FIXTURE ? FIXTURE_ROWS : await fetchFromSanity()
  const { overdue, dueSoon, unreadable, cutoff: effectiveCutoff } = collectDueContent(rows, {
    today,
    withinDays,
  })

  if (unreadable.length) {
    log(`WARNING: ${unreadable.length} item(s) had an unreadable nextReviewAt and were listed nowhere. Check them by hand.`)
  }
  log(`overdue=${overdue.length} dueSoon=${dueSoon.length} (window closes ${effectiveCutoff})`)

  const email = renderEmail({ overdue, dueSoon, today, withinDays, siteUrl })

  mkdirSync(OUT_DIR, { recursive: true })
  writeFileSync(path.join(OUT_DIR, 'review-reminder-preview.txt'), `${email.subject}\n\n${email.text}\n`)
  writeFileSync(path.join(OUT_DIR, 'review-reminder-preview.html'), email.html)

  if (email.total === 0) {
    log('nothing due — no email sent. (This is normal on most weeks.)')
    return
  }

  if (DRY_RUN || FIXTURE) {
    log('DRY RUN: not sending. Preview written to quality-results/review-reminder-preview.{txt,html}')
    console.log('\n--- subject ---')
    console.log(email.subject)
    console.log('--- body ---\n')
    console.log(email.text)
    if (!DRY_RUN && !FIXTURE) return
    return
  }

  const to = process.env.CONTENT_MANAGER_EMAIL
  if (!to) fail('CONTENT_MANAGER_EMAIL is not set.')
  if (!process.env.RESEND_API_KEY) fail('RESEND_API_KEY is not set.')
  const from = process.env.FORMS_EMAIL_FROM
  if (!from) fail('FORMS_EMAIL_FROM is not set to a sender verified in Resend.')

  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY)
  const result = await resend.emails.send({
    from,
    to,
    subject: email.subject,
    text: email.text,
    html: email.html,
  })

  if (result.error) fail(`Resend delivery failed: ${result.error.message}`)
  log(`sent "${email.subject}" to ${to} (id ${result.data?.id ?? 'unknown'})`)
}

main().catch((error) => fail(error?.stack ?? String(error)))
