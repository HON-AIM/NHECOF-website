import { defineField, defineType } from 'sanity'

export const contactDetails = defineType({
  name: 'contactDetails',
  title: 'Contact Details',
  type: 'object',
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: (r) => r.email(),
    }),
    defineField({
      name: 'phone',
      title: 'Phone',
      type: 'string',
    }),
    defineField({
      name: 'website',
      title: 'Website',
      type: 'url',
    }),
    defineField({
      name: 'address',
      title: 'Address',
      type: 'text',
      rows: 2,
    }),
  ],
})
