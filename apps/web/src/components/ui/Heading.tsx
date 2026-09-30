import type { ElementType, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Eyebrow } from './Eyebrow'

interface HeadingProps {
  children: ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  eyebrow?: string
  eyebrowVariant?: 'default' | 'accent' | 'caution'
  subtitle?: string
  className?: string
  id?: string
}

const sizeClasses: Record<NonNullable<HeadingProps['level']>, string> = {
  1: 'text-4xl md:text-5xl',
  2: 'text-3xl md:text-4xl',
  3: 'text-2xl md:text-3xl',
  4: 'text-xl md:text-2xl',
  5: 'text-lg md:text-xl',
  6: 'text-base font-bold',
}

export function Heading({
  children,
  level = 2,
  eyebrow,
  eyebrowVariant = 'default',
  subtitle,
  className,
  id,
}: HeadingProps) {
  const Tag = (`h${level}`) as ElementType

  const heading = (
    <Tag
      id={id}
      className={cn(
        'font-display tracking-tight',
        sizeClasses[level],
        eyebrow && 'mt-3',
        className,
      )}
    >
      {children}
    </Tag>
  )

  if (!eyebrow && !subtitle) {
    return heading
  }

  return (
    <div>
      {eyebrow && <Eyebrow variant={eyebrowVariant}>{eyebrow}</Eyebrow>}
      {heading}
      {subtitle && <p className="mt-2 text-lg text-ink-500">{subtitle}</p>}
    </div>
  )
}