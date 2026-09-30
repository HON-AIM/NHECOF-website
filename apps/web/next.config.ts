import type { NextConfig } from 'next'
import path from 'path'
import {
  STATIC_REDIRECTS,
  fetchSanityRedirectDocs,
  toNextRedirect,
} from './src/lib/seo/redirects'
import { SECURITY_HEADERS } from './src/lib/security/headers'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, '../../'),
  // `poweredByHeader` leaks the framework and runtime version to anyone who
  // probes a response header, which is free reconnaissance.
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
      },
    ],
    // Negotiate AVIF/WebP and pass every Sanity image through the custom
    // loader so srcsets are width-based and responsive.
    formats: ['image/avif', 'image/webp'],
    loaderFile: './src/lib/sanity/nextImageLoader.ts',
  },
  async headers() {
    return [
      {
        /*
         * Applied to every route, including the HTML documents, the API
         * handlers and the Sanity image optimiser.
         *
         * The nonce-based `content-security-policy` is *not* set here: it is
         * generated per request in `src/middleware.ts`. Adding it here as well
         * would overwrite the nonce with a static policy and break every script.
         */
        source: '/:path*',
        headers: SECURITY_HEADERS,
      },
    ]
  },
  async redirects() {
    const sanityDocs = await fetchSanityRedirectDocs().catch(() => [])
    const sanityRedirects = sanityDocs.map(toNextRedirect)

    const seen = new Set(STATIC_REDIRECTS.map((r) => r.source))
    const merged = [...STATIC_REDIRECTS]
    for (const redirect of sanityRedirects) {
      if (seen.has(redirect.source)) continue
      seen.add(redirect.source)
      merged.push(redirect)
    }

    return merged
  },
}

export default nextConfig