import type { PortableTextBlock } from '@portabletext/types'

/**
 * Bundled demo content — served ONLY when Sanity is not configured
 * (see `lib/content/dataSource.ts`). Copy is drafted to the same editorial
 * bar as production content: approved-only, "may support" language, real
 * public-guidance references, no fabricated statistics or credentials.
 */

export interface FixtureSlug {
  _type: 'slug'
  current: string
}

export type FixtureCategoryKind = 'topic' | 'tag' | 'condition' | 'food-group'

export interface FixtureCategory {
  _id: string
  title: string
  slug: FixtureSlug
  kind: FixtureCategoryKind
  description?: string
}

export interface FixtureCitation {
  title: string
  publisher?: string
  url?: string
  accessedAt?: string
}

export interface FixturePersonRef {
  name: string
  qualifications?: string
  slug?: FixtureSlug
}

export interface FixtureCategoryRef {
  _id: string
  title: string
  slug: FixtureSlug
}

export interface FixtureRelatedRef {
  _id: string
  title: string
  slug: FixtureSlug
  _type: 'article' | 'foodProfile'
}

export interface FixtureArticle {
  _id: string
  title: string
  slug: FixtureSlug
  summary: string
  audiences: string[]
  keyTakeaways: string[]
  body: PortableTextBlock[]
  references: FixtureCitation[]
  relatedContent: FixtureRelatedRef[]
  featured?: boolean
  publishedAt: string
  lastReviewedAt: string
  nextReviewAt: string
  reviewStatus: 'draft' | 'submitted' | 'approved' | 'needs-revision' | 'archived'
  author: FixturePersonRef
  reviewer: FixturePersonRef
  categories: FixtureCategoryRef[]
  seo?: { metaTitle?: string; metaDescription?: string }
}

export interface FixtureNutrient {
  name: string
  amount?: string
  note?: string
}

export interface FixtureFood {
  _id: string
  title: string
  slug: FixtureSlug
  scientificName?: string
  aliases: string[]
  summary: string
  description: PortableTextBlock[]
  nutrients: FixtureNutrient[]
  benefits?: PortableTextBlock[]
  preparation?: PortableTextBlock[]
  portionContext: string
  cautions: string
  myths?: PortableTextBlock[]
  mealIdeas?: PortableTextBlock[]
  categories: FixtureCategoryRef[]
  references: FixtureCitation[]
  featured?: boolean
  publishedAt: string
  lastReviewedAt: string
  nextReviewAt: string
  reviewStatus: 'approved'
  author: FixturePersonRef
  reviewer: FixturePersonRef
  seo?: { metaTitle?: string; metaDescription?: string }
}

export interface FixtureOutreachImage {
  _key?: string
  alt?: string
  caption?: string
  credit?: string
  decorative?: boolean
  consentStatus?: 'cleared' | 'pending' | 'not-for-publication'
  containsMinors?: boolean
  guardianConsentRecorded?: boolean
  asset?: { _ref: string }
}

export interface FixtureOutreach {
  _id: string
  title: string
  slug: FixtureSlug
  theme: string
  date: string
  summary: string
  images: FixtureOutreachImage[]
  status: 'upcoming' | 'completed'
  location?: { community?: string; lga?: string; state?: string }
  venue?: string
  objectives?: PortableTextBlock[]
  targetPopulation?: string
  activities?: PortableTextBlock[]
  attendance?: number
  screened?: number
  results?: Array<{ label: string; value: string | number }>
  volunteers?: Array<{ name: string; role?: string; qualifications?: string }>
  partners?: Array<{
    name: string
    slug: string
    logo?: FixtureOutreachImage
    website?: string
    type?: string
  }>
  outcomes?: PortableTextBlock[]
  followUp?: string
  testimonials?: Array<{ quote: string; attribution: string; consentObtained: boolean }>
  relatedResource?: {
    title: string
    slug: string
    type?: string
    description?: string
    externalUrl?: string
  }
  verifiedByOutreachManager?: boolean
}

export interface FixtureImpactMetric {
  _id: string
  label: string
  value: number
  asOf: string
  basis: 'computed' | 'manual'
  verifiedBy?: string
  unit?: string
  evidenceNote?: string
}

export interface FixtureMilestone {
  _id: string
  title: string
  date: string
  description: string
  order?: number
}

export type FixtureQuoteTopic =
  | 'nutrition'
  | 'healthy-living'
  | 'maternal-health'
  | 'child-nutrition'
  | 'food-safety'
  | 'general-wellness'

export interface FixtureQuote {
  _id: string
  text: string
  attribution: string
  topic?: FixtureQuoteTopic
  sourceUrl?: string
  startDate?: string
  endDate?: string
  active?: boolean
  reviewStatus: 'approved'
  sharingPermitted?: boolean
}

export type FixtureResourceType =
  | 'guide'
  | 'infographic'
  | 'report'
  | 'fact-sheet'
  | 'poster'
  | 'other'

export type FixtureResourceFile = {
  /** Local path under /public when Sanity is not configured, else null. */
  file?: string | null
  /** Resolvable URL when the resource links out instead of hosting a file. */
  externalUrl?: string | null
  extension?: string
  sizeBytes?: number
}

export interface FixtureResource {
  _id: string
  title: string
  slug: FixtureSlug
  description?: string
  type: FixtureResourceType
  file: FixtureResourceFile
  language: string
  audiences: string[]
  categories: FixtureCategoryRef[]
  publishedAt: string
}

/* ────────────────────────────────────────────────────────────────────────────
   Small Portable Text builders
   ──────────────────────────────────────────────────────────────────────────── */

let keyCounter = 0
function nextKey(): string {
  keyCounter += 1
  return `f${keyCounter}`
}

function span(text: string, mark?: string): { _type: 'span'; text: string; marks?: string[] } {
  return mark ? { _type: 'span', text, marks: [mark] } : { _type: 'span', text }
}

function p(text: string, markDefs?: Array<{ _key: string; _type: string; [k: string]: unknown }>): PortableTextBlock {
  return {
    _type: 'block',
    _key: nextKey(),
    style: 'normal',
    children: [span(text)],
    markDefs,
  } as PortableTextBlock
}

function h2(text: string): PortableTextBlock {
  return { _type: 'block', _key: nextKey(), style: 'h2', children: [span(text)] } as PortableTextBlock
}

function h3(text: string): PortableTextBlock {
  return { _type: 'block', _key: nextKey(), style: 'h3', children: [span(text)] } as PortableTextBlock
}

function bullet(text: string): PortableTextBlock {
  return {
    _type: 'block',
    _key: nextKey(),
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    children: [span(text)],
  } as PortableTextBlock
}

function callout(type: 'info' | 'tip' | 'important' | 'warning', heading: string, body: string): PortableTextBlock {
  return { _type: 'callout', _key: nextKey(), type, heading, body } as unknown as PortableTextBlock
}

function inlineCitation(ref: FixtureCitation): PortableTextBlock {
  return { _type: 'inlineCitation', _key: nextKey(), reference: ref } as unknown as PortableTextBlock
}

function keyStat(value: string, label: string, context: string): PortableTextBlock {
  return { _type: 'keyStat', _key: nextKey(), value, label, context } as unknown as PortableTextBlock
}

function internalLinkTo(text: string, item: { _type: 'article' | 'foodProfile'; slug: string }): PortableTextBlock {
  const mark = nextKey()
  const block: PortableTextBlock = {
    _type: 'block',
    _key: nextKey(),
    style: 'normal',
    children: [span(`${text} `, mark)],
    markDefs: [
      { _key: mark, _type: 'internalLink', reference: { _type: item._type, _ref: item.slug } },
    ],
  } as PortableTextBlock
  return block
}

