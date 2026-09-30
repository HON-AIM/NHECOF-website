import { cn } from '@/lib/cn'

export interface ErrorSummaryProps {
  title?: string
  errors: Array<{ field: string; message: string }>
  className?: string
}

export function ErrorSummary({
  title = 'Please fix the following errors',
  errors,
  className,
}: ErrorSummaryProps) {
  if (errors.length === 0) {
    return null
  }

  const titleId = `error-summary-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`

  return (
    <div
      role="alert"
      aria-labelledby={titleId}
      className={cn(
        'rounded-lg border border-error bg-error-light p-4',
        className,
      )}
    >
      <h2 id={titleId} className="font-semibold text-error-dark">
        {title}
      </h2>
      <ul className="mt-2 space-y-1">
        {errors.map((error) => (
          <li key={`${error.field}-${error.message}`}>
            <a
              href={`#${error.field}`}
              className="text-sm text-error-dark underline decoration-error-dark/40 underline-offset-2 hover:decoration-error-dark"
            >
              {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ErrorSummary