import {
  PortableText,
  type PortableTextComponents,
  type PortableTextTypeComponentProps,
} from '@portabletext/react'
import type { PortableTextBlock } from '@portabletext/types'
import { urlFor } from '@/lib/sanity/client'
import { cn } from './Card'
import { Figure } from './Figure'
import { normalizeSearchText } from '@/lib/search/normalize'

interface ProseProps {
  value: PortableTextBlock[]
  /** The article/food references list — used to number inline citations. */
  references?: Array<Pick<Citation, 'title' | 'publisher' | 'url'>>
  className?: string
}

interface Citation {
  title?: string
  publisher?: string
  url?: string
  accessedAt?: string
}

interface SanityImage {
  asset?: { _ref?: string }
  alt?: string
  caption?: string
  credit?: string
  decorative?: boolean
  consentStatus?: 'cleared' | 'pending' | 'not-for-publication'
  containsMinors?: boolean
}

interface CalloutBlock {
  _type: 'callout'
  type?: 'info' | 'warning' | 'tip' | 'important'
  heading?: string
  body?: string
}

interface MythFactBlock {
  _type: 'mythFact'
  myth?: string
  fact?: string
  source?: Citation
}

interface KeyStatBlock {
  _type: 'keyStat'
  value?: string
  label?: string
  context?: string
}

interface FigureBlock {
  _type: 'figure'
  image?: SanityImage
  caption?: string
  credit?: string
}

interface InlineCitationBlock {
  _type: 'inlineCitation'
  reference?: Citation
}

interface InternalLinkValue {
  reference?: { _type?: string; _ref?: string }
}

function resolveInternalHref(value: unknown): string | undefined {
  const reference = (value as InternalLinkValue | undefined)?.reference
  if (!reference?._ref) return undefined
  switch (reference._type) {
    case 'article':
      return `/nutrition/articles/${reference._ref}`
    case 'foodProfile':
      return `/nutrition/foods/${reference._ref}`
    case 'page':
      return `/${reference._ref}`
    default:
      return undefined
  }
}

/** Stable, readable anchor id derived from heading text (matches TOC). */
function headingId(text: string): string {
  const normalized = normalizeSearchText(text).replace(/\s+/g, '-')
  return normalized || 'section'
}

/** Map an inline citation to its position in the full references list. */
function findReferenceNumber(
  value: InlineCitationBlock,
  references: ProseProps['references'],
  fallback: number,
): number | null {
  if (!references || references.length === 0) return null
  const citation = value.reference
  if (!citation?.title) return null
  const title = citation.title.trim().toLowerCase()
  const byTitle = references.findIndex((ref) => ref.title?.trim().toLowerCase() === title)
  if (byTitle !== -1) return byTitle + 1
  const byUrl = citation.url
    ? references.findIndex((ref) => ref.url && ref.url === citation.url)
    : -1
  if (byUrl !== -1) return byUrl + 1
  return fallback
}

const calloutStyles: Record<NonNullable<CalloutBlock['type']>, string> = {
  info: 'bg-info-light border-l-info',
  warning: 'bg-warning-light border-l-warning',
  tip: 'bg-leaf-100 border-l-leaf-600',
  important: 'bg-gold-100 border-l-gold-600',
}

function CalloutBlockRenderer({
  value,
}: PortableTextTypeComponentProps<CalloutBlock>) {
  const type = value.type ?? 'info'
  return (
    <div role="note" className={cn('mb-6 rounded-lg border-l-4 p-4', calloutStyles[type])}>
      {value.heading ? (
        <p className="mb-1 font-semibold text-ink-900">{value.heading}</p>
      ) : null}
      {value.body ? <p className="text-ink-800">{value.body}</p> : null}
    </div>
  )
}

