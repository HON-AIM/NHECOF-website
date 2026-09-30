# NHECOF Website Implementation Plan

## 1. Document Purpose

This document is the implementation blueprint for the official website of the **NutriHealth Education and Community Outreach Foundation (NHECOF)**. It translates the agreed website architecture into a practical development plan that can be implemented inside one root project folder.

The website will function as:

- A reliable public nutrition-education platform.
- A permanent record of NHECOF's community outreach activities.
- A transparent presentation of the organisation's impact.
- A channel for outreach requests, partnerships, volunteering and enquiries.
- A content platform that authorised NHECOF personnel can update without editing the React source code.

The first release will use **React, Vite, React Router and Sanity Studio**. Sanity Studio will provide the required content-administration interface, so a separate custom admin dashboard will not be built during the first phase.

---

## 2. Project Vision

### 2.1 Working Positioning Statement

> Making reliable nutrition knowledge and preventive health support accessible to Nigerian communities.

This statement is a working direction and should be approved or refined before final website copy is produced.

### 2.2 Core Website Pillars

1. **Learn:** Understand nutrition, Nigerian foods and practical healthy living.
2. **See Our Impact:** Explore NHECOF's outreaches, screenings and community results.
3. **Take Part:** Volunteer, partner with NHECOF, request an outreach or support its work.

### 2.3 Primary Audiences

- Nigerian individuals and families seeking understandable nutrition information.
- Parents, caregivers, pregnant women and young adults.
- People interested in preventing diet-related diseases.
- Schools, churches, associations and community leaders seeking an outreach.
- Health and nutrition professionals interested in volunteering.
- NGOs, government agencies, companies and prospective partners.
- Donors, grant organisations and institutional supporters.
- Journalists, researchers and members of the general public.

### 2.4 Initial Success Indicators

- Visitors can find relevant nutrition information within three interactions.
- Every published health article identifies its author, reviewer, sources and review date.
- Every completed outreach can be recorded consistently.
- Impact figures can be traced to verified outreach records.
- NHECOF personnel can publish content without changing source code.
- All important pages work comfortably on mobile devices and slower networks.
- Contact and outreach-request submissions reach the correct NHECOF representative.

---

## 3. Approved Technical Direction

### 3.1 Core Stack

| Area | Technology | Purpose |
|---|---|---|
| Public website | React | Component-based user interface |
| Build tooling | Vite | Development server and production builds |
| Routing | React Router | Page routing, nested layouts and error routes |
| Language | TypeScript | Safer content models and maintainable code |
| Styling | Tailwind CSS | Responsive design and consistent tokens |
| Content administration | Sanity Studio | Articles, quotes, outreaches, people and resources |
| Content delivery | Sanity Content Lake | Hosted structured content and media metadata |
| Rich text | Sanity Portable Text | Structured article and page content |
| Forms | React Hook Form and Zod | Form state and validation |
| Form processing | Serverless functions | Secure submission processing and email delivery |
| Email | Resend or an equivalent provider | Enquiry and outreach-request notifications |
| Bot protection | Cloudflare Turnstile | Spam protection without intrusive challenges |
| Hosting | Vercel | Public website deployment and preview builds |
| Analytics | Plausible or privacy-conscious equivalent | Traffic and content-performance measurement |
| Error monitoring | Sentry, optional for launch | Production error reporting |

### 3.2 Important Rendering Requirement

NHECOF is a content-heavy public website, so it must not be implemented as an unplanned client-only single-page application. Public pages and article URLs should be prerendered or otherwise deliver meaningful HTML for search engines and social platforms.

The implementation must provide:

- Crawlable page content.
- Unique metadata for each route.
- Correct Open Graph and social-sharing metadata.
- Canonical URLs.
- Structured data where appropriate.
- An XML sitemap generated from published content.
- A valid `robots.txt` file.
- A proper not-found response and page.

If the chosen React Router configuration cannot reliably prerender dynamic Sanity routes, that limitation must be resolved before content development continues. The fallback decision should be a React-compatible prerendering solution, not a silent reduction in SEO quality.

### 3.3 Single-Repository Decision

The public website and Sanity Studio will remain in one repository and one root folder. They will be logically separated into `apps/web` and `apps/studio` so each can be deployed independently without maintaining two codebases.

---

## 4. Single-Folder Project Structure

