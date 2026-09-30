/**
 * Pure, dependency-free logic for the weekly content review reminder.
 *
 * Kept separate from `send-review-reminders.mjs` so the date maths and the
 * email rendering can be unit tested without a network, a Sanity project or a
 * Resend key (see `review-reminders.test.mjs`).
 *
 * SCOPE NOTE — this deliberately mirrors the Studio's own "Content Due for
 * Review" list (apps/studio/structure/index.ts):
 *   _type in ["article","foodProfile"] && reviewStatus == "approved" && nextReviewAt <= today+N
 * `nextReviewAt` is a `date` field and exists on `article` and `foodProfile`
 * ONLY. Quotes, pages, resources, programs and outreach records have no such
 * field today, so they are not covered by these reminders. See
 * docs/studio-guide.md "What the reminders do not cover".
 */

export const WITHIN_DAYS = 30

/** Types that carry a `nextReviewAt` field. Keep in sync with the Studio. */
export const REMINDER_TYPES = ['article', 'foodProfile']

/** Public route prefix for each reminder type, matching apps/web routes. */
export const TYPE_ROUTES = {
  article: '/nutrition/articles',
  foodProfile: '/nutrition/foods',
}

/**
 * GROQ projection. `nextReviewAt` is a plain `YYYY-MM-DD` string, so the
 * comparison below is a correct lexicographic date comparison.
 */
export const DUE_CONTENT_QUERY = `*[
  _type in $types &&
  reviewStatus == "approved" &&
  defined(nextReviewAt) &&
  nextReviewAt <= $cutoff
] | order(nextReviewAt asc) {
  _id,
  _type,
  title,
  "slug": slug.current,
  lastReviewedAt,
  nextReviewAt,
  "reviewer": reviewer->name
}`

/** YYYY-MM-DD in UTC. Deliberately UTC so the cron result is timezone-stable. */
export function toIsoDate(date) {
  return new Date(date).toISOString().slice(0, 10)
}