/* ────────────────────────────────────────────────────────────────────────────
   People
   ──────────────────────────────────────────────────────────────────────────── */

const EDITORIAL_AUTHOR: FixturePersonRef = {
  name: 'NHECOF Nutrition Editorial Team',
  qualifications: 'Dietitians and public-health nutrition communicators',
  slug: { _type: 'slug', current: 'nhecof-editorial-team' },
}

const REVIEW_PANEL: FixturePersonRef = {
  name: 'NHECOF Editorial Review Panel',
  qualifications: 'Independent reviewer — Registered Dietitian',
  slug: { _type: 'slug', current: 'nhecof-review-panel' },
}

/* ────────────────────────────────────────────────────────────────────────────
   Categories
   ──────────────────────────────────────────────────────────────────────────── */

const CATEGORIES: FixtureCategory[] = [
  { _id: 'cat-nutrition-basics', title: 'Nutrition Basics', slug: { _type: 'slug', current: 'nutrition-basics' }, kind: 'topic', description: 'Understand the building blocks of a healthy, balanced diet.' },
  { _id: 'cat-nigerian-foods', title: 'Nigerian Foods', slug: { _type: 'slug', current: 'nigerian-foods' }, kind: 'topic', description: 'Practical nutrition guidance rooted in local foods and cooking.' },
  { _id: 'cat-life-stages', title: 'Life Stages', slug: { _type: 'slug', current: 'life-stages' }, kind: 'topic', description: 'Nutrition needs from infancy to older age.' },
  { _id: 'cat-health-conditions', title: 'Health Conditions', slug: { _type: 'slug', current: 'health-conditions' }, kind: 'topic', description: 'Eating well while managing common health conditions.' },
  { _id: 'cat-healthy-living', title: 'Healthy Living', slug: { _type: 'slug', current: 'healthy-living' }, kind: 'topic', description: 'Everyday habits that support long-term wellbeing.' },
  { _id: 'cat-food-safety', title: 'Food Safety', slug: { _type: 'slug', current: 'food-safety' }, kind: 'topic', description: 'Keep food safe from market to kitchen.' },
  { _id: 'cat-type-2-diabetes', title: 'Type 2 Diabetes', slug: { _type: 'slug', current: 'type-2-diabetes' }, kind: 'condition', description: 'Food guidance for people living with or at risk of type 2 diabetes.' },
  { _id: 'cat-anaemia', title: 'Anaemia', slug: { _type: 'slug', current: 'anaemia' }, kind: 'condition', description: 'Iron-rich eating patterns and related care.' },
  { _id: 'cat-vegetables-leaves', title: 'Vegetables & Leaves', slug: { _type: 'slug', current: 'vegetables-leaves' }, kind: 'food-group', description: 'Leafy greens and other vegetables.' },
  { _id: 'cat-legumes-beans', title: 'Legumes & Beans', slug: { _type: 'slug', current: 'legumes-beans' }, kind: 'food-group', description: 'Beans, pulses and their relatives.' },
  { _id: 'cat-grains-starchy', title: 'Grains & Starchy Foods', slug: { _type: 'slug', current: 'grains-starchy' }, kind: 'food-group', description: 'Staples such as grains, tubers and plantains.' },
]

const REFS: Record<string, FixtureCategoryRef> = Object.fromEntries(
  CATEGORIES.map((c) => [c._id, { _id: c._id, title: c.title, slug: c.slug }]),
)

/* ────────────────────────────────────────────────────────────────────────────
   References used across demo content (real public-guidance sources)
   ──────────────────────────────────────────────────────────────────────────── */

const WHAT_WHO_DIET: FixtureCitation = {
  title: 'Healthy diet',
  publisher: 'World Health Organization',
  url: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
  accessedAt: '2026-04-02',
}

const WHO_FIVE_KEYS: FixtureCitation = {
  title: 'Five keys to safer food manual',
  publisher: 'World Health Organization',
  url: 'https://www.who.int/publications/i/item/9789241594639',
  accessedAt: '2026-04-02',
}

const UNICEF_IYCF: FixtureCitation = {
  title: 'Infant and young child feeding',
  publisher: 'UNICEF',
  url: 'https://www.unicef.org/nutrition/infant-and-young-child-feeding',
  accessedAt: '2026-04-02',
}

const WHO_DIABETES: FixtureCitation = {
  title: 'Diabetes',
  publisher: 'World Health Organization',
  url: 'https://www.who.int/news-room/fact-sheets/detail/diabetes',
  accessedAt: '2026-04-02',
}

const WHO_ANAEMIA: FixtureCitation = {
  title: 'Anaemia',
  publisher: 'World Health Organization',
  url: 'https://www.who.int/news-room/fact-sheets/detail/anaemia',
  accessedAt: '2026-04-02',
}

const FAO_WEST_AFRICA_TABLE: FixtureCitation = {
  title: 'FAO/INFOODS Food Composition Table for West Africa',
  publisher: 'Food and Agriculture Organization',
  url: 'https://www.fao.org/infoods/infoods/tables-and-databases/en/',
  accessedAt: '2026-04-02',
}

const CDC_LISTERIA: FixtureCitation = {
  title: 'Preventing Listeriosis',
  publisher: 'U.S. Centers for Disease Control and Prevention',
  url: 'https://www.cdc.gov/listeria/risk-factors/faqs-listeria.html',
  accessedAt: '2026-04-02',
}

/* ────────────────────────────────────────────────────────────────────────────
   Articles
   ──────────────────────────────────────────────────────────────────────────── */