```text
nhecof-website/
├── apps/
│   ├── web/
│   │   ├── public/
│   │   │   ├── favicon.svg
│   │   │   ├── robots.txt
│   │   │   └── static/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── App.tsx
│   │   │   │   ├── router.tsx
│   │   │   │   └── providers.tsx
│   │   │   ├── assets/
│   │   │   ├── components/
│   │   │   │   ├── common/
│   │   │   │   ├── content/
│   │   │   │   ├── forms/
│   │   │   │   ├── home/
│   │   │   │   ├── impact/
│   │   │   │   ├── layout/
│   │   │   │   └── seo/
│   │   │   ├── config/
│   │   │   ├── features/
│   │   │   │   ├── articles/
│   │   │   │   ├── daily-quotes/
│   │   │   │   ├── food-profiles/
│   │   │   │   ├── forms/
│   │   │   │   ├── impact/
│   │   │   │   ├── outreach/
│   │   │   │   ├── resources/
│   │   │   │   └── search/
│   │   │   ├── hooks/
│   │   │   ├── layouts/
│   │   │   ├── lib/
│   │   │   │   ├── analytics/
│   │   │   │   ├── forms/
│   │   │   │   ├── sanity/
│   │   │   │   └── seo/
│   │   │   ├── pages/
│   │   │   ├── styles/
│   │   │   ├── types/
│   │   │   ├── utils/
│   │   │   └── main.tsx
│   │   ├── api/
│   │   │   ├── contact.ts
│   │   │   ├── outreach-request.ts
│   │   │   └── newsletter.ts
│   │   ├── index.html
│   │   ├── package.json
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── studio/
│       ├── schemaTypes/
│       │   ├── documents/
│       │   ├── objects/
│       │   └── index.ts
│       ├── structure/
│       ├── validation/
│       ├── sanity.cli.ts
│       ├── sanity.config.ts
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── shared-types/
│   └── shared-utils/
├── docs/
│   ├── content-guidelines.md
│   ├── editorial-policy.md
│   ├── image-guidelines.md
│   ├── launch-checklist.md
│   └── privacy-data-map.md
├── scripts/
│   ├── generate-sitemap.ts
│   ├── validate-content.ts
│   └── check-links.ts
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── pnpm-workspace.yaml
```

### 4.1 Organisation Rules

- `apps/web` contains only the public-facing website and its serverless form handlers.
- `apps/studio` contains Sanity Studio, schemas, validation and editorial navigation.
- `packages/shared-types` contains types shared between the website and Studio where practical.
- `packages/shared-utils` contains reusable framework-independent utilities.
- `docs` contains operational documentation, not production code.
- Feature-specific components, queries, types and utilities should remain together under `features`.
- Generic components should be added to `components/common` only after they are genuinely reused.
- Secrets must never be committed. Only safe placeholder names belong in `.env.example`.

---

## 5. Information Architecture and Routes

### 5.1 Primary Navigation

- Home
- About
- What We Do
- Nutrition Hub
- Our Impact
- Get Involved

Secondary navigation and footer links should include Resources, News & Events, Contact, Editorial Policy, Privacy Policy and Terms/Disclaimer.

### 5.2 Route Plan

| Route | Page purpose | Priority |
|---|---|---|
| `/` | Mission, daily quote, programmes, impact, featured knowledge and calls to action | Launch |
| `/about` | Story, mission, vision, values, founder, team and governance | Launch |
| `/what-we-do` | Overview of NHECOF's programme areas | Launch |
| `/what-we-do/:slug` | Individual programme description and related impact | Later if needed |
| `/nutrition` | Searchable Nutrition Hub landing page | Launch |
| `/nutrition/articles` | Article archive with filters | Launch |
| `/nutrition/articles/:slug` | Evidence-based individual article | Launch |
| `/nutrition/foods` | Nigerian food-profile directory | Launch |
| `/nutrition/foods/:slug` | Individual food profile | Launch |
| `/nutrition/myths-and-facts` | Nutrition misconception archive | Phase 2 |
| `/nutrition/myths-and-facts/:slug` | Individual myth explanation | Phase 2 |
| `/impact` | Verified statistics, reach and featured stories | Launch |
| `/outreaches` | Completed and upcoming outreach archive | Launch |
| `/outreaches/:slug` | Complete outreach record | Launch |
| `/resources` | Downloadable guides, infographics and reports | Launch |
| `/news` | Organisational news and announcements | Phase 2 |
| `/events` | Upcoming and completed events | Phase 2 |
| `/get-involved` | Overview of participation options | Launch |
| `/volunteer` | Volunteer information and application | Phase 2 |
| `/partner` | Partnership information and enquiry | Launch |
| `/request-an-outreach` | Outreach-request form | Launch |
| `/contact` | General contact information and form | Launch |
| `/editorial-policy` | Content standards, review and corrections | Launch |
| `/medical-disclaimer` | Educational-use and medical-care disclaimer | Launch |
| `/privacy` | Privacy notice and form-data use | Launch |
| `*` | Accessible not-found page | Launch |

