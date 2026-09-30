/**
 * Next.js instrumentation hook.
 *
 * Server-side error monitoring is intentionally NOT initialised here. Doing so
 * requires `withSentryConfig` in `next.config.ts`, which applies a build-time
 * source-map upload step and would couple every build to a Sentry account —
 * unacceptable for a site that must build without any optional credentials.
 *
 * Consequence, stated plainly: with this configuration the site reports
 * *client-side* JavaScript errors only. Server and edge function errors are not
 * captured. That is a real gap, and the launch checklist records it as the
 * reason to revisit server monitoring post-launch (or to rely on Vercel's own
 * function logs, which remain available either way).
 *
 * This file must exist for the `SentryProvider` lazy client chunk to have a
 * stable registration point, and as the documented upgrade path.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === 'nodejs' && process.env.SENTRY_TRACES_SAMPLE_RATE) {
    // Left deliberately empty. See the note above: enabling server tracing
    // requires build-time source-map upload configuration in next.config.ts.
  }
}
