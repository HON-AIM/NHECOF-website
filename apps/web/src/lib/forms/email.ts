import { Resend } from 'resend'
import type { FormType, FormOutput } from '@/features/forms/schemas'
import { escapeHtml } from './sanitise'

/**
 * Email delivery via Resend (plan §9.2).
 *
 * Two emails are sent for every successful submission:
 *   1. An acknowledgement to the submitter — plain, warm language stating
 *      clearly what happens next and when.
 *   2. A structured internal notification to NHECOF with all fields, with
 *      `reply_to` set to the submitter so the team can reply in one click.
 *
 * Recipient addresses come from environment variables
 * (CONTACT/OUTREACH/PARTNERSHIP_RECIPIENT_EMAIL). The `from` address must be
 * a verified sender in Resend (`FORMS_EMAIL_FROM`); it defaults for local
 * running but should be overridden before launch.
 *
 * Test mode: when `RESEND_API_KEY` is absent (development/e2e, no live env)
 * the module logs the would-be emails and resolves successfully so the full
 * journey is exercised end to end. Resend's own test keys (`re_test_…`) are
 * also honoured and never touch real inboxes.
 */

export interface EmailResult {
  subject: string
  text: string
  html: string
}

type EmailField = { label: string; value: string }

const FORM_LABEL: Record<FormType, string> = {
  contact: 'message',
  'outreach-request': 'outreach request',
  partnership: 'partnership enquiry',
}

const ACTION_PLAN: Record<FormType, string> = {
  contact:
    'We aim to respond within 2-3 business days. If you reported a correction, it will also be logged for the relevant reviewer to act on.',
  'outreach-request':
    'A member of our team will review your request and contact you within 3 business days to discuss dates, venue and next steps.',
  partnership:
    'Our partnerships team will review the enquiry and reach out within 5 business days to explore next steps together.',
}

function submitterFirstName(email: string): string {
  const local = email.split('@')[0] ?? ''
  return local.replace(/[._+-]/g, ' ').trim() || 'friend'
}

/** Empty phone/optional fields don't create awkward "N/A" rows in emails. */
function optionalValue(value: string | undefined | null): string | null {
  return value && value.trim() ? value.trim() : null
}

/* ── Field extraction (attack-safe: only label/value strings, no HTML) ─── */

function contactFields(data: FormOutput): EmailField[] {
  const d = data as Extract<FormOutput, { subject: string }>
  return [
    { label: 'Name', value: d.name },
    { label: 'Email', value: d.email },
    ...(optionalValue(String(d.telephone ?? '')) ? [{ label: 'Telephone', value: String(d.telephone) }] : []),
    { label: 'Subject', value: d.subject },
    { label: 'Message', value: d.message },
  ]
}

function outreachFields(data: FormOutput): EmailField[] {
  const d = data as Extract<FormOutput, { organisationName: string }>
  return [
    { label: 'Organisation or community', value: d.organisationName },
    { label: 'Contact name', value: d.contactName },
    { label: 'Contact role', value: d.contactRole },
    { label: 'Email', value: d.email },
    { label: 'Telephone', value: d.telephone },
    { label: 'Community', value: d.community },
    { label: 'LGA', value: d.lga },
    { label: 'State', value: d.state },
    { label: 'Estimated audience', value: d.audienceSize },
    { label: 'Target audience', value: d.targetAudience },
    { label: 'Venue', value: d.venueAvailability },
    { label: 'Main health/nutrition concerns', value: d.healthConcerns },
    { label: 'Preferred date or range', value: d.preferredDate },
    { label: 'Type of support requested', value: d.supportType },
    ...(optionalValue(d.additionalInfo) ? [{ label: 'Additional information', value: d.additionalInfo as string }] : []),
  ]
}

function partnershipFields(data: FormOutput): EmailField[] {
  const d = data as Extract<FormOutput, { organisation: string }>
  return [
    { label: 'Organisation', value: d.organisation },
    { label: 'Contact person', value: d.contactPerson },
    { label: 'Email', value: d.email },
    ...(optionalValue(String(d.telephone ?? '')) ? [{ label: 'Telephone', value: String(d.telephone) }] : []),
    { label: 'Partnership interest', value: d.partnershipInterest },
    { label: 'Proposed contribution', value: d.proposedContribution },
    ...(optionalValue(d.message) ? [{ label: 'Message', value: d.message as string }] : []),
  ]
}

function fieldsFor(formType: FormType, data: FormOutput): EmailField[] {
  if (formType === 'contact') return contactFields(data)
  if (formType === 'outreach-request') return outreachFields(data)
  return partnershipFields(data)
}

/* ── Templates ─────────────────────────────────────────────────────────────── */

function buildAcknowledgement(formType: FormType, email: string, reference: string): EmailResult {
  const firstName = submitterFirstName(email)
  const label = FORM_LABEL[formType]
  const whatNext = ACTION_PLAN[formType]
  const subject = `Thank you — we received your ${label}`

  const text = [
    `Dear ${firstName},`,
    ``,
    `Thank you for contacting NHECOF. We have received your ${label} and it is now with our team.`,
    ``,
    `Your reference number is ${reference}. Please keep it for any follow-up.`,
    ``,
    `What happens next:`,
    whatNext,
    ``,
    `If your matter is urgent, please call or reach us on WhatsApp rather than waiting for email.`,
    ``,
    `For urgent health concerns, always contact a qualified healthcare provider directly.`,
    ``,
    `Warm regards,`,
    `The NHECOF team`,
  ].join('\n')

  const rows = [
    `<p>Dear ${escapeHtml(firstName)},</p>`,
    `<p>Thank you for contacting NHECOF. We have received your <strong>${escapeHtml(label)}</strong> and it is now with our team.</p>`,
    `<p style="margin-bottom:0">Your reference number is <strong>${escapeHtml(reference)}</strong>. Please keep it for any follow-up.</p>`,
    `<h3 style="font-size:16px;color:#1F5A3F;margin:20px 0 6px">What happens next</h3>`,
    `<p>${escapeHtml(whatNext)}</p>`,
    `<p style="margin-top:20px">If your matter is urgent, please call or reach us on WhatsApp rather than waiting for email.</p>`,
    `<p style="color:#7A3400"><strong>For urgent health concerns, always contact a qualified healthcare provider directly.</strong></p>`,
    `<p>Warm regards,<br>The NHECOF team</p>`,
  ]

  return { subject, text, html: wrapHtml(subject, rows) }
}

