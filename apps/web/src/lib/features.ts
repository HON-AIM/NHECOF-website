/**
 * Feature flag helpers.
 *
 * Flags are read from `NEXT_PUBLIC_*` at build/request time and are safe to
 * call from both server components and client components.
 */

export function programmeDetailRoutesEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_PROGRAMME_DETAILS === 'true'
}