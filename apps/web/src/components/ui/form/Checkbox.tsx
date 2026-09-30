'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { cn } from '@/lib/cn'

export interface CheckboxProps {
  id: string
  label: string
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  error?: string
  disabled?: boolean
  className?: string
}

export function Checkbox({
  id,
  label,
  checked,
  onCheckedChange,
  error,
  disabled,
  className,
}: CheckboxProps) {
  return (
    <div className={cn('space-y-1', className)}>
      {/* The label wraps the control so the whole row is the pointer target,
          which keeps the effective hit area above the WCAG 2.2 24 px minimum
          (2.5.8) without enlarging the 16 px checkbox itself. */}
      <label
        className={cn(
          'flex min-h-6 cursor-pointer items-center',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <CheckboxPrimitive.Root
          id={id}
          checked={checked}
          onCheckedChange={(value) => onCheckedChange?.(value === true)}
          disabled={disabled}
          className="peer h-4 w-4 shrink-0 rounded border border-ink-300 bg-white text-white data-[state=checked]:border-leaf-700 data-[state=checked]:bg-leaf-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-700 focus-visible:ring-offset-2"
        >
          <CheckboxPrimitive.Indicator className="flex h-full w-full items-center justify-center text-current">
            <svg
              viewBox="0 0 12 12"
              fill="none"
              className="h-3 w-3"
              aria-hidden="true"
            >
              <path
                d="M2.5 6.5 5 9l4.5-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </CheckboxPrimitive.Indicator>
        </CheckboxPrimitive.Root>
        <span className="ml-2 text-sm text-ink-800 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
          {label}
        </span>
      </label>
      {error ? (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default Checkbox