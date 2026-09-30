import { NextResponse, type NextRequest } from 'next/server'
import { buildCsp } from '@/lib/security/csp'

/**
 * Per-request CSP nonce.
 *
 * Next.js reads the `Content-Security-Policy` **request** header, extracts the
 * nonce, and attaches it to the framework's own `<script>` tags. That is what
 * allows `script-src` to drop `'unsafe-inline'` without breaking hydration.
 *
 * The nonce is generated per request with `crypto.randomUUID`, so it cannot be
 * predicted or reused. It is passed to the request headers (for Next.js) and to
 * the response headers (for the browser); the two must match exactly or the
 * policy will block Next's own scripts.
 */
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCsp({
    nonce,
    isDev: process.env.NODE_ENV === 'development',
    analyticsHost: process.env.NEXT_PUBLIC_ANALYTICS_HOST,
    analyticsProvider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER,
  })

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  // Set on the request so Next can nonce its own scripts.
  requestHeaders.set('content-security-policy', csp)

  const response = NextResponse.next({ request: { headers: requestHeaders } })
  response.headers.set('content-security-policy', csp)
  return response
}

export const config = {
  /*
   * Skip static assets and the Sanity image optimiser path.
   *
   * - `_next/static`  : hashed build output, already nonce-free and
   *                     same-origin; the policy adds nothing but overhead.
   * - `_next/image`   : the optimiser proxies Sanity's CDN, and a strict policy
   *                     on this path breaks image rendering in development.
   * - favicon/manifest: tiny files, no scripts.
   *
   * API routes keep the policy: they still need `frame-ancestors` and
   * `X-Content-Type-Options`, which are set globally in `next.config.ts`.
   *
   * Prefetch requests are deliberately NOT excluded. Skipping them would let a
   * prefetched route load without a policy, which is a small but real hole.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt|sitemap.xml).*)',
  ],
}