function MythFactBlockRenderer({
  value,
}: PortableTextTypeComponentProps<MythFactBlock>) {
  return (
    <div className="mb-6 overflow-hidden rounded-lg">
      <div className="grid md:grid-cols-2">
        <div className="bg-gold-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-gold-800">Myth</p>
          <p className="text-sm text-ink-800">{value.myth}</p>
        </div>
        <div className="bg-leaf-50 p-4">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-leaf-700">Fact</p>
          <p className="text-sm text-ink-800">{value.fact}</p>
        </div>
      </div>
      {value.source ? (
        <div className="border-t border-ink-100 bg-paper-100 px-4 py-2">
          <p className="text-xs text-ink-500">
            Source: {value.source.title}
            {value.source.publisher ? ` — ${value.source.publisher}` : ''}
            {value.source.url ? (
              <>
                {' · '}
                <a
                  href={value.source.url}
                  className="text-leaf-700 underline underline-offset-2 hover:text-leaf-800"
                >
                  View source
                </a>
              </>
            ) : null}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function KeyStatBlockRenderer({
  value,
}: PortableTextTypeComponentProps<KeyStatBlock>) {
  return (
    <div className="mb-6 rounded-lg bg-paper-100 p-6">
      {value.value ? (
        <p className="font-display text-3xl font-bold text-leaf-700">{value.value}</p>
      ) : null}
      {value.label ? <p className="mt-1 text-lg text-ink-700">{value.label}</p> : null}
      {value.context ? <p className="mt-1 text-sm text-ink-500">{value.context}</p> : null}
    </div>
  )
}

function FigureBlockRenderer({ value }: PortableTextTypeComponentProps<FigureBlock>) {
  const image = value.image
  const src =
    image && image.asset?._ref ? urlFor(image).width(1200).auto('format').url() : undefined
  const alt = image?.decorative ? '' : image?.alt ?? value.caption ?? ''

  return (
    <Figure
      src={src}
      image={image}
      alt={alt}
      caption={value.caption ?? image?.caption}
      credit={value.credit ?? image?.credit}
      decorative={image?.decorative}
      consentStatus={image?.consentStatus ?? 'pending'}
      containsMinors={image?.containsMinors}
      className="my-6"
    />
  )
}

function InlineCitationBlockRenderer({
  value,
  index,
  references,
}: PortableTextTypeComponentProps<InlineCitationBlock> & {
  references?: ProseProps['references']
}) {
  const number = findReferenceNumber(value, references, index + 1)
  const href = number !== null ? `#reference-${number}` : value.reference?.url
  const label = value.reference?.title ? `Reference ${number ?? ''}` : undefined
  return (
    <sup className="text-leaf-700">
      <a
        href={href}
        aria-label={label}
        className="ml-0.5 text-xs font-semibold text-leaf-700 underline-offset-2 hover:underline"
      >
        {number ?? index + 1}
      </a>
    </sup>
  )
}

function buildComponents(references?: ProseProps['references']): PortableTextComponents {
  return {
    block: {
      h2: ({ children }) => {
        const text = toPlainText(children)
        return (
          <h2
            id={headingId(text)}
            data-prose-heading
            className="mt-8 mb-4 scroll-mt-24 font-display text-2xl font-semibold text-ink-900"
          >
            {children}
          </h2>
        )
      },
      h3: ({ children }) => {
        const text = toPlainText(children)
        return (
          <h3
            id={headingId(text)}
            data-prose-heading
            className="mt-6 mb-3 scroll-mt-24 font-display text-xl font-semibold text-ink-900"
          >
            {children}
          </h3>
        )
      },
      h4: ({ children }) => (
        <h4 className="mt-4 mb-2 font-display text-lg font-semibold text-ink-900">{children}</h4>
      ),
      normal: ({ children }) => (
        <p className="mb-4 leading-relaxed text-ink-800">{children}</p>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-6 border-l-4 border-leaf-300 pl-4 italic text-ink-600">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className="mb-4 list-disc pl-6 space-y-1">{children}</ul>
      ),
      number: ({ children }) => (
        <ol className="mb-4 list-decimal pl-6 space-y-1">{children}</ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => <li>{children}</li>,
      number: ({ children }) => <li>{children}</li>,
    },
    marks: {
      link: ({ children, value }) => {
        const href = (value as { href?: string } | undefined)?.href
        return (
          <a href={href} className="text-leaf-700 underline-offset-2 hover:underline">
            {children}
          </a>
        )
      },
      internalLink: ({ children, value }) => {
        const href = resolveInternalHref(value)
        if (!href) return <>{children}</>
        return (
          <a href={href} className="text-leaf-700 underline-offset-2 hover:underline">
            {children}
          </a>
        )
      },
      citation: ({ children, value }) => {
        const citation = value as Citation | undefined
        return (
          <sup className="text-leaf-700">
            <a
              href={citation?.url}
              aria-label={citation?.title}
              className="text-xs font-semibold text-leaf-700 underline-offset-2 hover:underline"
            >
              {children}
            </a>
          </sup>
        )
      },
      strong: ({ children }) => <strong className="font-semibold text-ink-900">{children}</strong>,
      em: ({ children }) => <em>{children}</em>,
      underline: ({ children }) => <u>{children}</u>,
      code: ({ children }) => (
        <code className="rounded bg-paper-100 px-1.5 py-0.5 font-mono text-sm">{children}</code>
      ),
    },
    types: {
      callout: CalloutBlockRenderer,
      mythFact: MythFactBlockRenderer,
      keyStat: KeyStatBlockRenderer,
      figure: FigureBlockRenderer,
      inlineCitation: (props) => <InlineCitationBlockRenderer {...props} references={references} />,
    },
  }
}

function toPlainText(children: unknown): string {
  const parts: string[] = []
  function collect(node: unknown): void {
    if (node === null || node === undefined) return
    if (typeof node === 'string') parts.push(node)
    else if (Array.isArray(node)) node.forEach(collect)
    else if (typeof node === 'object' && 'props' in (node as { props?: unknown }) && (node as { props?: unknown })) {
      const props = (node as { props: { children?: unknown } }).props
      collect(props.children)
    }
  }
  collect(children)
  return parts.join(' ')
}

export function Prose({ value, references, className }: ProseProps) {
  return (
    <div className={cn('w-full max-w-prose', className)}>
      <PortableText value={value} components={buildComponents(references)} />
    </div>
  )
}