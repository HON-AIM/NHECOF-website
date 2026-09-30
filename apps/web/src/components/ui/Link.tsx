import NextLink from 'next/link'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

interface LinkProps extends ComponentProps<typeof NextLink> {
  variant?: 'default' | 'subtle' | 'branded'
}

const variantClasses: Record<NonNullable<LinkProps['variant']>, string> = {
  default: 'text-leaf-700 underline-offset-2 hover:underline',
  subtle: 'text-ink-700 hover:text-leaf-700',
  branded: 'text-leaf-700 font-medium hover:text-leaf-800',
}

export function Link({ variant = 'default', className, ...props }: LinkProps) {
  return (
    <NextLink
      className={cn(
        'inline-flex items-center gap-1 transition-colors duration-fast',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  )
}