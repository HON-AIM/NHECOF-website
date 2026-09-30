import { defineField, defineType } from 'sanity'

export const category = defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'title', maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'kind',
      title: 'Kind',
      type: 'string',
      description:
        '"topic" for subject categories (e.g. Nutrition Basics), "condition" for health conditions (e.g. Anaemia), "food-group" for ingredient groups (e.g. Legumes & Beans), "tag" for granular labels',
      options: {
        list: [
          { title: 'Topic', value: 'topic' },
          { title: 'Health Condition', value: 'condition' },
          { title: 'Food Group', value: 'food-group' },
          { title: 'Tag', value: 'tag' },
        ],
        layout: 'radio',
      },
      initialValue: 'topic',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'parent',
      title: 'Parent Category',
      type: 'reference',
      to: [{ type: 'category' }],
      description: 'Optional parent for hierarchical categories',
    }),
  ],
  preview: {
    select: { title: 'title', kind: 'kind' },
    prepare({ title, kind }) {
      return { title, subtitle: kind ? `[${kind}]` : '' }
    },
  },
})