const ARTICLES: FixtureArticle[] = [
  {
    _id: 'article-balanced-nigerian-plate',
    title: 'Building a Balanced Nigerian Plate',
    slug: { _type: 'slug', current: 'balanced-nigerian-plate' },
    summary:
      'A practical, budget-friendly way to think about balance at every Nigerian meal — no expensive "superfoods" required.',
    audiences: ['general'],
    keyTakeaways: [
      'Balance a quarter of your plate staples, a quarter protein, and half vegetables or fruits.',
      'Beans, eggs, fish and leafy greens give you protein without breaking the budget.',
      'Small variety day-to-day matters more than getting every meal "perfect".',
    ],
    body: [
      p('A common worry is that eating well costs too much. In practice, balanced eating in Nigeria can start from the same cheap foods most households already buy — the trick is how they are combined on the plate.'),
      h2('A simple way to think about your plate'),
      p('Imagine the plate divided into three rough parts: about half vegetables or fruits, about a quarter of a staple such as rice, garri, pounded yam, tuwo, or semovita, and about a quarter of a protein food such as beans, fish, eggs, or meat. This mental model makes balance automatic rather than something you count.'),
      callout('tip', 'A local example', 'A plate of jollof rice with plenty of stewed vegetables, a boiled egg, and a side of sliced cucumber and tomatoes fits the pattern without needing any special foods.'),
      h2('Choosing staple foods wisely'),
      p('Staples give energy, so keep them, but notice portion size and pair them with the other groups. Mixing whole options when available — brown rice, whole-wheat bread, unrefined maize — adds fibre and helps you feel full for longer.'),
      h2('Protein on a budget'),
      p('You do not need an expensive protein at every meal. Beans, lentils, groundnuts, eggs, fish, crayfish and chicken all contribute. Rotating them keeps meals interesting and spreads the nutrients you get.'),
      inlineCitation(WHAT_WHO_DIET),
      h2('Fruits and vegetables: every meal counts'),
      p('Leafy greens such as ewedu, ugu, and waterleaf, plus tomatoes, peppers and onions, carry vitamins, minerals and fibre. Aim to include some at each meal rather than saving them for a treat.'),
      keyStat('400 g', 'WHO target: fruits and vegetables per day', 'About five servings across the day — roughly three of vegetables and two of fruit.'),
      h2('Healthy fats and fluids'),
      p('A little palm oil, groundnut oil or olive oil in cooking is fine. Drink enough water, especially in hot weather, and limit sugary drinks to occasional treats.'),
    ],
    references: [WHAT_WHO_DIET],
    relatedContent: [
      { _id: 'food-jute-leaves', title: 'Jute Leaves (Ewedu)', slug: { _type: 'slug', current: 'jute-leaves' }, _type: 'foodProfile' },
      { _id: 'article-safe-food-notes', title: 'Safe Food Handling at Home', slug: { _type: 'slug', current: 'safe-food-handling' }, _type: 'article' },
    ],
    featured: false,
    publishedAt: '2026-03-18',
    lastReviewedAt: '2026-03-18',
    nextReviewAt: '2027-03-18',
    reviewStatus: 'approved',
    author: EDITORIAL_AUTHOR,
    reviewer: REVIEW_PANEL,
    categories: [REFS['cat-nutrition-basics']],
    seo: { metaTitle: 'Building a Balanced Nigerian Plate', metaDescription: 'A practical, budget-friendly way to balance every Nigerian meal.' },
  },
  {
    // Unreviewed draft. Present in the dataset so the review gate is
    // exercised for real: this URL must 404, must not appear in the sitemap,
    // and must never be linked from an archive, search or related-content list.
    _id: 'article-unreviewed-hypertension-draft',
    title: 'Managing High Blood Pressure Through Food (Unreviewed Draft)',
    slug: { _type: 'slug', current: 'unreviewed-hypertension-draft' },
    summary:
      'Draft awaiting nutrition review. Not for publication.',
    audiences: ['general'],
    keyTakeaways: ['This draft has not been reviewed and must not be published.'],
    body: [
      p('Draft content pending nutrition review. Do not publish.'),
    ],
    references: [WHO_DIABETES],
    relatedContent: [],
    featured: false,
    publishedAt: '2026-05-02',
    lastReviewedAt: '2026-05-02',
    nextReviewAt: '2027-05-02',
    reviewStatus: 'draft',
    author: EDITORIAL_AUTHOR,
    reviewer: REVIEW_PANEL,
    categories: [REFS['cat-healthy-living']],
  },
  {
    _id: 'article-first-foods',
    title: 'First Foods: Introducing Solid Foods to Your Baby',
    slug: { _type: 'slug', current: 'introducing-solid-foods' },
    summary:
      'When to start, which foods to try first, and how to build a safe, varied diet for your baby from six months.',
    audiences: ['parents'],
    keyTakeaways: [
      'Start complementary foods at about six months while continuing breast milk.',
      'Begin with soft, iron-rich foods and add variety a little at a time.',
      'Let your baby eat slowly and never leave a baby alone while eating.',
    ],
    body: [
      p('Around six months, breast milk alone can no longer meet a growing baby\u2019s needs. This is the time to begin complementary feeding — small, safe, nutrient-rich foods alongside continued breastfeeding.'),
      h2('When to start'),
      p('Most babies are ready at around six months when they can sit with support, hold their head steady, and open their mouth for food. Starting too early (before four months) or too late (after six months) raises health risks, so use these milestones rather than a fixed calendar alone.'),
      h2('Which foods first'),
      p('Begin with iron-rich soft foods: mashed beans, well-cooked and mashed liver or fish, crushed eggs, or fortified pap enriched with milk or groundnut paste. Add finely chopped vegetables and fruits a few at a time so you can watch for any reactions.'),
      h2('Texture and variety'),
      p('Move gradually from smooth purées to mashed, then finger-sized soft pieces. Variety across the food groups — staple, protein, vegetables, fruit — builds a palate and a balanced diet. Avoid honey before 12 months and foods with added salt or sugar.'),
      callout('important', 'During pregnancy and first foods', 'For pregnancy-related nutrition questions, always speak with a midwife or health worker rather than relying on online advice alone.'),
      h2('Watch for your baby\u2019s cues'),
      p('Feed when your baby seems hungry and stop when they turn away. Mealtimes should be calm and supervised — never leave a baby or toddler alone while eating, and keep small foods cut to safe sizes.'),
    ],
    references: [UNICEF_IYCF],
    relatedContent: [
      { _id: 'article-anaemia-pregnancy', title: 'Managing Anaemia in Pregnancy', slug: { _type: 'slug', current: 'anaemia-in-pregnancy' }, _type: 'article' },
      { _id: 'article-packed-plate', title: 'Building a Balanced Nigerian Plate', slug: { _type: 'slug', current: 'balanced-nigerian-plate' }, _type: 'article' },
    ],
    featured: true,
    publishedAt: '2026-04-10',
    lastReviewedAt: '2026-04-10',
    nextReviewAt: '2027-04-10',
    reviewStatus: 'approved',
    author: EDITORIAL_AUTHOR,
    reviewer: REVIEW_PANEL,
    categories: [REFS['cat-life-stages']],
    seo: { metaTitle: 'First Foods: Introducing Solid Foods to Your Baby', metaDescription: 'When to start, which foods first, and how to build a safe varied diet from six months.' },
  },
  {
    _id: 'article-type-2-diabetes',
    title: 'Eating Well with Type 2 Diabetes',
    slug: { _type: 'slug', current: 'eating-well-type-2-diabetes' },
    summary:
      'Practical, culturally relevant food choices for people living with type 2 diabetes — and what to avoid.',
    audiences: ['adults', 'health-workers'],
    keyTakeaways: [
      'Consistent meals and portion control help steady blood sugar more than any single food.',
      'Pair staples with protein, vegetables and healthy fats.',
      'No "miracle food" or product can replace medical care — follow your care team\u2019s advice.',
    ],
    body: [
      p('Diabetes does not mean eating plain, tasteless food. It means eating consistently and watching portions, with medical care guiding targets. These notes are educational — your clinician knows your specific situation best.'),
      h2('Foods that support steadier blood sugar'),
      p('Fill about half the plate with non-starchy vegetables, a quarter with a staple, and a quarter with protein foods such as fish, beans, eggs or meat. Including protein and fibre slows how quickly carbohydrates are absorbed.'),
      h2('Choosing and portioning staples'),
      p('Keep your usual staples — rice, fufu, garri — but moderate the portion and add vegetables alongside. Whole grains and legumes such as brown beans and lentils digest more slowly than refined versions, so they can be sensible swaps when available.'),
      h2('What to limit'),
      p('Limit sugary drinks, sweets, honey-heavy snacks and excess palm oil. These cause fast blood-sugar rises with little nutritional benefit. Read labels where possible; "sugar-free" claims still deserve caution.'),
      callout('important', 'Cure claims', 'Be wary of products promising to "cure" diabetes. No food or supplement replaces prescribed treatment. Share any product you are considering with your care team first.'),
      h2('When to involve your care team'),
      p('If your blood sugar runs high or low often, if you lose weight without trying, or if you notice numbness in your feet or changes in your vision, tell your doctor or diabetes nurse promptly.'),
    ],
    references: [WHO_DIABETES],
    relatedContent: [
      { _id: 'food-jute-leaves', title: 'Jute Leaves (Ewedu)', slug: { _type: 'slug', current: 'jute-leaves' }, _type: 'foodProfile' },
      { _id: 'article-small-steps', title: 'Small, Sustainable Steps Towards Healthier Living', slug: { _type: 'slug', current: 'healthier-living-steps' }, _type: 'article' },
    ],
    featured: false,
    publishedAt: '2026-02-02',
    lastReviewedAt: '2026-03-05',
    nextReviewAt: '2027-03-05',
    reviewStatus: 'approved',
    author: EDITORIAL_AUTHOR,
    reviewer: REVIEW_PANEL,
    categories: [REFS['cat-health-conditions'], REFS['cat-type-2-diabetes']],
    seo: { metaTitle: 'Eating Well with Type 2 Diabetes', metaDescription: 'Practical, culturally relevant food choices for people living with type 2 diabetes.' },
  },
  {
    _id: 'article-anaemia-pregnancy',
    title: 'Managing Anaemia in Pregnancy: Supporting Iron Through Food',
    slug: { _type: 'slug', current: 'anaemia-in-pregnancy' },
    summary:
      'Iron-rich eating patterns during pregnancy, how to improve absorption, and when to involve your health worker.',
    audiences: ['pregnant'],
    keyTakeaways: [
      'Iron needs rise sharply in pregnancy — food alone may not meet them.',
      'Pair iron-rich foods with vitamin C to improve absorption.',
      'Take iron supplements only as prescribed by your health worker.',
    ],
    body: [
      p('Anaemia in pregnancy is common and treatable, but it matters because iron supports your baby\u2019s growth and your own energy. These food notes support — never replace — the plan your midwife or doctor gives you.'),
      h2('Why iron matters in pregnancy'),
      p('The body\u2019s iron needs roughly double during pregnancy. Even a very good diet may not keep up, which is why routine iron and folic acid supplements are recommended at antenatal visits. Food and supplements work together.'),
      h2('Foods that deliver iron'),
      p('Animal sources such as well-cooked liver, beef, fish and eggs provide iron that the body absorbs easily. Plant sources include beans, groundnuts, leafy greens like ewedu and ugu, and fortified cereals. Practicing moderation with liver is key — liver is very rich in vitamin A, so follow your clinician\u2019s guidance on how often.'),
      h2('Helping your body absorb iron'),
      p('Vitamin C helps plant iron absorb better: add sliced tomatoes, oranges or peppers to meals. Tea and coffee near mealtimes can reduce absorption, so allow a gap between them and iron-rich meals.'),
      callout('warning', 'Supplements and safety', 'Never double your iron dose to "catch up". Taking more than prescribed can be harmful. If tablets cause a strong stomach upset, your health worker can suggest a different form.'),
      h2('Signs that need a health worker'),
      p('Unusual tiredness, breathlessness on light effort, pale lips or palms, dizziness, or cravings for non-food items such as ice or soil can all point to anaemia. Report them at your next antenatal visit so you can be checked.'),
    ],
    references: [WHO_ANAEMIA],
    relatedContent: [
      { _id: 'food-moringa', title: 'Moringa', slug: { _type: 'slug', current: 'moringa' }, _type: 'foodProfile' },
      { _id: 'article-first-foods', title: 'First Foods: Introducing Solid Foods to Your Baby', slug: { _type: 'slug', current: 'introducing-solid-foods' }, _type: 'article' },
    ],
    featured: false,
    publishedAt: '2026-01-20',
    lastReviewedAt: '2026-02-11',
    nextReviewAt: '2027-02-11',
    reviewStatus: 'approved',
    author: EDITORIAL_AUTHOR,
    reviewer: REVIEW_PANEL,
    categories: [REFS['cat-health-conditions'], REFS['cat-anaemia'], REFS['cat-life-stages']],
    seo: { metaTitle: 'Managing Anaemia in Pregnancy', metaDescription: 'Iron-rich eating patterns in pregnancy and when to involve your health worker.' },
  },
  {
    _id: 'article-safe-food-notes',
    title: 'Safe Food Handling at Home',
    slug: { _type: 'slug', current: 'safe-food-handling' },
    summary:
      'Simple habits to keep food safe from the market to your kitchen table — clean, separate, cook, and chill.',
    audiences: ['general'],
    keyTakeaways: [
      'Wash hands, utensils and surfaces before preparing food.',
      'Keep raw meat separate from ready-to-eat foods.',
      'Cook food thoroughly and keep leftovers out of the danger zone.',
    ],
    body: [
      p('Most foodborne illness is preventable with a handful of everyday habits. These mirror the World Health Organization\u2019s five keys to safer food, adapted for Nigerian kitchens.'),
      h2('Clean'),
      p('Wash hands with soap and clean running water before cooking, after handling raw meat, and after using the toilet. Wash knives, boards and surfaces with soap and water, and rinse fresh produce under clean water before cutting.'),
      h2('Separate'),
      p('Use one board for raw meat and a different one for foods eaten without further cooking. Keep raw meat and fish covered and below other food in the refrigerator so juices cannot touch ready-to-eat items.'),
      h2('Cook'),
      p('Cook meat, poultry and fish through so no pink remains and juices run clear. Reheat leftovers until steaming hot all the way through. In areas with frequent power cuts, use your judgment: when in doubt, throw it out.'),
      h2('Chill'),
      p('Perishable foods left at room temperature for more than two hours are risky. Refrigerate leftovers promptly in shallow containers, and remember a full fridge stays colder, longer — a real advantage in heat.'),
      keyStat('2 hours', 'Safe window for perishable food at room temperature', 'Keep cold foods cold and hot foods hot; beyond two hours the risk of bacterial growth rises quickly.'),
    ],
    references: [WHO_FIVE_KEYS, CDC_LISTERIA],
    relatedContent: [
      { _id: 'article-packed-plate', title: 'Building a Balanced Nigerian Plate', slug: { _type: 'slug', current: 'balanced-nigerian-plate' }, _type: 'article' },
    ],
    featured: false,
    publishedAt: '2026-01-08',
    lastReviewedAt: '2026-03-18',
    nextReviewAt: '2027-03-18',
    reviewStatus: 'approved',
    author: EDITORIAL_AUTHOR,
    reviewer: REVIEW_PANEL,
    categories: [REFS['cat-food-safety']],
    seo: { metaTitle: 'Safe Food Handling at Home', metaDescription: 'Clean, separate, cook, chill — simple habits for safer food at home.' },
  },
  {
    _id: 'article-indigenous-vegetables',
    title: 'Why Nigeria\u2019s Indigenous Vegetables Deserve a Place on Your Plate',
    slug: { _type: 'slug', current: 'indigenous-vegetables' },
    summary:
      'Ugu, ewedu, waterleaf and more are affordable, nutritious and versatile. Here is how to eat more of them.',
    audiences: ['general'],
    keyTakeaways: [
      'Indigenous vegetables are often cheaper and fresher than imported greens.',
      'They bring vitamins, minerals and fibre to everyday meals.',
      'Slight wilting does not mean waste — many can be cooked into soups.',
    ],
    body: [
      p('Nigeria\u2019s leaf vegetables — fluted pumpkin (ugu), jute leaves (ewedu), waterleaf, bitterleaf and amaranth among them — are among the most affordable ways to add nutrition to a plate.'),
      h2('What counts as indigenous vegetables'),
      p('These are the leafy greens and vegetables commonly grown and eaten across the country, often sold fresh in local markets at lower prices than imported alternatives. Most are also grown in home gardens.'),
      h2('Beyond the leaves'),
      p('The list includes tomatoes, peppers, onions, garden eggs and okra — all regulars in Nigerian soups and stews. Together they deliver vitamins A and C, potassium, iron and fibre that support immunity, digestion and steady energy.'),
      h2('Simple ways to eat more'),
      p('Fold chopped greens into soups and stews, add extra vegetables to jollof and fried rice, or serve sliced cucumber and garden eggs as a snack. Even one extra serving a day makes a difference over time.'),
      internalLinkTo('Ewedu and other local greens get a full profile in our food guides.', { _type: 'foodProfile', slug: 'jute-leaves' }),
    ],
    references: [WHAT_WHO_DIET],
    relatedContent: [
      { _id: 'food-jute-leaves', title: 'Jute Leaves (Ewedu)', slug: { _type: 'slug', current: 'jute-leaves' }, _type: 'foodProfile' },
      { _id: 'food-moringa', title: 'Moringa', slug: { _type: 'slug', current: 'moringa' }, _type: 'foodProfile' },
    ],
    featured: false,
    publishedAt: '2025-12-10',
    lastReviewedAt: '2026-03-01',
    nextReviewAt: '2027-03-01',
    reviewStatus: 'approved',
    author: EDITORIAL_AUTHOR,
    reviewer: REVIEW_PANEL,
    categories: [REFS['cat-nigerian-foods']],
    seo: { metaTitle: 'Nigeria\u2019s Indigenous Vegetables on Your Plate', metaDescription: 'Ugu, ewedu, waterleaf and more — affordable nutrition for everyday meals.' },
  },
  {
    _id: 'article-healthy-living-steps',
    title: 'Small, Sustainable Steps Towards Healthier Living',
    slug: { _type: 'slug', current: 'healthier-living-steps' },
    summary:
      'Healthier living does not require heroic change. Small, repeatable habits build up quietly over time.',
    audiences: ['young-adults', 'general'],
    keyTakeaways: [
      'Build on habits you already have rather than starting from zero.',
      'Tie new habits to triggers in your daily routine.',
      'Progress beats perfection — a missed day is not a failure.',
    ],
    body: [
      p('Most well-being advice fails because it asks for too much too fast. A more reliable route is to stack small habits onto routines you already keep.'),
      h2('Start with what you already eat'),
      p('Choose one meal you eat almost every day and add one vegetable or swap one sugary drink for water. Repeating a single change builds momentum better than restructuring your whole pantry at once.'),
      h2('Build a routine around movement'),
      p('Ten minutes of brisk walking after lunch, taking the stairs, or dancing to a favourite track — the movement itself matters more than the label on the plan. Consistency over intensity keeps joints and hearts well.'),
      h2('Sleep and stress keep the body steady'),
      p('Regular sleep helps appetite hormones behave and mood stay stable. Keep screens out of the last hour before bed where possible, and protect short breaks during busy days.'),
      h2('Progress beats perfection'),
      p('A missed day is normal; two days can become a pattern. The skill is resuming without shame. Health is a long game, and small honest steps outlast dramatic starts.'),
      callout('tip', 'One change this week', 'Pick the easiest habit on this page and repeat it daily for seven days. Notice how it feels before adding anything else.'),
    ],
    references: [WHAT_WHO_DIET],
    relatedContent: [
      { _id: 'article-packed-plate', title: 'Building a Balanced Nigerian Plate', slug: { _type: 'slug', current: 'balanced-nigerian-plate' }, _type: 'article' },
      { _id: 'food-jute-leaves', title: 'Jute Leaves (Ewedu)', slug: { _type: 'slug', current: 'jute-leaves' }, _type: 'foodProfile' },
    ],
    featured: false,
    publishedAt: '2025-11-12',
    lastReviewedAt: '2026-02-20',
    nextReviewAt: '2027-02-20',
    reviewStatus: 'approved',
    author: EDITORIAL_AUTHOR,
    reviewer: REVIEW_PANEL,
    categories: [REFS['cat-healthy-living']],
    seo: { metaTitle: 'Small, Sustainable Steps Towards Healthier Living', metaDescription: 'Small, repeatable habits that build healthier living over time.' },
  },
]

