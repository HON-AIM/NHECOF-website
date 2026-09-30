import { cn } from '@/lib/cn'

interface StatProps {
  value: string | number
  label: string
  asOf?: string
  source?: string
  className?: string
}

export function Stat({ value, label, asOf, source, className }: StatProps) {
  return (
    <div className={cn(className)}>
      <p className="font-display text-4xl font-bold text-leaf-700 md:text-5xl">
        {value}
      </p>
      <p className="mt-1 text-lg text-ink-700">{label}</p>
      {asOf && <p className="mt-1 text-sm text-ink-400">{asOf}</p>}
      {source && <p className="mt-1 text-xs italic text-ink-400">{source}</p>}
    </div>
  )
}