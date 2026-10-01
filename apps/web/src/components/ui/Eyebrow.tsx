import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EyebrowProps {
  children: ReactNode
  variant?: 'default' | 'accent' | 'caution'
  className?: string
}

const variantClasses: Record<NonNullable<EyebrowProps['variant']>, string> = {
  default: 'text-leaf-700',
  accent: 'text-clay-600',
  caution: 'text-gold-800',
}

export function Eyebrow({ children, variant = 'default', className }: EyebrowProps) {
  return (
    <p
      className={cn(
        'text-xs font-semibold uppercase tracking-widest',
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </p>
  )
}