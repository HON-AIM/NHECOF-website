'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="mx-auto max-w-[var(--width-prose)] px-4 py-16 text-center md:px-8">
      <h2 className="font-display text-2xl font-bold text-ink-900">
        Something went wrong
      </h2>
      <p className="mt-3 text-ink-700">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-leaf-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-leaf-900"
      >
        Try again
      </button>
    </section>
  )
}
