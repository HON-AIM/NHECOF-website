/**
 * Search text normalization — used both client-side (command palette) and in
 * unit tests so diacritic-insensitive matching behaves identically everywhere.
 *
 * "Search must be diacritic-insensitive": typing "efo" must find "Ẹfọ́".
 * Strategy: Unicode NFD-decompose, strip combining marks, then lowercase and
 * collapse whitespace/punctuation. NFD turns Ẹ (U+1EB8) into "E" + U+0323 and
 * ọ (U+1ECD) into "o" + U+0323; removing mark characters yields "efo".
 */

const COMBINING_MARKS = /[\u0300-\u036f]/g

export function normalizeSearchText(input: string): string {
  return input
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

/** Split normalized text into distinct terms. */
export function tokenizeSearchText(input: string): string[] {
  const normalized = normalizeSearchText(input)
  if (!normalized) return []
  return [...new Set(normalized.split(/\s+/))]
}

/** True when every query token is present in the haystack term set. */
export function matchesAllTokens(query: string, haystack: string): boolean {
  const terms = tokenizeSearchText(query)
  if (terms.length === 0) return false
  const hayTerms = new Set(tokenizeSearchText(haystack))
  return terms.every((term) => hayTerms.has(term))
}

/** Wrap case-insensitive occurrences of a query in <mark> for highlighting. */
export function highlightMatches(text: string, query: string): string {
  const terms = tokenizeSearchText(query)
  if (terms.length === 0) return text
  const escaped = terms
    .sort((a, b) => b.length - a.length)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('|')
  if (!escaped) return text
  const re = new RegExp(`(${escaped})`, 'gi')
  return text.replace(re, '<mark class="bg-palm-200 text-ink-900 rounded-sm px-0.5">$1</mark>')
}