'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'
import { ChevronDownIcon } from '@/components/icons'

interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

/**
 * Table of contents built from Portable Text headings rendered by `Prose`
 * (headings carry `data-prose-heading` + a slugified `id`).
 *
 * Desktop: a sticky sidebar card inside the PageShell aside column.
 * Mobile: a collapsible native `<details>` disclosure so it does not push
 * the article body down the page on small screens.
 */
export function ArticleToc() {
  const [items, setItems] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    const headings: TocItem[] = Array.from(
      document.querySelectorAll<HTMLElement>('h2[data-prose-heading], h3[data-prose-heading]'),
    )
      .map((heading) => {
        const level: 2 | 3 = heading.tagName === 'H2' ? 2 : 3
        return {
          id: heading.id,
          text: heading.textContent ?? '',
          level,
        }
      })
      .filter((item) => item.id && item.text.trim())

    setItems(headings)
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveId((visible.target as HTMLElement).id)
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    )
    for (const item of headings) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  if (items.length === 0) return null

  const list = (
    <ul className="space-y-1">
      {items.map((item) => (
        <li key={item.id} className={cn(item.level === 3 && 'pl-3')}>
          <a
            href={`#${item.id}`}
            onClick={() => setActiveId(item.id)}
            className={cn(
              'block rounded-md px-2 py-1 text-sm leading-snug transition-colors',
              activeId === item.id
                ? 'bg-leaf-50 font-medium text-leaf-800'
                : 'text-ink-600 hover:bg-paper-100 hover:text-leaf-800',
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  )

  return (
    <>
      {/* Mobile: collapsible disclosure */}
      <details className="group rounded-xl border border-ink-100 bg-white lg:hidden">
        <summary
          className="flex cursor-pointer list-none items-center justify-between gap-2 p-4 text-xs font-semibold uppercase tracking-wide text-ink-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700 [&::-webkit-details-marker]:hidden"
        >
          <span>On this page</span>
          <ChevronDownIcon
            aria-hidden="true"
            className="h-4 w-4 shrink-0 transition-transform duration-fast group-open:rotate-180"
          />
        </summary>
        <div className="border-t border-ink-100 p-3">{list}</div>
      </details>

      {/* Desktop: sticky sidebar card */}
      <nav
        aria-label="On this page"
        className="hidden rounded-xl border border-ink-100 bg-white p-4 lg:sticky lg:top-24 lg:block"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
          On this page
        </p>
        {list}
      </nav>
    </>
  )
}