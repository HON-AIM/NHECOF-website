import { describe, it, expect } from 'vitest'
import { createElement, Fragment, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { renderMarkdown } from '../src/lib/markdown'

function render(source: string): string {
  const nodes: ReactNode = createElement(Fragment, null, renderMarkdown(source))
  return renderToStaticMarkup(nodes)
}

describe('renderMarkdown', () => {
  it('renders h2 and h3 headings', () => {
    const html = render('## Evidence Standards\n\n### Preferred Sources')
    expect(html).toContain(
      '<h2 class="mt-8 mb-4 font-display text-2xl font-semibold text-ink-900"><span>Evidence Standards</span></h2>'
    )
    expect(html).toContain(
      '<h3 class="mt-6 mb-3 font-display text-xl font-semibold text-ink-900"><span>Preferred Sources</span></h3>'
    )
  })

  it('joins wrapped paragraph lines and renders a heading first', () => {
    const html = render('A single paragraph\ncontinuing on the next line.')
    expect(html).toContain('<p class="mb-4 leading-relaxed text-ink-800">')
    expect(html).toContain(
      '<span><span>A single paragraph</span></span><span><br/><span>continuing on the next line.</span></span>'
    )
  })

  it('renders bullet and numbered lists', () => {
    const html = render('- one\n- two\n\n1. first\n2. second')
    expect(html).toContain('<ul class="mb-4 list-disc space-y-1 pl-6">')
    expect(html).toContain('<li><span>one</span></li>')
    expect(html).toContain('<ol class="mb-4 list-decimal space-y-1 pl-6">')
    expect(html).toContain('<li><span>first</span></li>')
  })

  it('renders bold, inline code, links and mailto addresses', () => {
    const html = render('A **strong** `code` [link](https://example.com) and [editorial@nhecof.org].')
    expect(html).toContain('<strong class="font-semibold text-ink-900">strong</strong>')
    expect(html).toContain('<code class="rounded bg-paper-100 px-1.5 py-0.5 font-mono text-sm">code</code>')
    expect(html).toContain('<a href="https://example.com"')
    expect(html).toContain('href="mailto:editorial@nhecof.org"')
  })

  it('renders blockquotes and horizontal rules', () => {
    const html = render('> **Version:** Draft\n> Second quote line\n\n---')
    expect(html).toContain('<blockquote class="my-6 border-l-4 border-leaf-300 pl-4 italic text-ink-600">')
    expect(html).toContain('<strong class="font-semibold text-ink-900">Version:</strong>')
    expect(html).toContain('<hr class="my-8 border-t border-ink-100"/>')
  })

  it('renders tables with a header row and body rows', () => {
    const html = render('| Field | Requirement |\n|---|---|\n| Author | Named person |\n| Reviewer | **Different person** |')
    expect(html).toContain('<table class="w-full border-collapse text-sm">')
    expect(html).toContain('<thead>')
    expect(html).toContain('<th class="py-2 pr-4 font-semibold text-ink-900"><span>Field</span></th>')
    expect(html).toContain('<tbody>')
    expect(html).toContain('<td class="py-2 pr-4 align-top"><span>Author</span></td>')
    expect(html).toContain('<strong class="font-semibold text-ink-900">Different person</strong>')
  })

  it('escapes raw HTML from the source document exactly once', () => {
    const html = render('Dangerous <script>alert(1)</script> and ampersand &')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('&amp;')
    expect(html).not.toContain('&amp;lt;')
  })

  it('renders blocks in source order', () => {
    const html = render('Intro paragraph.\n\n## Heading\n\n- item')
    expect(html.indexOf('Intro paragraph.')).toBeLessThan(html.indexOf('Heading'))
    expect(html.indexOf('Heading')).toBeLessThan(html.indexOf('item'))
  })
})