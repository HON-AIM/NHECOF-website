import { Container } from '@/components/ui/Container'

/*
  Newsletter section — only renders when NEWSLETTER_ENABLED=true.
  Lives behind a feature flag on the homepage; the subscribe flow itself is
  deferred until a later release. This component provides the visual shell.
*/

interface NewsletterProps {
  enabled: boolean
}

export function Newsletter({ enabled }: NewsletterProps) {
  if (!enabled) return null

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="bg-leaf-900 text-white"
    >
      <Container width="prose" className="py-14 md:py-20 text-center">
        <h2
          id="newsletter-heading"
          className="font-display text-2xl font-bold md:text-3xl"
        >
          Stay informed
        </h2>
        <p className="mt-3 text-base text-leaf-200">
          Get evidence-based nutrition tips and community health updates
          delivered to your inbox.
        </p>

        {/* Subscribe flow deferred; only the visual shell ships behind the flag */}
        <div className="mt-8 mx-auto max-w-md">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex gap-2"
            aria-label="Newsletter signup"
          >
            <label htmlFor="newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="newsletter-email"
              type="email"
              placeholder="you@example.com"
              required
              className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/50 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="rounded-lg bg-palm-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-palm-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-3 text-xs text-leaf-300">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </Container>
    </section>
  )
}
