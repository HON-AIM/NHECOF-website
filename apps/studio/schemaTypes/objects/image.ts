import { defineField, defineType } from 'sanity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PreviewProps = Record<string, any>

export const image = defineType({
  name: 'nhecofImage',
  title: 'Image',
  type: 'image',
  options: { hotspot: true },
  fields: [
    defineField({
      name: 'alt',
      title: 'Alternative Text',
      type: 'string',
      description:
        'Describes the image for screen readers. Leave empty only if the image is purely decorative.',
      validation: (r) =>
        r.custom((val, ctx) => {
          const doc = ctx.parent as Record<string, unknown>
          if (doc?.decorative) return true
          if (!val || val.trim() === '') return 'Alt text is required unless the image is marked as decorative'
          return true
        }),
    }),
    defineField({
      name: 'decorative',
      title: 'Decorative Image',
      type: 'boolean',
      description:
        'Mark true if this image is purely decorative and conveys no information. Alt text will be omitted.',
      initialValue: false,
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
      description: 'Visible caption shown below the image',
    }),
    defineField({
      name: 'credit',
      title: 'Credit / Attribution',
      type: 'string',
      description: 'Photographer, source or "NHECOF"',
    }),
    defineField({
      name: 'consentStatus',
      title: 'Consent Status',
      type: 'string',
      options: {
        list: [
          { title: 'Cleared for publication', value: 'cleared' },
          { title: 'Consent pending', value: 'pending' },
          { title: 'Not for publication', value: 'not-for-publication' },
        ],
        layout: 'radio',
      },
      initialValue: 'pending',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'containsMinors',
      title: 'Contains Minors',
      type: 'boolean',
      description: 'Does this image show anyone under 18?',
      initialValue: false,
    }),
    defineField({
      name: 'guardianConsentRecorded',
      title: 'Guardian Consent Recorded',
      type: 'boolean',
      description:
        'Required when containsMinors is true. Confirms written guardian consent is on file.',
      initialValue: false,
      hidden: ({ parent }) => !parent?.containsMinors,
      validation: (r) =>
        r.custom((val, ctx) => {
          const doc = ctx.parent as Record<string, unknown>
          if (doc?.containsMinors && !val) {
            return 'Guardian consent must be recorded before this image can be published'
          }
          return true
        }),
    }),
  ],
  preview: {
    prepare(props: PreviewProps) {
      return { title: props.caption || props.alt || 'Image' }
    },
  },
})
