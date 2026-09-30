import { cn } from '@/lib/cn'

export interface HelpTextProps {
  children: React.ReactNode
  className?: string
}

export function HelpText({ children, className }: HelpTextProps) {
  return (
    <p className={cn('mt-1 text-xs text-ink-500', className)}>{children}</p>
  )
}

export default HelpText