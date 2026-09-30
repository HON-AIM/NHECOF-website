import { defineField, defineType } from 'sanity'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PreviewProps = Record<string, any>

export const location = defineType({
  name: 'location',
  title: 'Location',
  type: 'object',
  fields: [
    defineField({
      name: 'community',
      title: 'Community / Town',
      type: 'string',
    }),
    defineField({
      name: 'lga',
      title: 'Local Government Area',
      type: 'string',
    }),
    defineField({
      name: 'state',
      title: 'State',
      type: 'string',
      options: {
        list: [
          'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
          'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
          'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo', 'Jigawa',
          'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
          'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
          'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
        ].map((s) => ({ title: s, value: s })),
        layout: 'dropdown',
      },
    }),
  ],
  preview: {
    prepare(props: PreviewProps) {
      const parts = [props.community, props.lga, props.state].filter(Boolean)
      return { title: parts.join(', ') || 'No location set' }
    },
  },
})
