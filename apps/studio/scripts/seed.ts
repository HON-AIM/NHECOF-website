#!/usr/bin/env node

/**
 * Seed script for NHECOF Sanity Studio.
 *
 * Inserts clearly labelled SAMPLE content into a separate `development` dataset.
 * This script REFUSES to run against `production`.
 *
 * Usage (from project root):
 *   pnpm seed
 *
 * Or from apps/studio:
 *   pnpm seed
 *
 * Requires:
 *   SANITY_STUDIO_PROJECT_ID and SANITY_STUDIO_DATASET environment variables
 *   or .env.local in apps/studio with those values.
 */

import { createClient } from '@sanity/client'
import dotenv from 'dotenv'
import { resolve } from 'path'

// Load env from studio directory
dotenv.config({ path: resolve(__dirname, '../.env.local') })
dotenv.config({ path: resolve(__dirname, '../.env') })

const SANITY_PROJECT_ID = process.env.SANITY_STUDIO_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID
const SANITY_DATASET = process.env.SANITY_STUDIO_DATASET || process.env.NEXT_PUBLIC_SANITY_DATASET || 'development'

// ── Safety check ──────────────────────────────────────────────────────────────
if (SANITY_DATASET === 'production') {
  console.error(
    '\n❌ REFUSING TO SEED: This script will not run against the production dataset.\n' +
    '   Set SANITY_STUDIO_DATASET=development or leave it unset to seed the dev dataset.\n',
  )
  process.exit(1)
}

if (!SANITY_PROJECT_ID) {
  console.error(
    '\n❌ Missing SANITY_STUDIO_PROJECT_ID.\n' +
    '   Set it in your .env.local or as an environment variable.\n',
  )
  process.exit(1)
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: '2025-01-01',
  token: process.env.SANITY_AUTH_TOKEN,
  useCdn: false,
})

const SAMPLE_PREFIX = 'SAMPLE — '

// ── Helpers ───────────────────────────────────────────────────────────────────
async function createIfNotExists(doc: {
  _type: string
  _id: string
  title?: string
  [key: string]: unknown
}) {
  try {
    await client.createIfNotExists(doc)
    console.log(`  ✓ ${doc._type}: ${doc.title || doc._id}`)
  } catch (err) {
    console.error(`  ✗ ${doc._type}: ${doc.title || doc._id} — ${err}`)
  }
}

