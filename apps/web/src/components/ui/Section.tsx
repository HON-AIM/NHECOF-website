import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import PatternDivider from '@/components/pattern/PatternDivider'

interface SectionProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  pattern?: 'top' | 'bottom' | 'both' | 'none'
  patternVariant?: 'diamonds' | 'waves' | 'dots'
  as?: 'section' | 'div' | 'article' | 'main'
  id?: string
  'aria-labelledby'?: string
  'aria-label'?: string
}

const paddingClasses: Record<NonNullable<SectionProps['padding']>, string> = {
  none: '',
  sm: 'py-8',
  md: 'py-12 md:py-16',
  lg: 'py-16 md:py-24',
}

export function Section({
  children,
  className,
  padding = 'md',
  pattern = 'none',
  patternVariant = 'diamonds',
  as = 'section',
  id,
  'aria-labelledby': ariaLabelledby,
  'aria-label': ariaLabel,
}: SectionProps) {
  const Tag = as as ElementType
  const showTop = pattern === 'top' || pattern === 'both'
  const showBottom = pattern === 'bottom' || pattern === 'both'

  return (
    <Tag
      id={id}
      aria-labelledby={ariaLabelledby}
      aria-label={ariaLabel}
      className={cn(className)}
    >
      {showTop && <PatternDivider variant={patternVariant} />}
      <div className={paddingClasses[padding]}>{children}</div>
      {showBottom && <PatternDivider variant={patternVariant} />}
    </Tag>
  )
}