### 5.3 Founder Content Decision

Version one will not have a separate founder route. The `/about` page will contain a substantial **Our Founder** section with:

- Professional photograph.
- Full name and role.
- Relevant Food Science and Technology background.
- Short founding motivation.
- Founder statement.
- Relevant professional/social link.

This provides accountability without making the NGO website appear to be a personal portfolio. A separate founder page can be introduced later if there is enough substantial material, such as publications, awards, public speaking, media appearances and professional initiatives.

---

## 6. Page-Level Implementation Requirements

### 6.1 Homepage

The homepage should contain the following sequence:

1. **Header:** Logo, primary navigation, search access and one principal action.
2. **Opening section:** Mission-led headline, concise explanation, authentic outreach image and two calls to action.
3. **Daily Nutrition Thought:** Approved quote, source and sharing action.
4. **Impact snapshot:** Verified totals only.
5. **What We Do:** Short introduction to NHECOF's programme areas.
6. **Featured knowledge:** Featured article and food profile.
7. **Recent outreach:** Latest completed outreach with a tangible result.
8. **Upcoming activity:** Shown only when a valid upcoming activity exists.
9. **Participation section:** Request an outreach, partner or volunteer.
10. **Newsletter:** Added only when the subscription workflow is operational.
11. **Footer:** Contact, policies, social profiles and organisational information.

The first viewport must explain who NHECOF is, what it does and what the visitor can do next. Avoid an oversized decorative hero that forces visitors to scroll before finding useful content.

### 6.2 About Page

Required sections:

- Organisational introduction.
- NHECOF's founding story.
- Mission.
- Vision.
- Objectives.
- Values.
- Founder section.
- Team and advisers.
- Governance/registration information that is safe and appropriate to publish.
- Link to contact or partnership page.

### 6.3 Nutrition Hub

The landing page must provide clear entry points for:

- Nutrition basics.
- Nigerian foods and their benefits.
- Nutrition by life stage.
- Nutrition and health conditions.
- Practical healthy living.
- Food safety.
- Myths and facts.

Visitors should be able to search by keyword and filter by topic, audience and content type. Search results must include a helpful empty state and a way to clear filters.

### 6.4 Article Page

Every article page must display:

- Title and short summary.
- Hero/featured image where useful.
- Author name and relevant qualification.
- Reviewer name and relevant qualification.
- Publication date and last-reviewed date.
- Estimated reading time.
- Key takeaways.
- Article body with accessible headings.
- Nigerian/local examples where relevant.
- Source/reference list.
- Educational disclaimer.
- Related content.
- Correction/reporting link.

### 6.5 Food Profile Page

Each food profile should use a consistent structure:

- Common and scientific name when appropriate.
- Description and common Nigerian uses.
- Key nutrients.
- Evidence-supported potential benefits.
- Healthy preparation options.
- Practical portion context.
- Cautions, allergies or condition-specific concerns.
- Myth or misconception, if applicable.
- Affordable meal ideas.
- Sources and reviewer information.

The copy must never describe a food as curing a disease unless that statement is explicitly supported by authoritative clinical evidence and approved by a qualified reviewer.

### 6.6 Outreach Archive and Detail Page

The archive should support filtering by year, state and programme type. Each outreach page must record:

- Title and theme.
- Date.
- Community, local government area and state.
- Summary and objectives.
- Target population.
- Activities conducted.
- Attendance.
- Number screened, where applicable.
- Volunteers and professionals involved.
- Partners and sponsors.
- Key findings or outcomes.
- Follow-up activity.
- Photographs with captions and consent status.
- Testimonials that have publication permission.
- Related report or resource.

