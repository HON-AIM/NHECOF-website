# Accessibility Checklist — WCAG 2.2 (Level AA)

Walk-through checklist for **every shared component** on the NHECOF website, plus
the **WCAG 2.2 Target Size (2.5.8)** entries. Automated coverage is listed first
so a human is only asked to verify what machines cannot.

> **Regression gate** — marked automatically by the quality run:
> `REGRESSION-STATUS: PASS  ← auto-marked Mon, 28 Sep 2026 15:38:15 GMT

---

## 1. What automation already covers

| Gate | Where it runs | Failure mode |
| --- | --- | --- |
| axe gauntlet (19 route templates × 360px + 1280px, cat. A–AAA) | `e2e/axe-all-routes.spec.ts` | test failure |
| WCAG 2.2 Target Size 2.5.8 — 20 controls measured in-browser | `e2e/target-size.spec.ts` | test failure |
| Header WCAG 2.2 (target size, focus-not-obscured, skip link, dialog inert) | `e2e/header-wcag.spec.ts` | test failure |
| WCAG contrast (token pairs) | `scripts/check-contrast.mjs` | CI exit ≠ 0 |
| Keyboard + focus-appearance journeys | `e2e`, `styleguide.spec.ts` | test failure |
| Unit tests (component a11y invariants) | `__tests__` (vitest) | test failure |
| Lighthouse a11y (≥ 100) | `scripts/lighthouse.mjs` | CI exit ≠ 0 |

Human verification below is therefore scoped to **semantics and judgement**,
not mechanical re-measurement.

---

## 2. Shared components — manual walk-through

For each component: confirm with real screen-reader + keyboard only that the
described behaviour holds. Contrast, focus rings, target sizes and role/labels
already asserted by the automated gates above.

- **Header** — announcement bar is dismissible and focus returns to its trigger;
  dropdown opens/closes with keyboard (Enter/Space/Escape); focus moves into the
  panel; inert background confirmed; skip link is the first tab stop.
- **Footer** — newsletter/feedback pattern is a real form with a labelled,
  inheriting focus; social icons each have distinct accessible names.
- **AnnouncementBar / Toast** — live region announces banner text; toast
  dismiss button is reachable; toast is `role="status"` not `alert` unless urgent.
- **PageShell** — single `main` landmark (skip-target); renders after header/footer.
- **Breadcrumbs** — labelled `nav["Breadcrumb"]`; each crumb is a real link;
  current page is text, not a link.
- **Button** — all variants operate with Enter + Space; `aria-busy` while
  submitting; loading state does not remove the control.
- **Link** — distinct focus appearance; underlined in body copy; external links
  indicate they open new tabs (aria-label) without misleading names.
- **Card / ArticleCard / OutreachCard / ProgramCard / FoodCard / ResourceCard /
  PersonCard** — whole-card link keeps a single, meaningful accessible name;
  decorative art elements are `aria-hidden`.
- **Accordion** — header buttons with `aria-expanded` + `aria-controls`;
  activation by click and Enter/Space; panels remain readable when collapsed.
- **Tabs** — roving tabindex + `aria-selected`; arrow-key navigation; panels
  labelled by the tab.
- **Dialog / Sheet** — title via `aria-labelledby`; focus trapped; Escape closes
  and focus returns to the opener; background is inert while open.
- **Pagination** — landmark nav with `aria-current="page"`, previous/next labelled.
- **Prose** — heading slug anchors are stable (TOC + deep links agree); internal
  links, citations (`aria-label`), callouts, key stats and myth/fact blocks keep
  defined roles/labels.
- **Figure / ResponsiveImage** — `alt` reflects editorial context; decorative
  figures use `alt=""` (or null); captions link to the figure.
- **Table-free layouts** — data in stat grids is readable in source order
  (fixture/SSG content order preserved at 360 px).
- **Stat / Badge / Eyebrow / Heading / Section / Container / Skeleton /
  EmptyState / LeafCutFrame / PatternDivider** — no interactive semantics lost;
  decorative patterns are `aria-hidden`; skeletons use `aria-busy`.
- **NutritionSearchDialog** — open via header toggle; input labelled; results
  listbox with `aria-selected`; Escape restores focus to the toggle.
- **ShareButtons / ArticleToc** — distinct names per platform; TOC updates
  `aria-current` as you scroll.
- **form/ErrorSummary** — on submit failure, focus moves into the summary so the
  first error is announced; links point at the offending fields.
- **form/Input, Textarea, Select, Checkbox, RadioGroup, Label, Field, HelpText** —
  every control bound to a label; error text hooked with `aria-describedby`;
  help text does not replace the label.

---

## 3. WCAG 2.2 Target Size (Minimum, 2.5.8) — 20 entries

All interactive targets ≥ **24 × 24 CSS px**. Flat rejects apply; links in a line
of text and controls with an equivalent larger hit area are exempt.

**These results are measured, not asserted by hand.** `e2e/target-size.spec.ts`
measures every entry in a real browser and writes the evidence to
`quality-results/a11y/target-size.json`; the test fails if any target falls below
24 px. Re-run with `pnpm e2e`. Prose links are exempt under 2.5.8 and are
deliberately not measured.

| # | Control | Measured on | Hit area (px) | Status |
| --- | --- | --- | --- | --- |
| t-01 | Primary / secondary buttons | `/request-an-outreach` | 96×38 | **PASS** |
| t-02 | Ghost / text buttons | `/nutrition` | 112×34 | **PASS** |
| t-03 | Icon-only buttons (share, copy, close) | article detail | 138×42 | **PASS** |
| t-04 | Top-bar nav links | `/` | 110×35 | **PASS** |
| t-05 | Nutrition Hub dropdown trigger | `/` | 112×34 | **PASS** |
| t-06 | Dropdown menu items | `/` (trigger opened) | 287×43 | **PASS** |
| t-07 | Mobile hamburger trigger | `/` @ 390×844 | 43×43 | **PASS** |
| t-08 | Search open toggle | `/` | 138×42 | **PASS** |
| t-09 | Search input | `/` (dialog opened) | 438×60 | **PASS** |
| t-10 | Search result items | `/` (query `moringa`) | 527×95 | **PASS** |
| t-11 | Text input fields | `/contact` | 276×49 | **PASS** |
| t-12 | Textarea fields | `/contact` | 578×151 | **PASS** |
| t-13 | Select fields | `/contact` | 578×45 | **PASS** |
| t-14 | Checkboxes / radio groups | `/contact` | 26×26 | **PASS** |
| t-15 | Breadcrumb links | article detail | 41×26 | **PASS** |
| t-16 | Footer links | `/` | 90×25 | **PASS** |
| t-17 | Card links | `/nutrition/foods` | 176×414 | **PASS** |
| t-18 | Tabs | — | — | **N/A** — `components/ui/Tabs.tsx` is implemented but not used by any page at launch, so there is no rendered instance to measure. Re-check when a page adopts it. |
| t-19 | Pagination controls | `/nutrition/articles` | — | **N/A** — rendered only when an archive spans more than one page; published content volume is a single page at launch. Re-check when the library grows. |
| t-20 | Skip-to-content link | `/` (first Tab stop) | 170×54 | **PASS** |

**Result: 18 measured PASS · 0 below the 24 px minimum · 2 documented N/A.**

Fixes made to reach this state (all found by the measurement pass, not by
inspection):

- `components/ui/Breadcrumbs.tsx` — breadcrumb links were 41×21, one band under
  the minimum; they now use `inline-flex min-h-6 items-center`.
- `features/forms/fields.tsx` (`CheckboxField`) — the native checkbox was
  `h-5 w-5` (20 px); it is now `h-6 w-6` (24 px).
- `components/ui/form/Checkbox.tsx` — the Radix checkbox keeps its 16 px visual
  size but is now wrapped in a `<label>`, so the whole row is the pointer target.
- `components/layout/Footer.tsx` — footer nav links were 23 px tall and are now
  `inline-flex min-h-6 items-center`.

---

## 4. Regression gate

`REGRESSION-STATUS: PASS  ← auto-marked Mon, 28 Sep 2026 15:38:15 GMT

Last full accessible walk-through recorded in `docs/quality-report.md`
(generated by `pnpm quality:report`), which auto-marks the line above.