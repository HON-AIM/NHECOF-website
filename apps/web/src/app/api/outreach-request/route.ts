import { outreachRequestSchema } from '@/features/forms/schemas'
import { handleFormSubmission } from '@/lib/forms/submit'

export const dynamic = 'force-dynamic'

/**
 * Outreach request form submission (plan §9.1 / §9.2).
 * Full server-side pipeline lives in `lib/forms/submit.ts`.
 */
export async function POST(request: Request) {
  return handleFormSubmission(request, {
    formType: 'outreach-request',
    schema: outreachRequestSchema,
  })
}