import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'
import { safeRedirectPath } from '@/lib/sanity/preview'

/**
 * Leave draft mode.
 *
 * Always allowed, with no secret required. The endpoint only clears a cookie
 * that the enable route set, so there is nothing to escalate — and an editor who
 * walks away from a shared machine must be able to exit without a credential.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const redirectTo = safeRedirectPath(searchParams.get('slug'))

  const store = await draftMode()
  store.disable()

  return NextResponse.redirect(new URL(redirectTo, request.url), {
    headers: { 'cache-control': 'no-store' },
  })
}