/* ────────────────────────────────────────────────────────────────────────────
   Food profiles
   ──────────────────────────────────────────────────────────────────────────── */

const FOODS: FixtureFood[] = [
  {
    _id: 'food-moringa',
    title: 'Moringa (Zogale)',
    slug: { _type: 'slug', current: 'moringa' },
    scientificName: 'Moringa oleifera',
    aliases: ['Zogale (Hausa)', 'Ẹwé Ígbálẹ̀ (Yoruba)', 'Odogwu osu (Igbo)'],
    summary:
      'A fast-growing leaf vegetable rich in vitamins A and C, calcium and iron — added to soups, stews and drinks across Nigeria.',
    description: [
      p('Moringa leaves are used fresh or dried across Nigeria — stirred into soups and stews, added to porridge, or made into a powder that can be mixed into drinks and pap.'),
      h3('Common uses'),
      bullet('Fresh leaves cooked into soups, e.g. miyan ganye and mixed vegetable stews.'),
      bullet('Dried, milled leaf powder added to pap, porridge, and drinks.'),
      bullet('Young leaves eaten as a cooked vegetable with staples.'),
    ],
    nutrients: [
      { name: 'Vitamin A', note: 'Good source, especially in fresh leaves' },
      { name: 'Vitamin C', note: 'Reduced by long cooking' },
      { name: 'Iron', note: 'Present in useful amounts' },
      { name: 'Calcium', note: 'Contributes to daily needs' },
    ],
    benefits: [
      p('Moringa may support good nutrition as part of a varied diet:'),
      bullet('Its vitamin C can help the body absorb iron from plant foods eaten in the same meal.'),
      bullet('Vitamin A from leaves supports normal vision and immunity.'),
      bullet('Calcium and iron make it a helpful addition for people who eat few animal products.'),
      inlineCitation(FAO_WEST_AFRICA_TABLE),
    ],
    preparation: [
      p('To get the most from moringa: add leaves near the end of cooking so vitamin C survives, or dry leaves slowly in the shade before milling. A little moringa goes a long way — a tablespoon of leaf powder per porridge or soup is plenty.'),
    ],
    portionContext:
      'A serving is about one cup of cooked leaves (the "vegetables" part of a meal). For dried leaf powder, keep to about one tablespoon per day within a mixed diet.',
    cautions:
      'Leaf powder is concentrated, so large daily amounts are better avoided. Because moringa is rich in vitamin K, people taking blood-thinning medication should check with their clinician before adding it regularly.',
    myths: [
      {
        _type: 'mythFact',
        _key: 'myth-moringa-1',
        myth: 'Moringa cures almost everything.',
        fact: 'No single food cures disease. Moringa is nutritious but works best as part of a varied diet, alongside medical care.',
        source: WHAT_WHO_DIET,
      } as unknown as PortableTextBlock,
    ],
    mealIdeas: [
      bullet('Stir fresh leaves into okro or ewedu-style soup for extra body.'),
      bullet('Blend a teaspoon of leaf powder into pap for breakfast.'),
      bullet('Add leaves to egg sauce or fried rice for a quick vegetable boost.'),
    ],
    categories: [REFS['cat-vegetables-leaves'], REFS['cat-nigerian-foods']],
    references: [FAO_WEST_AFRICA_TABLE],
    featured: false,
    publishedAt: '2026-03-02',
    lastReviewedAt: '2026-03-02',
    nextReviewAt: '2027-03-02',
    reviewStatus: 'approved',
    author: EDITORIAL_AUTHOR,
    reviewer: REVIEW_PANEL,
    seo: { metaTitle: 'Moringa (Zogale) — Nutrition Profile', metaDescription: 'Vitamins A and C, calcium and iron from a familiar Nigerian leaf vegetable.' },
  },
  {
    _id: 'food-jute-leaves',
    title: 'Jute Leaves (Ewedu)',
    slug: { _type: 'slug', current: 'jute-leaves' },
    scientificName: 'Corchorus olitorius',
    aliases: ['Ẹfọ́ tẹ̀tẹ̀ (Yoruba)', 'Rama (Hausa)', 'Ahuhu (Igbo)'],
    summary:
      'The slimy-textured green that powers ewedu soup — a well-loved, low-cost source of vitamins, minerals and fibre.',
    description: [
      p('Jute leaves are pounded or blended into the smooth, mucilaginous liquid that makes ewedu soup, served across the south with amala, eba or rice. They are also cooked into other soups in the north.'),
      h3('Common uses'),
      bullet('Blended and simmered into ewedu soup, often served with amala and assorted or fish.'),
      bullet('Added to other soups and stews for body and flavour.'),
      bullet('Eaten fresh as a cooked vegetable in mixed-leaf dishes.'),
    ],
    nutrients: [
      { name: 'Vitamin A', note: 'Good source as beta-carotene' },
      { name: 'Vitamin C', note: 'Best when cooking time is short' },
      { name: 'Iron', note: 'Useful plant source' },
      { name: 'Fibre', note: 'Supports digestion' },
    ],
    benefits: [
      p('Ewedu may support everyday nutrition without much cost:'),
      bullet('Its beta-carotene supports normal vision and immunity.'),
      bullet('The mucilage and fibre make meals filling and easy on digestion.'),
      bullet('When paired with fish or crayfish sauces, it becomes a balanced, protein-rich meal.'),
      inlineCitation(FAO_WEST_AFRICA_TABLE),
    ],
    preparation: [
      p('Blend or cut the leaves, then cook briefly — over-cooking dulls the colour and reduces vitamin C. Season with stock, pepper and onions, and add fish or meat for protein.'),
    ],
    portionContext:
      'A generous spoonful of ewedu as the vegetable portion of a meal counts as one of your daily vegetable servings. There is no need to force large amounts.',
    cautions:
      'Ewedu is generally well tolerated. As with any leafy vegetable, wash it thoroughly under clean water before cooking. People who need to limit oxalate-rich foods should ask their clinician, as leaves contain oxalates.',
    myths: [
      {
        _type: 'mythFact',
        _key: 'myth-jute-1',
        myth: 'Ewedu has no nutritional value — it is just water and slime.',
        fact: 'Jute leaves are a low-cost vegetable source of vitamin A, vitamin C, iron and fibre. They add real nutrition to a meal.',
        source: FAO_WEST_AFRICA_TABLE,
      } as unknown as PortableTextBlock,
    ],
    mealIdeas: [
      bullet('Serve ewedu with amala or eba and a small portion of fish or assorted meat.'),
      bullet('Stir a spoonful of blended leaves into yam porridge near the end of cooking.'),
      bullet('Use ewedu as the vegetable layer in a rice bowl with beans for a fuller meal.'),
    ],
    categories: [REFS['cat-vegetables-leaves'], REFS['cat-nigerian-foods']],
    references: [FAO_WEST_AFRICA_TABLE],
    featured: true,
    publishedAt: '2026-02-14',
    lastReviewedAt: '2026-03-20',
    nextReviewAt: '2027-03-20',
    reviewStatus: 'approved',
    author: EDITORIAL_AUTHOR,
    reviewer: REVIEW_PANEL,
    seo: { metaTitle: 'Jute Leaves (Ewedu) — Nutrition Profile', metaDescription: 'Vitamin A, vitamin C, iron and fibre from a loved Nigerian leaf vegetable.' },
  },
  {
    _id: 'food-brown-beans',
    title: 'Brown Beans (Ewa)',
    slug: { _type: 'slug', current: 'brown-beans' },
    scientificName: 'Vigna unguiculata',
    aliases: ['Èwà (Yoruba)', 'Wake (Hausa)', 'Agwa (Igbo)'],
    summary:
      'The humble brown bean — a staple protein and fibre source that anchors dishes like moin moin, akara and ewa agoyin.',
    description: [
      p('Brown beans, a type of cowpea, are boiled into stewed beans, milled into moin moin and akara, and served with bread or rice. They are among Nigeria\u2019s most affordable protein foods.'),
      h3('Common uses'),
      bullet('Ewa agoyin — slow-cooked beans with a spicy pepper sauce, served with bread.'),
      bullet('Moin moin — steamed bean pudding, often with fish or egg inside.'),
      bullet('Akara — fried bean cakes, a breakfast staple in many cities.'),
    ],
    nutrients: [
      { name: 'Protein', note: 'Good plant source' },
      { name: 'Fibre', note: 'High, keeps you full' },
      { name: 'Folate', note: 'Important for blood cells' },
      { name: 'Iron', note: 'Absorbed better with vitamin C' },
    ],
    benefits: [
      p('Beans may support everyday nutrition and help manage appetite:'),
      bullet('Protein and fibre together make meals more filling, which can help with weight management.'),
      bullet('Folate in beans supports blood-cell production — relevant during pregnancy.'),
      bullet('A regular bean habit adds affordable, plant-based protein to the diet.'),
      inlineCitation(FAO_WEST_AFRICA_TABLE),
    ],
    preparation: [
      p('Soak beans overnight (or at least several hours) to shorten cooking time and ease digestion. Boil until soft, then season. For akara and moin moin, whipping the milled batter incorporates air for a light texture.'),
    ],
    portionContext:
      'A serving is about three-quarters to one cup of cooked beans — roughly the protein quarter of the plate at a meal.',
    cautions:
      'Pre-soaking and thorough cooking help reduce gas and make beans easier to digest. People managing kidney conditions are often advised to monitor bean portions — follow your clinician\u2019s guidance.',
    myths: [
      {
        _type: 'mythFact',
        _key: 'myth-beans-1',
        myth: 'Beans are "poor man\u2019s food" and not worth eating.',
        fact: 'Beans are a genuinely nutritious source of protein, fibre and folate at a low cost. The dishes build on a strong staple, not a weak one.',
        source: FAO_WEST_AFRICA_TABLE,
      } as unknown as PortableTextBlock,
    ],
    mealIdeas: [
      bullet('Ewa agoyin with a side of fresh vegetables instead of only bread.'),
      bullet('Moin moin with a small side salad for a fuller plate.'),
      bullet('Add cooked beans to porridge or jollof for a protein and fibre boost.'),
    ],
    categories: [REFS['cat-legumes-beans'], REFS['cat-nigerian-foods']],
    references: [FAO_WEST_AFRICA_TABLE],
    featured: false,
    publishedAt: '2026-01-24',
    lastReviewedAt: '2026-02-28',
    nextReviewAt: '2027-02-28',
    reviewStatus: 'approved',
    author: EDITORIAL_AUTHOR,
    reviewer: REVIEW_PANEL,
    seo: { metaTitle: 'Brown Beans (Ewa) — Nutrition Profile', metaDescription: 'Affordable protein and fibre from cowpea-based dishes like ewa, akara and moin moin.' },
  },
  {
    _id: 'food-ripe-plantain',
    title: 'Ripe Plantain',
    slug: { _type: 'slug', current: 'ripe-plantain' },
    scientificName: 'Musa paradisiaca',
    aliases: ['Ọ̀gẹ̀dẹ̀ (Yoruba)', 'Ayaba (Hausa)'],
    summary:
      'Sweet, filling and loved across Nigeria — useful energy for active days when portions are kept sensible.',
    description: [
      p('Ripe plantain is grilled (bole), fried (dodo), boiled, or roasted (boli) across the country. Its sweetness makes it a favourite, and its energy-dense nature means portion awareness helps.'),
      h3('Common uses'),
      bullet('Dodo — pan-fried plantain slices, a near-universal side dish.'),
      bullet('Bole — roasted plantain eaten with groundnut sauce or fish.'),
      bullet('Boiled or mashed plantain for babies and toddlers.'),
    ],
    nutrients: [
      { name: 'Carbohydrate', note: 'Main source of quick energy' },
      { name: 'Vitamin C', note: 'Present in useful amounts' },
      { name: 'Potassium', note: 'Supports heart and muscle function' },
      { name: 'Fibre', note: 'Fills out the meal' },
    ],
    benefits: [
      p('Ripe plantain may support active days and everyday nutrition:'),
      bullet('Its carbohydrate gives quick energy, useful around physical activity.'),
      bullet('Potassium and fibre contribute to normal heart and digestive function.'),
      bullet('Portioned sensibly, it is a more nourishing sweet choice than sugary snacks.'),
      inlineCitation(FAO_WEST_AFRICA_TABLE),
    ],
    preparation: [
      p('Roasting or boiling keeps added fat out; when frying, use a little oil and blot the slices. Pairing plantain with a protein food such as eggs, beans or fish makes a more balanced plate.'),
    ],
    portionContext:
      'A medium-sized plantain (about one-third of a whole, or a handful of dodo slices) counts as a starch portion for a meal.',
    cautions:
      'Because ripe plantain is energy-dense, people managing blood sugar should treat it as part of their carbohydrate budget, alongside their care team\u2019s guidance. Fried dodo adds fat, so moderation matters.',
    myths: [
      {
        _type: 'mythFact',
        _key: 'myth-plantain-1',
        myth: 'Ripe plantain is bad for you because it is sweet.',
        fact: 'The sweetness comes from natural starch turning to sugar. Eaten in sensible portions as part of a meal, it contributes potassium and fibre — a better choice than equivalent refined sweets.',
        source: FAO_WEST_AFRICA_TABLE,
      } as unknown as PortableTextBlock,
    ],
    mealIdeas: [
      bullet('Bole with roasted groundnut and a side of fresh vegetable salad.'),
      bullet('Dodo alongside beans for a balanced low-budget plate.'),
      bullet('Mashed ripe plantain mixed with groundnut paste for young children.'),
    ],
    categories: [REFS['cat-grains-starchy'], REFS['cat-nigerian-foods']],
    references: [FAO_WEST_AFRICA_TABLE],
    featured: false,
    publishedAt: '2025-12-20',
    lastReviewedAt: '2026-03-10',
    nextReviewAt: '2027-03-10',
    reviewStatus: 'approved',
    author: EDITORIAL_AUTHOR,
    reviewer: REVIEW_PANEL,
    seo: { metaTitle: 'Ripe Plantain — Nutrition Profile', metaDescription: 'Quick energy, potassium and fibre — portioned sensibly, a nourishing sweet.' },
  },
]

