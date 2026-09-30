import { defineField, defineType } from 'sanity'

export const impactMetric = defineType({
  name: 'impactMetric',
  title: 'Impact Metric',
  type: 'document',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      type: 'string',
      description: 'e.g. "People Reached", "Communities Served", "Health Workers Trained"',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'number',
      validation: (r) => r.required().min(0),
    }),
    defineField({
      name: 'asOf',
      title: 'Effective As Of',
      type: 'date',
      validation: (r) => r.required(),
      description: 'Date this metric was last verified',
    }),
    defineField({
      name: 'basis',
      title: 'Value Basis',
      type: 'string',
      options: {
        list: [
          { title: 'Computed (derived from outreach records)', value: 'computed' },
          { title: 'Manually entered', value: 'manual' },
        ],
        layout: 'radio',
      },
      initialValue: 'manual',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'verifiedBy',
      title: 'Verified By',
      type: 'string',
      description: 'Name or role of the person who verified this figure',
      hidden: ({ parent }) => parent?.basis !== 'manual',
      validation: (r) =>
        r.custom((val, ctx) => {
          const doc = ctx.parent as Record<string, unknown>
          if (doc?.basis === 'manual' && (!val || val.trim() === '')) {
            return 'Manual metrics must include who verified the figure'
          }
          return true
        }),
    }),
    defineField({
      name: 'evidenceNote',
      title: 'Evidence Note',
      type: 'text',
      rows: 2,
      description: 'Reference to the source document or internal record',
      hidden: ({ parent }) => parent?.basis !== 'manual',
      validation: (r) =>
        r.custom((val, ctx) => {
          const doc = ctx.parent as Record<string, unknown>
          if (doc?.basis === 'manual' && (!val || val.trim() === '')) {
            return 'Manual metrics must include an evidence note'
          }
          return true
        }),
    }),
    defineField({
      name: 'sourceOutreach',
      title: 'Source Outreach',
      type: 'reference',
      to: [{ type: 'outreach' }],
      description: 'For computed metrics: the outreach record this derives from',
      hidden: ({ parent }) => parent?.basis !== 'computed',
    }),
    defineField({
      name: 'unit',
      title: 'Unit',
      type: 'string',
      description: 'Optional unit label (e.g. "people", "events", "kg")',
    }),
  ],
  preview: {
    select: { label: 'label', value: 'value', basis: 'basis', asOf: 'asOf' },
    prepare({ label, value, basis, asOf }) {
      const dateStr = asOf
        ? new Date(asOf).toLocaleDateString('en-NG', { year: 'numeric', month: 'short' })
        : ''
      return {
        title: `${value ?? '?'} ${label || ''}`.trim(),
        subtitle: `${basis === 'computed' ? 'Computed' : 'Manual'} — ${dateStr}`,
      }
    },
  },
})
