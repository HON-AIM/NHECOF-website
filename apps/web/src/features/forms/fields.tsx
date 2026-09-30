'use client'

import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { forwardRef, useRef } from 'react'
import { cn } from '@/lib/cn'
import { Link } from '@/components/ui/Link'
import type { FormType } from '@/features/forms/schemas'

/* ── Shared form primitives (a11y: visible labels, aria-describedby errors) ── */
/* Handles 200% zoom, keyboard-only and screen-reader usage. */

interface BaseFieldProps {
  id: string
  label: string
  hint?: string
  error?: string
  className?: string
}

function FieldMeta({ id, hint, error }: { id: string; hint?: string; error?: string }) {
  return (
    <span className="text-sm">
      {hint && !error ? (
        <span id={`${id}-hint`} className="text-ink-500">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${id}-error`} className="font-medium text-error-dark">
          {error}
        </span>
      ) : null}
    </span>
  )
}

function describeBy(id: string, hint?: string, error?: string): string | undefined {
  const ids: string[] = []
  if (hint) ids.push(`${id}-hint`)
  if (error) ids.push(`${id}-error`)
  return ids.length > 0 ? ids.join(' ') : undefined
}

export interface TextFieldProps
  extends BaseFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { id, label, hint, error, className, ...props },
  ref,
) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block font-medium text-ink-800">
        {label}
      </label>
      <input
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describeBy(id, hint, error)}
        className={cn(
          'w-full rounded-md border bg-white px-3 py-2.5 text-base text-ink-900',
          'placeholder:text-ink-300 focus:outline-none',
          error
            ? 'border-error focus:border-error'
            : 'border-ink-200 focus:border-leaf-600',
        )}
        {...props}
      />
      <FieldMeta id={id} hint={hint} error={error} />
    </div>
  )
})

export interface TextAreaFieldProps
  extends BaseFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className'> {}

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(function TextAreaField(
  { id, label, hint, error, className, rows = 5, ...props },
  ref,
) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block font-medium text-ink-800">
        {label}
      </label>
      <textarea
        id={id}
        ref={ref}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describeBy(id, hint, error)}
        className={cn(
          'w-full resize-y rounded-md border bg-white px-3 py-2.5 text-base text-ink-900',
          'placeholder:text-ink-300 focus:outline-none',
          error
            ? 'border-error focus:border-error'
            : 'border-ink-200 focus:border-leaf-600',
        )}
        {...props}
      />
      <FieldMeta id={id} hint={hint} error={error} />
    </div>
  )
})

export interface SelectFieldProps
  extends BaseFieldProps,
    Omit<InputHTMLAttributes<HTMLSelectElement>, 'id' | 'className' | 'type'> {
  options: readonly string[] | Array<{ value: string; label: string }>
  placeholder?: string
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { id, label, hint, error, options, placeholder, className, ...props },
  ref,
) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <label htmlFor={id} className="block font-medium text-ink-800">
        {label}
      </label>
      <select
        id={id}
        ref={ref}
        aria-invalid={error ? true : undefined}
        aria-describedby={describeBy(id, hint, error)}
        className={cn(
          'w-full rounded-md border bg-white px-3 py-2.5 text-base text-ink-900',
          'focus:outline-none',
          error
            ? 'border-error focus:border-error'
            : 'border-ink-200 focus:border-leaf-600',
        )}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options.map((option) => {
          const value = typeof option === 'string' ? option : option.value
          const label = typeof option === 'string' ? option : option.label
          return (
            <option key={value} value={value}>
              {label}
            </option>
          )
        })}
      </select>
      <FieldMeta id={id} hint={hint} error={error} />
    </div>
  )
})

export interface CheckboxFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className' | 'type'>,
    BaseFieldProps {
  children?: ReactNode
}

export const CheckboxField = forwardRef<HTMLInputElement, CheckboxFieldProps>(function CheckboxField(
  { id, label, hint, error, children, className, ...props },
  ref,
) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-start gap-3">
        <input
          id={id}
          ref={ref}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={describeBy(id, hint, error)}
            className={cn(
              // `h-6 w-6` (24 px) meets the WCAG 2.2 Target Size (Minimum) 2.5.8
              // minimum for the control itself, not only via its label.
              'mt-0.5 h-6 w-6 shrink-0 rounded border focus:ring-2 focus:ring-leaf-600',
              error ? 'border-error' : 'border-ink-200',
            )}
          {...props}
        />
        <label htmlFor={id} className="font-medium text-ink-800">
          {label}
        </label>
      </div>
      <div className="pl-8">{children}</div>
      <div className="pl-8">
        <FieldMeta id={id} hint={hint} error={error} />
      </div>
    </div>
  )
})

/* ── Invisible honeypot (lures bots, never shown to people) ─────────────────── */

export const HoneypotField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function HoneypotField({ ...props }, ref) {
    return (
      <div className="sr-only" aria-hidden="true">
        <label htmlFor={props.id ?? 'website'}>Website</label>
        <input
          id={props.id ?? 'website'}
          ref={ref}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...props}
        />
      </div>
    )
  },
)

/* ── Error summary (focus on failed submit) ─────────────────────────────────── */

interface ErrorSummaryProps {
  errors: Record<string, string>
}

export const ErrorSummary = forwardRef<HTMLDivElement, ErrorSummaryProps>(function ErrorSummary(
  { errors },
  ref,
) {
  const errorList = Object.entries(errors).filter(([, message]) => message !== '')
  if (errorList.length === 0) return null

  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className="rounded-lg border-l-4 border-error bg-error-light p-4"
    >
      <h2 className="mb-2 font-semibold text-error-dark">There is a problem</h2>
      <ul className="space-y-1 text-sm text-error-dark">
        {errorList.map(([key, message]) => (
          <li key={key}>{message}</li>
        ))}
      </ul>
    </div>
  )
})

/**
 * Holds a reference to the error summary so the form can move focus to it
 * after a failed submit (WCAG 2.4.3/3.2.1). Returns a ref and the element id.
 */
export function useErrorSummaryRef() {
  const ref = useRef<HTMLDivElement>(null)

  function focusErrorSummary() {
    // Give React a tick to render the errors before moving focus.
    requestAnimationFrame(() => {
      ref.current?.focus()
    })
  }

  return { ref, focusErrorSummary }
}

/** Server messages mapped to the client, keyed by the field the server flagged. */
export function serverFieldErrors(payload: { fieldErrors?: Record<string, string> }): Record<string, string> {
  return payload.fieldErrors ?? {}
}

/* ── Success screen (reference number + next steps) ─────────────────────────── */

const NEXT_STEPS_BY_FORM: Record<FormType, string[]> = {
  contact: [
    'One of our team will read your message.',
    'A reply lands in your inbox within 2-3 business days.',
    "If it's urgent, call or WhatsApp us rather than waiting for email.",
  ],
  'outreach-request': [
    'Our team will review your request.',
    'We will contact you within 3 business days to discuss dates, venue, and next steps.',
    'Keep your reference number handy for that conversation.',
  ],
  partnership: [
    'Our partnerships team will review the enquiry.',
    'We will reach out within 5 business days to explore next steps together.',
    'Keep your reference number handy for that conversation.',
  ],
}

interface SuccessPanelProps {
  formType: FormType
  reference: string
  title?: string
}

export function SuccessPanel({ formType, reference, title }: SuccessPanelProps) {
  const steps = NEXT_STEPS_BY_FORM[formType]
  return (
    <div
      role="status"
      className="rounded-xl border border-leaf-200 bg-leaf-50 p-6 sm:p-8"
    >
      <h2 className="font-display text-xl font-semibold text-leaf-900">
        {title ?? 'Thank you — we received your message'}
      </h2>
      <p className="mt-2 text-ink-700">
        Reference number: <strong className="font-mono text-leaf-800">{reference}</strong>
      </p>
      <ol className="mt-4 space-y-2 text-ink-700">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-leaf-700 text-xs font-bold text-white">
              {index + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-ink-600">
        Keep this reference number if you need to follow up with us. You can also review how we
        handle your information in our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </div>
  )
}