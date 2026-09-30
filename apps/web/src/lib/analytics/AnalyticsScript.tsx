'use client'

import Script from 'next/script'
import { getAnalyticsHost, getProvider, getScriptUrl } from './provider'

/**
 * Injects the configured analytics script once per page load.
 *
 * Rendered in the root layout. When no provider is configured this renders
 * nothing, which is the correct behaviour for a site that must not quietly ship
 * an undeclared tracker.
 *
 * The provider rationale and cost trade-off are documented in `./provider.ts`.
 */
export function AnalyticsScript() {
  const provider = getProvider()
  const src = getScriptUrl()
  if (!src) return null

  if (provider === 'umami') {
    return <Script defer data-website-id={getAnalyticsHost()} src={src} strategy="afterInteractive" />
  }

  if (provider === 'plausible') {
    return <Script defer data-domain={getAnalyticsHost()} src={src} strategy="afterInteractive" />
  }

  return <Script defer src={src} strategy="afterInteractive" />
}
