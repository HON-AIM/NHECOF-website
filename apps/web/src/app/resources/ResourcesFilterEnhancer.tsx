'use client'

import { useEffect } from 'react'
import {
  matchesFilters,
  parseResourceFilters,
  resourceCountLabel,
} from '@/features/resources/filter'

const URL_CHANGE_EVENT = 'nhecof:urlchange'

/**
 * Applies the `?type=` / `?topic=` / `?audience=` query filter to the archive
 * that `ResourcesArchive` rendered statically.
 *
 * The server cannot read the query string without giving up static
 * prerendering of the route, so the whole archive ships in the HTML and this
 * narrows it after mount. The matching logic lives in
 * `src/features/resources/filter.ts` and is unit-tested in
 * `__tests__/resources-filter.test.ts`.
 */
export function ResourcesFilterEnhancer() {
  useEffect(() => {
    const apply = () => {
      const filters = parseResourceFilters(window.location.search)
      const hasFilter = Boolean(filters.type || filters.topic || filters.audience)

      const items = Array.from(
        document.querySelectorAll<HTMLElement>('[data-resource-item]'),
      )
      let visible = 0
      for (const item of items) {
        const show = matchesFilters(
          {
            type: item.dataset.type,
            topics: item.dataset.topics,
            audiences: item.dataset.audiences,
          },
          filters,
        )
        item.hidden = !show
        if (show) visible += 1
      }

      for (const chip of document.querySelectorAll<HTMLElement>('[data-filter-key]')) {
        const key = chip.dataset.filterKey as 'type' | 'topic' | 'audience'
        const value = chip.dataset.filterValue || null
        const active = value ? filters[key] === value : !filters[key]
        if (active) chip.setAttribute('aria-current', 'true')
        else chip.removeAttribute('aria-current')
      }

      const count = document.querySelector<HTMLElement>('[data-resource-count]')
      if (count) count.textContent = resourceCountLabel(visible, hasFilter)

      const empty = document.querySelector<HTMLElement>('[data-resource-empty]')
      if (empty) empty.hidden = visible > 0
    }

    // `popstate` only covers back/forward. Client-side `<Link>` navigation uses
    // `history.pushState`, which fires no event, so wrap it to re-apply.
    const notify = () => window.dispatchEvent(new Event(URL_CHANGE_EVENT))
    const originalPushState = history.pushState
    const originalReplaceState = history.replaceState
    history.pushState = function patchedPushState(...args) {
      const result = originalPushState.apply(this, args)
      notify()
      return result
    }
    history.replaceState = function patchedReplaceState(...args) {
      const result = originalReplaceState.apply(this, args)
      notify()
      return result
    }

    apply()
    window.addEventListener('popstate', apply)
    window.addEventListener(URL_CHANGE_EVENT, apply)

    return () => {
      history.pushState = originalPushState
      history.replaceState = originalReplaceState
      window.removeEventListener('popstate', apply)
      window.removeEventListener(URL_CHANGE_EVENT, apply)
    }
  }, [])

  return null
}
