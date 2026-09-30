import { defineField, defineType } from 'sanity'

export const person = defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
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
      name: 'role',
      title: 'Role at NHECOF',
      type: 'string',
      options: {
        list: [
          { title: 'Founder', value: 'founder' },
          { title: 'Team Member', value: 'team' },
          { title: 'Adviser', value: 'adviser' },
          { title: 'Writer', value: 'writer' },
          { title: 'Reviewer', value: 'reviewer' },
          { title: 'Volunteer', value: 'volunteer' },
          { title: 'Outreach Manager', value: 'outreach-manager' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'qualifications',
      title: 'Qualifications',
      type: 'string',
      description: 'Professional qualifications or relevant credentials',
    }),
    defineField({
      name: 'specialisation',
      title: 'Specialisation',
      type: 'string',
      description: 'Area of expertise (e.g. "Paediatric Nutrition")',
    }),
    defineField({
      name: 'photo',
      title: 'Photo',
      type: 'nhecofImage',
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'portableText',
    }),
    defineField({
      name: 'contact',
      title: 'Contact',
      type: 'contactDetails',
    }),
    defineField({
      name: 'canReview',
      title: 'Can Act as Reviewer',
      type: 'boolean',
      initialValue: false,
      description: 'Can this person review health content for publication?',
    }),
    defineField({
      name: 'isFounder',
      title: 'NHECOF Founder',
      type: 'boolean',
      initialValue: false,
      description: 'Mark the founder so they appear in the "Our Founder" section of the About page.',
    }),
    defineField({
      name: 'founderStatement',
      title: 'Founder Statement',
      type: 'text',
      rows: 4,
      description: 'Pull-quote shown in the founder section of the About page.',
      hidden: ({ parent }) => !parent?.isFounder,
    }),
    defineField({
      name: 'founderMotivation',
      title: 'Founding Motivation',
      type: 'text',
      rows: 4,
      description: 'A short explanation of why NHECOF was founded.',
      hidden: ({ parent }) => !parent?.isFounder,
    }),
    defineField({
      name: 'professionalLinks',
      title: 'Professional Links',
      type: 'array',
      description: 'One or more professional profiles (e.g. LinkedIn, university profile).',
      of: [
        {
          type: 'object',
          name: 'professionalLink',
          title: 'Professional Link',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'url',
              title: 'URL',
              type: 'url',
              validation: (r) => r.required(),
            }),
          ],
        },
      ],
      hidden: ({ parent }) => !parent?.isFounder,
    }),
  ],
  preview: {
    select: { name: 'name', role: 'role', qualifications: 'qualifications', media: 'photo' },
    prepare({ name, role, qualifications, media }) {
      const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1).replace('-', ' ') : ''
      return {
        title: name || 'Unnamed',
        subtitle: [roleLabel, qualifications].filter(Boolean).join(' — '),
        media,
      }
    },
  },
})