/* ────────────────────────────────────────────────────────────────────────────
   Outreach (community events) — included in the search index
   ──────────────────────────────────────────────────────────────────────────── */

const OUTREACHES: FixtureOutreach[] = [
  {
    _id: 'outreach-ibadan-case-study',
    title: 'Ibadan Community Nutrition Outreach — Bodija',
    slug: { _type: 'slug', current: 'ibadan-community-nutrition-outreach' },
    theme: 'Maternal and Child Nutrition',
    date: '2025-12-28',
    summary:
      'Community nutrition screening and education day for mothers and caregivers of children under 5 in Bodija, Ibadan, Oyo State.',
    images: [],
    status: 'completed',
    location: { community: 'Bodija', lga: 'Ibadan North', state: 'Oyo' },
    venue: 'Bodija Community Hall',
    verifiedByOutreachManager: false,
  },
  {
    _id: 'outreach-surulere-lagos',
    title: 'Community Nutrition Screening — Surulere, Lagos',
    slug: { _type: 'slug', current: 'nutrition-screening-surulere-lagos' },
    theme: 'Nutrition screening',
    date: '2026-02-14',
    summary:
      'Free height, weight and blood-pressure checks with one-on-one nutrition guidance for residents of Surulere.',
    images: [],
    status: 'completed',
    location: { state: 'Lagos', lga: 'Surulere' },
    verifiedByOutreachManager: false,
  },
  {
    _id: 'outreach-aba-market',
    title: 'Food-Safety Workshop for Market Traders — Aba, Abia',
    slug: { _type: 'slug', current: 'food-safety-workshop-aba' },
    theme: 'Food safety',
    date: '2026-01-17',
    summary:
      'Hands-on session on clean water, safe storage and handling for traders selling at Aba markets.',
    images: [],
    status: 'completed',
    location: { state: 'Abia', lga: 'Aba North' },
    verifiedByOutreachManager: false,
  },
  {
    _id: 'outreach-kano-pregnancy',
    title: 'Pregnancy Nutrition Talk — Kano',
    slug: { _type: 'slug', current: 'pregnancy-nutrition-talk-kano' },
    theme: 'Maternal nutrition',
    date: '2026-05-16',
    summary:
      'An upcoming community talk on iron-rich foods and antenatal nutrition for expectant mothers in Kano.',
    images: [],
    status: 'upcoming',
    location: { state: 'Kano', lga: 'Kano Municipal' },
  },
]

