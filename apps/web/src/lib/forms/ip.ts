import { createHash } from 'node:crypto'

/**
 * Best-effort client IP from request headers (reverse proxies / CDNs).
 * Never trusts a single header blindly; Windows/Node path is safe.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  const cfIp = request.headers.get('cf-connecting-ip')
  if (cfIp) return cfIp.trim()
  return 'unknown'
}

/** SHA-256 digest of the client IP, used as the rate-limit key (no raw IPs). */
export function hashIp(ip: string): string {
  return createHash('sha256').update(ip).digest('hex').slice(0, 32)
}