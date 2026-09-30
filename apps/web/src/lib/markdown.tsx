import type { ReactNode } from 'react'

/**
 * Minimal, dependency-free Markdown renderer tailored to the policy documents
 * kept in /docs (editorial-policy.md). Supports the constructs those documents
 * use: ## / ### headings, bullet and numbered lists, blockquotes, tables,
 * inline code, **bold**, [text](url) links, mailto-style [address] links and
 * horizontal rules. Source text is rendered as React children, which escapes
 * any HTML present in the source document.
 */

type InlineToken =
  | { type: 'text'; text: string }
  | { type: 'strong'; text: string }
  | { type: 'code'; text: string }
  | { type: 'link'; text: string; href: string }
  | { type: 'mailto'; email: string }

const INLINE_TOKEN_RE =
  /\*\*([^*]+)\*\*|`([^`]+)`|\[([^\]()]+)\]\(([^)]+)\)|\[([^\]()]*@[^\]()]+)\]/g

function tokeniseInline(escaped: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = INLINE_TOKEN_RE.exec(escaped)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ type: 'text', text: escaped.slice(lastIndex, match.index) })
    }
    const [, strong, code, linkText, linkHref, mailto] = match
    if (strong !== undefined) tokens.push({ type: 'strong', text: strong })
    else if (code !== undefined) tokens.push({ type: 'code', text: code })
    else if (linkHref !== undefined) tokens.push({ type: 'link', text: linkText, href: linkHref })
    else if (mailto !== undefined) tokens.push({ type: 'mailto', email: mailto })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < escaped.length) {
    tokens.push({ type: 'text', text: escaped.slice(lastIndex) })
  }

  return tokens
}

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const tokens = tokeniseInline(text)
  return tokens.map((token, index) => {
    const key = `${keyPrefix}-${index}`
    switch (token.type) {
      case 'strong':
        return (
          <strong key={key} className="font-semibold text-ink-900">
            {token.text}
          </strong>
        )
      case 'code':
        return (
          <code key={key} className="rounded bg-paper-100 px-1.5 py-0.5 font-mono text-sm">
            {token.text}
          </code>
        )
      case 'link':
        return (
          <a
            key={key}
            href={token.href}
            className="text-leaf-700 underline underline-offset-2 hover:text-leaf-800"
          >
            {token.text}
          </a>
        )
      case 'mailto':
        return (
          <a
            key={key}
            href={`mailto:${token.email}`}
            className="text-leaf-700 underline underline-offset-2 hover:text-leaf-800"
          >
            {token.email}
          </a>
        )
      default:
        return <span key={key}>{token.text}</span>
    }
  })
}

interface BlockResult {
  node: ReactNode
  consumed: number
}

const HEADING_RE = /^(#{2,3})\s+(.*)$/
const UNORDERED_ITEM_RE = /^[-*]\s+(.*)$/
const ORDERED_ITEM_RE = /^(\d+)\.\s+(.*)$/
const BLOCKQUOTE_RE = /^>\s?(.*)$/
const HORIZONTAL_RULE_RE = /^-{3,}$/
const TABLE_ROW_RE = /^\|/
const TABLE_SEPARATOR_RE = /^\|[\s|:-]*\|[\s|:-]*$/

function splitTableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function parseBlock(lines: string[], index: number): BlockResult | null {
  const line = lines[index]

  const heading = HEADING_RE.exec(line)
  if (heading) {
    const level = heading[1].length
    const content = renderInline(heading[2], `h-${index}`)
    const className =
      level === 2
        ? 'mt-8 mb-4 font-display text-2xl font-semibold text-ink-900'
        : 'mt-6 mb-3 font-display text-xl font-semibold text-ink-900'
    const Tag = (level === 2 ? 'h2' : 'h3') as 'h2' | 'h3'
    return { node: <Tag key={index} className={className}>{content}</Tag>, consumed: 1 }
  }

  if (HORIZONTAL_RULE_RE.test(line)) {
    return { node: <hr key={index} className="my-8 border-t border-ink-100" />, consumed: 1 }
  }

  if (BLOCKQUOTE_RE.test(line)) {
    const captured: string[] = []
    let cursor = index
    while (cursor < lines.length && BLOCKQUOTE_RE.test(lines[cursor])) {
      captured.push(BLOCKQUOTE_RE.exec(lines[cursor])?.[1] ?? '')
      cursor++
    }
    return {
      node: (
        <blockquote key={index} className="my-6 border-l-4 border-leaf-300 pl-4 italic text-ink-600">
          {captured.map((text, i) => (
            <p key={`q-${i}`} className="mb-2 last:mb-0">
              {renderInline(text, `q-${index}-${i}`)}
            </p>
          ))}
        </blockquote>
      ),
      consumed: captured.length,
    }
  }

  if (UNORDERED_ITEM_RE.test(line)) {
    const items: { text: string; key: string }[] = []
    let cursor = index
    while (cursor < lines.length) {
      const item = UNORDERED_ITEM_RE.exec(lines[cursor])
      if (!item) break
      items.push({ text: item[1], key: `ul-${cursor}` })
      cursor++
    }
    return {
      node: (
        <ul key={index} className="mb-4 list-disc space-y-1 pl-6">
          {items.map((item, i) => (
            <li key={item.key}>{renderInline(item.text, `${item.key}-${i}`)}</li>
          ))}
        </ul>
      ),
      consumed: items.length,
    }
  }

  if (ORDERED_ITEM_RE.test(line)) {
    const items: { text: string; key: string }[] = []
    let cursor = index
    while (cursor < lines.length) {
      const item = ORDERED_ITEM_RE.exec(lines[cursor])
      if (!item) break
      items.push({ text: item[2], key: `ol-${cursor}` })
      cursor++
    }
    return {
      node: (
        <ol key={index} className="mb-4 list-decimal space-y-1 pl-6">
          {items.map((item, i) => (
            <li key={item.key}>{renderInline(item.text, `${item.key}-${i}`)}</li>
          ))}
        </ol>
      ),
      consumed: items.length,
    }
  }

  if (TABLE_ROW_RE.test(line)) {
    const rows: string[] = []
    let cursor = index
    while (cursor < lines.length && TABLE_ROW_RE.test(lines[cursor])) {
      rows.push(lines[cursor])
      cursor++
    }
    const headerCells = rows[0] ? splitTableCells(rows[0]) : []
    const bodyRows = rows
      .slice(2)
      .filter((row) => TABLE_ROW_RE.test(row) && !TABLE_SEPARATOR_RE.test(row))
    return {
      node: (
        <div key={index} className="mb-6 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b-2 border-ink-200 text-left">
                {headerCells.map((cell, i) => (
                  <th key={`th-${index}-${i}`} className="py-2 pr-4 font-semibold text-ink-900">
                    {renderInline(cell, `th-${index}-${i}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((row, ri) => (
                <tr key={`tr-${index}-${ri}`} className="border-b border-ink-100">
                  {splitTableCells(row).map((cell, ci) => (
                    <td key={`td-${index}-${ri}-${ci}`} className="py-2 pr-4 align-top">
                      {renderInline(cell, `td-${index}-${ri}-${ci}`)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
      consumed: rows.length,
    }
  }

  if (line.trim() === '') return null

  const captured: string[] = []
  let cursor = index
  while (cursor < lines.length && lines[cursor].trim() !== '') {
    captured.push(lines[cursor])
    cursor++
  }
  return {
    node: (
      <p key={index} className="mb-4 leading-relaxed text-ink-800">
        {captured.map((text, i) => (
          <span key={`p-${i}`}>
            {i > 0 ? <br /> : null}
            {renderInline(text, `p-${index}-${i}`)}
          </span>
        ))}
      </p>
    ),
    consumed: captured.length,
  }
}

export function renderMarkdown(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, '\n').split('\n')
  const nodes: ReactNode[] = []
  let index = 0

  while (index < lines.length) {
    const block = parseBlock(lines, index)
    if (block) {
      nodes.push(block.node)
      index += block.consumed
    } else {
      index++
    }
  }

  return nodes
}