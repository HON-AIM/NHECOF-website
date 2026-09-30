import { defineField, defineType } from 'sanity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PreviewProps = Record<string, any>

export const cta = defineType({
  name: 'cta',
  title: 'Call to Action',
  type: 'object',
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
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'variant',
      title: 'Style',
      type: 'string',
      options: {
        list: [
          { title: 'Primary', value: 'primary' },
          { title: 'Secondary', value: 'secondary' },
          { title: 'Outline', value: 'outline' },
        ],
      },
      initialValue: 'primary',
    }),
  ],
  preview: {
    prepare(props: PreviewProps) {
      return { title: props.label || 'CTA', subtitle: props.url }
    },
  },
})
