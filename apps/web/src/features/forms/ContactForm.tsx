'use client'

/**
 * General contact form (plan §9.1).
 * Shared schema + RHF validation on the client, full pipeline on the server.
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CONTACT_SUBJECTS } from '@/features/forms/constants'
import { Button } from '@/components/ui/Button'
import {
  CheckboxField,
  ErrorSummary,
  HoneypotField,
  SelectField,
  SuccessPanel,
  TextAreaField,
  TextField,
  useErrorSummaryRef,
} from '@/features/forms/fields'
import { contactSchema, type ContactOutput } from '@/features/forms/schemas'
import { TurnstileWidget } from '@/features/forms/TurnstileWidget'
import { useFormSubmission } from '@/features/forms/useFormSubmission'
import { useEffect, useState } from 'react'
import { Link } from '@/components/ui/Link'

interface ContactFormProps {
  prefilledSubject?: string
  sourceRef?: string
}

export function ContactForm({ prefilledSubject, sourceRef }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<ContactOutput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      subject: CONTACT_SUBJECTS.includes(prefilledSubject as (typeof CONTACT_SUBJECTS)[number])
        ? (prefilledSubject as (typeof CONTACT_SUBJECTS)[number])
        : undefined,
      ref: sourceRef,
    },
  })

  const { state, formError, fieldErrors, reference, submit } = useFormSubmission()
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const { ref: errorSummaryRef, focusErrorSummary } = useErrorSummaryRef()

  // A server-side field error maps back onto the matching RHF field.
  useEffect(() => {
    const entries = Object.entries(fieldErrors)
    if (entries.length === 0) return
    for (const [field, message] of entries) {
      setError(field as keyof ContactOutput, { message })
    }
    focusErrorSummary()
  }, [fieldErrors])

  if (state === 'success' && reference) {
    return <SuccessPanel formType="contact" reference={reference} />
  }

  const onSubmit = (values: ContactOutput) => {
    void submit('/api/contact', values as unknown as Record<string, unknown>, turnstileToken)
  }

  const allErrorMessages: Record<string, string> = {
    ...Object.fromEntries(Object.entries(errors).filter(([, e]) => e?.message).map(([k, e]) => [k, e!.message ?? ''])),
    ...(formError ? { form: formError } : {}),
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      <ErrorSummary ref={errorSummaryRef} errors={allErrorMessages} />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="contact-name"
          label="Your name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          id="contact-email"
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <TextField
        id="contact-telephone"
        label="Telephone (optional)"
        type="tel"
        autoComplete="tel"
        hint="Nigerian numbers in any format work, e.g. 0803 123 4567."
        error={errors.telephone?.message}
        {...register('telephone')}
      />

      <SelectField
        id="contact-subject"
        label="Subject"
        options={CONTACT_SUBJECTS}
        placeholder="Choose a subject"
        error={errors.subject?.message}
        {...register('subject')}
      />

      <TextAreaField
        id="contact-message"
        label="Your message"
        hint="Include as much detail as you can."
        error={errors.message?.message}
        {...register('message')}
      />

      <CheckboxField
        id="contact-consent"
        label="I agree to the Privacy Policy"
        hint="We'll only use your details to respond to your message."
        error={errors.privacyConsent?.message}
        {...register('privacyConsent')}
      >
        By submitting, you agree to our{' '}
        <Link href="/privacy" className="text-leaf-700 underline underline-offset-2 hover:text-leaf-800">
          Privacy Policy
        </Link>
        .
      </CheckboxField>

      <TurnstileWidget onTokenChange={setTurnstileToken} />

      <HoneypotField {...register('website')} />

      <Button type="submit" loading={state === 'submitting'}>
        {state === 'submitting' ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  )
}