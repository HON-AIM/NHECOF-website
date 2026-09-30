import { defineField, defineType } from 'sanity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PreviewProps = Record<string, any>

export const impactResult = defineType({
  name: 'impactResult',
  title: 'Impact Result',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. "People screened", "Meals distributed"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'number',
      validation: (r) => r.required().integer().positive(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
      description: 'Optional context for this result',
    }),
  ],
  preview: {
    prepare(props: PreviewProps) {
      return { title: `${props.value ?? '?'} ${props.label || ''}`.trim() }
    },
  },
})
