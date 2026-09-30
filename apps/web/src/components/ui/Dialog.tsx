'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { isValidElement, type ReactNode } from 'react'

interface DialogProps {
  trigger: ReactNode
  children: ReactNode
  title?: string
  description?: string
  className?: string
}

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

export function Dialog({ trigger, children, title, description, className }: DialogProps) {
  const triggerIsElement = isValidElement(trigger)

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild={triggerIsElement}>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-black/50" />
        <DialogPrimitive.Content
          aria-label={title ? undefined : 'Dialog'}
          className={cn(
            'fixed left-1/2 top-1/2 z-modal w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            'max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg',
            className,
          )}
        >
          <div className="pr-8">
            {title ? (
              <DialogPrimitive.Title className="font-display text-lg font-semibold text-ink-900">
                {title}
              </DialogPrimitive.Title>
            ) : null}
            {description ? (
              <DialogPrimitive.Description className="mt-2 text-sm text-ink-600">
                {description}
              </DialogPrimitive.Description>
            ) : null}
          </div>
          <div className="mt-4">{children}</div>
          <DialogPrimitive.Close
            aria-label="Close"
            className="absolute top-4 right-4 rounded-full p-1.5 text-ink-500 transition-colors hover:bg-paper-100 hover:text-ink-900"
          >
            <XIcon className="h-5 w-5" />
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}