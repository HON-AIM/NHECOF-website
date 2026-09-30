import { cn } from '@/lib/cn'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  helpText?: string
}

export function Input({
  error,
  helpText,
  className,
  id,
  ...props
}: InputProps) {
  const errorId = id ? `${id}-error` : undefined
  const helpId = id ? `${id}-help` : undefined
  const describedBy = error ? errorId : helpText ? helpId : undefined

  return (
    <>
      <input
        id={id}
        className={cn(
          'w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-leaf-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-paper-100 disabled:opacity-60',
          error ? 'border-error ring-2 ring-error' : undefined,
          className,
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      />
      {error ? (
        <p id={errorId} className="mt-1 text-xs text-error">
          {error}
        </p>
      ) : helpText ? (
        <p id={helpId} className="mt-1 text-xs text-ink-500">
          {helpText}
        </p>
      ) : null}
    </>
  )
}

export default Input