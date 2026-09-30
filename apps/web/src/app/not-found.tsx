import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { NotFoundTracker } from '@/components/NotFoundTracker'

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/404',
    fallbackTitle: 'Page not found',
    fallbackDescription:
      'Sorry, we could not find the page you were looking for. It may have been moved or the link may be incorrect.',
    noindex: true,
  })
}

export default function NotFound() {
  return (
    <section className="mx-auto max-w-[var(--width-prose)] px-4 py-16 text-center md:px-8">
      <NotFoundTracker />
      <p className="text-sm font-semibold tracking-wide text-palm-600">404</p>
      <h1 className="mt-2 font-display text-3xl font-bold text-ink-900">
        Page not found
      </h1>
      <p className="mt-3 text-ink-700">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have
        been moved or the link may be incorrect. You can try one of these instead.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-2 text-sm">
        <Link href="/" className="font-semibold text-leaf-700 hover:underline">
          Back to homepage
        </Link>
        <Link href="/nutrition" className="text-ink-600 hover:text-leaf-700 hover:underline">
          Browse the Nutrition Hub
        </Link>
        <Link href="/contact" className="text-ink-600 hover:text-leaf-700 hover:underline">
          Contact us
        </Link>
      </div>
    </section>
  )
}