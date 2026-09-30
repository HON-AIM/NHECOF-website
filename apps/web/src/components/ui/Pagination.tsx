import Link from 'next/link'
import { cn } from '@/lib/cn'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  basePath?: string
  /** Optional query params to preserve across pages (e.g. archive filters). */
  params?: Record<string, string | string[] | undefined>
  className?: string
}

type PageItem = number | 'start-ellipsis' | 'end-ellipsis'

function getPageItems(currentPage: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const pages = new Set<number>([
    1,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ])

  const sorted = [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)

  const items: PageItem[] = []

  for (let i = 0; i < sorted.length; i += 1) {
    const page = sorted[i]
    const previous = sorted[i - 1]

    if (previous !== undefined && page - previous > 1) {
      items.push(
        page - previous > 2
          ? page > currentPage
            ? 'end-ellipsis'
            : 'start-ellipsis'
          : previous + 1,
      )
    }

    items.push(page)
  }

  return items
}

function pageHref(
  basePath: string,
  page: number,
  params?: Record<string, string | string[] | undefined>,
): string {
  const base = basePath.replace(/\/$/, '')
  const sp = new URLSearchParams()
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue
      if (Array.isArray(value)) {
        for (const v of value) sp.append(key, v)
      } else if (value !== '') {
        sp.set(key, value)
      }
    }
  }
  if (page > 1) sp.set('page', String(page))
  const qs = sp.toString()
  return qs ? `${base}?${qs}` : base
}

export function Pagination({
  currentPage,
  totalPages,
  basePath = '/',
  params,
  className,
}: PaginationProps) {
  if (totalPages < 1) {
    return null
  }

  const items = getPageItems(currentPage, totalPages)
  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages

  const linkClasses =
    'rounded-md px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-paper-100'

  return (
    <nav
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-1', className)}
    >
      {hasPrevious ? (
        <Link
          href={pageHref(basePath, currentPage - 1, params)}
          aria-label="Previous page"
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium text-leaf-700 hover:bg-paper-100',
          )}
        >
          Previous
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-300"
        >
          Previous
        </span>
      )}

      {items.map((item) => {
        if (item === 'start-ellipsis' || item === 'end-ellipsis') {
          return (
            <span
              key={item}
              aria-hidden="true"
              className="px-2 py-1.5 text-sm text-ink-400"
            >
              &hellip;
            </span>
          )
        }

        if (item === currentPage) {
          return (
            <span
              key={item}
              aria-current="page"
              className="rounded-md bg-leaf-700 px-3 py-1.5 text-sm font-semibold text-white"
            >
              {item}
            </span>
          )
        }

        return (
          <Link
            key={item}
            href={pageHref(basePath, item, params)}
            aria-label={`Go to page ${item}`}
            className={linkClasses}
          >
            {item}
          </Link>
        )
      })}

      {hasNext ? (
        <Link
          href={pageHref(basePath, currentPage + 1, params)}
          aria-label="Next page"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-leaf-700 hover:bg-paper-100"
        >
          Next
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="rounded-md px-3 py-1.5 text-sm font-medium text-ink-300"
        >
          Next
        </span>
      )}
    </nav>
  )
}

export default Pagination