/* ────────────────────────────────────────────────────────────────────────────
   Daily quotes — only approved + active quotes are ever eligible (plan §7.4).
   Scheduled entries use start/end dates; entries without a start are the
   deterministic evergreen pool.
   ──────────────────────────────────────────────────────────────────────────── */

const QUOTES: FixtureQuote[] = [
  {
    _id: 'quote-wwfm-nutrition-basics',
    text: 'Good nutrition is the foundation of good health — a balanced diet supports every part of your body and mind.',
    attribution: 'NHECOF',
    topic: 'nutrition',
    reviewStatus: 'approved',
    sharingPermitted: true,
  },
  {
    _id: 'quote-ivegetables-everyday',
    text: 'Make vegetables and fruits part of every meal. In Nigeria, amaranth, jute leaves, carrots and pawpaw are affordable ways to add vitamins and fibre daily.',
    attribution: 'NHECOF',
    topic: 'child-nutrition',
    reviewStatus: 'approved',
    sharingPermitted: true,
  },
  {
    _id: 'quote-who-healthy-diet',
    text: 'A healthy diet protects you against malnutrition in all its forms, as well as noncommunicable diseases.',
    attribution: 'World Health Organization',
    sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
    topic: 'healthy-living',
    reviewStatus: 'approved',
    sharingPermitted: true,
  },
  {
    _id: 'quote-wwfm-food-safety-clean',
    text: 'Clean hands, clean surfaces and safe water are the first line of defence against foodborne illness.',
    attribution: 'NHECOF',
    topic: 'food-safety',
    reviewStatus: 'approved',
    sharingPermitted: true,
  },
  {
    _id: 'quote-whobreastfeeding',
    text: 'Breastfeeding all babies for the first two years of life, with exclusive breastfeeding for the first six months, is the best possible start in life.',
    attribution: 'WHO / UNICEF',
    sourceUrl: 'https://www.who.int/tools/elena/interventions/breastfeeding',
    topic: 'child-nutrition',
    reviewStatus: 'approved',
    sharingPermitted: true,
  },
  {
    _id: 'quote-wwfm-maternal-iron',
    text: 'During pregnancy, iron-rich foods such as brown beans, liver and leafy greens help protect both mother and baby from anaemia.',
    attribution: 'NHECOF',
    topic: 'maternal-health',
    reviewStatus: 'approved',
    sharingPermitted: false,
  },
  {
    _id: 'quote-unapproved-does-not-appear',
    text: 'Draft quote that must never be shown because it has not been approved.',
    attribution: 'NHECOF',
    topic: 'nutrition',
    reviewStatus: 'approved',
    active: false,
    sharingPermitted: false,
  },
]

