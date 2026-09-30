import { defineField, defineType } from 'sanity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PreviewProps = Record<string, any>

export const citation = defineType({
  name: 'citation',
  title: 'Citation / Reference',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'publisher',
      title: 'Publisher / Source',
      type: 'string',
      description: 'Organisation, journal or website name',
    }),
    defineField({
      name: 'url',
      title: 'URL',
      type: 'url',
      validation: (r) =>
        r.uri({ allowRelative: false, scheme: ['http', 'https'] }),
    }),
    defineField({
      name: 'accessedAt',
      title: 'Date Accessed',
      type: 'date',
      description: 'When you last accessed this source',
    }),
  ],
  preview: {
    prepare(props: PreviewProps) {
      return { title: props.title || 'Untitled reference', subtitle: props.publisher }
    },
  },
})