function buildNotification(
  formType: FormType,
  data: FormOutput,
  reference: string,
  submitterEmail: string,
): EmailResult {
  const label = FORM_LABEL[formType]
  const subject = `New ${label} — ${reference}`

  const rows = fieldsFor(formType, data)
    .map((field) => [field.label, field.value] as const)

  const text = [
    `New ${label}`,
    `Reference: ${reference}`,
    ``,
    ...rows.map(([fieldLabel, value]) => `${fieldLabel}: ${value}`),
    ``,
    `Reply-to: ${submitterEmail}`,
  ].join('\n')

  const html = wrapHtml(subject, [
    `<p>A new <strong>${escapeHtml(label)}</strong> has arrived (reference <strong>${escapeHtml(reference)}</strong>):</p>`,
    `<table style="border-collapse:collapse;font-size:14px">${rows
      .map(
        ([fieldLabel, value]) =>
          `<tr><td style="padding:6px 16px 0 0;vertical-align:top;color:#5C564D;white-space:nowrap;font-weight:600">${escapeHtml(fieldLabel)}</td><td style="padding:6px 0 0;vertical-align:top">${escapeHtml(value)}</td></tr>`,
      )
      .join('\n')}</table>`,
  ])

  return { subject, text, html }
}

function wrapHtml(subject: string, inner: string[]): string {
  return [
    `<!DOCTYPE html>`,
    `<html lang="en">`,
    `<body style="margin:0;padding:0;background:#FBF6EC;font-family:Arial,Helvetica,sans-serif;color:#22201C">`,
    `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 16px">`,
    `<table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FFFFFF;border-radius:12px;border:1px solid #E7DBC0">`,
    `<tr><td style="padding:24px 28px;border-bottom:1px solid #E7DBC0;background:#16352A;border-radius:12px 12px 0 0">`,
    `<span style="color:#FFFFFF;font-size:18px;font-weight:bold">NHECOF</span>`,
    `</td></tr>`,
    `<tr><td style="padding:24px 28px;font-size:15px;line-height:1.65">`,
    inner.join('\n'),
    `</td></tr>`,
    `</table>`,
    `</td></tr></table>`,
    `</body>`,
    `</html>`,
  ].join('\n')
}

/* ── Delivery ──────────────────────────────────────────────────────────────── */

function recipientFor(formType: FormType): string | null {
  const key =
    formType === 'contact'
      ? 'CONTACT_RECIPIENT_EMAIL'
      : formType === 'outreach-request'
        ? 'OUTREACH_RECIPIENT_EMAIL'
        : 'PARTNERSHIP_RECIPIENT_EMAIL'
  const value = process.env[key]
  return value && value.trim() ? value.trim() : null
}

function fromAddress(): string {
  const configured = process.env.FORMS_EMAIL_FROM
  if (configured && configured.trim()) return configured.trim()
  // Fall back to a verified-sender-friendly default; override before launch.
  return 'NHECOF <no-reply@nhecof.org>'
}

export interface SendSubmissionEmailsResult {
  simulated: boolean
}

/**
 * Sends the acknowledgement + internal notification for one submission.
 * Throws when a live send fails so the pipeline can surface a safe error.
 */
export async function sendSubmissionEmails(send: {
  formType: FormType
  data: FormOutput
  submitterEmail: string
  reference: string
}): Promise<SendSubmissionEmailsResult> {
  const { formType, data, submitterEmail, reference } = send
  const ack = buildAcknowledgement(formType, submitterEmail, reference)
  const notif = buildNotification(formType, data, reference, submitterEmail)
  const recipient = recipientFor(formType)

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    // Test mode (no live env): exercise the whole path without sending.
    console.log(
      `[forms] simulated delivery ${JSON.stringify({
        reference,
        formType,
        to: submitterEmail,
        recipient,
        ackSubject: ack.subject,
        notifSubject: notif.subject,
      })}`,
    )
    return { simulated: true }
  }

  // Resend test-key mode: keys starting re_test_ never reach real inboxes.
  const resend = new Resend(apiKey)

  const from = fromAddress()

  // Internal notification first: reply-to is the submitter.
  const notifications = [
    resend.emails.send({
      from,
      to: recipient ?? submitterEmail,
      replyTo: submitterEmail,
      subject: notif.subject,
      text: notif.text,
      html: notif.html,
    }),
    resend.emails.send({
      from,
      to: submitterEmail,
      subject: ack.subject,
      text: ack.text,
      html: ack.html,
    }),
  ]

  const results = await Promise.all(notifications)
  const failures = results.filter((r) => r.error).map((r) => r.error?.message ?? 'unknown error')
  if (failures.length > 0) {
    throw new Error(`Resend delivery failed for ${reference}: ${failures.join('; ')}`)
  }

  return { simulated: false }
}

export function hasRecipientFor(formType: FormType): boolean {
  return recipientFor(formType) !== null
}