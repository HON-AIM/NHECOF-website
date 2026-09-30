/**
 * String sanitisation for form submissions (plan §9.2).
 *
 * Applied to every string field after Zod validation. Safe for plain-text
 * email rendering AND for HTML (we HTML-escape on render regardless).
 */
// Strip control characters except common whitespace. The control chars below
// are deliberate (defence against terminal/FTP-injection style message
// payloads), so the lint rule is disabled for this one line.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

export function sanitiseString(value: string): string {
  return value
    // strip control characters except common whitespace
    .replace(CONTROL_CHARS, '')
    // collapse repeated whitespace (spaces, tabs, newlines) into a single space
    .replace(/\s+/g, ' ')
    .trim()
}

/** Sanitise every string value in a flat object, preserving other types. */
export function sanitiseSubmission<T extends Record<string, unknown>>(data: T): T {
  const result = { ...data }
  for (const key of Object.keys(result)) {
    const value = result[key]
    if (typeof value === 'string') {
      ;(result as Record<string, unknown>)[key] = sanitiseString(value)
    }
  }
  return result
}

/** Escape a string for safe inclusion in an HTML email body. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}