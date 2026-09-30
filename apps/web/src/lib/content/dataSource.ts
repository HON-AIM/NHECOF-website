/**
 * Content data-source detection.
 *
 * When no public Sanity configuration is present (e.g. local development
 * before `.env` is set up), the site serves bundled demo content from
 * `lib/content/fixtures.ts` so every page and e2e journey works. When Sanity
 * credentials exist, live content wins and fixtures are never used.
 *
 * NOTE: reads `process.env.NEXT_PUBLIC_*` directly. Do NOT call `getEnv()` /
 * `getPublicEnv()` here — those validate the full public schema and throw when
 * unrelated optional keys are missing.
 */

export function hasSanityConfig(): boolean {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET
  return Boolean(projectId && dataset)
}

/** True when bundled demo content should be served instead of Sanity. */
export function useContentFixtures(): boolean {
  return !hasSanityConfig()
}