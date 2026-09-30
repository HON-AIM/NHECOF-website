import type { ReactNode } from 'react'
import { cn } from './Card'

interface CalloutProps {
  variant?: 'info' | 'caution' | 'disclaimer' | 'warning'
  heading?: string
  children: ReactNode
  className?: string
}

const variantClasses: Record<NonNullable<CalloutProps['variant']>, string> = {
  info: 'bg-info-light border-l-info text-info-dark',
  caution: 'bg-warning-light border-l-warning text-warning-dark',
  disclaimer: 'bg-paper-100 border-l-ink-400 text-ink-700 border-dashed',
  warning: 'bg-warning-light border-l-warning text-warning-dark',
}

export function Callout({ variant = 'info', heading, children, className }: CalloutProps) {
  return (
    <div
      role="note"
      className={cn('border-l-4 rounded-r-lg p-4', variantClasses[variant], className)}
    >
      {heading ? <p className="mb-2 font-semibold">{heading}</p> : null}
      <div>{children}</div>
      {variant === 'disclaimer' ? (
        <p className="mt-2 text-xs italic">
          This information is provided for educational purposes only and is not a substitute for
          professional medical advice.
        </p>
      ) : null}
    </div>
  )
}