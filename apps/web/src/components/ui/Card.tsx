import type { ElementType, ReactNode } from 'react'
import { ResponsiveImage } from './ResponsiveImage'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

interface CardProps {
  children: ReactNode
  variant?: 'default' | 'outlined' | 'filled' | 'interactive'
  className?: string
  as?: ElementType
}

const variantClasses: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-white rounded-lg shadow-sm border border-ink-100 overflow-hidden',
  outlined: 'bg-transparent rounded-lg border border-ink-200',
  filled: 'bg-paper-100 rounded-lg',
  interactive:
    'bg-white rounded-lg shadow-sm border border-ink-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer',
}

export function Card({
  children,
  variant = 'default',
  className,
  as: Component = 'div',
}: CardProps) {
  return <Component className={cn(variantClasses[variant], className)}>{children}</Component>
}

interface CardImageProps {
  src: string
  alt: string
  className?: string
}

export function CardImage({ src, alt, className }: CardImageProps) {
  return (
    <ResponsiveImage
      src={src}
      alt={alt}
      ratio="16/10"
      displayWidth={640}
      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      className={cn('aspect-[16/10] w-full object-cover', className)}
    />
  )
}

interface CardBodyProps {
  children: ReactNode
  className?: string
}

export function CardBody({ children, className }: CardBodyProps) {
  return <div className={cn('p-5 space-y-2', className)}>{children}</div>
}

interface CardTitleProps {
  children: ReactNode
  className?: string
  as?: ElementType
}

export function CardTitle({ children, className, as: Component = 'h3' }: CardTitleProps) {
  return (
    <Component
      className={cn('font-display text-lg font-semibold text-ink-900 line-clamp-2', className)}
    >
      {children}
    </Component>
  )
}

interface CardDescriptionProps {
  children: ReactNode
  className?: string
}

export function CardDescription({ children, className }: CardDescriptionProps) {
  return <p className={cn('text-sm text-ink-600 line-clamp-3', className)}>{children}</p>
}

interface CardFooterProps {
  children: ReactNode
  className?: string
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn('flex items-center gap-2 pt-3 border-t border-ink-100', className)}>
      {children}
    </div>
  )
}