The 28 December 2025 Ibadan outreach can be used as the first complete outreach case study once its details and photographs are assembled and verified.

### 6.7 Impact Page

The impact page must distinguish:

- Current cumulative impact.
- Historical milestones.
- Per-outreach results.
- Geographic reach.
- Personal/community stories.

The current record of more than 600 people reached across three Nigerian states should not be published until it is reconciled with the earlier 230+ people/six-community milestone and supported by an internal record. The earlier figure may be presented as a dated milestone rather than deleted.

### 6.8 Get Involved

The page should explain:

- Who can volunteer.
- Suitable volunteer roles.
- Partnership opportunities.
- Ways organisations can host or request an outreach.
- Future support/donation options.

Donation collection should not be launched until NHECOF's legal, financial, payment-processing and reporting arrangements are ready.

---

## 7. Sanity Content Model

### 7.1 Required Document Types

| Document | Purpose |
|---|---|
| `siteSettings` | Organisation name, contact details, social links and default metadata |
| `homepage` | Homepage editorial selections and calls to action |
| `page` | Flexible controlled pages where a dedicated model is unnecessary |
| `article` | Evidence-based nutrition articles |
| `foodProfile` | Structured Nigerian food information |
| `quote` | Approved daily nutrition thoughts |
| `outreach` | Completed and upcoming outreach records |
| `program` | NHECOF programme areas |
| `person` | Founder, team, adviser, writer and reviewer profiles |
| `impactMetric` | Verified metric labels, values and effective dates |
| `impactMilestone` | Dated organisational achievements |
| `resource` | Downloadable reports, guides and infographics |
| `partner` | Approved partner/sponsor profiles |
| `testimonial` | Consent-controlled public testimonials |
| `event` | Upcoming and completed public events |
| `category` | Content categories |
| `tag` | Optional granular content labels |

### 7.2 Reusable Object Types

- SEO metadata.
- Portable Text blocks.
- Call to action.
- Image with alternative text, caption, credit and consent information.
- Reference/citation.
- Author-reviewer attribution.
- Location.
- Impact result.
- Contact details.
- Publication review record.

### 7.3 Article Fields

Minimum article schema:

- `title`
- `slug`
- `summary`
- `featuredImage`
- `author`
- `reviewer`
- `categories`
- `audiences`
- `keyTakeaways`
- `body`
- `references`
- `publishedAt`
- `lastReviewedAt`
- `nextReviewAt`
- `reviewStatus`
- `featured`
- `relatedContent`
- `seo`

### 7.4 Daily Quote Logic

Each quote must include:

- Quote text.
- Named author/source or `NHECOF` attribution.
- Optional authoritative source URL.
- Topic.
- Start/display date.
- End date, if seasonal.
- Active status.
- Social-sharing permission.

The website should select the active quote for the current date. When no specifically scheduled quote exists, it should select deterministically from the approved evergreen collection based on the calendar day. This ensures all visitors see the same quote that day without a daily manual update.

Unreviewed AI-generated health quotations must not be displayed automatically.

### 7.5 Editorial Roles

| Role | Access |
|---|---|
| Administrator | Configuration, users and all content |
| Content Manager | Manage articles, quotes, food profiles, resources and homepage selections |
| Nutrition Reviewer | Review health content and update review fields |
| Outreach Manager | Manage outreaches, events, photographs and metrics |
| Contributor | Create and revise drafts without final publication authority |

---

## 8. Editorial Governance

### 8.1 Publishing Workflow

1. Contributor creates a draft.
2. Nutrition reviewer checks evidence, claims, cautions and references.
3. Reviewer requests revisions or marks the content medically/nutritionally approved.
4. Content manager checks grammar, readability, formatting, images and metadata.
5. Authorised publisher publishes or schedules the item.
6. The system records a future review date.
7. Outdated content is revised, redirected or archived.

### 8.2 Evidence Standards

Preferred sources should include:

- World Health Organization.
- Nigeria's Federal Ministry of Health and relevant public agencies.
- Food and Agriculture Organization.
- UNICEF.
- Peer-reviewed systematic reviews and high-quality studies.
- Recognised professional nutrition and medical organisations.
- Nigerian studies where local context materially matters.

References must support the actual claim made. Blog posts and commercial wellness pages should not be used as the primary evidence for health claims.

### 8.3 Required Content Safeguards

