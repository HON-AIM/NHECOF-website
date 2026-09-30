# Launch checklist

Every item in `CLAUDE.md` §20 (Definition of Done for Version One), plus the
deployment and operations requirements, with a tick box and an evidence link.

**Rules for using this document**

- An unticked box is a blocker. Do not launch with unticked boxes.
- A ticked box needs a **link to evidence**. "Done" is not evidence; a URL, a
  screenshot path, a commit SHA or a test name is.
- Anything ticked from memory rather than observation must be re-checked.
- If an item cannot be evidenced, tick nothing and record why in the Notes
  column. That is a legitimate outcome; a false tick is not.

**Target launch date:** _TBC_
**Launch owner:** _TBC_
**Last updated:** _TBC_

---

## A. Content readiness

- [ ] **A1.** Every launch route exists and returns 200 on mobile and desktop.
      Evidence: __
- [ ] **A2.** No launch page contains placeholder text.
      Evidence: `pnpm check:placeholders` output showing zero findings.
- [ ] **A3.** Every published article shows author, reviewer, publication date,
      last-reviewed date, and references.
      Evidence: __
- [ ] **A4.** Every health claim cites a source from the approved list in
      `CLAUDE.md` §8.2 (WHO, Federal Ministry of Health, FAO, UNICEF,
      peer-reviewed reviews, recognised professional bodies).
      Evidence: __
- [ ] **A5.** Impact figures are reconciled and traceable to a specific
      outreach record. The unreconciled "600+ people" figure is either
      substantiated or not published.
      Evidence: __
- [ ] **A6.** Outreach photographs have recorded publication consent
      (`docs/templates/image-consent-checklist.md` completed per set).
      Evidence: __
- [ ] **A7.** No testimonial is published without a recorded permission.
      Evidence: __
- [ ] **A8.** The daily quote library contains only reviewed, approved quotes.
      Evidence: `docs/launch-content-tracker.md` quote section.
- [ ] **A9.** Clinical review has been completed by a qualified reviewer for
      every article touching pregnancy, infant feeding, supplements or
      medication interactions.
      Evidence: __
- [ ] **A10.** The founder section on `/about` is approved, with a professional
      photograph and an accurate biography.
      Evidence: __

## B. Engineering quality

- [ ] **B1.** `pnpm typecheck` passes. Evidence: __
- [ ] **B2.** `pnpm lint` passes. Evidence: __
- [ ] **B3.** `pnpm test` passes. Evidence: __
- [ ] **B4.** `pnpm --filter web run build` succeeds. Evidence: __
- [ ] **B5.** `pnpm check:bundle` is within budget. Evidence: __
- [ ] **B6.** `pnpm check:contrast` passes. Evidence: __
- [ ] **B7.** Axe reports zero violations on all routes. Evidence: __
- [ ] **B8.** E2E suite passes. Evidence: __
- [ ] **B9.** `pnpm check:client-secrets` confirms no server secret is in the
      client bundle. Evidence: __
- [ ] **B10.** `pnpm check:audit` passes, or every remaining advisory has a
      dated, in-review exception in `security/audit-exceptions.json`.
      Evidence: `quality-results/dependency-audit.md`.

## C. Accessibility

- [ ] **C1.** Keyboard-only navigation reaches every interactive element, with
      a visible focus indicator throughout. Evidence: __
- [ ] **C2.** A skip-to-content link is present and works. Evidence: __
- [ ] **C3.** Every meaningful image has alternative text; decorative images
      have empty alternative text. Evidence: __
- [ ] **C4.** Form labels are correctly associated and errors are announced. Evidence: __
- [ ] **C5.** Heading hierarchy is logical on every page. Evidence: __
- [ ] **C6.** Usable at 200% text enlargement, with no horizontal scrolling. Evidence: __
- [ ] **C7.** Reduced-motion preference is respected. Evidence: __
- [ ] **C8.** Screen-reader landmarks and form announcements verified on
      `/`, `/nutrition`, an article, and `/request-an-outreach`.
      Evidence: __
- [ ] **C9.** Contrast meets WCAG AA. Evidence: `pnpm check:contrast`.
- [ ] **C10.** Responsive behaviour checked at 360, 390, 430, 768, 1280 and
      1440 px. Evidence: __

## D. Security and privacy

- [ ] **D1.** HSTS, `X-Content-Type-Options`, `X-Frame-Options`,
      `Referrer-Policy` and `Permissions-Policy` are present on production.
      Evidence: `curl -sSI https://<apex>` output.
- [ ] **D2.** Content-Security-Policy is present and no console violations
      occur on any page. Evidence: __
- [ ] **D3.** `SANITY_API_READ_TOKEN` is **read-only** and server-side only.
      Evidence: __
- [ ] **D4.** `SANITY_PREVIEW_SECRET` is unset in production. Evidence: __
- [ ] **D5.** Draft content is not reachable from any public URL. Evidence:
      `e2e/production-ops.spec.ts` draft-mode block.
- [ ] **D6.** `/api/revalidate` rejects unsigned and tampered requests.
      Evidence: `e2e/production-ops.spec.ts` webhook block.
- [ ] **D7.** Turnstile live site key and secret key are the production pair. Evidence: __
- [ ] **D8.** No secrets are committed to the repository. Evidence: CI
      `Secret scan` job passing.
- [ ] **D9.** Privacy policy is published and matches what the forms collect.
      Evidence: `/privacy` vs `docs/privacy-data-map.md`.
- [ ] **D10.** A privacy enquiry and removal-request route is published. Evidence: __
- [ ] **D11.** Rate limiting is active on all form endpoints in production. Evidence: __