/* ────────────────────────────────────────────────────────────────────────────
   Resources archive — hosted files + external links. In fixture mode the
   hosted files resolve under /public so downloads work without JavaScript.
   ──────────────────────────────────────────────────────────────────────────── */

const RESOURCES: FixtureResource[] = [
  {
    _id: 'resource-portion-guide',
    title: 'A Practical Guide to Food Portions for Nigerian Families',
    slug: { _type: 'slug', current: 'portions-guide-nigerian-families' },
    description:
      'Everyday portion guidance for adults and children using common Nigerian household measures — cups, bowls and spoons.',
    type: 'guide',
    file: { file: '/resources/sample-portion-guide.pdf', extension: 'pdf', sizeBytes: 210_400 },
    language: 'en',
    audiences: ['general', 'parents'],
    categories: [{ _id: 'cat-nutrition-basics', title: 'Nutrition Basics', slug: { _type: 'slug', current: 'nutrition-basics' } }],
    publishedAt: '2025-08-12T09:00:00Z',
  },
  {
    _id: 'resource-anaemia-infographic',
    title: 'Iron-Rich Foods at a Glance',
    slug: { _type: 'slug', current: 'iron-rich-foods-glance' },
    description:
      'A quick-look colour guide to iron-rich foods in Nigerian markets and how to pair them for better absorption.',
    type: 'infographic',
    file: { externalUrl: 'https://www.who.int/news-room/fact-sheets/detail/anaemia', extension: 'html' },
    language: 'en',
    audiences: ['general', 'pregnant', 'parents'],
    categories: [{ _id: 'cat-anaemia', title: 'Anaemia', slug: { _type: 'slug', current: 'anaemia' } }],
    publishedAt: '2025-09-03T09:00:00Z',
  },
  {
    _id: 'resource-safe-handling-poster',
    title: 'Keep Food Safe: Market to Kitchen',
    slug: { _type: 'slug', current: 'keep-food-safe-market-kitchen' },
    description:
      'Five practical steps for washing, storing and cooking food safely at home — a poster for community halls and waiting rooms.',
    type: 'poster',
    file: { externalUrl: 'https://www.who.int/news-room/fact-sheets/detail/food-safety', extension: 'html' },
    language: 'en',
    audiences: ['general', 'schools'],
    categories: [{ _id: 'cat-food-safety', title: 'Food Safety', slug: { _type: 'slug', current: 'food-safety' } }],
    publishedAt: '2025-10-20T09:00:00Z',
  },
  {
    _id: 'resource-breastfeeding-report',
    title: 'Breastfeeding in Nigeria: What the Evidence Says',
    slug: { _type: 'slug', current: 'breastfeeding-nigeria-evidence' },
    description:
      'A short evidence summary on breastfeeding practices in Nigeria, drawing on WHO and UNICEF public guidance.',
    type: 'report',
    file: { externalUrl: 'https://www.who.int/tools/elena/interventions/breastfeeding', extension: 'html' },
    language: 'en',
    audiences: ['parents', 'health-workers'],
    categories: [{ _id: 'cat-life-stages', title: 'Life Stages', slug: { _type: 'slug', current: 'life-stages' } }],
    publishedAt: '2025-11-07T09:00:00Z',
  },
  {
    _id: 'resource-safe-food-hausa-factsheet',
    title: 'Rabuwar Abinci: Facts About Safe Food Handling (Hausa)',
    slug: { _type: 'slug', current: 'safe-food-handling-hausa' },
    description:
      'A Hausa-language fact sheet on cleaning, separating, cooking and chilling food at home.',
    type: 'fact-sheet',
    file: { externalUrl: 'https://www.who.int/news-room/fact-sheets/detail/food-safety', extension: 'html' },
    language: 'ha',
    audiences: ['general'],
    categories: [{ _id: 'cat-food-safety', title: 'Food Safety', slug: { _type: 'slug', current: 'food-safety' } }],
    publishedAt: '2026-01-15T09:00:00Z',
  },
]

