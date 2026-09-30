import { NextResponse } from 'next/server'

/**
 * Liveness endpoint for the uptime monitor (plan §Operations).
 *
 * Deliberately shallow by default. A monitor that hits Sanity on every check
 * would double as a load generator and would report "down" whenever Sanity has a
 * blip — which is not actionable as a *site* alert, and encourages people to
 * disable the monitor.
 *
 * `?deep=1` performs a real content-API round trip and is intended for a
 * separate, less frequent dependency check, not for a 60-second monitor.
 */

export const dynamic = 'force-dynamic'

const startedAt = Date.now()

interface DeepResult {
  ok: boolean
  latencyMs: number
  error?: string
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const deep = searchParams.get('deep') === '1'

  const body: Record<string, unknown> = {
    status: 'ok',
    // Uptime monitors can group alerts by this.
    service: 'nhecof-web',
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    environment: process.env.VERCEL_ENV ?? 'local',
    region: process.env.VERCEL_REGION ?? 'unknown',
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
  }

  if (deep) {
    const sanity = await checkSanity()
    body.sanity = sanity
    if (!sanity.ok) body.status = 'degraded'
  }

  return NextResponse.json(body, {
    // Never cache: a cached 200 is a false positive when the app is down.
    headers: { 'cache-control': 'no-store' },
    status: body.status === 'ok' ? 200 : 503,
  })
}

async function checkSanity(): Promise<DeepResult> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  if (!projectId || !dataset) {
    return { ok: false, latencyMs: 0, error: 'Sanity project/dataset not configured' }
  }

  const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'
  const url =
    `https://${projectId}.api.sanity.io/v${apiVersion}/data/query/${dataset}` +
    `?query=${encodeURIComponent('count(*[_type == "siteSettings"])')}&limit=1`

  const started = Date.now()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)

  try {
    const response = await fetch(url, { signal: controller.signal })
    const latencyMs = Date.now() - started
    if (!response.ok) {
      return { ok: false, latencyMs, error: `Sanity responded ${response.status}` }
    }
    return { ok: true, latencyMs }
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  } finally {
    clearTimeout(timeout)
  }
}
