// Shared, deterministic date/number formatting.
// All dates are rendered in the project's canonical time zone so that the
// same value renders identically on the server and on every client,
// regardless of the visitor's device time zone.

export const SITE_TIME_ZONE = 'Africa/Lagos'

const dateFullFmt = new Intl.DateTimeFormat('en-NG', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: SITE_TIME_ZONE,
})

const dateLongFmt = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: SITE_TIME_ZONE,
})

const dateShortFmt = new Intl.DateTimeFormat('en-NG', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: SITE_TIME_ZONE,
})

const monthYearFmt = new Intl.DateTimeFormat('en-NG', {
  month: 'long',
  year: 'numeric',
  timeZone: SITE_TIME_ZONE,
})

const numberFmt = new Intl.NumberFormat('en-NG')

function toDate(value: string | Date | null | undefined): Date {
  if (value instanceof Date) return value
  if (typeof value === 'string' && value.length > 0) {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date
  }
  return new Date(Number.NaN)
}

const VALID_DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/

function parseDate(value: string | Date | null | undefined): Date {
  const date = toDate(value)
  if (Number.isNaN(date.getTime())) return date
  return date
}

/** "28 December 2025" — full day, long month, year (canonical Lagos time). */
export function formatDateLong(value: string | Date | null | undefined): string {
  const date = parseDate(value)
  if (Number.isNaN(date.getTime())) return ''
  return dateLongFmt.format(date)
}

/** "14 Feb 2026" — day, short month, year. */
export function formatDateShort(value: string | Date | null | undefined): string {
  const date = parseDate(value)
  if (Number.isNaN(date.getTime())) return ''
  return dateShortFmt.format(date)
}

/** "Wednesday, 4 March 2026" — full weekday plus long date. */
export function formatDateFull(value: string | Date | null | undefined): string {
  const date = parseDate(value)
  if (Number.isNaN(date.getTime())) return ''
  return dateFullFmt.format(date)
}

/** "March 2026" — month and year only. */
export function formatMonthYear(value: string | Date | null | undefined): string {
  const date = parseDate(value)
  if (Number.isNaN(date.getTime())) return ''
  return monthYearFmt.format(date)
}

/** Format a number with thousands separators in the Nigerian locale: 12500 → "12,500". */
export function formatNumber(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : value
  if (n === null || n === undefined || Number.isNaN(Number(n))) return ''
  return numberFmt.format(Number(n))
}

/**
 * Compact display form used for headline figures:
 * values >= 1M render as "1.2M", values >= 1K render as "12.5K",
 * smaller values fall back to locale-formatted integers ("1,234").
 */
export function formatCompact(value: number | string | null | undefined): string {
  const n = typeof value === 'string' ? Number(value) : value
  const num = Number(n)
  if (n === null || n === undefined || Number.isNaN(num)) return ''
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return numberFmt.format(num)
}

/** True when a value represents a real, renderable date. */
export function isValidDateValue(value: string | Date | null | undefined): boolean {
  return !Number.isNaN(parseDate(value).getTime())
}

/** Whether the input looks like a date-only ISO string, e.g. "2026-05-16". */
export function isDateOnlyString(value: string): boolean {
  return VALID_DATE_ONLY.test(value)
}

/** Establish a stable year key from a date value (used for filters/grouping). */
export function yearFor(value: string | Date | null | undefined): number | undefined {
  const date = parseDate(value)
  if (Number.isNaN(date.getTime())) return undefined
  return date.getUTCFullYear()
}