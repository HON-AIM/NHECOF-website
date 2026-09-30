import type { ReactNode } from 'react'
import { cn } from './Card'

export const LEAF_CUT_PATH =
  'polygon(10% 0%, 50% 3%, 90% 0%, 100% 20%, 97% 48%, 100% 76%, 92% 100%, 50% 96%, 8% 100%, 0% 78%, 3% 48%, 0% 22%)'

interface LeafCutFrameProps {
  children: ReactNode
  className?: string
}

/**
 * Leaf-shaped (leaf-cut) photo frame — the brand's signature portrait shape.
 * Wraps the child (usually an image) inside a leaf silhouette on a leaf-tinted
 * backing so the cut edges read as an intentional frame.
 */
export function LeafCutFrame({ children, className }: LeafCutFrameProps) {
  return (
    <div className={cn('inline-block rounded-leaf bg-leaf-100 p-2', className)}>
      <div className="overflow-hidden" style={{ clipPath: LEAF_CUT_PATH }}>
        {children}
      </div>
    </div>
  )
}

export default LeafCutFrame