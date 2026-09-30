'use client'

/**
 * Outreach request wizard (plan §9.1): 3 steps + a review screen.
 *
 * - Per-step validation (field lists from the shared schema)
 * - Step state preserved when going back (RHF keeps the whole value map)
 * - Review page before submit, with an explicit privacy-consent checkbox
 * - Full server pipeline runs on the final POST
 */

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { NIGERIAN_STATES } from '@/features/forms/constants'
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
import {
  OUTREACH_STEP_FIELDS,
  outreachRequestSchema,
  type OutreachRequestOutput,
} from '@/features/forms/schemas'
import { TurnstileWidget } from '@/features/forms/TurnstileWidget'
import { useFormSubmission } from '@/features/forms/useFormSubmission'
import { cn } from '@/lib/cn'

const AUDIENCE_SIZES = ['Under 50', '50–100', '101–300', '301–500', 'Over 500'] as const
const TARGET_AUDIENCES = [
  'Women',
  'Men',
  'Children',
  'Adolescents',
  'Pregnant & nursing women',
  'Elderly',
  'People living with chronic conditions',
  'Mixed community',
  'Other',
] as const
const VENUE_OPTIONS = ['Venue secured', 'Venue likely available', 'Need help finding a venue', 'Not sure yet'] as const
const SUPPORT_TYPES = [
  'Nutrition education session',
  'Health screening',
  'Training for health volunteers',
  'Educational materials',
  'Long-term programme support',
  'Other',
] as const

const STEPS = [
  { title: 'About you', description: 'Who is requesting the outreach' },
  { title: 'Your community', description: 'Where and who you want to reach' },
  { title: 'What you need', description: 'Topics, dates and support' },
] as const

