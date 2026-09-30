'use client'

import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { useId } from 'react'
import { cn } from '@/lib/cn'

export interface RadioOption {
  value: string
  label: string
  disabled?: boolean
}

export interface RadioGroupProps {
  name: string
  options: RadioOption[]
  value?: string
  onValueChange?: (value: string) => void
  error?: string
  className?: string
}

export function RadioGroup({
  name,
  options,
  value,
  onValueChange,
  error,
  className,
}: RadioGroupProps) {
  const uid = useId()

  return (
    <div className={cn('space-y-1', className)}>
      <RadioGroupPrimitive.Root
        name={name}
        value={value}
        onValueChange={onValueChange}
        className="flex flex-col gap-3"
      >
        {options.map((option) => {
          const id = `${uid}-${option.value}`
          return (
            <div key={option.value} className="flex items-center">
              <RadioGroupPrimitive.Item
                id={id}
                value={option.value}
                disabled={option.disabled}
                className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-ink-300 bg-white text-leaf-700 data-[state=checked]:border-2 data-[state=checked]:border-leaf-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-leaf-700 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-leaf-700" />
                </RadioGroupPrimitive.Indicator>
              </RadioGroupPrimitive.Item>
              <label
                htmlFor={id}
                className="ml-2 text-sm text-ink-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {option.label}
              </label>
            </div>
          )
        })}
      </RadioGroupPrimitive.Root>
      {error ? (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default RadioGroup