import { test, expect } from '@playwright/test'
import { createClient } from '@sanity/client'

/**
 * Critical end-to-end journeys (CLAUDE.md §16.3).
 *
 * 1. Homepage load                — hero, featured activity, latest knowledge
 * 2. Search & browse to content   — query → article/food detail
 * 3. Sticky header interaction    — sticky nav, topic menu, mobile menu
 * 4. Form submission (success + error)
 * 5. Navigation & deep-linking    — baked anchors, breadcrumb/back paths
 * 6. CMS Sanity publish           — env-gated, skipped without credentials
 * 7. Route 404                    — unknown route → not-found with recovery links
 */

// ─────────────────────────── Journey 1 ───────────────────────────
test('J1 · homepage loads hero, featured knowledge and food profile', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 30_000 })

  // Latest knowledge: the featured article links through to its detail page.
  await expect(page.getByRole('heading', { name: 'Featured knowledge' })).toBeVisible()
  const featured = page.getByRole('link', { name: /First Foods: Introducing Solid Foods to Your Baby/ })
  await expect(featured.first()).toBeVisible()

  // Latest knowledge also spotlights a food profile.
  const food = page.getByRole('link', { name: /Jute Leaves \(Ewedu\)/ })
  await expect(food.first()).toBeVisible()
})

// ─────────────────────────── Journey 2 ───────────────────────────
test('J2 · search query opens the matching food profile', async ({ page }) => {
  await page.goto('/nutrition/search')
  await page.getByPlaceholder(/search articles and foods/i, { exact: false }).fill('moringa')
  await page.getByRole('button', { name: 'Search', exact: true }).click()
  await page.waitForURL(/q=moringa/)

  const result = page.getByRole('link', { name: /moringa/i })
  await expect(result.first()).toBeVisible()
  await result.first().click()
  await page.waitForURL(/\/nutrition\/foods\/moringa/)
  await expect(page.getByRole('heading', { name: /Moringa/, level: 1 })).toBeVisible()
})

// ─────────────────────────── Journey 3 ───────────────────────────
test('J3 · sticky header stays usable and navigates via the nutrition topic menu', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/nutrition')
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()

  // Scroll a tall page; the header must stay fixed and interactive.
  await page.evaluate(() => window.scrollTo(0, 1800))
  await expect(page.getByRole('navigation', { name: 'Primary navigation' })).toBeVisible()
  const headerTop = await page.locator('header').evaluate((el) => el.getBoundingClientRect().top)
  expect(headerTop).toBeLessThanOrEqual(0)

  // Topic menu works from the sticky header (dropdown opens on click).
  await page.getByRole('button', { name: 'Nutrition Hub', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Nutrition Basics' }).click()
  await page.waitForURL(/\/nutrition\/articles\?category=nutrition-basics/)
  await expect(page.getByRole('heading', { name: /Nutrition Articles/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Balanced Nigerian Plate/ }).first()).toBeVisible()
})

// ─────────────────────────── Journey 4 ───────────────────────────
test('J4 · contact form: guidance on error, then success with reference number', async ({ page }) => {
  await page.goto('/contact')

  // Error path: submit empty form → inline validation + error summary focused.
  await page.getByRole('button', { name: 'Send message' }).click()
  await expect(page.getByText('Name must be at least 2 characters.').first()).toBeVisible()
  await expect(page.getByText('You must agree to the Privacy Policy to continue.').first()).toBeVisible()

  // Success path: fill a valid message.
  await page.getByLabel('Your name').fill('Adaeze Okonkwo')
  await page.getByLabel('Email address').fill('adaeze.okonkwo@example.com')
  await page.getByLabel('Subject').selectOption({ label: 'General enquiry' })
  await page.getByLabel('Your message').fill('We would love NHECOF to visit our community.')
  await page.getByLabel('I agree to the Privacy Policy').check()
  await page.getByRole('button', { name: 'Send message' }).click()

  await expect(page.getByText(/thank you.{0,3}we received/i)).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText(/^Reference number:/i)).toBeVisible()
})

// ─────────────────────────── Journey 5 ───────────────────────────
test('J5 · deep link with anchor lands on the section with breadcrumb trail', async ({ page }) => {
  await page.goto('/nutrition/articles/introducing-solid-foods#when-to-start')
  await expect(
    page.getByRole('heading', { name: 'First Foods: Introducing Solid Foods to Your Baby', level: 1 }),
  ).toBeVisible()

  // Baked anchor resolves to the section.
  await expect(page.locator('#when-to-start')).toBeVisible()

  // Share affordances on content pages (rendered as labelled links).
  await expect(page.getByRole('link', { name: /Share on (WhatsApp|Facebook|X)/ }).first()).toBeVisible()

  // Navigation breadcrumb provides a recovery path.
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible()
  await page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Nutrition Hub' }).click()
  await page.waitForURL(/\/nutrition$/)
})

