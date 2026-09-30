import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Anonymous search analytics.
 *
 * Accepts **query length and result count only** — never the query text.
 *
 * This endpoint previously logged the raw search string, on the reasoning that
 * it was "anonymous". That was wrong for this site specifically: a nutrition
 * search box invites queries like "sickle cell diet", "my husband has
 * diabetes", or a person's name, and those strings would have been written to
 * Vercel function logs and retained there indefinitely. On a health-education
 * site in a small community, a query string is personal data even with no
 * identifier attached, because it can be identifying in context.
 *
 * Length plus result count answers the only operational question that matters —
 * "is the index failing anyone?" — without retaining what anyone typed.
 *
 * Still not collected: query text, user agent, IP, session id, referrer.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null

    const queryLength =
      typeof body?.queryLength === 'number' && Number.isFinite(body.queryLength)
        ? Math.max(0, Math.min(200, Math.floor(body.queryLength)))
        : null
    const resultCount =
      typeof body?.resultCount === 'number' && Number.isFinite(body.resultCount)
        ? Math.max(0, Math.min(10_000, Math.floor(body.resultCount)))
        : null
    const scope = body?.scope === 'nutrition' || body?.scope === 'foods' || body?.scope === 'articles' || body?.scope === 'all'
      ? body.scope
      : 'all'

    if (queryLength === null) {
      return NextResponse.json({ ok: false, error: 'queryLength is required' }, { status: 400 })
    }

    // Structured, greppable, and contains no free text.
    console.log(
      `[analytics] search scope=${scope} queryLength=${queryLength} resultCount=${resultCount ?? 'unknown'} hadNoResults=${resultCount === 0}`,
    )

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid payload' }, { status: 400 })
  }
}