export function OutreachRequestForm() {
  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setError,
    formState: { errors },
  } = useForm<OutreachRequestOutput>({
    resolver: zodResolver(outreachRequestSchema),
    mode: 'onBlur',
  })

  const [step, setStep] = useState(0)
  const [reviewErrors, setReviewErrors] = useState<Record<string, string>>({})
  const { state, formError, fieldErrors, reference, submit } = useFormSubmission()
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const { ref: errorSummaryRef, focusErrorSummary } = useErrorSummaryRef()

  useEffect(() => {
    const entries = Object.entries(fieldErrors)
    if (entries.length === 0) return
    for (const [field, message] of entries) {
      setError(field as keyof OutreachRequestOutput, { message })
    }
    focusErrorSummary()
  }, [fieldErrors])

  if (state === 'success' && reference) {
    return <SuccessPanel formType="outreach-request" reference={reference} />
  }

  const goNext = async () => {
    const fields = OUTREACH_STEP_FIELDS[step + 1]
    const ok = await trigger(fields as (keyof OutreachRequestOutput)[])
    if (!ok) {
      focusErrorSummary()
      return
    }
    setStep((s) => Math.min(s + 1, STEPS.length))
  }

  const goBack = () => {
    setStep((s) => Math.max(s - 1, 0))
  }

  const onSubmit = async (values: OutreachRequestOutput) => {
    const consentOk = values.privacyConsent === true
    if (!consentOk) {
      setReviewErrors({ privacyConsent: 'You must agree to the Privacy Policy to continue.' })
      focusErrorSummary()
      return
    }
    setReviewErrors({})
    void submit('/api/outreach-request', values as unknown as Record<string, unknown>, turnstileToken)
  }

  const allErrorMessages: Record<string, string> = {
    ...Object.fromEntries(
      Object.entries(errors).filter(([, e]) => e?.message).map(([k, e]) => [k, e!.message ?? '']),
    ),
    ...reviewErrors,
    ...(formError ? { form: formError } : {}),
  }

  const reviewValues = getValues()

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
      {/* Progress indicator */}
      <ol aria-label="Form progress" className="flex flex-wrap items-center gap-2 sm:gap-4">
        {STEPS.map((item, index) => {
          const isCurrent = index === step
          const isComplete = index < step
          return (
            <li key={item.title} className="flex items-center gap-2 sm:gap-4">
              <span
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm',
                  isCurrent && 'bg-leaf-700 text-white',
                  isComplete && 'bg-leaf-100 text-leaf-800',
                  !isCurrent && !isComplete && 'bg-ink-100 text-ink-600',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold',
                    isCurrent ? 'bg-white/20' : 'bg-white/60',
                  )}
                >
                  {isComplete ? '✓' : index + 1}
                </span>
                <span className="hidden sm:inline">{item.title}</span>
              </span>
              {index < STEPS.length - 1 ? <span className="text-ink-300" aria-hidden="true">→</span> : null}
            </li>
          )
        })}
      </ol>

      <ErrorSummary ref={errorSummaryRef} errors={allErrorMessages} />

      <p className="text-sm text-ink-500" aria-live="polite">
        Step {Math.min(step + 1, STEPS.length + 1)} of {STEPS.length + 1}:{' '}
        {step < STEPS.length ? STEPS[step].description : 'Review your request'}
      </p>

      {/* Step 1 — who you are */}
      {step === 0 && (
        <div className="space-y-6">
          <TextField
            id="org-name"
            label="Organisation or community name"
            autoComplete="organization"
            error={errors.organisationName?.message}
            {...register('organisationName')}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              id="contact-name"
              label="Contact person's name"
              autoComplete="name"
              error={errors.contactName?.message}
              {...register('contactName')}
            />
            <TextField
              id="contact-role"
              label="Contact person's role"
              hint="e.g. community leader, teacher, coordinator"
              error={errors.contactRole?.message}
              {...register('contactRole')}
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
              label="Telephone"
              type="tel"
              autoComplete="tel"
              hint="e.g. 0803 123 4567 or +2348031234567"
              error={errors.telephone?.message}
              {...register('telephone')}
            />
          </div>
        </div>
      )}

      {/* Step 2 — where / who you want to reach */}
      {step === 1 && (
        <div className="space-y-6">
          <TextField
            id="community"
            label="Community name"
            hint="e.g. the Okpanam community, Badagry market traders"
            error={errors.community?.message}
            {...register('community')}
          />
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              id="lga"
              label="Local government area"
              hint="e.g. Oshodi-Isolo, Ifako-Ijaiye"
              error={errors.lga?.message}
              {...register('lga')}
            />
            <SelectField
              id="state"
              label="State"
              options={NIGERIAN_STATES}
              placeholder="Choose a state"
              error={errors.state?.message}
              {...register('state')}
            />
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            <SelectField
              id="audience-size"
              label="Estimated audience size"
              options={AUDIENCE_SIZES}
              placeholder="Select an estimate"
              error={errors.audienceSize?.message}
              {...register('audienceSize')}
            />
            <SelectField
              id="target-audience"
              label="Who do you want to reach?"
              options={TARGET_AUDIENCES}
              placeholder="Select the main group"
              error={errors.targetAudience?.message}
              {...register('targetAudience')}
            />
          </div>
          <SelectField
            id="venue"
            label="Venue availability"
            options={VENUE_OPTIONS}
            placeholder="What's the venue situation?"
            error={errors.venueAvailability?.message}
            {...register('venueAvailability')}
          />
        </div>
      )}

      {/* Step 3 — what you need */}
      {step === 2 && (
        <div className="space-y-6">
          <TextAreaField
            id="health-concerns"
            label="Main health or nutrition concerns"
            hint="What topics would you like covered? e.g. anaemia, child nutrition, diabetes"
            error={errors.healthConcerns?.message}
            {...register('healthConcerns')}
          />
          <TextField
            id="preferred-date"
            label="Preferred date or date range"
            hint="e.g. a Saturday in November, or a specific week"
            error={errors.preferredDate?.message}
            {...register('preferredDate')}
          />
          <SelectField
            id="support-type"
            label="Type of support requested"
            options={SUPPORT_TYPES}
            placeholder="Choose what you need"
            error={errors.supportType?.message}
            {...register('supportType')}
          />
          <TextAreaField
            id="additional-info"
            label="Anything else we should know? (optional)"
            rows={4}
            error={errors.additionalInfo?.message}
            {...register('additionalInfo')}
          />
        </div>
      )}

      {/* Review step */}
      {step === STEPS.length && (
        <div className="space-y-6">
          <div className="space-y-4 rounded-xl border border-ink-100 bg-paper-100 p-5">
            {[
              ['Organisation or community', reviewValues.organisationName],
              ['Contact person', `${reviewValues.contactName} (${reviewValues.contactRole})`],
              ['Email', reviewValues.email],
              ['Telephone', reviewValues.telephone],
              ['Community', `${reviewValues.community}, ${reviewValues.lga}, ${reviewValues.state}`],
              ['Audience', `${reviewValues.audienceSize} — ${reviewValues.targetAudience}`],
              ['Venue', reviewValues.venueAvailability],
              ['Health concerns', reviewValues.healthConcerns],
              ['Preferred date', reviewValues.preferredDate],
              ['Support requested', reviewValues.supportType],
              ...(reviewValues.additionalInfo
                ? ([['Additional info', reviewValues.additionalInfo]] as const)
                : []),
            ].map(([label, value]) => (
              <div key={label} className="grid gap-1 sm:grid-cols-[11rem_1fr] sm:gap-4">
                <dt className="text-sm font-semibold text-ink-500">{label}</dt>
                <dd className="text-ink-800">{value}</dd>
              </div>
            ))}
          </div>

          <CheckboxField
            id="consent"
            label="I agree to the Privacy Policy"
            error={reviewErrors.privacyConsent ?? errors.privacyConsent?.message}
            {...register('privacyConsent')}
          >
            By submitting this request, NHECOF may contact you using the details above to plan this
            outreach. See our{' '}
            <Link href="/privacy" className="text-leaf-700 underline underline-offset-2 hover:text-leaf-800">
              Privacy Policy
            </Link>{' '}
            for how we use personal data.
          </CheckboxField>

          <TurnstileWidget onTokenChange={setTurnstileToken} />
          <HoneypotField {...register('website')} />
        </div>
      )}

      <div className="flex flex-wrap gap-3 pt-2">
        {step > 0 && (
          <Button type="button" variant="quiet" onClick={goBack}>
            Back
          </Button>
        )}
        {step < STEPS.length ? (
          <Button type="button" onClick={() => void goNext()}>
            Continue
          </Button>
        ) : (
          <Button type="submit" loading={state === 'submitting'}>
            {state === 'submitting' ? 'Submitting…' : 'Submit request'}
          </Button>
        )}
      </div>
    </form>
  )
}