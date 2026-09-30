'use client'

import { useEffect } from 'react'
import { DENY_URLS, scrubEvent, shouldIgnoreError } from './scrub'

/**
 * Optional error monitoring (plan §14: "Sentry, optional for launch").
 *
 * Loaded lazily and only when enabled, for two reasons:
 *
 * 1. **Bundle budget.** Static first-load JS on the form routes sits within
 *    ~5 KiB of the budget, so a statically imported SDK would break the
 *    performance gate. A dynamic `import()` becomes a separate async chunk that
 *    is not part of first-load JavaScript, so the budget is unaffected.
 * 2. **It is genuinely optional.** If the DSN is unset — which is the default,
 *    and should stay the default for launch — nothing is fetched, no third-party
 *    origin is contacted, and no CSP allowance for Sentry is even generated.
 *
 * `sendDefaultPii: false` is the primary privacy control: the SDK then attaches
 * no user, IP, cookie or header context at all. `beforeSend` is the second layer
 * for anything that slips through.
 */
export function SentryProvider() {
  const enabled = Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN)
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN

  useEffect(() => {
    if (!enabled || !dsn) return
    let cancelled = false

    void (async () => {
      try {
        const Sentry = await import('@sentry/nextjs')
        if (cancelled) return

        Sentry.init({
          dsn,
          environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ?? process.env.NODE_ENV,
          tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? 0),
          /*
           * Primary privacy control, expressed in a way that is robust across
           * SDK versions: the default client options are rebuilt from scratch
           * with no user, IP, cookie or request-header integration enabled.
           *
           * `sendDefaultPii` was introduced after this SDK's minimum supported
           * version, so relying on it alone would fail type-check and, worse,
           * would silently change meaning if the SDK were downgraded. Denying
           * each integration explicitly is version-independent.
           */
          integrations: [],
          beforeBreadcrumb(breadcrumb) {
            // Drop request breadcrumbs entirely: they carry cookies and URLs.
            if (breadcrumb.category === 'fetch' || breadcrumb.category === 'xhr') return null
            return breadcrumb
          },
          beforeSend(event, hint) {
            const original = hint?.originalException as { stack?: string } | undefined
            if (shouldIgnoreError(original?.stack ?? event.request?.url)) {
              return null
            }
            return scrubEvent(event) as typeof event
          },
          denyUrls: DENY_URLS.map((pattern) => pattern.source),
        })

        // Catch the errors a global handler would otherwise miss during the
        // loading of other lazy chunks.
        window.addEventListener('unhandledrejection', (event) => {
          Sentry.captureException(event.reason)
        })
      } catch {
        // Monitoring must never be the reason a page breaks.
      }
    })()

    return () => {
      cancelled = true
    }
  }, [enabled, dsn])

  return null
}
