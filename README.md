# NHECOF Website

Official website for the **NutriHealth Education and Community Outreach Foundation** — a Nigerian nutrition-education and community-outreach NGO.

## Stack

- **Framework:** Next.js 15 (App Router, Server Components by default)
- **Language:** TypeScript (strict)
- **Styling:** Tailwind CSS v4 (CSS-first `@theme` tokens)
- **Content CMS:** Sanity Studio v3+ (in `apps/studio`)
- **Forms:** React Hook Form + Zod
- **Email:** Resend
- **Bot protection:** Cloudflare Turnstile
- **Rate limiting:** Upstash Redis
- **Hosting:** Vercel

## Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [pnpm](https://pnpm.io/) 9+ (install with `npm install -g pnpm`)
- A [Sanity](https://www.sanity.io/) project (create at sanity.io)
- A [Resend](https://resend.com/) API key
- A [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) site key and secret

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url> && cd nhecof-website

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in your Sanity project ID, dataset, API version, etc.

# 4. Start development servers (Next.js + Sanity Studio)
pnpm dev
```

- **Website:** http://localhost:3000
- **Sanity Studio:** http://localhost:3333

## Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start web + studio dev servers in parallel |
| `pnpm build` | Production build of the web app |
| `pnpm typecheck` | Type-check all packages (`tsc --noEmit`) |
| `pnpm lint` | Run ESLint on the web app |
| `pnpm test` | Run Vitest unit tests |
| `pnpm e2e` | Run Playwright end-to-end tests |
| `pnpm typegen` | Regenerate TypeScript types from Sanity schemas |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting without writing |

## Folder Structure

```
nhecof-website/
├── apps/
│   ├── web/                    # Next.js public website
│   │   ├── src/
│   │   │   ├── app/            # Next.js App Router pages and layouts
│   │   │   ├── features/       # Feature modules (queries, components, types)
│   │   │   ├── lib/            # Shared libraries (sanity client, utilities)
│   │   │   ├── sanity/         # TypeGen output (types.ts — do not edit)
│   │   │   └── env.ts          # Zod-validated environment variables
│   │   ├── __tests__/          # Vitest unit tests
│   │   └── e2e/                # Playwright end-to-end tests
│   └── studio/                 # Sanity Studio
│       └── schemaTypes/        # Sanity content schemas
├── .github/                    # CI workflows and Dependabot
├── .env.example                # Environment variable reference
├── package.json                # Root workspace scripts
└── pnpm-workspace.yaml         # pnpm workspace config
```

## Why No `packages/shared-types`?

This project uses **Sanity TypeGen** as the single source of truth for content types. When you create or modify a Sanity schema in `apps/studio/schemaTypes/`, running `pnpm typegen` generates TypeScript types into `apps/web/src/sanity/types.ts`.

This eliminates the need for a separate `shared-types` package that would drift out of sync with the actual content model. The generated types are always authoritative.

## How to Add a Feature

New features follow a **feature-folder convention** inside `apps/web/src/features/`:

```
features/
└── articles/
    ├── components/        # React components for this feature
    │   ├── ArticleCard.tsx
    │   └── ArticleList.tsx
    ├── queries.ts         # GROQ queries for Sanity
    ├── types.ts           # Feature-specific TypeScript types
    └── utils.ts           # Helper functions
```

Each feature folder contains:

| File | Purpose |
|---|---|
| `components/` | UI components specific to this feature |
| `queries.ts` | GROQ query strings and typed query functions |
| `types.ts` | TypeScript interfaces (often imported from `@/sanity/types`) |
| `utils.ts` | Pure helper functions (formatting, calculation, etc.) |

**Rules:**
- Components that are reused across features go in `src/components/common/` instead.
- Queries live in the feature folder, not scattered across components.
- Types from Sanity are imported from `@/sanity/types` (TypeGen output), not duplicated.
- Never hard-code content that an editor should manage in Sanity.

## Environment Variables

See [`.env.example`](.env.example) for the full list. Variables are prefixed:
- `NEXT_PUBLIC_*` — exposed to the browser (Sanity project ID, site URL, Turnstile site key)
- No prefix — server-only (API keys, secrets, recipient emails)

The `src/env.ts` module validates all variables with Zod and provides clear error messages if any are missing.

## Deployment, security and operations

| Document | Purpose |
|---|---|
| [`docs/deployment-and-rollback.md`](docs/deployment-and-rollback.md) | Deploying, rolling back code and content, rotating secrets, backups and restore drills, branch protection, who to contact |
| [`docs/launch-checklist.md`](docs/launch-checklist.md) | Every §20 definition-of-done item with a tick box and a required evidence link |
| [`docs/dns-and-email-checklist.md`](docs/dns-and-email-checklist.md) | Nameservers, apex/www, HTTPS, HSTS, Turnstile, Resend SPF/DKIM/DMARC, Gmail and Outlook delivery tests, CORS |
| [`docs/studio-guide.md`](docs/studio-guide.md) | Editorial walkthrough for non-technical content managers |
| [`security/audit-exceptions.json`](security/audit-exceptions.json) | Reviewed, time-boxed dependency-audit exceptions |

### Branch protection (required — CI is only useful if it can block a merge)

CI runs three jobs: `Secret scan`, `Dependency audit` and
`Typecheck, Lint, Test, Build`. Configure these on `main` in
**Settings → Branches → Branch protection rules**:

- Require a pull request before merging.
- Require at least **one approving review**.
- Require status checks to pass. Required checks — enable all three, and do
  not accept a job that is "expected" but not required:
  - `Secret scan`
  - `Dependency audit`
  - `Typecheck, Lint, Test, Build`
- Require branches to be up to date before merging.
- **Do not allow force-pushes** and do not allow branch deletion.
- Restrict who can push to `main` directly; the audit gate is only meaningful
  if it cannot be bypassed.

### Dependency auditing

```bash
pnpm check:audit
```

The gate is stricter about `apps/web` (the deployed server) than about
`apps/studio` (a static bundle whose `node_modules` are never shipped). Any
high or critical advisory in `apps/web` fails the build with no exceptions
permitted. Studio advisories must be individually reviewed and listed in
`security/audit-exceptions.json` with an owner, a rationale and a `reviewBy`
date. **The gate fails once a `reviewBy` date passes**, which is deliberate:
exceptions that never expire stop being reviewed decisions and become
permanent, unnoticed risk.

`pnpm-workspace.yaml` also pins `postcss` to `^8.5.10` to clear a high-severity
advisory inherited from Next.js. Remove that override once Next ships a
release depending on a patched version.

### Local verification before any deploy

```bash
SKIP_PLACEHOLDER_CHECK=false pnpm typecheck
pnpm lint
pnpm test
SKIP_PLACEHOLDER_CHECK=false pnpm build
pnpm check:bundle
pnpm check:audit
```

`SKIP_PLACEHOLDER_CHECK=true` is for local iteration only. The 13 known
editorial placeholders are documented in `docs/launch-content-tracker.md`; they
must be replaced before launch, and the launch checklist treats them as
blocking.

## Sanity Studio

The Studio is organised by editorial responsibility:

- **Content** — articles, food profiles, quotes, pages
- **Nutrition Hub** — categories and resources
- **Outreach & Impact** — outreaches, metrics, milestones, events
- **People** — team, volunteers, partners
- **Site** — settings, homepage, redirects
- **Content Due for Review** — items with `nextReviewAt` within 30 days

### Health Content Gate

Articles and food profiles require `reviewStatus: "approved"` before they
appear on the public site — the site's GROQ queries filter on it, so an
unapproved document is not published even if it is saved as published in
Studio.

**Known limitation:** the custom `Publish (blocked)` document action shows a
warning message but does **not** actually remove Sanity's own Publish action.
The content gate is enforced by the queries, not by the Studio UI. The
`warningWords` list in `apps/studio/validation/warningWords.ts` is also not
wired into validation. Both are tracked in `docs/launch-checklist.md` (E6).

### Preview and revalidation

- Draft mode is enabled via `/api/draft/enable?secret=…&slug=…`, requires
  `SANITY_PREVIEW_SECRET`, and is not configured in production.
- Sanity publishes trigger `/api/revalidate` through an HMAC-signed webhook,
  which revalidates by cache tag. See `docs/deployment-and-rollback.md`.
- Draft reads bypass the Next.js Data Cache explicitly, because
  `unstable_cache` is **not** bypassed by draft mode.

### V1 Deviations from Implementation Plan

| Plan Section | Deviation | Rationale |
|---|---|---|
| Document type `tag` | Merged into `category` with a `kind` field (`topic` or `tag`) | Reduces document types while preserving granularity |
| Document type `testimonial` | Folded into `outreach.testimonials` and `impactMilestone.testimonial` as consent-controlled objects | Testimonials are always tied to an outreach or milestone; embedding with consent fields simplifies the workflow |

### TypeGen

Run `pnpm typegen` to regenerate `apps/web/src/sanity/types.ts` from the Studio schemas. This is the single shared type source for the web app.

### Seed Script

Run `pnpm seed` to insert clearly labelled SAMPLE content into the `development` dataset. This script **refuses to run** against `production`.

## License

Private — NutriHealth Education and Community Outreach Foundation.
