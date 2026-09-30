import { DefaultDocumentNodeResolver } from 'sanity/structure'

export const defaultDocumentNode: DefaultDocumentNodeResolver = (S, { schemaType }) => {
  const previewableTypes = ['article', 'foodProfile', 'page', 'quote', 'outreach']
  if (previewableTypes.includes(schemaType)) {
    return S.document().views([
      S.view.form(),
    ])
  }
  return S.document().views([S.view.form()])
}