// ── Seed data ─────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`\n🌱 Seeding dataset "${SANITY_DATASET}" on project ${SANITY_PROJECT_ID}\n`)

  // ── Categories ────────────────────────────────────────────────────────────
  console.log('Creating categories...')
  await createIfNotExists({
    _type: 'category',
    _id: 'cat-nutrition-basics',
    title: `${SAMPLE_PREFIX}Nutrition Basics`,
    slug: { _type: 'slug', current: 'nutrition-basics' },
    kind: 'topic',
    description: 'Fundamental nutrition concepts',
  })
  await createIfNotExists({
    _type: 'category',
    _id: 'cat-nigerian-foods',
    title: `${SAMPLE_PREFIX}Nigerian Foods`,
    slug: { _type: 'slug', current: 'nigerian-foods' },
    kind: 'topic',
    description: 'Information about traditional Nigerian foods',
  })
  await createIfNotExists({
    _type: 'category',
    _id: 'cat-tag-weaning',
    title: `${SAMPLE_PREFIX}Weaning`,
    slug: { _type: 'slug', current: 'weaning' },
    kind: 'tag',
    description: 'Complementary feeding for infants',
  })

  // ── People ────────────────────────────────────────────────────────────────
  console.log('\nCreating people...')
  await createIfNotExists({
    _type: 'person',
    _id: 'person-sample-author',
    name: `${SAMPLE_PREFIX}Dr. Amina Bello`,
    slug: { _type: 'slug', current: 'dr-amina-bello' },
    role: 'writer',
    qualifications: 'PhD Nutrition Science, University of Ibadan',
    specialisation: 'Maternal and Child Nutrition',
    canReview: false,
  })
  await createIfNotExists({
    _type: 'person',
    _id: 'person-sample-reviewer',
    name: `${SAMPLE_PREFIX}Prof. Chukwuma Okafor`,
    slug: { _type: 'slug', current: 'prof-chukwuma-okafor' },
    role: 'reviewer',
    qualifications: 'MD, PhD, FNMCN',
    specialisation: 'Public Health Nutrition',
    canReview: true,
  })

  // ── Quote ─────────────────────────────────────────────────────────────────
  console.log('\nCreating quotes...')
  await createIfNotExists({
    _type: 'quote',
    _id: 'quote-sample-1',
    text: `${SAMPLE_PREFIX}Good nutrition is the foundation of a healthy life. Start with what is on your plate today.`,
    attribution: 'NHECOF',
    topic: 'nutrition',
    active: true,
    sharingPermitted: true,
  })

  // ── Article ───────────────────────────────────────────────────────────────
  console.log('\nCreating articles...')
  await createIfNotExists({
    _type: 'article',
    _id: 'article-sample-breastfeeding',
    title: `${SAMPLE_PREFIX}Understanding Exclusive Breastfeeding`,
    slug: { _type: 'slug', current: 'sample-understanding-exclusive-breastfeeding' },
    summary: `${SAMPLE_PREFIX}A brief guide to exclusive breastfeeding for the first six months, based on WHO recommendations.`,
    author: { _type: 'reference', _ref: 'person-sample-author' },
    reviewer: { _type: 'reference', _ref: 'person-sample-reviewer' },
    categories: [{ _type: 'reference', _ref: 'cat-nutrition-basics' }],
    audiences: ['parents', 'general'],
    keyTakeaways: [
      `${SAMPLE_PREFIX}Breast milk provides all the nutrition a baby needs for the first six months.`,
      `${SAMPLE_PREFIX}Exclusive breastfeeding reduces the risk of infections and diarrhoea.`,
    ],
    body: [
      {
        _type: 'block',
        _key: 'block1',
        style: 'h2',
        children: [{ _type: 'span', _key: 'span1', text: 'What is Exclusive Breastfeeding?' }],
      },
      {
        _type: 'block',
        _key: 'block2',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'span2',
            text: `${SAMPLE_PREFIX}Exclusive breastfeeding means giving a baby only breast milk — no water, no formula, no other liquids or固体 for the first six months of life. The World Health Organization recommends exclusive breastfeeding as the optimal way to feed newborns.`,
          },
        ],
      },
      {
        _type: 'block',
        _key: 'block3',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'span3',
            text: `${SAMPLE_PREFIX}After six months, complementary foods should be introduced while breastfeeding continues for up to two years or beyond.`,
          },
        ],
      },
    ],
    references: [
      {
        _type: 'citation',
        _key: 'ref1',
        title: 'WHO Infant and Young Child Feeding Guidelines',
        publisher: 'World Health Organization',
        url: 'https://www.who.int/health-topics/complementary-feeding',
      },
    ],
    publishedAt: '2025-06-15T10:00:00Z',
    lastReviewedAt: '2025-06-14T10:00:00Z',
    nextReviewAt: '2026-06-15',
    reviewStatus: 'approved',
    featured: false,
  })

  // ── Food Profile ──────────────────────────────────────────────────────────
  console.log('\nCreating food profiles...')
  await createIfNotExists({
    _type: 'foodProfile',
    _id: 'food-sample-millet',
    title: `${SAMPLE_PREFIX}Millet`,
    scientificName: 'Pennisetum glaucum',
    slug: { _type: 'slug', current: 'sample-millet' },
    aliases: ['Millet grain', 'Bajra', 'Baale (Yoruba)'],
    summary: `${SAMPLE_PREFIX}A drought-resistant cereal grain widely cultivated in Northern Nigeria, rich in iron, fibre and B vitamins.`,
    description: [
      {
        _type: 'block',
        _key: 'fp-block1',
        style: 'normal',
        children: [
          {
            _type: 'span',
            _key: 'fp-span1',
            text: `${SAMPLE_PREFIX}Millet is one of the most important cereal crops in Nigeria, particularly in the northern regions. It is used to prepare tuwo, kunu, and various porridges.`,
          },
        ],
      },
    ],
    nutrients: [
      { _type: 'object', _key: 'n1', name: 'Iron', amount: '3.0 mg per 100g', note: 'Important for preventing anaemia' },
      { _type: 'object', _key: 'n2', name: 'Fibre', amount: '8.5 g per 100g', note: 'Supports digestive health' },
      { _type: 'object', _key: 'n3', name: 'Protein', amount: '11.0 g per 100g', note: 'Good plant protein source' },
    ],
    cautions: `${SAMPLE_PREFIX}People with coeliac disease should verify that millet is processed in a gluten-free facility. Millet contains goitrogens which may affect thyroid function in large quantities.`,
    author: { _type: 'reference', _ref: 'person-sample-author' },
    reviewer: { _type: 'reference', _ref: 'person-sample-reviewer' },
    references: [
      {
        _type: 'citation',
        _key: 'fp-ref1',
        title: 'Nutritional Composition of Nigerian Foods',
        publisher: 'Federal Institute of Industrial Research',
      },
    ],
    publishedAt: '2025-07-01T10:00:00Z',
    lastReviewedAt: '2025-06-30T10:00:00Z',
    nextReviewAt: '2026-07-01',
    reviewStatus: 'approved',
  })

  // ── Outreach ──────────────────────────────────────────────────────────────
  console.log('\nCreating outreach records...')
  await createIfNotExists({
    _type: 'outreach',
    _id: 'outreach-sample-ibadan',
    title: `${SAMPLE_PREFIX}Ibadan Community Nutrition Outreach`,
    slug: { _type: 'slug', current: 'sample-ibadan-community-nutrition-outreach' },
    theme: 'Maternal and Child Nutrition',
    date: '2025-12-28',
    location: {
      _type: 'location',
      community: 'Bodija',
      lga: 'Ibadan North',
      state: 'Oyo',
    },
    summary: `${SAMPLE_PREFIX}Community nutrition screening and education event targeting mothers and caregivers of children under 5 in Bodija, Ibadan.`,
    targetPopulation: 'Mothers and caregivers of children under 5',
    attendance: 85,
    screened: 42,
    results: [
      {
        _type: 'impactResult',
        _key: 'result1',
        label: 'People screened',
        value: 42,
      },
      {
        _type: 'impactResult',
        _key: 'result2',
        label: 'Children assessed',
        value: 28,
      },
    ],
    status: 'completed',
    verifiedByOutreachManager: true,
  })

  // ── Program ───────────────────────────────────────────────────────────────
  console.log('\nCreating programmes...')
  await createIfNotExists({
    _type: 'program',
    _id: 'program-nutrition-education',
    title: `${SAMPLE_PREFIX}Nutrition Education`,
    slug: { _type: 'slug', current: 'sample-nutrition-education' },
    summary: `${SAMPLE_PREFIX}Community-based nutrition education programmes across Nigerian communities.`,
    order: 1,
  })

  // ── Impact Metric ─────────────────────────────────────────────────────────
  console.log('\nCreating impact metrics...')
  await createIfNotExists({
    _type: 'impactMetric',
    _id: 'metric-sample-people-reached',
    label: `${SAMPLE_PREFIX}People Reached`,
    value: 600,
    asOf: '2025-12-31',
    basis: 'manual',
    verifiedBy: 'Content Manager',
    evidenceNote: `${SAMPLE_PREFIX}Aggregated from outreach attendance records for 2024-2025. Pending full reconciliation.`,
    unit: 'people',
  })

  // ── Daily Quotes ──────────────────────────────────────────────────────────
  console.log('\nCreating daily quotes...')
  await createIfNotExists({
    _type: 'quote',
    _id: 'quote-sample-healthy-diet',
    text: `${SAMPLE_PREFIX}A healthy diet protects you against malnutrition in all its forms, as well as noncommunicable diseases.`,
    attribution: 'World Health Organization',
    sourceUrl: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
    topic: 'healthy-living',
    active: true,
    reviewStatus: 'approved',
    sharingPermitted: true,
  })
  await createIfNotExists({
    _type: 'quote',
    _id: 'quote-sample-vegetables',
    text: `${SAMPLE_PREFIX}Make vegetables and fruits part of every meal — amaranth, jute leaves, carrots and pawpaw are affordable ways to add vitamins and fibre daily.`,
    attribution: 'NHECOF',
    topic: 'nutrition',
    active: true,
    reviewStatus: 'approved',
    sharingPermitted: true,
  })
  await createIfNotExists({
    _type: 'quote',
    _id: 'quote-sample-unreviewed',
    text: `${SAMPLE_PREFIX}This quote must never appear because it has not been approved.`,
    attribution: 'NHECOF',
    topic: 'nutrition',
    active: true,
    reviewStatus: 'draft',
    sharingPermitted: false,
  })

  // ── Resources ─────────────────────────────────────────────────────────────
  console.log('\nCreating resources...')
  await createIfNotExists({
    _type: 'resource',
    _id: 'resource-sample-portions',
    title: `${SAMPLE_PREFIX}A Practical Guide to Food Portions for Nigerian Families`,
    slug: { _type: 'slug', current: 'sample-portions-guide-nigerian-families' },
    description: `${SAMPLE_PREFIX}Everyday portion guidance for adults and children using common Nigerian household measures.`,
    type: 'guide',
    externalUrl: 'https://www.who.int/news-room/fact-sheets/detail/healthy-diet',
    language: 'en',
    audiences: ['general', 'parents'],
    categories: [{ _type: 'reference', _ref: 'cat-nutrition-basics' }],
    publishedAt: '2025-08-12T09:00:00Z',
  })
  await createIfNotExists({
    _type: 'resource',
    _id: 'resource-sample-anaemia',
    title: `${SAMPLE_PREFIX}Iron-Rich Foods at a Glance`,
    slug: { _type: 'slug', current: 'sample-iron-rich-foods-glance' },
    description: `${SAMPLE_PREFIX}A quick-look guide to iron-rich foods in Nigerian markets and how to pair them for better absorption.`,
    type: 'infographic',
    externalUrl: 'https://www.who.int/news-room/fact-sheets/detail/anaemia',
    language: 'en',
    audiences: ['general', 'pregnant'],
    categories: [{ _type: 'reference', _ref: 'cat-tag-weaning' }],
    publishedAt: '2025-09-03T09:00:00Z',
  })

  // ── Site Settings ─────────────────────────────────────────────────────────
  console.log('\nCreating site settings...')
  await createIfNotExists({
    _type: 'siteSettings',
    _id: 'siteSettings',
    organisationName: 'NutriHealth Education and Community Outreach Foundation',
    tagline: 'Making reliable nutrition knowledge accessible to Nigerian communities',
    medicalDisclaimer: `${SAMPLE_PREFIX}The information provided on this website is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.`,
  })

  // ── Homepage ──────────────────────────────────────────────────────────────
  console.log('\nCreating homepage...')
  await createIfNotExists({
    _type: 'homepage',
    _id: 'homepage',
    headline: `${SAMPLE_PREFIX}Reliable Nutrition Knowledge for Nigerian Communities`,
    subheadline: `${SAMPLE_PREFIX}NHECOF provides evidence-based nutrition education and community health outreach across Nigeria.`,
    primaryCta: {
      _type: 'cta',
      label: 'Explore Nutrition Hub',
      url: '/nutrition',
      variant: 'primary',
    },
    secondaryCta: {
      _type: 'cta',
      label: 'Request an Outreach',
      url: '/request-an-outreach',
      variant: 'outline',
    },
  })

  console.log('\n✅ Seeding complete!\n')
}

seed().catch((err) => {
  console.error('\n❌ Seed failed:', err)
  process.exit(1)
})
