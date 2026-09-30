import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface ContainerProps {
  children: ReactNode
  width?: 'narrow' | 'prose' | 'wide' | 'full'
  className?: string
  as?: ElementType
}

const widthClasses: Record<NonNullable<ContainerProps['width']>, string> = {
  narrow: 'max-w-[var(--width-narrow)]',
  prose: 'max-w-[var(--width-prose)]',
  wide: 'max-w-[var(--width-wide)]',
  full: 'max-w-[var(--width-broad)]',
}

export function Container({
  children,
  width = 'wide',
  className,
  as,
}: ContainerProps) {
  const Tag = (as ?? 'div') as ElementType

  return (
    <Tag className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', widthClasses[width], className)}>
      {children}
    </Tag>
  )
}