- Educational content must not diagnose readers.
- Disease-related articles must encourage appropriate professional care.
- Pregnancy, infant feeding, supplements and medication-interaction content requires qualified review.
- All statistics must show a source and relevant date.
- Every article must show when it was last reviewed.
- Conflicts of interest and sponsored content must be disclosed.
- Corrections must be logged and significant changes acknowledged.

---

## 9. Forms and Communication Workflows

### 9.1 Launch Forms

#### General Contact

- Name.
- Email.
- Telephone, optional.
- Subject.
- Message.
- Consent checkbox.

#### Outreach Request

- Organisation or community name.
- Contact person's name and role.
- Email and telephone.
- Community, LGA and state.
- Estimated audience size.
- Target audience.
- Main health/nutrition concerns.
- Preferred date or date range.
- Venue availability.
- Type of support requested.
- Additional information.
- Privacy consent.

#### Partnership Enquiry

- Organisation.
- Contact person.
- Partnership interest.
- Proposed contribution or collaboration.
- Message.
- Contact details and consent.

### 9.2 Form Processing Requirements

- Validate data in the browser and again on the server.
- Add bot protection and rate limiting.
- Do not expose email-provider credentials in the React bundle.
- Send a clear acknowledgement to the submitter.
- Send a structured notification to NHECOF.
- Avoid collecting medical histories or sensitive diagnoses in version one.
- Log only the minimum information required for delivery and troubleshooting.
- Provide understandable success and error states.

---

## 10. Design System and User Experience

### 10.1 Visual Direction

The visual identity should feel **credible, human, energetic and locally grounded**. It should avoid looking like a hospital portal, commercial supplement store or generic charity template.

Recommended characteristics:

- Strong, accessible primary colour based on the approved NHECOF identity.
- Supporting food/nutrition accent colours used with restraint.
- Clear editorial typography.
- Authentic photographs from NHECOF activities.
- Clean layouts with generous but efficient spacing.
- Visible evidence, dates and attribution.
- Simple icons for topic navigation.
- Limited, purposeful animation.

### 10.2 Design Tokens

Define centrally:

- Brand colours.
- Neutral colours.
- Semantic success, warning and error colours.
- Font families and type scale.
- Spacing scale.
- Border radii.
- Shadows.
- Content widths.
- Breakpoints.
- Animation duration and easing.

### 10.3 Accessibility Requirements

- Main body text should normally be at least 16px.
- Interactive text and labels should normally be at least 14px.
- Full keyboard navigation.
- Visible focus indicators.
- Sufficient colour contrast.
- Alternative text for meaningful images.
- Empty alternative text for decorative images.
- Captions/transcripts for meaningful video and audio.
- Correct form labels and error associations.
- Logical heading hierarchy.
- A skip-to-content link.
- Respect for reduced-motion preferences.
- Usability at 200% text enlargement.

### 10.4 Responsive Behaviour

Design and verify at minimum:

- Small mobile around 360px.
- Standard mobile around 390–430px.
- Tablet around 768px.
- Laptop around 1280px.
- Large desktop around 1440px.

No page should produce accidental horizontal scrolling. Tables and statistics must remain understandable on small screens.

---

## 11. Search, Discovery and Related Content

### 11.1 Initial Search

The launch search should index:

- Article titles and summaries.
- Food-profile names and aliases.
- Categories.
- Health conditions.
- Audience/life-stage labels.
- Outreach titles and locations where appropriate.

For the initial content volume, client-side search over a compact published-content index is sufficient. A specialist service such as Algolia should be considered only when the library becomes large enough to justify the additional complexity and cost.

### 11.2 Filters

- Topic.
- Content type.
- Audience/life stage.
- Health condition.
- Food group.
- Publication/review date where useful.

### 11.3 Related Content

Editors should be able to select important related items manually. Automatic fallback recommendations may use shared categories and tags but must not create unsafe medical associations.

---

## 12. SEO and Social Sharing

### 12.1 Required SEO Features

- Unique title and meta description per page.
- Canonical URL.
- Crawlable navigation links.
- Automatically generated sitemap.
- `robots.txt`.
- Helpful not-found page.
- Descriptive, stable URL slugs.
- Image alternative text.
- Image dimensions to reduce layout movement.
- Internal links between related topics.
- Breadcrumbs for deeper content.
- Redirect map when slugs change.

### 12.2 Structured Data

