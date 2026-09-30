import { defineField, defineType } from 'sanity'

export const partner = defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Organisation Name',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'name', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Logo',
      type: 'nhecofImage',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'type',
      title: 'Partner Type',
      type: 'string',
      options: {
        list: [
          { title: 'NGO', value: 'ngo' },
          { title: 'Government Agency', value: 'government' },
          { title: 'Corporate', value: 'corporate' },
          { title: 'Academic', value: 'academic' },
          { title: 'Community Organisation', value: 'community' },
          { title: 'Other', value: 'other' },
        ],
      },
    }),
    defineField({
      name: 'contact',
      title: 'Contact',
      type: 'contactDetails',
    }),
  ],
  preview: {
    select: { name: 'name', type: 'type', media: 'logo' },
    prepare({ name, type, media }) {
      const typeLabel = type ? type.charAt(0).toUpperCase() + type.slice(1) : ''
      return { title: name || 'Unnamed Partner', subtitle: typeLabel, media }
    },
  },
})
