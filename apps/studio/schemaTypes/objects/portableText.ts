import { defineType, defineField, defineArrayMember } from 'sanity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PreviewProps = Record<string, any>

const calloutBlock = defineType({
  name: 'callout',
  title: 'Callout',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Callout Type',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Warning', value: 'warning' },
          { title: 'Tip', value: 'tip' },
          { title: 'Important', value: 'important' },
        ],
      },
      initialValue: 'info',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'heading',
      title: 'Heading',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Body',
      type: 'text',
      rows: 3,
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    prepare(props: PreviewProps) {
      return { title: props.heading || `${props.type || 'Info'} callout` }
    },
  },
})

const mythFactBlock = defineType({
  name: 'mythFact',
  title: 'Myth vs Fact',
  type: 'object',
  fields: [
    defineField({
      name: 'myth',
      title: 'Myth',
      type: 'text',
      rows: 2,
      validation: (r) => r.required(),
      description: 'The common misconception',
    }),
    defineField({
      name: 'fact',
      title: 'Fact',
      type: 'text',
      rows: 3,
      validation: (r) => r.required(),
      description: 'The evidence-based correction',
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'citation',
      description: 'Supporting reference for the fact',
    }),
  ],
  preview: {
    prepare(props: PreviewProps) {
      return { title: `Myth: ${(props.myth || '').slice(0, 60)}…` }
    },
  },
})

const keyStatBlock = defineType({
  name: 'keyStat',
  title: 'Key Statistic',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'Value',
      type: 'string',
      description: 'e.g. "600+", "3 states", "85%"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'context',
      title: 'Context',
      type: 'text',
      rows: 2,
      description: 'Optional explanation',
    }),
  ],
  preview: {
    prepare(props: PreviewProps) {
      return { title: `${props.value || '?'} ${props.label || ''}`.trim() }
    },
  },
})

const inlineCitationBlock = defineType({
  name: 'inlineCitation',
  title: 'Inline Citation',
  type: 'object',
  fields: [
    defineField({
      name: 'reference',
      title: 'Reference',
      type: 'citation',
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    prepare(props: PreviewProps) {
      return { title: props.reference?._ref ? 'Citation' : 'No reference set' }
    },
  },
})

const figureBlock = defineType({
  name: 'figure',
  title: 'Figure',
  type: 'object',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      type: 'nhecofImage',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'caption',
      title: 'Caption',
      type: 'string',
    }),
    defineField({
      name: 'credit',
      title: 'Credit',
      type: 'string',
    }),
  ],
  preview: {
    prepare(props: PreviewProps) {
      return { title: props.caption || 'Figure' }
    },
  },
})

export const portableText = defineType({
  name: 'portableText',
  title: 'Portable Text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'Heading 2', value: 'h2' },
        { title: 'Heading 3', value: 'h3' },
        { title: 'Heading 4', value: 'h4' },
        { title: 'Blockquote', value: 'blockquote' },
      ],
      lists: [
        { title: 'Bullet', value: 'bullet' },
        { title: 'Numbered', value: 'number' },
      ],
      marks: {
        decorators: [
          { title: 'Bold', value: 'bold' },
          { title: 'Italic', value: 'italic' },
          { title: 'Underline', value: 'underline' },
          { title: 'Code', value: 'code' },
        ],
        annotations: [
          {
            name: 'link',
            title: 'Link',
            type: 'object',
            fields: [
              defineField({
                name: 'href',
                title: 'URL',
                type: 'url',
                validation: (r) =>
                  r.uri({ allowRelative: true, scheme: ['http', 'https', 'mailto'] }),
              }),
            ],
          },
          {
            name: 'internalLink',
            title: 'Internal Link',
            type: 'object',
            fields: [
              defineField({
                name: 'reference',
                title: 'Reference',
                type: 'reference',
                to: [
                  { type: 'article' },
                  { type: 'foodProfile' },
                  { type: 'page' },
                ],
              }),
            ],
          },
          {
            name: 'citation',
            title: 'Citation',
            type: 'citation',
          },
        ],
      },
    }),
    defineArrayMember({ type: 'callout' }),
    defineArrayMember({ type: 'mythFact' }),
    defineArrayMember({ type: 'keyStat' }),
    defineArrayMember({ type: 'inlineCitation' }),
    defineArrayMember({ type: 'figure' }),
  ],
})