Use valid JSON-LD where applicable:

- `Organization` for NHECOF.
- `Article` for nutrition articles.
- `BreadcrumbList` for nested pages.
- `Event` for genuine public events.
- `Person` for publicly listed authors/reviewers.

Do not mark ordinary informational content as medical advice or add structured data that the visible page does not support.

### 12.3 Social Previews

Each important page should provide an appropriate title, description and image when shared. Article and outreach images must include usage permission. A generic branded fallback may be used only when a content-specific image is unavailable.

---

## 13. Performance Plan

- Prerender public content routes where practical.
- Split code by route.
- Load below-the-fold images lazily.
- Serve responsive image sizes.
- Compress photographs before upload.
- Avoid autoplaying videos.
- Keep third-party scripts minimal.
- Use font subsetting and controlled font weights.
- Cache public Sanity queries appropriately.
- Prevent layout shifts by reserving image dimensions.
- Test using simulated slower mobile connections.

Target outcomes for principal pages:

- Largest Contentful Paint under 2.5 seconds under reasonable field conditions.
- Cumulative Layout Shift below 0.1.
- Interaction to Next Paint below 200 milliseconds where achievable.
- No critical accessibility or SEO errors at launch.

---

## 14. Security and Privacy

### 14.1 Security Controls

- Keep secrets in hosting environment variables.
- Use a read-only Sanity token only when a token is required publicly.
- Keep privileged Sanity tokens server-side.
- Restrict Sanity Studio access to authorised accounts.
- Validate and sanitise form submissions.
- Apply rate limiting and bot protection.
- Set appropriate security headers.
- Restrict allowed origins where applicable.
- Keep packages updated and review dependency alerts.
- Back up critical organisational source documents outside the website platform.

### 14.2 Privacy Principles

- Collect the minimum personal information needed.
- Explain why each form collects information.
- Obtain explicit consent.
- Define how long submissions are retained.
- Do not publish identifiable beneficiary stories or images without appropriate consent.
- Never expose private medical or screening results.
- Provide a method for privacy enquiries and removal requests.

---

## 15. Environment Configuration

The `.env.example` should document names without containing real values:

```text
VITE_SANITY_PROJECT_ID=
VITE_SANITY_DATASET=
VITE_SANITY_API_VERSION=
VITE_SITE_URL=
SANITY_STUDIO_PROJECT_ID=
SANITY_STUDIO_DATASET=
RESEND_API_KEY=
CONTACT_RECIPIENT_EMAIL=
TURNSTILE_SECRET_KEY=
VITE_TURNSTILE_SITE_KEY=
SENTRY_DSN=
```

Development, preview and production environments should use separate configuration where appropriate. Preview content must not accidentally expose private drafts.

---

## 16. Testing Strategy

### 16.1 Automated Tests

Focus automated coverage on high-risk behaviour:

- Quote-of-the-day selection.
- Content transformation and Portable Text rendering.
- Date and metric formatting.
- Form validation.
- Search and filtering.
- Metadata generation.
- Sitemap generation.
- Not-found behaviour.

Use component/integration tests for important user interactions and a limited end-to-end suite for critical journeys.

### 16.2 Critical End-to-End Journeys

1. Visitor opens the homepage and reaches a featured article.
2. Visitor searches the Nutrition Hub and opens a relevant result.
3. Visitor filters Nigerian food profiles.
4. Visitor reads an outreach report and moves to the impact page.
5. Visitor submits an outreach request successfully.
6. Content manager publishes an approved article in Sanity and it becomes publicly available.
7. Invalid or spam-like form submissions are rejected safely.

### 16.3 Manual Quality Assurance

- Mobile and desktop layout.
- Keyboard-only navigation.
- Screen-reader landmarks and form announcements.
- 200% zoom/text resizing.
- Slow-network loading.
- Social-link previews.
- Broken links.
- Image captions, credits and alternative text.
- Article author, reviewer and reference presentation.
- Accurate impact totals.
- Form email delivery.

---

## 17. Analytics and Measurement

Track useful, privacy-conscious events such as:

- Article viewed.
- Food profile viewed.
- Search performed.
- Filter applied.
- Resource downloaded.
- Outreach page viewed.
- Outreach-request form completed.
- Partnership enquiry completed.
- Volunteer-interest action.
- Newsletter signup, when introduced.

