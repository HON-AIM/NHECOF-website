export interface ResourceFilters {
  type?: string
  topic?: string
  audience?: string
}

/** Filterable metadata carried on each rendered archive item. */
export interface ResourceFilterableItem {
  type?: string
  topics?: string
  audiences?: string
}

function list(value: string | undefined): string[] {
  return (value ?? '').split(' ').filter(Boolean)
}

/**
 * Applies the active query-string filters to one archive item.
 *
 * Kept pure and framework-free so the behaviour that the server-rendered
 * archive plus `ResourcesFilterEnhancer` applies after hydration can be unit
 * tested directly.
 */
export function matchesFilters(
  item: ResourceFilterableItem,
  filters: ResourceFilters,
): boolean {
  if (filters.type && item.type !== filters.type) return false
  if (filters.topic && !list(item.topics).includes(filters.topic)) return false
  if (filters.audience && !list(item.audiences).includes(filters.audience)) return false
  return true
}

/** Reads the supported filters out of a query string. */
export function parseResourceFilters(search: string): ResourceFilters {
  const sp = new URLSearchParams(search)
  return {
    type: sp.get('type') ?? undefined,
    topic: sp.get('topic') ?? undefined,
    audience: sp.get('audience') ?? undefined,
  }
}

/** Human-readable result count, matching the archive's `role="status"` text. */
export function resourceCountLabel(visible: number, filtered: boolean): string {
  const noun = visible === 1 ? 'resource' : 'resources'
  return `${visible} ${noun} ${filtered ? 'found' : 'available'}`
}