/** Whole days from `today` to `isoDate`. Negative means the date has passed. */
export function daysUntil(isoDate, today) {
  const MS_PER_DAY = 86_400_000
  const a = Date.parse(`${toIsoDate(today)}T00:00:00Z`)
  const b = Date.parse(`${isoDate}T00:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.NaN
  return Math.round((b - a) / MS_PER_DAY)
}

/** Human label for the "next review due" date, e.g. "in 12 days" / "31 days overdue". */
export function describeDue(isoDate, today) {
  const days = daysUntil(isoDate, today)
  if (Number.isNaN(days)) return 'unknown'
  if (days < 0) {
    const n = Math.abs(days)
    return n === 1 ? '1 day overdue' : `${n} days overdue`
  }
  if (days === 0) return 'due today'
  if (days === 1) return 'due tomorrow'
  return `due in ${days} days`
}

/**
 * Split due entries into overdue and due-within-window.
 * Entries missing a usable `nextReviewAt` are collected as `unreadable` rather
 * than silently dropped, so a malformed date cannot hide a review deadline.
 */
export function collectDueContent(entries, { today, withinDays = WITHIN_DAYS } = {}) {
  const reference = today ?? toIsoDate(new Date())
  const cutoff = toIsoDate(new Date(Date.parse(`${reference}T00:00:00Z`) + withinDays * 86_400_000))

  const overdue = []
  const dueSoon = []
  const unreadable = []

  for (const entry of entries ?? []) {
    if (!entry?.nextReviewAt) {
      unreadable.push(entry)
      continue
    }
    const days = daysUntil(entry.nextReviewAt, reference)
    if (Number.isNaN(days)) {
      unreadable.push(entry)
      continue
    }
    // The query already bounds this, but keep the guard so the function is safe
    // to call with an unfiltered list.
    if (days > withinDays) continue

    const row = {
      id: entry._id,
      type: entry._type,
      label: entry._type === 'foodProfile' ? 'Food profile' : 'Article',
      title: entry.title,
      url: `${TYPE_ROUTES[entry._type] ?? '/'}/${entry.slug ?? ''}`,
      nextReviewAt: entry.nextReviewAt,
      lastReviewedAt: entry.lastReviewedAt ?? null,
      reviewer: entry.reviewer ?? null,
      due: describeDue(entry.nextReviewAt, reference),
    }
    if (days < 0) overdue.push(row)
    else dueSoon.push(row)
  }

  return { overdue, dueSoon, unreadable, cutoff, today: reference, withinDays }
}

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch])

function buildRowText(row, siteUrl) {
  return `  - [${row.label}] ${row.title}\n      ${row.nextReviewAt} (${row.due})  ${siteUrl}${row.url}`
}

/**
 * Render the reminder email as plain text and simple HTML.
 * No images, no tracking, no external assets: it must render in Outlook and
 * Gmail alike and must not embed recipient data in a remote request.
 */
export function renderEmail({ overdue = [], dueSoon = [], today, withinDays = WITHIN_DAYS, siteUrl = '' } = {}) {
  const total = overdue.length + dueSoon.length
  const subject =
    total === 0
      ? 'NHECOF content review: nothing due this week'
      : `NHECOF content review: ${total} item${total === 1 ? '' : 's'} due${overdue.length ? ` (${overdue.length} overdue)` : ''}`

  const text = [
    'NHECOF weekly content review reminder',
    '',
    `Generated for ${today}.`,
    '',
    overdue.length
      ? `OVERDUE (${overdue.length}) — these are past their review date:`
      : 'OVERDUE — none.',
    ...(overdue.length ? overdue.map((row) => buildRowText(row, siteUrl)) : []),
    '',
    dueSoon.length
      ? `DUE WITHIN ${withinDays} DAYS (${dueSoon.length}):`
      : `DUE WITHIN ${withinDays} DAYS — none.`,
    ...(dueSoon.length ? dueSoon.map((row) => buildRowText(row, siteUrl)) : []),
    '',
    'What to do:',
    '  1. Open the item in Sanity Studio.',
    '  2. Check the claims and references are still accurate.',
    '  3. Update "Last Reviewed" and set a new "Next Review Due" date.',
    '  4. If the content is out of date and cannot be fixed now, set',
    '     "Review Status" to "Needs Revision" so it leaves the public site.',
    '',
    siteUrl ? `Website: ${siteUrl}` : '',
    'This reminder only covers Articles and Food Profiles, which are the only',
    'content types that carry a "Next Review Due" date.',
  ]
    .filter((line) => line !== undefined)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  const htmlRow = (row) => `
    <tr>
      <td style="padding:6px 12px 6px 0;vertical-align:top;white-space:nowrap;">${escapeHtml(row.label)}</td>
      <td style="padding:6px 0;vertical-align:top;">
        <a href="${escapeHtml(siteUrl + row.url)}" style="color:#1f6f43;">${escapeHtml(row.title)}</a><br>
        <span style="color:#5b6b63;font-size:12px;">
          Next review ${escapeHtml(row.nextReviewAt)} (${escapeHtml(row.due)})${row.reviewer ? ` · reviewer: ${escapeHtml(row.reviewer)}` : ''}
        </span>
      </td>
    </tr>`

  const htmlSection = (heading, rows) => `
    <h2 style="font:600 15px/1.4 system-ui,sans-serif;margin:20px 0 6px;">${escapeHtml(heading)}</h2>
    ${rows.length
      ? `<table role="presentation" style="border-collapse:collapse;font:14px/1.5 system-ui,sans-serif;">${rows.map(htmlRow).join('')}</table>`
      : '<p style="font:14px/1.5 system-ui,sans-serif;color:#5b6b63;margin:0;">None.</p>'}`

  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#f6f7f5;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:8px;padding:24px;">
    <h1 style="font:600 18px/1.4 system-ui,sans-serif;margin:0 0 4px;">NHECOF weekly content review reminder</h1>
    <p style="font:14px/1.5 system-ui,sans-serif;color:#5b6b63;margin:0 0 8px;">Generated for ${escapeHtml(today ?? '')}.</p>
    ${htmlSection(overdue.length ? `Overdue (${overdue.length})` : 'Overdue', overdue)}
    ${htmlSection(`Due within ${withinDays} days (${dueSoon.length})`, dueSoon)}
    <h2 style="font:600 15px/1.4 system-ui,sans-serif;margin:20px 0 6px;">What to do</h2>
    <ol style="font:14px/1.6 system-ui,sans-serif;margin:0;padding-left:20px;">
      <li>Open the item in Sanity Studio.</li>
      <li>Check the claims and references are still accurate.</li>
      <li>Update <em>Last Reviewed</em> and set a new <em>Next Review Due</em> date.</li>
      <li>If it cannot be fixed now, set <em>Review Status</em> to <em>Needs Revision</em> so it leaves the public site.</li>
    </ol>
    <p style="font:12px/1.5 system-ui,sans-serif;color:#5b6b63;margin:20px 0 0;border-top:1px solid #e5e7eb;padding-top:12px;">
      This reminder only covers Articles and Food Profiles, the only content types with a &ldquo;Next Review Due&rdquo; date.
    </p>
  </div>
</body></html>`

  return { subject, text, html, total }
}
