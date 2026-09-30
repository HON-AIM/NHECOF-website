import { Container } from '@/components/ui/Container'
import { Stat } from '@/components/ui/Stat'
import { formatCompact, formatMonthYear } from '@/lib/format'
import type { ImpactMetric } from './queries'

interface ImpactSnapshotProps {
  heading?: string
  description?: string
  metrics: ImpactMetric[]
}

function formatValue(value: number, unit?: string): string {
  const formatted = formatCompact(value)
  return unit && formatted ? `${formatted} ${unit}` : formatted
}

export function ImpactSnapshot({
  heading,
  description,
  metrics,
}: ImpactSnapshotProps) {
  if (!metrics || metrics.length === 0) return null

  return (
    <section aria-labelledby="impact-heading" className="bg-leaf-950 text-white">
      <Container width="wide" className="py-14 md:py-20">
        {heading && (
          <h2
            id="impact-heading"
            className="font-display text-2xl font-bold md:text-3xl"
          >
            {heading}
          </h2>
        )}
        {description && (
          <p className="mt-2 max-w-prose text-base text-leaf-200">
            {description}
          </p>
        )}

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          {metrics.map((metric) => (
            <Stat
              key={metric._id}
              value={formatValue(metric.value, metric.unit)}
              label={metric.label}
              asOf={formatMonthYear(metric.asOf)}
              source={
                metric.basis === 'computed' ? 'Computed from records' : undefined
              }
              className="[&_p:first-child]:text-white [&_p]:text-leaf-200 [&_p:first-child]:text-4xl md:[&_p:first-child]:text-5xl"
            />
          ))}
        </div>
      </Container>
    </section>
  )
}
