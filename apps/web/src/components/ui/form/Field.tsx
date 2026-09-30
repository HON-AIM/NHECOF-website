import { cn } from '@/lib/cn'
import { Label } from './Label'
import { HelpText } from './HelpText'

export interface FieldProps {
  label: string
  htmlFor?: string
  required?: boolean
  error?: string
  helpText?: string
  children: React.ReactNode
  className?: string
}

export function Field({
  label,
  htmlFor,
  required,
  error,
  helpText,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      ) : helpText ? (
        <HelpText>{helpText}</HelpText>
      ) : null}
    </div>
  )
}

export default Field