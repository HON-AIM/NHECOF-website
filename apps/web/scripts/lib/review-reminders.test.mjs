/**
 * Unit tests for the review reminder logic.
 * Run: node --test scripts/lib/
 *
 * These cover the parts that can silently go wrong: the date maths around the
 * 30-day window, the overdue/due-soon split, malformed dates, and whether the
 * rendered email actually names the overdue items.
 */

import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DUE_CONTENT_QUERY,
  REMINDER_TYPES,
  collectDueContent,
  daysUntil,
  describeDue,
  renderEmail,
  toIsoDate,
} from './review-reminders.mjs'

const row = (over = {}) => ({
  _id: 'a1',
  _type: 'article',
  title: 'Test article',
  slug: 'test-article',
  lastReviewedAt: '2026-01-01T00:00:00Z',
  nextReviewAt: '2026-06-01',
  reviewer: 'Dr Test',
  ...over,
})

test('toIsoDate returns a UTC YYYY-MM-DD string', () => {
  assert.equal(toIsoDate('2026-06-01T23:59:59Z'), '2026-06-01')
  assert.equal(toIsoDate(new Date('2026-06-01T00:00:00Z')), '2026-06-01')
})

test('daysUntil counts whole days, negative when past', () => {
  assert.equal(daysUntil('2026-06-01', '2026-06-01'), 0)
  assert.equal(daysUntil('2026-06-11', '2026-06-01'), 10)
  assert.equal(daysUntil('2026-05-22', '2026-06-01'), -10)
})

test('describeDue phrases past and future dates', () => {
  assert.equal(describeDue('2026-06-01', '2026-06-01'), 'due today')
  assert.equal(describeDue('2026-06-02', '2026-06-01'), 'due tomorrow')
  assert.equal(describeDue('2026-06-11', '2026-06-01'), 'due in 10 days')
  assert.equal(describeDue('2026-05-31', '2026-06-01'), '1 day overdue')
  assert.equal(describeDue('2026-05-22', '2026-06-01'), '10 days overdue')
})

test('collectDueContent splits overdue from due-soon at the 30 day boundary', () => {
  const result = collectDueContent(
    [
      row({ _id: 'overdue', nextReviewAt: '2026-05-01' }),
      row({ _id: 'today', nextReviewAt: '2026-06-01' }),
      row({ _id: 'edge', nextReviewAt: '2026-07-01' }),
      row({ _id: 'outside', nextReviewAt: '2026-08-01' }),
    ],
    { today: '2026-06-01' },
  )
  assert.deepEqual(result.overdue.map((r) => r.id), ['overdue'])
  assert.deepEqual(result.dueSoon.map((r) => r.id), ['today', 'edge'])
  assert.equal(result.cutoff, '2026-07-01')
})

test('collectDueContent keeps unreadable dates visible instead of dropping them', () => {
  const result = collectDueContent(
    [row({ _id: 'no-date', nextReviewAt: undefined }), row({ _id: 'bad-date', nextReviewAt: 'soon' })],
    { today: '2026-06-01' },
  )
  assert.equal(result.unreadable.length, 2)
  assert.equal(result.overdue.length + result.dueSoon.length, 0)
})

test('collectDueContent labels food profiles and builds their route', () => {
  const result = collectDueContent([row({ _type: 'foodProfile', slug: 'moringa', nextReviewAt: '2026-06-05' })], {
    today: '2026-06-01',
  })
  assert.equal(result.dueSoon[0].label, 'Food profile')
  assert.equal(result.dueSoon[0].url, '/nutrition/foods/moringa')
})

test('renderEmail names every overdue and due-soon item', () => {
  const { overdue, dueSoon } = collectDueContent(
    [row({ _id: 'o', title: 'Overdue one', nextReviewAt: '2026-05-01' }), row({ _id: 's', title: 'Soon one', nextReviewAt: '2026-06-10' })],
    { today: '2026-06-01' },
  )
  const email = renderEmail({ overdue, dueSoon, today: '2026-06-01', siteUrl: 'https://nhecof.org' })
  assert.equal(email.total, 2)
  assert.match(email.subject, /2 items due \(1 overdue\)/)
  assert.ok(email.text.includes('Overdue one'))
  assert.ok(email.text.includes('Soon one'))
  assert.ok(email.text.includes('https://nhecof.org/nutrition/articles/test-article'))
  assert.ok(email.html.includes('Overdue one'))
})

test('renderEmail uses a singular subject for one item', () => {
  const email = renderEmail({ overdue: [], dueSoon: [{ label: 'Article', title: 'One', nextReviewAt: '2026-06-05', due: 'due in 4 days', url: '/x' }], today: '2026-06-01' })
  assert.match(email.subject, /1 item due/)
})

test('renderEmail produces a no-op subject when nothing is due', () => {
  const email = renderEmail({ overdue: [], dueSoon: [], today: '2026-06-01' })
  assert.equal(email.total, 0)
  assert.match(email.subject, /nothing due/)
})

test('renderEmail escapes HTML in titles', () => {
  const email = renderEmail({
    overdue: [],
    dueSoon: [{ label: 'Article', title: '<img src=x onerror=alert(1)>', nextReviewAt: '2026-06-05', due: 'soon', url: '/x' }],
    today: '2026-06-01',
  })
  assert.ok(!email.html.includes('<img src=x'))
  assert.ok(email.html.includes('&lt;img'))
})

test('the GROQ query mirrors the Studio filter', () => {
  assert.ok(DUE_CONTENT_QUERY.includes('_type in $types'))
  assert.ok(DUE_CONTENT_QUERY.includes('reviewStatus == "approved"'))
  assert.ok(DUE_CONTENT_QUERY.includes('nextReviewAt <= $cutoff'))
  assert.deepEqual(REMINDER_TYPES, ['article', 'foodProfile'])
})
