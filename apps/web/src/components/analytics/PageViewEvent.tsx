'use client'

import { useTrackEvent } from '@/lib/analytics/useTrackEvent'
import type { AnalyticsEventName } from '@/lib/analytics/provider'

/**
 * Fire a page-view event from a Server Component.
 *
 * Renders nothing. Exists so that a server-rendered page can record a view
 * without becoming a Client Component itself — the page keeps server rendering
 * and only this leaf is shipped to the browser.
 *
 * Properties must be JSON-serialisable (string / number / boolean) because they
 * cross the server/client boundary. Values that do not match the event schema
 * are dropped by `sanitiseEvent`, so passing a free-text field degrades to a
 * missing property rather than to leaked data.
 */
export function PageViewEvent({
  event,
  properties,
}: {
  event: AnalyticsEventName
  properties?: Record<string, string | number | boolean>
}) {
  useTrackEvent(event, properties ?? {})
  return null
}
