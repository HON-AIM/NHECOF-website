import type { DocumentBadgeComponent, DocumentBadgeDescription } from 'sanity'

export const reviewStatusBadge: DocumentBadgeComponent = (props) => {
  const doc = props.published || props.draft
  if (!doc) return null

  const status = (doc as Record<string, unknown>).reviewStatus as string | undefined

  let color: DocumentBadgeDescription['color'] = 'primary'
  if (status === 'approved') color = 'success'
  else if (status === 'submitted') color = 'warning'
  else if (status === 'needs-revision') color = 'danger'

  const label = status
    ? status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')
    : 'Draft'

  return { label, color, title: label }
}
