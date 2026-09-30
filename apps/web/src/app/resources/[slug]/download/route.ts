import { NextResponse } from 'next/server'
import { getResourceBySlug } from '@/features/resources/queries'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ slug: string }>
}

/**
 * Resource download entry point.
 *
 * Always server-side: logs an anonymous `resource_downloaded` event, then 302s
 * to the actual file. Because this is a plain redirect it works even when the
 * visitor has JavaScript disabled, and a logging failure never blocks the file.
 */
export async function GET(request: Request, context: RouteContext) {
  const { slug } = await context.params
  const resource = await getResourceBySlug(slug)

  if (!resource?.downloadUrl) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  try {
    console.log(
      `[analytics] resource_downloaded ${JSON.stringify({
        id: resource._id,
        slug: resource.slug,
        type: resource.type,
        language: resource.language,
      })}`,
    )
  } catch {
    // Analytics must never break a download.
  }

  const target = new URL(resource.downloadUrl, request.url).toString()
  return NextResponse.redirect(target, 302)
}