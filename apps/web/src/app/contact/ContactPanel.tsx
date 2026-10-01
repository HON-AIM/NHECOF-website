'use client'

import { useEffect, useState } from 'react'
import { ContactForm } from '@/features/forms/ContactForm'
import { Badge } from '@/components/ui/Badge'

interface Prefill {
  subject?: string
  message?: string
  ref?: string
}

function readPrefill(): Prefill {
  if (typeof window === 'undefined') return {}
  const sp = new URLSearchParams(window.location.search)
  return {
    subject: sp.get('subject') ?? undefined,
    message: sp.get('message') ?? undefined,
    ref: sp.get('ref') ?? undefined,
  }
}

/**
 * Renders the contact form and applies `?subject=` / `?message=` / `?ref=`
 * prefill from the URL.
 *
 * This previously read the params with `useSearchParams()` inside a
 * `<Suspense fallback={null}>`, which removed the entire form from the initial
 * HTML and cost roughly 1.4s of LCP on /contact (Lighthouse performance 88).
 * Reading `window.location` after mount keeps the server render free of the
 * hook — no Suspense boundary, form present in the first paint — while still
 * honouring the deep links the site uses (e.g. /get-involved -> ?subject=Volunteering).
 */
export function ContactPanel() {
  const [prefill, setPrefill] = useState<Prefill>({})

  useEffect(() => {
    // Runs on mount, which covers client-side navigation to /contact?subject=…
    // as well as a direct load.
    const apply = () => setPrefill(readPrefill())
    apply()

    // Back/forward can change the query without remounting this component.
    window.addEventListener('popstate', apply)
    return () => window.removeEventListener('popstate', apply)
  }, [])

  const { subject, message, ref } = prefill

  return (
    <>
      {subject ? (
        <p className="text-sm text-ink-600">
          <Badge variant="clay">Subject: {subject}</Badge>
          <span className="ml-2">
            Your message will start with the subject &ldquo;{subject}&rdquo;.
          </span>
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-ink-600">
          <Badge variant="leaf">Page in question</Badge>
          <span className="ml-2 break-all">{message}</span>
        </p>
      ) : null}
      {/* Keyed so a prefill applied after mount remounts the form, which is what
          re-evaluates react-hook-form's defaultValues. */}
      <ContactForm
        key={`${subject ?? ''}:${message ?? ''}:${ref ?? ''}`}
        prefilledSubject={subject}
        sourceRef={ref}
      />
    </>
  )
}
