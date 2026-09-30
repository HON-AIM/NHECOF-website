import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemaTypes'
import { structure } from './structure'
import { defaultDocumentNode } from './structure/defaultDocumentNode'
import { reviewStatusBadge } from './badges/reviewStatusBadge'
import { reviewGateAction } from './actions/reviewGateAction'
import { slugRedirectGuardAction } from './actions/slugRedirectGuardAction'

export default defineConfig({
  name: 'nhecof-studio',
  title: 'NHECOF Studio',

  projectId:
    process.env.SANITY_STUDIO_PROJECT_ID ||
    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ||
    '',
  dataset:
    process.env.SANITY_STUDIO_DATASET ||
    process.env.NEXT_PUBLIC_SANITY_DATASET ||
    'production',

  plugins: [
    structureTool({
      structure,
      defaultDocumentNode,
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) => {
      const healthContentTypes = ['article', 'foodProfile']
      const slugRedirectTypes = ['article', 'foodProfile', 'outreach', 'resource', 'person', 'programme']
      if (slugRedirectTypes.includes(context.schemaType)) {
        return [slugRedirectGuardAction, ...prev]
      }
      if (healthContentTypes.includes(context.schemaType)) {
        return [reviewGateAction, ...prev]
      }
      return prev
    },
    badges: (prev, context) => {
      const reviewableTypes = ['article', 'foodProfile']
      if (reviewableTypes.includes(context.schemaType)) {
        return [...prev, reviewStatusBadge]
      }
      return prev
    },
  },
})
