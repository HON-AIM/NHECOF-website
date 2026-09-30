import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('NHECOF Studio')
    .items([
      // ── Content (articles, food profiles, quotes) ────────────────────────
      S.listItem()
        .title('Content')
        .child(
          S.list()
            .title('Content')
            .items([
              S.listItem()
                .title('Articles')
                .child(S.documentTypeList('article').title('Articles')),
              S.listItem()
                .title('Food Profiles')
                .child(S.documentTypeList('foodProfile').title('Food Profiles')),
              S.listItem()
                .title('Quotes')
                .child(S.documentTypeList('quote').title('Quotes')),
              S.listItem()
                .title('Pages')
                .child(S.documentTypeList('page').title('Pages')),
            ]),
        ),

      // ── Nutrition Hub (categories) ──────────────────────────────────────
      S.listItem()
        .title('Nutrition Hub')
        .child(
          S.list()
            .title('Nutrition Hub')
            .items([
              S.listItem()
                .title('Categories')
                .child(S.documentTypeList('category').title('Categories')),
              S.listItem()
                .title('Resources')
                .child(S.documentTypeList('resource').title('Resources')),
            ]),
        ),

      // ── Outreach & Impact ───────────────────────────────────────────────
      S.listItem()
        .title('Outreach & Impact')
        .child(
          S.list()
            .title('Outreach & Impact')
            .items([
              S.listItem()
                .title('Outreaches')
                .child(S.documentTypeList('outreach').title('Outreaches')),
              S.listItem()
                .title('Impact Metrics')
                .child(S.documentTypeList('impactMetric').title('Impact Metrics')),
              S.listItem()
                .title('Impact Milestones')
                .child(S.documentTypeList('impactMilestone').title('Impact Milestones')),
              S.listItem()
                .title('Events')
                .child(S.documentTypeList('event').title('Events')),
            ]),
        ),

      // ── People ──────────────────────────────────────────────────────────
      S.listItem()
        .title('People')
        .child(
          S.list()
            .title('People')
            .items([
              S.listItem()
                .title('People')
                .child(S.documentTypeList('person').title('People')),
              S.listItem()
                .title('Partners')
                .child(S.documentTypeList('partner').title('Partners')),
            ]),
        ),

      // ── Site ────────────────────────────────────────────────────────────
      S.listItem()
        .title('Site')
        .child(
          S.list()
            .title('Site')
            .items([
              S.documentTypeListItem('siteSettings').title('Site Settings'),
              S.documentTypeListItem('homepage').title('Homepage'),
              S.documentTypeListItem('redirect').title('Redirects'),
            ]),
        ),

      // ── Editorial ───────────────────────────────────────────────────────
      S.divider(),
      S.listItem()
        .title('Content Due for Review')
        .child(
          S.documentList()
            .title('Content Due for Review')
            .filter(
              '_type in ["article", "foodProfile"] && reviewStatus == "approved" && nextReviewAt <= $today',
            )
            .params({
              today: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split('T')[0],
            })
            .defaultOrdering([{ field: 'nextReviewAt', direction: 'asc' }]),
        ),
    ])
