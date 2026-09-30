'use client'

import { useEffect, useRef } from 'react'
import { track, type AnalyticsEventName } from './provider'

/**
 * Fire an analytics event once, when a view is genuinely completed.
 *
 * The "once" guard matters: React 19 StrictMode double-invokes effects in
 * development, and a re-render (a filter change, a hydration pass) would
 * otherwise inflate the event count. Double-counted analytics is worse than
 * missing analytics, because it quietly misleads every later decision.
 *
 * Properties are held in a ref rather than used as an effect dependency: a
 * caller passing an inline object would otherwise re-fire on every render.
 */
export function useTrackEvent(event: AnalyticsEventName, properties: Record<string, unknown> = {}) {
  const sent = useRef(false)
  const latest = useRef(properties)
  latest.current = properties

  useEffect(() => {
    if (sent.current) return
    sent.current = true
    track(event, latest.current)
  }, [event])
}
