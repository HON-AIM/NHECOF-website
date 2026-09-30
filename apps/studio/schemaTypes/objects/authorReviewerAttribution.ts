import { defineField, defineType } from 'sanity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PreviewProps = Record<string, any>

export const authorReviewerAttribution = defineType({
  name: 'authorReviewerAttribution',
  title: 'Author / Reviewer',
  type: 'object',
  fields: [
    defineField({
      name: 'person',
      title: 'Person',
      type: 'reference',
      to: [{ type: 'person' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      options: {
        list: [
          { title: 'Author', value: 'author' },
          { title: 'Reviewer', value: 'reviewer' },
          { title: 'Contributor', value: 'contributor' },
        ],
      },
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    prepare(props: PreviewProps) {
      return {
        title: props.person?._ref ? `${props.role || 'Person'}` : 'No person selected',
        subtitle: props.role,
      }
    },
  },
})
