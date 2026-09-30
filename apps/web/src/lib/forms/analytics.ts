import type { FormType } from '@/features/forms/schemas'

/**
 * Privacy-conscious analytics (plan §17).
 *
 * Only COMPLETION events are recorded — never field contents. The reference
 * lets the team correlate with the delivery store if needed without leaking
 * personal data into the log line.
 */
export function logFormCompleted(formType: FormType, reference: string): void {
  const eventName =
    formType === 'outreach-request'
      ? 'outreach_request_completed'
      : formType === 'partnership'
        ? 'partnership_enquiry_completed'
        : null

  if (!eventName) return

  try {
    console.log(`[analytics] ${eventName} ${JSON.stringify({ reference })}`)
  } catch {
    // Analytics must never break a form submission.
  }
}