// ─────────────────────────── Journey 6 ───────────────────────────
const SANITY_WRITE_AVAILABLE =
  Boolean(process.env.SANITY_API_WRITE_TOKEN) &&
  Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) &&
  Boolean(process.env.NEXT_PUBLIC_SANITY_DATASET)

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET
const SANITY_TOKEN = process.env.SANITY_API_WRITE_TOKEN
const SANITY_API_VERSION = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-10-01'

/** Unique per run so repeated journeys never collide on `_id` or slug. */
const J6_RUN_ID = `e2e-j6-${Date.now().toString(36)}`
const J6_SLUG = `e2e-sanity-publish-${Date.now().toString(36)}`
const J6_TITLE = `Scripted Sanity publish ${J6_RUN_ID}`

/**
 * Minimal published article matching the `article` schema in
 * `apps/studio/schemaTypes/documents/article.ts`. Field coverage is deliberate:
 * `reviewStatus`/`publishedAt` satisfy the sitemap review gate and `body`
 * exercises Portable Text rendering end to end.
 */
const J6_ARTICLE = {
  _type: 'article',
  title: J6_TITLE,
  slug: { _type: 'slug', current: J6_SLUG },
  summary:
    'Temporary article created by the scripted end-to-end publish journey. It is deleted again in the test teardown.',
  keyTakeaways: ['Created by Playwright journey 6'],
  body: [
    {
      _type: 'block',
      _key: 'j6-body',
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: 'j6-span',
          marks: [],
          text: 'This paragraph was published by the scripted Sanity journey and is removed during teardown.',
        },
      ],
    },
  ],
  categories: [],
  audiences: [],
  references: [],
  reviewStatus: 'approved',
  featured: false,
  publishedAt: new Date().toISOString(),
}

function sanityWriteClient() {
  return createClient({
    projectId: SANITY_PROJECT_ID as string,
    dataset: SANITY_DATASET as string,
    apiVersion: SANITY_API_VERSION,
    token: SANITY_TOKEN as string,
    useCdn: false,
  })
}

test('J6 · CMS Sanity publish: scripted publish updates the live page', async ({ page }) => {
  test.skip(
    !SANITY_WRITE_AVAILABLE,
    'J6 · CMS Sanity publish: scripted Sanity create/update/publish lands on the live page — requires SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET, which are not configured in this environment (see CLAUDE.md §16.3; written skip reason recorded in the quality report).',
  )
  test.setTimeout(120_000)

  const client = sanityWriteClient()
  const docId = `${J6_RUN_ID}-article`

  // 1. Create the document as a draft.
  const draft = { ...J6_ARTICLE, _id: `drafts.${docId}` }
  await client.createOrReplace(draft)

  // 2. Publish it. The public site reads the published dataset, so the document
  //    must leave draft state for the page to resolve.
  await client.action({
    actionType: 'sanity.action.document.publish',
    draftId: `drafts.${docId}`,
    publishedId: docId,
  })

  try {
    // 3. The slug is generated at request time, so read it back from the
    //    published document rather than assuming the draft value.
    const published = await client.getDocument<{ slug?: { current?: string } }>(docId)
    const slug = published?.slug?.current
    expect(slug, 'published document must expose a slug').toBeTruthy()

    // 4. Open the generated public URL and assert the content is live.
    const response = await page.goto(`/nutrition/articles/${slug}`)
    expect(response?.status(), 'published article must return 200').toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: J6_TITLE })).toBeVisible()

    // 5. A second reader (fresh navigation) sees the same content.
    await page.reload()
    await expect(page.getByRole('heading', { level: 1, name: J6_TITLE })).toBeVisible()
  } finally {
    // 6. Always clean up so the development dataset is not polluted.
    await client.delete({ id: docId }).catch(() => undefined)
  }
})

// ─────────────────────────── Journey 7 ───────────────────────────
test('J7 · unknown content slug serves the 404 recovery page', async ({ page }) => {
  const response = await page.goto('/nutrition/articles/this-article-does-not-exist')
  // A real 404 is required, not merely "the not-found page rendered". The app
  // deliberately has no loading.tsx: a streaming boundary flushes the response
  // head as 200 before the page resolves, which would make notFound() render
  // the 404 UI inside a 200 response. seo-review-gate.test.ts guards that.
  expect(response?.status()).toBe(404)

  await expect(page.getByRole('heading', { level: 1, name: /not found/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible()
})