# Quality Report

_Generated Mon, 28 Sep 2026 15:38:15 GMT by `scripts/generate-quality-report.mjs`_

**Regression gate: PASS**

## Gates

| Gate | Result | Note |
| --- | --- | --- |
| unit tests | PASS | 215 passed · 0 failed · 1 skipped |
| e2e (Playwright) | PASS | 7 passed · 1 skipped · 0 failed (8 total) |
| axe (all routes, 360+1280px) | PASS | 0 violations across 19 route templates × 2 viewports |
| WCAG 2.2 target size (2.5.8) | PASS | 18/20 measured ≥ 24px · 0 below minimum · 0 unresolved · 2 not applicable |
| JS bundle budgets | PASS | 33 routes checked · content ≤ 117.1875 KiB gzip |
| lighthouse | PASS | mobile (Slow 4G) · 6 routes · a11y ≥ 100% · median of 3 runs |
| contrast tokens | PASS | ✅ All 45 colour pairs pass WCAG AA contrast requirements. |
| placeholder scan | FAIL | 13 placeholders pending editorial sign-off — documented acceptance gap (plan Phase 9) |
| client secrets scan | PASS | ✅ No server-only secrets found in the client bundle. Safe for production. |

## Metrics

| Metric | Value |
| --- | --- |
| unit passed | 215 |
| unit failed | 0 |
| unit skipped | 1 |
| e2e total | 8 |
| e2e passed | 7 |
| e2e skipped | 1 |
| e2e failed | 0 |
| target size measured | 18 |
| target size below 24px | 0 |
| bundled routes | 33 |
| lighthouse routes | 6 |

## Largest routes (first-load JS, gzip)

| Route | Kind | KiB |
| --- | --- | --- |
| `/request-an-outreach` | other | 141.1 |
| `/contact` | other | 139.8 |
| `/partner` | other | 139.4 |
| `/layout` | other | 132.7 |
| `/` | other | 113.3 |
| `/nutrition/articles/[slug]` | content | 110.7 |
| `/about` | other | 110.1 |
| `/get-involved` | other | 110.1 |

## Lighthouse (mobile, Slow 4G)

Each route is audited **3 times** and scored on the **median**. Lighthouse scores carry a documented margin of error of about +/-5, so a single sample against a hard threshold is a flaky gate; the full spread is kept below so the noise stays visible rather than hidden.

| Route | Performance | Accessibility | SEO | Best-practices | Perf spread | Status |
| --- | --- | --- | --- | --- | --- | --- |
| home | 94 | 100 | 100 | 100 | 94–95 | PASS |
| contact | 94 | 100 | 100 | 100 | 94–95 | PASS |
| nutrition-hub | 95 | 100 | 100 | 100 | 93–95 | PASS |
| article | 94 | 100 | 100 | 100 | 94–95 | PASS |
| outreach | 92 | 100 | 100 | 100 | 92–94 | PASS |
| resources | 93 | 100 | 100 | 100 | 85–93 | PASS |

## axe violations

None across all routes at 360px and 1280px.

## WCAG 2.2 Target Size (Minimum) — 2.5.8

Measured in a real browser by `e2e/target-size.spec.ts`; minimum 24px. Prose links are exempt and are not measured.

| # | Control | Route | Hit area (px) | Status |
| --- | --- | --- | --- | --- |
| t-01 | Primary / secondary buttons | `/request-an-outreach` | 96×38 | **PASS** |
| t-02 | Ghost / text buttons | `/nutrition` | 112×34 | **PASS** |
| t-03 | Icon-only buttons (share, copy, close) | `/nutrition/articles/introducing-solid-foods` | 138×42 | **PASS** |
| t-04 | Top-bar nav links | `/` | 110×35 | **PASS** |
| t-05 | Nutrition Hub dropdown trigger | `/` | 112×34 | **PASS** |
| t-06 | Dropdown menu items | `/` | 287×43 | **PASS** |
| t-07 | Mobile hamburger trigger | `/` | 43×43 | **PASS** |
| t-08 | Search open toggle | `/` | 138×42 | **PASS** |
| t-09 | Search input | `/` | 438×60 | **PASS** |
| t-10 | Search result items | `/` | 527×95 | **PASS** |
| t-11 | Text input fields | `/contact` | 276×49 | **PASS** |
| t-12 | Textarea fields | `/contact` | 578×151 | **PASS** |
| t-13 | Select fields | `/contact` | 578×45 | **PASS** |
| t-14 | Checkboxes / radio groups | `/contact` | 26×26 | **PASS** |
| t-15 | Breadcrumb links | `/nutrition/articles/introducing-solid-foods` | 41×26 | **PASS** |
| t-16 | Footer links | `/` | 90×25 | **PASS** |
| t-17 | Card links | `/nutrition/foods` | 176×414 | **PASS** |
| t-18 | Tabs | `/styleguide` | — | **N/A** — Tabs is implemented (components/ui/Tabs.tsx) but is not used by any page at launch, so no rendered instance exists to measure. |
| t-19 | Pagination controls | `/nutrition/articles` | — | **N/A** — Pagination is rendered only when the archive spans more than one page; the published content volume is a single page at launch. |
| t-20 | Skip-to-content link | `/` | 170×54 | **PASS** |

## Skipped tests & written reasons

_Playwright: 1 skipped · Vitest: 1 skipped._

| Suite | Test | Written reason |
| --- | --- | --- |
| `critical-journeys.spec.ts` | J6 · CMS Sanity publish: scripted publish updates the live page | J6 · CMS Sanity publish: scripted Sanity create/update/publish lands on the live page — requires SANITY_API_WRITE_TOKEN + NEXT_PUBLIC_SANITY_PROJECT_ID/DATASET, which are not configured in this environment (see CLAUDE.md §16.3; written skip reason recorded in the quality report). |
| `__tests__/content-consistency.test.ts` | live Sanity dataset consistency | Requires a configured Sanity project (`NEXT_PUBLIC_SANITY_PROJECT_ID` + dataset). Guarded by `it.skipIf(!hasSanityConfig())`; it cannot validate a real dataset in an environment without credentials. |

## Documented acceptance gaps (not code regressions)

- **placeholder scan** — 13 placeholders pending editorial sign-off — documented acceptance gap (plan Phase 9)
- **Journey 6** (scripted Sanity publish) is environment-gated. The test performs a real create → publish → verify → delete cycle against the development dataset and is skipped here only because `SANITY_API_WRITE_TOKEN` / `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` are not configured in this environment.
- **Styleguide suite** is skipped when the suite runs against a production-style server, because `/styleguide` intentionally returns 404 in production by design. Run `pnpm e2e` against the dev server to execute it.

> These gaps are excluded from the regression gate above so that CI still fails on real regressions. They must clear before launch (plan §20 Definition of Done).

---

**How to run:** `pnpm typecheck && pnpm lint && pnpm test && pnpm --filter web run build && pnpm e2e && pnpm quality:bundle && pnpm quality:lighthouse && pnpm quality:report`