Avoid collecting sensitive health information in analytics. Establish a simple monthly reporting routine covering traffic, popular topics, failed searches, participation enquiries and content requiring updates.

---

## 18. Delivery Phases

### Phase 0: Discovery and Content Audit

**Objectives**

- Confirm legal organisation name and public contact details.
- Approve mission, vision, values and objectives.
- Reconcile all impact figures.
- Assemble outreach dates, photographs, attendance and screening records.
- Confirm image/testimonial consent.
- Identify the initial authors and qualified reviewers.
- Approve brand assets and visual direction.
- Select the initial launch content.

**Deliverables**

- Approved content inventory.
- Verified impact spreadsheet or register.
- Brand and image asset folder.
- Initial sitemap and route list.
- Launch article list.
- Privacy data map.

**Exit criterion:** No unverified organisational claim is required to complete the launch pages.

### Phase 1: Project Foundation

**Tasks**

- Create the single-folder workspace.
- Configure React, Vite, React Router, TypeScript and Tailwind.
- Configure Sanity Studio in `apps/studio`.
- Establish environment-variable handling.
- Add formatting, type checking and basic quality scripts.
- Create the global layout, error boundary and not-found page.
- Define tokens for colour, typography, spacing and responsive behaviour.

**Exit criterion:** Both applications run locally, share the expected configuration and can be built successfully.

### Phase 2: Sanity Models and Editorial Workflow

**Tasks**

- Create document and object schemas.
- Add validation rules.
- Configure Studio navigation by editorial responsibility.
- Create author/reviewer relationships.
- Implement publication and review fields.
- Add preview support.
- Seed approved sample content.

**Exit criterion:** An authorised editor can create, review and publish a correctly structured article, food profile, quote and outreach record.

### Phase 3: Public Design System and Core Pages

**Tasks**

- Build the responsive header, navigation and footer.
- Build reusable cards, content metadata, breadcrumbs and calls to action.
- Implement Home, About, What We Do, Get Involved and Contact.
- Add the founder section to About.
- Use authentic, permission-cleared imagery.
- Verify accessibility fundamentals.

**Exit criterion:** Core organisational pages accurately present NHECOF on mobile and desktop.

### Phase 4: Nutrition Hub

**Tasks**

- Implement article and food-profile queries.
- Build archives, filters and search.
- Build article and food detail templates.
- Implement author, reviewer, references and disclaimers.
- Add related content.
- Implement empty, loading and error states.

**Exit criterion:** Visitors can discover and read reviewed nutrition content using stable, shareable URLs.

### Phase 5: Outreach and Impact

**Tasks**

- Build outreach archive and detail routes.
- Add filters for year, state and programme.
- Build impact page and dated milestones.
- Calculate or retrieve verified metrics consistently.
- Add consent-controlled stories and photography.

**Exit criterion:** All displayed impact claims are traceable to approved content or records.

### Phase 6: Daily Quote and Resources

**Tasks**

- Implement scheduled and evergreen quote selection.
- Provide safe source attribution.
- Add optional social sharing.
- Build resources archive and file downloads.
- Record useful download analytics.

**Exit criterion:** The daily quote changes predictably and only approved quotes can appear.

### Phase 7: Forms and Notifications

**Tasks**

- Build contact, outreach-request and partnership forms.
- Add browser and server validation.
- Add bot protection and rate limiting.
- Configure acknowledgement and internal notification emails.
- Add privacy consent and retention rules.
- Test successful and failed delivery scenarios.

**Exit criterion:** NHECOF reliably receives submissions without exposing secrets or accepting malformed requests.

### Phase 8: SEO, Performance and Accessibility

**Tasks**

- Implement route-specific metadata.
- Add sitemap, canonical URLs and robots rules.
- Add appropriate structured data.
- Verify prerendered/crawlable content.
- Optimise images, fonts and route bundles.
- Complete keyboard, contrast and responsive testing.
- Test social sharing on representative pages.

**Exit criterion:** The site passes the launch SEO, performance and accessibility checklist with no critical failures.

### Phase 9: Content Population and Review

**Tasks**

- Enter approved organisational copy.
- Publish the initial nutrition articles.
- Publish initial Nigerian food profiles.
- Publish the first complete outreach case study.
- Add verified historical milestones.
- Review every source, date, image, link and claim.

**Suggested minimum launch content**