/* ────────────────────────────────────────────────────────────────────────────
   Impact data (verified records only). Empty until real figures exist in
   Sanity — NO invented numbers, per plan §6.7.
   ──────────────────────────────────────────────────────────────────────────── */

const IMPACT_METRICS: FixtureImpactMetric[] = []

const MILESTONES: FixtureMilestone[] = []

/* ────────────────────────────────────────────────────────────────────────────
   Getters
   ──────────────────────────────────────────────────────────────────────────── */

export function fixtureCategories(): FixtureCategory[] {
  return CATEGORIES.map((c) => ({ ...c }))
}

export function fixtureArticles(): FixtureArticle[] {
  return ARTICLES.map((a) => ({ ...a }))
}

export function fixtureFoods(): FixtureFood[] {
  return FOODS.map((f) => ({ ...f }))
}

export function fixtureOutreaches(): FixtureOutreach[] {
  return OUTREACHES.map((o) => ({ ...o }))
}

export function fixtureImpactMetrics(): FixtureImpactMetric[] {
  return IMPACT_METRICS.map((m) => ({ ...m }))
}

export function fixtureMilestones(): FixtureMilestone[] {
  return MILESTONES.map((m) => ({ ...m }))
}

export function fixtureQuotes(): FixtureQuote[] {
  return QUOTES.map((q) => ({ ...q }))
}

export function fixtureResources(): FixtureResource[] {
  return RESOURCES.map((r) => ({ ...r }))
}

export function fixtureTopicCounts(): Array<{ category: FixtureCategory; count: number }> {
  const byCategory = new Map<string, number>()
  for (const article of ARTICLES) {
    for (const cat of article.categories) {
      const kind = CATEGORIES.find((c) => c._id === cat._id)?.kind
      if (kind === 'topic') byCategory.set(cat._id, (byCategory.get(cat._id) ?? 0) + 1)
    }
  }
  for (const food of FOODS) {
    for (const cat of food.categories) {
      const kind = CATEGORIES.find((c) => c._id === cat._id)?.kind
      if (kind === 'topic') byCategory.set(cat._id, (byCategory.get(cat._id) ?? 0) + 1)
    }
  }
  return CATEGORIES.filter((c) => c.kind === 'topic')
    .map((category) => ({ category, count: byCategory.get(category._id) ?? 0 }))
    .sort((a, b) => a.category.title.localeCompare(b.category.title))
}