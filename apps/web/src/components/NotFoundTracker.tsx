'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { logAnonymousEvent } from '@/lib/analytics'

export function NotFoundTracker() {
  const path = usePathname()

  useEffect(() => {
    logAnonymousEvent('not_found', { path })
  }, [path])

  return null
}