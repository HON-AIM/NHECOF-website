import Link from 'next/link'
import { isDraftModeEnabled } from '@/lib/sanity/fetch'

/**
 * Persistent banner shown only while draft mode is active.
 *
 * A reviewer looking at an unpublished revision is looking at something that
 * does not exist for the public, and forgetting that is how an unreviewed claim
 * gets screenshotted and shared. The banner names the exit route.
 */
export async function DraftModeBanner() {
  if (!(await isDraftModeEnabled())) return null

  return (
    <div
      data-testid="draft-banner"
      role="status"
      className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-950 dark:bg-amber-950 dark:text-amber-100"
    >
      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-amber-600 align-middle" aria-hidden="true" />
      Draft mode is on &mdash; you are seeing unpublished content that the public cannot access.
      <Link
        href="/api/draft/disable?slug=/"
        prefetch={false}
        className="ml-2 underline underline-offset-2 hover:no-underline"
      >
        Exit preview
      </Link>
    </div>
  )
}
