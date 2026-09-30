import { draftMode } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  PREVIEW_DENIED_MESSAGE,
  previewSecretMatches,
  safeRedirectPath,
} from '@/lib/sanity/preview'

/**
 * Enable draft mode.
 *
 * Studio's presentation tool links to:
 *   /api/draft/enable?secret=<SANITY_PREVIEW_SECRET>&slug=/nutrition/articles/foo
 *
 * The secret is checked with a constant-time comparison and the redirect target
 * is sanitised, so neither a guessed secret nor a crafted `slug` can be used to
 * escalate access or bounce an editor to another origin.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  const redirectTo = safeRedirectPath(searchParams.get('slug'))

  if (!previewSecretMatches(secret)) {
    // 401 with a plain response so the failure is obvious during testing but
    // does not become a JSON blob inside a browser tab.
    return new NextResponse(PREVIEW_DENIED_MESSAGE, {
      status: 401,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
    })
  }

  const store = await draftMode()
  store.enable()

  return NextResponse.redirect(new URL(redirectTo, request.url), {
    headers: { 'cache-control': 'no-store' },
  })
}
