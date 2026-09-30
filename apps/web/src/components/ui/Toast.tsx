'use client'

import * as ToastPrimitive from '@radix-ui/react-toast'
import { cn } from '@/lib/cn'

export interface ToastProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  variant?: 'success' | 'error' | 'warning' | 'info'
  title?: string
  description?: string
  duration?: number
}

const variantClasses: Record<NonNullable<ToastProps['variant']>, string> = {
  success: 'border-l-success',
  error: 'border-l-error',
  warning: 'border-l-warning',
  info: 'border-l-info',
}

export function Toast({
  open,
  onOpenChange,
  variant = 'info',
  title,
  description,
  duration = 5000,
}: ToastProps) {
  return (
    <ToastPrimitive.Provider>
      <style>{`
        @keyframes toast-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toast-fade-out {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
      <ToastPrimitive.Root
        open={open}
        onOpenChange={onOpenChange}
        duration={duration}
        className={cn(
          'relative rounded-lg border-l-4 bg-white p-4 pr-10 shadow-lg',
          'data-[state=open]:animate-[toast-slide-in_200ms_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[toast-fade-out_150ms_ease-in]',
          variantClasses[variant],
        )}
      >
        {title ? (
          <ToastPrimitive.Title className="font-semibold text-ink-900">
            {title}
          </ToastPrimitive.Title>
        ) : null}
        {description ? (
          <ToastPrimitive.Description className="mt-1 text-sm text-ink-600">
            {description}
          </ToastPrimitive.Description>
        ) : null}
        <ToastPrimitive.Close
          aria-label="Close notification"
          className="absolute right-2 top-2 rounded-md p-1 text-ink-400 transition-colors hover:bg-paper-100 hover:text-ink-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              d="M18 6 6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ToastPrimitive.Close>
      </ToastPrimitive.Root>
      <ToastPrimitive.Viewport className="fixed bottom-4 right-4 z-toast flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" />
    </ToastPrimitive.Provider>
  )
}

export default Toast