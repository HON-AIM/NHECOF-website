import { cn } from '@/lib/cn'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[]
  placeholder?: string
  error?: string
  helpText?: string
}

const chevronBackground =
  'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23766f65\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")'

export function Select({
  options,
  placeholder,
  error,
  helpText,
  className,
  id,
  ...props
}: SelectProps) {
  const errorId = id ? `${id}-error` : undefined
  const helpId = id ? `${id}-help` : undefined
  const describedBy = error ? errorId : helpText ? helpId : undefined

  return (
    <>
      <select
        id={id}
        className={cn(
          'w-full appearance-none rounded-md border border-ink-200 bg-white bg-no-repeat px-3 py-2 pr-10 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-leaf-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-paper-100 disabled:opacity-60',
          'bg-[position:right_0.75rem_center] bg-[size:1rem]',
          error ? 'border-error ring-2 ring-error' : undefined,
          className,
        )}
        style={{ backgroundImage: chevronBackground }}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>
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

export default Select