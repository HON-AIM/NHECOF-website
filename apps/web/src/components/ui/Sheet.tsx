'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { isValidElement, type ReactNode } from 'react'

interface SheetProps {
  trigger: ReactNode
  children: ReactNode
  side?: 'left' | 'right' | 'top' | 'bottom'
  title?: string
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

const sidePositionClasses: Record<NonNullable<SheetProps['side']>, string> = {
  right:
    'inset-y-0 right-0 w-full max-w-sm data-[state=closed]:translate-x-full',
  left: 'inset-y-0 left-0 w-full max-w-sm data-[state=closed]:-translate-x-full',
  top: 'inset-x-0 top-0 w-full max-h-[80vh] data-[state=closed]:-translate-y-full',
  bottom: 'inset-x-0 bottom-0 w-full max-h-[80vh] data-[state=closed]:translate-y-full',
}

export function Sheet({ trigger, children, side = 'right', title, className }: SheetProps) {
  const triggerIsElement = isValidElement(trigger)

  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger asChild={triggerIsElement}>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-black/50" />
        <DialogPrimitive.Content
          aria-label={title ? undefined : 'Sheet'}
          className={cn(
            'fixed z-modal flex flex-col bg-white shadow-lg',
            'transition-transform duration-normal ease-out',
            'data-[state=open]:translate-x-0 data-[state=open]:translate-y-0',
            sidePositionClasses[side],
            className,
          )}
        >
          <div className="flex items-center justify-between gap-4 border-b border-ink-100 px-4 py-3">
            {title ? (
              <DialogPrimitive.Title className="font-display text-base font-semibold text-ink-900">
                {title}
              </DialogPrimitive.Title>
            ) : null}
            <DialogPrimitive.Close
              aria-label="Close"
              className="ml-auto rounded-full p-1.5 text-ink-500 transition-colors hover:bg-paper-100 hover:text-ink-900"
            >
              <XIcon className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto p-4">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}