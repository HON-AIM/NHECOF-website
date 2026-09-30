import { defineField, defineType } from 'sanity'

export const siteSettings = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'organisationName',
      title: 'Organisation Name',
      type: 'string',
      initialValue: 'NutriHealth Education and Community Outreach Foundation',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'tagline',
      title: 'Tagline',
      type: 'string',
      description: 'Short organisation tagline',
    }),
    defineField({
      name: 'contact',
      title: 'Contact Details',
      type: 'contactDetails',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        defineField({ name: 'facebook', title: 'Facebook', type: 'url' }),
        defineField({ name: 'twitter', title: 'X / Twitter', type: 'url' }),
        defineField({ name: 'instagram', title: 'Instagram', type: 'url' }),
        defineField({ name: 'linkedin', title: 'LinkedIn', type: 'url' }),
        defineField({ name: 'youtube', title: 'YouTube', type: 'url' }),
        defineField({ name: 'whatsapp', title: 'WhatsApp', type: 'url' }),
      ],
      options: { collapsible: true, collapsed: true },
    }),
    defineField({
      name: 'defaultSeo',
      title: 'Default SEO',
      type: 'seo',
      description: 'Fallback SEO values used when a page does not set its own',
    }),
    defineField({
      name: 'medicalDisclaimer',
      title: 'Medical Disclaimer Text',
      type: 'text',
      rows: 4,
      description: 'Standard disclaimer shown on health content pages',
    }),
    defineField({
      name: 'editorialPolicy',
      title: 'Editorial Policy',
      type: 'text',
      rows: 6,
      description: 'NHECOF content standards and review process summary',
    }),
    defineField({
      name: 'registration',
      title: 'Registration / Governance',
      type: 'object',
      description: 'Only shown on the About page if provided. Leave empty to hide the governance block.',
      fields: [
        defineField({ name: 'body', title: 'Registration Body', type: 'string' }),
        defineField({ name: 'number', title: 'Registration / RC Number', type: 'string' }),
        defineField({ name: 'year', title: 'Year of Registration', type: 'string' }),
      ],
      options: { collapsible: true, collapsed: true },
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
