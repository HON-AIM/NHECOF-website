import { cn } from '@/lib/cn'

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export function Label({
  required = false,
  className,
  children,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn('text-sm font-medium text-ink-800', className)}
      {...props}
    >
      {children}
      {required ? (
        <>
          <span aria-hidden="true" className="ml-0.5 text-error">
            *
          </span>
          <span className="sr-only">(required)</span>
        </>
      ) : null}
    </label>
  )
}

export default Label