- 6–10 substantial nutrition articles.
- 6–10 Nigerian food profiles.
- 20–30 approved evergreen daily quotes.
- At least one complete outreach case study.
- A verified impact overview.
- Complete About, What We Do, Contact and policy pages.

**Exit criterion:** No launch-critical page depends on placeholder text or an unverified statistic.

### Phase 10: Deployment and Launch

**Tasks**

- Connect the repository to the hosting platform.
- Configure preview and production environments.
- Configure the custom domain and HTTPS.
- Deploy Sanity Studio with restricted access.
- Test all production forms.
- Submit the sitemap to search engines.
- Configure analytics and monitoring.
- Record the deployment and rollback process.
- Train the content manager and reviewer.

**Exit criterion:** The production website is secure, monitored, editable and ready for public promotion.

---

## 19. Recommended Work Schedule

This schedule assumes one primary developer with timely access to approved content.

| Week | Main outcome |
|---|---|
| 1 | Discovery, content audit, verified sitemap and project setup |
| 2 | Sanity schemas, editorial workflow and design system |
| 3 | Homepage, About, What We Do and common components |
| 4 | Nutrition Hub, article pages and food profiles |
| 5 | Outreach archive, impact page, quotes and resources |
| 6 | Forms, SEO, accessibility, performance and initial content population |
| 7 | Review, fixes, production deployment, documentation and training |

This is a planning estimate, not a fixed promise. The biggest schedule risk is delayed or unverified content, not React development.

---

## 20. Definition of Done for Version One

Version one is complete only when:

- All launch routes exist and work on mobile and desktop.
- NHECOF's official identity and claims have been approved.
- The founder is presented appropriately within the About page.
- Sanity Studio manages all recurring public content.
- No custom admin dashboard is required for routine content updates.
- Articles display authors, reviewers, dates, sources and disclaimers.
- The daily quote uses only approved content.
- Outreach and impact data are internally consistent.
- Forms validate securely and notifications are received.
- Public pages are crawlable and have correct metadata.
- Sitemap, canonical URLs, structured data and robots rules are operational.
- Accessibility testing finds no critical blocker.
- Core pages meet acceptable performance targets.
- Privacy, editorial and medical-disclaimer pages are published.
- There are no placeholder claims, stock testimonials or unlicensed images.
- A rollback method and content-update procedure are documented.

---

## 21. Deferred Features

The following should not delay version one:

- Custom-built admin dashboard.
- Beneficiary medical-record storage.
- Online diagnosis or personalised treatment advice.
- AI-generated medical advice.
- Donation processing before legal/financial readiness.
- Volunteer-management portal.
- User accounts for general visitors.
- Complex interactive nutrition calculators.
- Full multilingual support.
- Native mobile application.
- Advanced external search service.
- Live chat requiring continuous staffing.

These can be reconsidered after the website has real users, content and operational processes.

---

## 22. Immediate Pre-Build Checklist

Before development begins, NHECOF should provide or approve:

- [ ] Official logo files.
- [ ] Brand colours, if already established.
- [ ] Official contact email and telephone number.
- [ ] Domain name decision.
- [ ] Approved mission, vision, values and objectives.
- [ ] Approved short organisational history.
- [ ] Founder biography and professional photograph.
- [ ] Team member names, roles, biographies and photographs.
- [ ] Verified registration/governance information for public display.
- [ ] Reconciled impact figures.
- [ ] Complete record of the December 2025 Ibadan outreach.
- [ ] Photographs with confirmed publication permission.
- [ ] Initial article topics and qualified reviewers.
- [ ] Initial food-profile list.
- [ ] Initial approved quote collection.
- [ ] Social-media profile URLs.
- [ ] Recipient email for website forms.
- [ ] Privacy and content-correction contact.

---

## 23. Final Architectural Decision

The recommended version-one architecture is a **single-folder React content platform** with:

- A React/Vite public website.
- React Router with a verified prerendering strategy.
- Sanity Studio as the content administration system.
- Serverless functions for secure forms and email.
- No separate custom admin dashboard.
- The founder presented within the About page.
- Structured, reviewed health content.
- Traceable outreach and impact data.
- A deterministic daily quote drawn only from an approved library.

This delivers a professional and maintainable website without introducing unnecessary complexity, while leaving a clear path for future programmes, languages, donations, volunteer management and advanced reporting.
