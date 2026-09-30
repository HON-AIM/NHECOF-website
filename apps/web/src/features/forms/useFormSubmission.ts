'use client'

/**
 * Shared form-submission logic: posts values + turnstile token to the JSON
 * API, exposes loading/error/success states, and maps server field errors
 * back onto the client form. No values are lost on error — the caller keeps
 * editing their (still-mounted) form fields.
 */

import { useCallback, useState } from 'react'
import { serverFieldErrors } from '@/features/forms/fields'

export type SubmissionState = 'idle' | 'submitting' | 'success'

interface UseFormSubmissionResult {
  state: SubmissionState
  /** Non-field error surfaced at the top of the form (generic server message). */
  formError: string | null
  /** Field-keyed errors from the server (plain field messages). */
  fieldErrors: Record<string, string>
  reference?: string
  submit: (endpoint: string, values: Record<string, unknown>, token: string | null) => Promise<void>
  reset: () => void
}

export function useFormSubmission(): UseFormSubmissionResult {
  const [state, setState] = useState<SubmissionState>('idle')
  const [formError, setFormError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [reference, setReference] = useState<string | undefined>(undefined)

  const submit = useCallback(
    async (endpoint: string, values: Record<string, unknown>, token: string | null) => {
      setState('submitting')
      setFormError(null)
      setFieldErrors({})

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...values, turnstileToken: token }),
        })

        const payload = (await response.json().catch(() => null)) as {
          ok?: boolean
          reference?: string
          error?: string
          fieldErrors?: Record<string, string>
        } | null

        if (response.ok && payload?.ok) {
          setReference(payload.reference)
          setState('success')
          return
        }

        if (payload && typeof payload.error === 'string') {
          setFormError(payload.error)
        } else {
          setFormError('Something went wrong. Please try again.')
        }
        setFieldErrors(serverFieldErrors(payload ?? {}))
        setState('idle')
      } catch {
        setFormError('Unable to reach the server. Please check your connection and try again.')
        setState('idle')
      }
    },
    [],
  )

  const reset = useCallback(() => {
    setState('idle')
    setFormError(null)
    setFieldErrors({})
    setReference(undefined)
  }, [])

  return { state, formError, fieldErrors, reference, submit, reset }
}