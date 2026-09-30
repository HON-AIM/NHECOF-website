# Deployment and rollback

Operational runbook for the NHECOF website. It covers deploying, undoing a bad
release, undoing bad content, and rotating a leaked secret.

Read this before your first production deploy. It assumes you have access to
the Vercel project, the Sanity project, and the Resend account listed under
[Who to contact](#who-to-contact).

---

## 1. What deploys what

There are three deployables. They are separate on purpose: a content typo must
never require a code release, and a code release must never require a content
migration.

| Component | Deployed by | Frequency | Rollback |
|---|---|---|---|
| `apps/web` (public site) | Vercel, from `main` | On merge to `main` | Vercel instant rollback (promote a previous build) |
| `apps/studio` (content admin) | `pnpm --filter studio deploy` (Sanity hosting) | Rarely, only when schemas change | Redeploy the previous Studio build |
| Sanity content | Editors, in Studio | Continuously | Sanity document history, per document |

**Content is not in git.** A `git revert` cannot undo a wrong article. Section
4 covers that case, and it is the most common real incident.

### Repository layout on Vercel

- Root directory: `apps/web`
- Framework preset: Next.js
- Build command: `pnpm build` (repo default; do not override)
- Install command: `pnpm install --frozen-lockfile`

Vercel must be told the root directory is `apps/web`, or it will try to build
the pnpm workspace root and fail on `pnpm-workspace.yaml`.

---

## 2. Environments

Three environments, three purposes. They are not interchangeable.

| | Local | Preview (Vercel) | Production (Vercel) |
|---|---|---|---|
| Sanity dataset | `development` | `development` | `production` |
| Indexable by search engines | No | **Always no** | Only when `NEXT_PUBLIC_IS_LIVE=true` |
| Custom domain | none | `*.vercel.app` | apex + `www` |
| Who can see drafts | developer | invited editors, via secret URL | nobody |

**Preview must never be indexed.** It is enforced in code, not by discipline:
`apps/web/src/lib/seo/robots.ts` returns a blanket `Disallow: /` whenever
`VERCEL_ENV` is anything other than `production`, or when `DISABLE_INDEXING` is
set. A `noindex` alone is not enough — a blocked crawl is required, because
`noindex` is only honoured if the page is successfully crawled.

**Production stays `noindex` until the launch gate opens.** `NEXT_PUBLIC_IS_LIVE`
is the single switch. Do not set it during a routine deploy; see section 6.

### Environment variable matrix

Set these per environment in Vercel. Never reuse a value across environments.

| Variable | Local | Preview | Production |
|---|---|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | dev project | dev project | prod project |
| `NEXT_PUBLIC_SANITY_DATASET` | `development` | `development` | `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | pinned date | pinned date | pinned date |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | preview URL | `https://<apex>` |
| `NEXT_PUBLIC_IS_LIVE` | `false` | `false` | `false` until launch |
| `DISABLE_INDEXING` | `true` | `true` | `true` until launch |
| `SANITY_API_READ_TOKEN` | dev read token | dev read token | **prod** read token |
| `SANITY_REVALIDATE_SECRET` | local value | random per env | random per env |
| `SANITY_PREVIEW_SECRET` | unset | random per env | unset (production serves no drafts) |
| `RESEND_API_KEY` | test key | test key | live key |
| `CONTACT_RECIPIENT_EMAIL` | — | real inbox | real inbox |
| `OUTREACH_RECIPIENT_EMAIL` | — | real inbox | real inbox |
| `PARTNERSHIP_RECIPIENT_EMAIL` | — | real inbox | real inbox |
| `TURNSTILE_SECRET_KEY` | test keys | test keys | live site+secret pair |
| `VITE_TURNSTILE_SITE_KEY` / `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | test | test | live site key |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | — | — | live (rate limiting) |
| `NEXT_PUBLIC_ANALYTICS_PROVIDER` | `none` | `none` | `cloudflare` |
| `NEXT_PUBLIC_ANALYTICS_HOST` | — | — | provider host, if not Cloudflare |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | — | — | live DSN (optional) |

Two rules that are easy to get wrong:

1. **`SANITY_API_READ_TOKEN` must be read-only.** A Viewer/Reader role is
   enough. A token with write access turns a leaked secret into a defacement
   risk. The token is only ever used server-side for draft mode.
2. **`SANITY_PREVIEW_SECRET` should be unset in production.** Production is
   indexed and shared publicly; leaving draft mode enabled there means draft
   content can be reached by anyone who obtains the secret, and search engines
   can see a `noindex` page. If you need to review drafts, use Preview.

---

## 3. Deploying

### Automatic (normal path)

1. Merge to `main`.
2. CI runs: secret scan, dependency audit gate, typecheck, lint, test, build.
3. Vercel builds and deploys. Production is live in a few minutes.

If any CI job fails, the merge should not have been possible — see section 7 on
branch protection.

### Manual (schema change, or a failed automatic deploy)

```bash
# 1. Confirm the working tree is clean and on main.
git status --short
git pull --ff-only origin main

# 2. Install exactly what CI installed.
pnpm install --frozen-lockfile

# 3. Run the full gate locally before touching anything.
SKIP_PLACEHOLDER_CHECK=false pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm check:audit

# 4. Deploy Studio FIRST if schemas changed. The site reads the new schema;
#    a site deploy before the Studio would render against a schema that does
#    not exist yet.
pnpm --filter studio run deploy

# 5. Deploy the site.
vercel --prod          # or use the Vercel dashboard
```

**Order matters.** Studio before site when schemas change. Site before nothing
else, because the site tolerates a missing field but a Studio that offers a
field the site cannot render will tempt an editor to publish something broken.

### Verifying a deploy

Run these against the deployed URL, not localhost.

```bash
BASE=https://<your-deployment-url>

# Security headers present?
curl -sSI "$BASE" | grep -iE 'strict-transport|content-security|x-frame|x-content-type|referrer-policy|permissions-policy'

# robots.txt correct for this environment?
curl -sS "$BASE/robots.txt"

# Health endpoint
curl -sS "$BASE/api/health"

# Webhook rejects an unsigned request (must be 401)
curl -sS -o /dev/null -w '%{http_code}\n' -X POST "$BASE/api/revalidate" -d '{}'
```

---

## 4. Rolling back

### 4a. A bad code release

Symptoms: 500s, a broken page, a regression you can reproduce.

1. **Decide quickly.** Vercel keeps every build. Rolling back is safe and
   instant. Investigating on production while visitors see a broken site is not.
2. Vercel dashboard → Deployments → find the last known-good build →
   **Promote to Production**.
3. Confirm: `curl -sSI $BASE` returns 200 and the affected route renders.
4. Then investigate at leisure on a branch.

```bash
# Or from the CLI, promoting a specific deployment:
vercel promote <deployment-url> --prod
```

**Do not `git revert` as your first move.** A revert needs a CI run, a merge
and a fresh build — minutes during an incident. Promotion is seconds. Fix the
branch afterwards so the bad commit does not ship again.

### 4b. Bad content

Symptoms: a wrong article, a broken image, a false claim, an embarrassing typo.
This is the common case, and it is **not** a deploy problem.

1. Open the document in Sanity Studio.
2. **Document history → the previous revision → Restore.**

Every publish creates a revision, so this is safe and immediate. The restored
version is a new publish, which fires the webhook, which revalidates the cache —
so the fix reaches the live site within about 30 seconds without a redeploy.

3. Verify on the live URL.

If the *document itself* should never have existed, unpublish rather than
delete: an unpublished document can be restored, a deleted one cannot.

### 4c. A broken Sanity webhook (site content is stale)

Symptoms: an editor published, but the live site did not change.

```bash
# 1. Is the endpoint healthy?
curl -sS -o /dev/null -w '%{http_code}\n' -X POST "$BASE/api/revalidate" -d '{}'
#    401 = healthy (rejecting an unsigned request, as designed)

# 2. Is the signature secret still set in Vercel?
#    Check the production env; do not print the value.

# 3. Check Vercel logs for the webhook route.
```

If the webhook is misconfigured, force a rebuild rather than waiting for a
timeout: redeploying rebuilds every page and clears the stale cache.

Check the Sanity webhook's own delivery log in sanity.io/manage — it shows the
request and the response status, which distinguishes "Sanity never called" from
"we rejected it" from "we accepted it and the page is still stale".

### 4d. Leaked secret

Any credential suspected of leaking: treat as compromised, not as a suspicion.

| Secret | Where to rotate | What else must change |
|---|---|---|
| `SANITY_API_READ_TOKEN` | Sanity → API tokens | Nothing; read-only |
| Sanity webhook secret | Sanity webhook config **and** Vercel env | Order matters — see below |
| `SANITY_PREVIEW_SECRET` | Vercel env | Share the new URL with editors |
| `RESEND_API_KEY` | Resend → API keys | Verify the sending domain again |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile | Update the site key to match |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash console | — |
| `SENTRY_DSN` | Sentry → Projects | — |
| Vercel deploy/management token | Vercel → Settings → Tokens | — |

**Webhook secret rotation order.** Changing one side first means every publish
fails to revalidate until you finish. Change the Vercel variable *and* the
Sanity webhook in the same maintenance window, then confirm with a test publish.
If you must do them separately, do Vercel first — a mismatched secret fails
closed (401), so the site keeps serving correct cached content rather than
exposing anything.

Full sequence:

1. Rotate in the provider.
2. Update Vercel production env.
3. Redeploy (env changes require a redeploy to take effect).
4. Confirm the new value works with a test.
5. Confirm the old value no longer works.
6. Record what happened and when in the incident log.

---

## 5. Backups and restore

Sanity content is backed up weekly by `.github/workflows/sanity-dataset-backup.yml`
to a private, versioned S3-compatible bucket, with 84-day retention.

```bash
# List available backups
aws s3 ls s3://$BUCKET/$PREFIX/production/ --recursive

# Download one
aws s3 cp s3://$BUCKET/$PREFIX/production/<timestamp>/production.tar.gz ./restore/

# Inspect before importing
tar -tzf restore/production.tar.gz | head -50
```

### Restore drill

Run this **quarterly**, and after any incident that involves data loss. A backup
nobody has ever restored is a hypothesis, not a backup.

1. Create a **throwaway** Sanity dataset. Never drill into production.
2. Import the backup:

   ```bash
   npx sanity dataset import ./restore/production.tar.gz drill-dataset
   ```

3. Verify in Studio: article count, food profiles, outreach records, the daily
   quotes, and at least one article's Portable Text body renders correctly.
4. Point a Preview deployment at `drill-dataset` and check the pages render.
5. Delete the drill dataset.

Record the date, who ran it, which backup was used, and what you found. A drill
that finds a problem is a success; a drill never run is the failure.

---

## 6. Launching (opening indexing)

Not part of a normal deploy. Do it deliberately, as its own step.

1. Complete `docs/launch-checklist.md` and confirm every item is ticked.
2. Confirm the production dataset is the one you want indexed.
3. In Vercel production env, set `NEXT_PUBLIC_IS_LIVE=true` and
   `DISABLE_INDEXING=false`.
4. Redeploy.
5. Verify: `curl -sS $BASE/robots.txt` now allows crawling.
6. Submit `https://<apex>/sitemap.xml` to Google Search Console and Bing
   Webmaster Tools.

**To reverse** — if the site is not ready after all — set
`NEXT_PUBLIC_IS_LIVE=false` and `DISABLE_INDEXING=true` and redeploy. This
blocks crawlers immediately. It does not remove pages that are already indexed;
that takes days to weeks and is a separate problem, which is the reason to
confirm readiness before flipping the switch rather than after.

---

## 7. Branch protection

CI is only as good as its ability to block a bad merge. Configure on the
repository (Settings → Branches → Branch protection rules) for `main`:

- Require a pull request before merging.
- Require at least one approving review.
- Require status checks to pass. Required checks:
  - `Secret scan`
  - `Dependency audit`
  - `Typecheck, Lint, Test, Build`
- Require branches to be up to date before merging.
- Do not allow force-pushes.
- Do not allow deletions.

Also: protect the `main` branch from bypass, and keep a small number of people
able to push to `main` directly. The audit gate is only meaningful if it cannot
be skipped.

---

## 8. Routine operations

| Task | Cadence | Where |
|---|---|---|
| Content review reminders | Weekly, Monday | `.github/workflows/review-reminders.yml` |
| Sanity dataset backup | Weekly, Sunday 02:00 UTC | `.github/workflows/sanity-dataset-backup.yml` |
| Dependency updates | Weekly (Dependabot) | `.github/dependabot.yml` |
| Review audit exceptions | Quarterly | `security/audit-exceptions.json` |
| Restore drill | Quarterly | Section 5 |
| Re-check content review dates | Quarterly | Studio → review queue |
| Incident log | As needed | Keep with this document |

The audit exception list is deliberately time-boxed. Each exception carries a
`reviewBy` date, and `scripts/audit-gate.mjs` fails the build once that date
passes. This is intentional: exceptions that never expire stop being reviewed
decisions and become permanent, unnoticed risk.

---

## 9. Verifying locally

Run these from a clean shell. The unit suite deliberately runs with **no**
environment variables set, which is what CI does at `.github/workflows/ci.yml`
(the `Test` step has no `env:` block). Unit tests that read Sanity or provider
configuration will fail if you export those variables in your shell first, so
start from a clean environment.

The E2E suite needs the opposite: it runs against bundled fixtures and its
simulated email/bot-protection paths, which are selected by the **absence** of
credentials.

```bash
cd apps/web

# Unit tests — clean environment, matches CI.
pnpm test

# E2E — unset every credential so fixtures and simulation engage.
unset NEXT_PUBLIC_SANITY_PROJECT_ID NEXT_PUBLIC_SANITY_DATASET \
      NEXT_PUBLIC_TURNSTILE_SITE_KEY RESEND_API_KEY TURNSTILE_SECRET_KEY \
      UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN
rm -rf .next/cache
CI=1 SKIP_PLACEHOLDER_CHECK=true \
NEXT_PUBLIC_SANITY_API_VERSION=2024-01-01 \
NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
SANITY_API_READ_TOKEN=test SANITY_REVALIDATE_SECRET=test \
CONTACT_RECIPIENT_EMAIL=test@example.com \
OUTREACH_RECIPIENT_EMAIL=test@example.com \
PARTNERSHIP_RECIPIENT_EMAIL=test@example.com \
  pnpm exec playwright test
```

Two traps worth knowing, both of which have produced convincing false failures:

- `NEXT_PUBLIC_SANITY_PROJECT_ID=test` is **not** a way to disable Sanity. Any
  non-empty value is truthy, so the app switches from fixtures to live queries
  and every content test fails. Unset the variable instead.
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY=test` is also truthy, which loads the real
  Turnstile widget instead of the stub, so form journeys fail on a network
  call. `RESEND_API_KEY` must be unset for the same reason: the form routes log
  the would-be emails instead of sending them.
- Clearing `.next/cache` matters when switching to and from fixture mode. The
  Data Cache persists empty results across configuration changes, so a stale
  cache looks exactly like a content regression.

`RESEND_API_KEY` and `TURNSTILE_SECRET_KEY` are required in production but
optional outside it, because the simulated paths are selected by their absence.
Both Vercel Preview and Production run as `production`, so a deploy missing
either still fails fast rather than silently sending no mail.

### Degraded behaviour worth knowing before an incident

If Upstash Redis is unreachable, the form rate limiter logs a single warning and
falls back to an in-process window. It does **not** return a 500, and it does
**not** fail closed. That is deliberate: these forms are NHECOF's main contact
channel, so an Upstash outage must not discard a real school's outreach request.
Turnstile still gates bots independently, so the cost of an outage is weaker
spam protection rather than lost enquiries. If you see
`[rate-limit] Upstash unavailable...` in the logs, treat the form as working but
under-strength rate limiting until Redis recovers.

---

## Who to contact

Fill this in before the first production deploy. An unowned incident is an
incident that runs long.

| Role | Who | Contact | Notes |
|---|---|---|---|
| Site technical maintainer | _TBC_ | _TBC_ | Owns Vercel, repo, CI, this doc |
| Vercel account owner | _TBC_ | _TBC_ | Billing, project access |
| Sanity project owner | _TBC_ | _TBC_ | Datasets, CORS, tokens, webhooks |
| Resend account owner | _TBC_ | _TBC_ | Domain verification, sending |
| Cloudflare account owner | _TBC_ | _TBC_ | DNS, Turnstile, Web Analytics |
| Backup storage owner | _TBC_ | _TBC_ | The bucket the backups land in |
| NHECOF director / decision maker | _TBC_ | _TBC_ | Content corrections, launch go/no-go |

Escalation order: technical maintainer → account owner → director. For anything
involving a clinical claim, an incorrect health statement or a beneficiary's
privacy, go straight to the director and correct the content before
investigating the cause.
