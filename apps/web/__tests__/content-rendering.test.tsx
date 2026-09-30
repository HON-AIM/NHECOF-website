import { describe, it, expect } from 'vitest'
import { Fragment, createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { PortableTextBlock } from '@portabletext/types'
import { Prose } from '../src/components/ui/Prose'

function render(node: ReactNode): string {
  return renderToStaticMarkup(createElement(Fragment, null, node))
}

function asBlocks(value: Array<Record<string, unknown>>): PortableTextBlock[] {
  return value as unknown as PortableTextBlock[]
}

const blocks: Array<Record<string, unknown>> = [
  {
    _type: 'block',
    _key: 'h2a',
    style: 'h2',
    children: [{ _key: 'h2a1', _type: 'span', text: 'Introduction' }],
  },
  {
    _type: 'block',
    _key: 'pa',
    style: 'normal',
    children: [
      { _key: 'pa1', _type: 'span', text: 'Hello ' },
      { _key: 'pa2', _type: 'span', text: 'world', marks: ['link', 'citation'] },
      { _key: 'pa3', _type: 'span', text: '!' },
    ],
    markDefs: [
      { _key: 'link', _type: 'link', href: 'https://example.com/guide' },
      { _key: 'citation', _type: 'citation', title: 'Study X', url: 'https://example.com/x' },
    ],
  },
  {
    _type: 'block',
    _key: 'lb',
    style: 'normal',
    children: [
      { _key: 'lb1', _type: 'span', text: 'Bold and emphasised' },
    ],
    markDefs: [],
  },
]

describe('Prose (PortableText renderer)', () => {
  it('renders headings with stable, anchored ids', () => {
    const html = render(<Prose value={asBlocks(blocks)} />)
    expect(html).toContain('<h2 id="introduction"')
  })

  it('renders links and inline citation marks', () => {
    const html = render(<Prose value={asBlocks(blocks)} />)
    expect(html).toContain('href="https://example.com/guide"')
    expect(html).toContain('aria-label="Study X"')
  })

  it('renders reference-list custom blocks', () => {
    const html = render(
      <Prose
        value={asBlocks([
          { _type: 'callout', _key: 'c1', type: 'warning', heading: 'Heads up', body: 'Careful' },
          { _type: 'keyStat', _key: 'k1', value: '4,000', label: 'People reached' },
          { _type: 'mythFact', _key: 'm1', myth: 'Myth text', fact: 'Fact text' },
        ])}
      />,
    )
    expect(html).toContain('role="note"')
    expect(html).toContain('Heads up')
    expect(html).toContain('4,000')
    expect(html).toContain('Myth text')
    expect(html).toContain('Fact text')
  })

  it('numbers inline citations against the references list', () => {
    const html = render(
      <Prose
        value={asBlocks([
          { _type: 'inlineCitation', _key: 'i1', reference: { title: 'Study X', url: 'https://example.com/x' } },
        ])}
        references={[{ title: 'Study X', publisher: 'NHS', url: 'https://example.com/x' }]}
      />,
    )
    expect(html).toContain('aria-label="Reference 1"')
    expect(html).toContain('href="#reference-1"')
    expect(html).toContain('>1</a>')
  })

  it('renders a figure without an asset as a pending placeholder with alt text', () => {
    const html = render(
      <Prose
        value={asBlocks([
          {
            _type: 'figure',
            _key: 'f1',
            image: { consentStatus: 'cleared', alt: 'A field photo' },
            caption: 'Field work',
          },
        ])}
      />,
    )
    expect(html).toContain('aria-label="A field photo"')
    expect(html).toContain('Image pending consent')
    expect(html).toContain('Field work')
  })

  it('renders internal links to resolved public routes', () => {
    const html = render(
      <Prose
        value={asBlocks([
          {
            _type: 'block',
            _key: 'ia',
            style: 'normal',
            children: [
              { _key: 'ia1', _type: 'span', text: 'Read more', marks: ['internalLink'] },
            ],
            markDefs: [
              { _key: 'internalLink', _type: 'internalLink', reference: { _type: 'article', _ref: 'a-slug' } },
            ],
          },
        ])}
      />,
    )
    expect(html).toContain('href="/nutrition/articles/a-slug"')
  })
})