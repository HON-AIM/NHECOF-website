import type { DocumentActionComponent, DocumentActionProps } from 'sanity'

const HEALTH_CONTENT_TYPES = ['article', 'foodProfile']

export const reviewGateAction: DocumentActionComponent = (props: DocumentActionProps) => {
  const { type, published, draft } = props

  if (!HEALTH_CONTENT_TYPES.includes(type)) return null

  const liveDoc = published || draft
  if (!liveDoc) return null

  const reviewStatus = (liveDoc as Record<string, unknown>).reviewStatus as string | undefined

  return {
    label: reviewStatus === 'approved' ? 'Publish' : 'Publish (blocked)',
    disabled: reviewStatus !== 'approved',
    icon: () => null,
    title:
      reviewStatus === 'approved'
        ? 'Publish'
        : `Cannot publish: content review status is "${reviewStatus || 'draft'}". Health content must be marked "approved" before publication.`,
    onHandle: () => {
      // Review gate: publication blocked unless approved
    },
  }
}
