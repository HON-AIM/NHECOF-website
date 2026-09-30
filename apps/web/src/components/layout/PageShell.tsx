import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Breadcrumbs, type BreadcrumbItem } from '@/components/ui/Breadcrumbs'
import { BreadcrumbJsonLd } from '@/lib/seo/jsonLd'
import { Container } from '@/components/ui/Container'
import { Heading } from '@/components/ui/Heading'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface PageShellProps {
  children: ReactNode
  title: string
  eyebrow?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  sidebar?: ReactNode
  className?: string
}

export function PageShell({
  children,
  title,
  eyebrow,
  description,
  breadcrumbs,
  sidebar,
  className,
}: PageShellProps) {
  return (
    <div className={cn('min-h-[50vh]', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <>
          <BreadcrumbJsonLd items={breadcrumbs} />
          <Container width="wide" className="pt-6">
            <Breadcrumbs items={breadcrumbs} />
          </Container>
        </>
      )}

      {/* Title area */}
      <Container width="wide" className="pt-8 pb-6 md:pt-10 md:pb-8">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <Heading level={1}>{title}</Heading>
        {description && (
          <p className="mt-3 max-w-prose text-lg text-ink-600">{description}</p>
        )}
      </Container>

      {/* Content with optional sidebar */}
      {sidebar ? (
        <Container width="wide" className="pb-16">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_280px]">
            <div>{children}</div>
            <aside className="order-first lg:order-last">{sidebar}</aside>
          </div>
        </Container>
      ) : (
        <Container width="prose" className="pb-16">
          {children}
        </Container>
      )}
    </div>
  )
}