## E. Content management and editorial

- [ ] **E1.** Sanity Studio is deployed and accessible **only** to invited
      accounts. Evidence: __
- [ ] **E2.** A non-technical editor has completed the walkthrough in
      `docs/studio-guide.md` unaided, and can create, review and publish an
      article, a food profile and a quote.
      Evidence: date, editor name, and their own confirmation.
- [ ] **E3.** Editorial roles are assigned to real people, and the Nutrition
      Reviewer role is held by someone qualified. Evidence: __
- [ ] **E4.** The publishing workflow (draft → review → approve → publish →
      review date) is understood by the content manager. Evidence: __
- [ ] **E5.** The review-reminder workflow has run at least once against real
      data and the reminder was received. Evidence: __
- [ ] **E6.** `docs/editorial-policy.md` matches actual Studio behaviour. Evidence: __
- [ ] **E7.** Corrections and significant changes are logged. Evidence: __

## F. SEO

- [ ] **F1.** Every route has a unique title and meta description. Evidence: __
- [ ] **F2.** Canonical URLs are correct. Evidence: __
- [ ] **F3.** Open Graph and social preview images render correctly when
      shared. Evidence: __
- [ ] **F4.** `sitemap.xml` is valid and contains only published content. Evidence: __
- [ ] **F5.** `robots.txt` allows crawling (launch switch flipped). Evidence: __
- [ ] **F6.** Structured data validates: `Organization`, `Article`,
      `BreadcrumbList`, `Person`, `Event` where applicable. Evidence: __
- [ ] **F7.** The not-found page is helpful and returns a real 404. Evidence: __
- [ ] **F8.** Redirect map is in place for any changed slug. Evidence: __

## G. Forms and email

- [ ] **G1.** Contact form delivers to the real inbox from production. Evidence: __
- [ ] **G2.** Outreach-request form delivers, and the acknowledgement reaches
      the submitter. Evidence: __
- [ ] **G3.** Partnership enquiry delivers. Evidence: __
- [ ] **G4.** Spare/garbage submissions are rejected without emailing. Evidence: __
- [ ] **G5.** The submitter receives a clear acknowledgement. Evidence: __
- [ ] **G6.** Resend domain is verified: SPF, DKIM and DMARC records are
      published and pass. Evidence: __
- [ ] **G7.** Outreach notification email **reaches a Gmail inbox**. Evidence: __
- [ ] **G8.** Outreach notification email **reaches an Outlook inbox**. Evidence: __
- [ ] **G9.** No email-provider credential appears in the client bundle. Evidence: __

## H. Operations

- [ ] **H1.** `docs/deployment-and-rollback.md` is complete and the
      "Who to contact" table is filled in with real names. Evidence: __
- [ ] **H2.** Branch protection is enabled on `main` with the required checks. Evidence: __
- [ ] **H3.** Dependabot is enabled. Evidence: `.github/dependabot.yml`.
- [ ] **H4.** The dependency audit gate runs in CI. Evidence: __
- [ ] **H5.** Secret scanning runs in CI. Evidence: __
- [ ] **H6.** The weekly Sanity dataset backup has completed successfully at
      least once. Evidence: __
- [ ] **H7.** A **restore drill has been performed** on a throwaway dataset and
      the result recorded. Evidence: date and outcome.
- [ ] **H8.** An uptime monitor is watching `/`, `/nutrition` and `/api/health`. Evidence: __
- [ ] **H9.** Sentry (or the chosen error monitor) is live and scrubbing PII. Evidence: __
- [ ] **H10.** A rollback drill has been performed and recorded. Evidence:
      date, what was rolled back, how long it took.

## I. Environments and connectivity

- [ ] **I1.** Preview environment uses the `development` dataset. Evidence: __
- [ ] **I2.** Preview is `noindex` **and** crawl-blocked. Evidence: __
- [ ] **I3.** Production uses the `production` dataset. Evidence: __
- [ ] **I4.** Sanity CORS origins are set to the correct domains for each
      environment, with credentials enabled only where needed. Evidence: __
- [ ] **I5.** The Sanity webhook is configured with the correct secret and
      points at the production `/api/revalidate`. Evidence: __

## J. The launch gate itself

- [ ] **J1.** **An editor's publish is visible on the staging site within 30
      seconds.** Evidence: time the change, attach the webhook log.
- [ ] **J2.** Content rollback via Sanity document history has been tested. Evidence: __
- [ ] **J3.** A code rollback via Vercel promotion has been tested. Evidence: __
- [ ] **J4.** `NEXT_PUBLIC_IS_LIVE=true` set, production redeployed, and
      `robots.txt` confirmed to allow crawling. Evidence: __
- [ ] **J5.** `sitemap.xml` submitted to **Google Search Console**. Evidence:
      submission date and property URL.
- [ ] **J6.** `sitemap.xml` submitted to **Bing Webmaster Tools**. Evidence:
      submission date and property URL.
- [ ] **J7.** A live-consistency check against the real Sanity production
      dataset has been run. Evidence: __
- [ ] **J8.** NHECOF has approved the public content in writing. Evidence: __
- [ ] **J9.** Launch date and time agreed, and the team knows who is watching. Evidence: __

---

## Sign-off

| Role | Name | Date | Signature |
|---|---|---|---|
| Technical maintainer | | | |
| Content manager | | | |
| Nutrition reviewer | | | |
| NHECOF director | | | |

**Outstanding items carried past launch** (record deliberately, do not leave
blank — an unrecorded gap is worse than a recorded one):

| Item | Why deferred | Owner | Review by |
|---|---|---|---|
| | | | |
