import { cn } from '@/lib/cn'
import { ChevronRightIcon } from '@/components/icons'
import { Link } from './Link'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className={cn('text-sm', className)}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
        {items.map((item, index) => {
          const isLast = index === items.length - 1

          return (
            <li
              key={`${index}-${item.label}`}
              className="flex items-center gap-x-1.5"
            >
              {!isLast ? (
                <>
                  {item.href ? (
                    // `min-h-6` keeps the hit area at the WCAG 2.2 24 px minimum
                    // (2.5.8) — breadcrumb links are navigation, so they are not
                    // exempt as inline text links.
                    <Link href={item.href} variant="subtle" className="inline-flex min-h-6 items-center">
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-ink-700">{item.label}</span>
                  )}
                  <ChevronRightIcon className="h-4 w-4 text-ink-400" />
                </>
              ) : (
                <span aria-current="page" className="font-medium text-ink-900">
                  {item.label}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}