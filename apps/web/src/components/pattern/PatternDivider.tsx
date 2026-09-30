'use client'

import { useId, type CSSProperties } from 'react'
import { cn } from '@/lib/cn'

interface PatternDividerProps {
  variant?: 'diamonds' | 'waves' | 'dots'
  color?: string
  height?: number
  className?: string
}

const TILE = 32

function DiamondPattern({ id }: { id: string }) {
  return (
    <pattern
      id={id}
      width={TILE}
      height={TILE}
      patternUnits="userSpaceOnUse"
    >
      <path
        d="M16 0 32 16 16 32 0 16Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        opacity={0.5}
      />
      <path d="M16 9l7 7-7 7-7-7Z" fill="currentColor" opacity={0.9} />
      <circle cx={5} cy={5} r={1.25} fill="currentColor" opacity={0.8} />
      <circle cx={27} cy={5} r={1.25} fill="currentColor" opacity={0.8} />
      <circle cx={5} cy={27} r={1.25} fill="currentColor" opacity={0.8} />
      <circle cx={27} cy={27} r={1.25} fill="currentColor" opacity={0.8} />
    </pattern>
  )
}

function WavesPattern({ id, height }: { id: string; height: number }) {
  return (
    <pattern id={id} width={64} height={height} patternUnits="userSpaceOnUse">
      <path
        d="M-6 12c7-5 13-5 20 0s13 5 20 0 13-5 20 0 13 5 20 0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        opacity={0.6}
      />
      <path
        d="M-6 22c7-5 13-5 20 0s13 5 20 0 13-5 20 0 13 5 20 0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        opacity={0.4}
      />
      <path
        d="M-6 32c7-5 13-5 20 0s13 5 20 0 13-5 20 0 13 5 20 0"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.4}
        opacity={0.25}
      />
    </pattern>
  )
}

function DotsPattern({ id }: { id: string }) {
  return (
    <pattern
      id={id}
      width={TILE}
      height={TILE}
      patternUnits="userSpaceOnUse"
    >
      <circle cx={16} cy={16} r={6} fill="none" stroke="currentColor" strokeWidth={0.8} opacity={0.35} />
      <circle cx={8} cy={8} r={2} fill="currentColor" opacity={0.4} />
      <circle cx={24} cy={8} r={1.3} fill="currentColor" opacity={0.7} />
      <circle cx={16} cy={16} r={2.6} fill="currentColor" opacity={0.35} />
      <circle cx={8} cy={24} r={1.3} fill="currentColor" opacity={0.7} />
      <circle cx={24} cy={24} r={2} fill="currentColor" opacity={0.4} />
    </pattern>
  )
}

export default function PatternDivider({
  variant = 'diamonds',
  color = 'var(--color-leaf-200)',
  height = 40,
  className,
}: PatternDividerProps) {
  const id = `nhecof-pattern-${useId().replaceAll(':', '')}`
  const style: CSSProperties = { color }

  return (
    <svg
      className={cn('block w-full', className)}
      style={style}
      role="presentation"
      aria-hidden="true"
      focusable="false"
      width="100%"
      height={height}
    >
      <defs>
        {variant === 'diamonds' && <DiamondPattern id={id} />}
        {variant === 'waves' && <WavesPattern id={id} height={height} />}
        {variant === 'dots' && <DotsPattern id={id} />}
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}