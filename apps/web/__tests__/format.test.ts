import { describe, it, expect } from 'vitest'
import {
  SITE_TIME_ZONE,
  formatDateLong,
  formatDateShort,
  formatDateFull,
  formatMonthYear,
  formatNumber,
  formatCompact,
} from '../src/lib/format'

describe('date formatting (Africa/Lagos, en-NG)', () => {
  it('uses the canonical site time zone', () => {
    expect(SITE_TIME_ZONE).toBe('Africa/Lagos')
  })

  it('formats a date-only value as a long Nigerian date', () => {
    expect(formatDateLong('2025-12-28')).toBe('28 December 2025')
    expect(formatDateLong('2026-05-16')).toBe('16 May 2026')
  })

  it('formats a full ISO datetime in Lagos regardless of runtime zone', () => {
    // 23:30Z is on 31 March in UTC but already 1 April in Lagos.
    expect(formatDateLong('2026-03-31T23:30:00Z')).toBe('1 April 2026')
  })

  it('formats a short date with a short month', () => {
    expect(formatDateShort('2026-02-14')).toBe('14 Feb 2026')
  })

  it('formats a full date including the weekday', () => {
    expect(formatDateFull('2026-03-04')).toBe('Wednesday, 4 March 2026')
  })

  it('formats month and year only', () => {
    expect(formatMonthYear('2026-03-04')).toBe('March 2026')
  })

  it('accepts Date objects and real timestamps', () => {
    expect(formatDateLong(new Date('2025-12-28T00:00:00Z'))).toBe('28 December 2025')
    expect(formatDateLong('2025-12-28T12:00:00.000Z')).toBe('28 December 2025')
  })

  it('returns an empty string for invalid or missing values', () => {
    expect(formatDateLong('not-a-date')).toBe('')
    expect(formatDateLong('')).toBe('')
    expect(formatDateLong(null)).toBe('')
    expect(formatDateLong(undefined)).toBe('')
    expect(formatDateShort('bad')).toBe('')
  })
})

describe('number formatting (en-NG)', () => {
  it('formats integers with thousands separators', () => {
    expect(formatNumber(12500)).toBe('12,500')
    expect(formatNumber('12500')).toBe('12,500')
    expect(formatNumber(0)).toBe('0')
  })

  it('returns an empty string for invalid values', () => {
    expect(formatNumber(undefined)).toBe('')
    expect(formatNumber(null)).toBe('')
    expect(formatNumber('abc')).toBe('')
  })

  it('compacts large headline figures', () => {
    expect(formatCompact(1_234_000)).toBe('1.2M')
    expect(formatCompact(1_500_000)).toBe('1.5M')
    expect(formatCompact(1500)).toBe('1.5K')
    expect(formatCompact(1234)).toBe('1.2K')
    expect(formatCompact(999)).toBe('999')
  })
})