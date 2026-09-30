'use client'

/**
 * Partnership enquiry form (plan §9.1).
 * Shared schema + RHF validation, full server pipeline on submission.
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Link } from '@/components/ui/Link'
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
import { partnershipSchema, type PartnershipOutput } from '@/features/forms/schemas'
import { TurnstileWidget } from '@/features/forms/TurnstileWidget'
import { useFormSubmission } from '@/features/forms/useFormSubmission'

const PARTNERSHIP_INTERESTS = [
  'Host an outreach or programme',
  'Sponsor or fund a programme',
  'Provide venue or facilities',
  'Contribute expertise or professionals',
  'Media or communications partnership',
  'Research collaboration',
  'Distribute educational materials',
  'Other',
] as const

export function PartnershipForm() {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<PartnershipOutput>({
    resolver: zodResolver(partnershipSchema),
  })

  const { state, formError, fieldErrors, reference, submit } = useFormSubmission()
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const { ref: errorSummaryRef, focusErrorSummary } = useErrorSummaryRef()

  useEffect(() => {
    const entries = Object.entries(fieldErrors)
    if (entries.length === 0) return
    for (const [field, message] of entries) {
      setError(field as keyof PartnershipOutput, { message })
    }
    focusErrorSummary()
  }, [fieldErrors])

  if (state === 'success' && reference) {
    return <SuccessPanel formType="partnership" reference={reference} />
  }

  const onSubmit = (values: PartnershipOutput) => {
    void submit('/api/partnership', values as unknown as Record<string, unknown>, turnstileToken)
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
          id="organisation"
          label="Organisation name"
          autoComplete="organization"
          error={errors.organisation?.message}
          {...register('organisation')}
        />
        <TextField
          id="contact-person"
          label="Contact person"
          autoComplete="name"
          error={errors.contactPerson?.message}
          {...register('contactPerson')}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <TextField
          id="telephone"
          label="Telephone (optional)"
          type="tel"
          autoComplete="tel"
          hint="e.g. 0803 123 4567 or +2348031234567"
          error={errors.telephone?.message}
          {...register('telephone')}
        />
      </div>

      <SelectField
        id="partnership-interest"
        label="Partnership interest"
        options={PARTNERSHIP_INTERESTS}
        placeholder="Choose an interest"
        error={errors.partnershipInterest?.message}
        {...register('partnershipInterest')}
      />

      <TextAreaField
        id="proposed-contribution"
        label="Proposed contribution or collaboration"
        hint="Tell us about what your organisation could contribute."
        error={errors.proposedContribution?.message}
        {...register('proposedContribution')}
      />

      <TextAreaField
        id="message"
        label="Message (optional)"
        rows={4}
        error={errors.message?.message}
        {...register('message')}
      />

      <CheckboxField
        id="partnership-consent"
        label="I agree to the Privacy Policy"
        hint="We'll only use these details to explore the partnership."
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
        {state === 'submitting' ? 'Sending…' : 'Send partnership enquiry'}
      </Button>
    </form>
  )
}