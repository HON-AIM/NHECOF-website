'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type MiniSearchType from 'minisearch'
import { cn } from '@/lib/cn'
import { CloseIcon, SearchIcon } from '@/components/icons'
import {
  normalizeSearchText,
  tokenizeSearchText,
  highlightMatches,
} from '@/lib/search/normalize'

interface SearchItem {
  id: string
  type: 'article' | 'foodProfile' | 'outreach' | 'resource'
  title: string
  href: string
  summary?: string
  keywords: string[]
  publishedAt?: string
}

const RECENT_KEY = 'nhecof-recent-searches'
const MAX_RECENT = 5
const RESULT_LIMIT = 8

const TYPE_LABEL: Record<SearchItem['type'], string> = {
  article: 'Article',
  foodProfile: 'Food Profile',
  outreach: 'Outreach',
  resource: 'Resource',
}

function isTypableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return true
  const tag = target.tagName
  return !(
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

function readRecent(): string[] {
  try {
    const raw = window.localStorage.getItem(RECENT_KEY)
    const parsed = raw ? (JSON.parse(raw) as unknown) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

function writeRecent(query: string) {
  try {
    const next = [query, ...readRecent().filter((q) => q !== query)].slice(0, MAX_RECENT)
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable — recent searches are a progressive enhancement */
  }
}

export function NutritionSearchDialog({
  trigger,
  shortcut = 'desktop',
}: {
  trigger: ReactNode
  /** Which instance owns the "/" keyboard shortcut (matched against md+ viewport). */
  shortcut?: 'desktop' | 'mobile' | 'none'
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<SearchItem[]>([])
  const [index, setIndex] = useState<MiniSearchType<SearchItem> | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [recent, setRecent] = useState<string[]>([])
  const loadedRef = useRef(false)
  const lastLoggedRef = useRef<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Engine choice: MiniSearch over Fuse.js.
  // - Diacritic-insensitive matching is first-class here because we supply custom
  //   `tokenize`/`processTerm` (normalize → NFD + strip marks), so "efo" hits
  //   "Ẹfọ́". Fuse.js has no built-in diacritic folding and its fuzzy scoring
  //   blurs exact aliases like "ewedu".
  // - Prefix matching, per-field boosts and a tiny client footprint fit the small
  //   published-content index behind /search-index.json (plan §11.1); no external
  //   analytics-of-search service needed at launch.
  // - Loaded with a dynamic import inside `loadIndex` so the ~55 KB engine stays
  //   out of the initial bundle of every route (plan §13) and is only parsed once
  //   a visitor actually opens the dialog.

  const results = useMemo(() => {
    if (!index) return []
    const trimmed = query.trim()
    if (trimmed.length === 0) return []
    const matches = index.search(trimmed, { prefix: true })
    const ids = [...new Set(matches.slice(0, RESULT_LIMIT).map((m) => m.id as string))]
    return ids.map((id) => items.find((item) => item.id === id)).filter((x): x is SearchItem => Boolean(x))
  }, [index, query, items])

  async function loadIndex() {
    if (loadedRef.current) return
    loadedRef.current = true
    setStatus('loading')
    try {
      // The engine is only needed once the dialog is open, so keep it out of the
      // initial bundle and pull it in alongside the index itself.
      const [{ default: MiniSearch }, res] = await Promise.all([
        import('minisearch'),
        fetch('/search-index.json', { next: { revalidate: 3600 } }),
      ])
      if (!res.ok) throw new Error(`index: ${res.status}`)
      const data = (await res.json()) as SearchItem[]
      const ms = new MiniSearch<SearchItem>({
        idField: 'id',
        fields: ['title', 'summary', 'keywords'],
        storeFields: ['id', 'type', 'title', 'href', 'summary'],
        tokenize: (text) => tokenizeSearchText(text),
        processTerm: (term) => normalizeSearchText(term).slice(0, 32),
        searchOptions: {
          prefix: true,
          combineWith: 'OR',
          boost: { title: 3, keywords: 2, summary: 1 },
        },
      })
      ms.addAll(data)
      setItems(data)
      setIndex(ms)
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    if (open) {
      void loadIndex()
      setRecent(readRecent())
      requestAnimationFrame(() => inputRef.current?.focus())
    } else {
      setQuery('')
      setActiveIndex(0)
      lastLoggedRef.current = null
    }
  }, [open])

  // Global "/" shortcut opens the palette (once per viewport band).
  useEffect(() => {
    if (shortcut === 'none') return
    const mq = window.matchMedia('(min-width: 768px)')
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      if (!isTypableTarget(event.target)) return
      const matchesDesktop = mq.matches
      if (shortcut === 'desktop' && !matchesDesktop) return
      if (shortcut === 'mobile' && matchesDesktop) return
      event.preventDefault()
      setOpen(true)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [shortcut])

  /*
   * Anonymous search analytics.
   *
   * Sends the query LENGTH and result count, never the text. A nutrition search
   * can contain a health condition or a person's name, and those strings must
   * not be written to server logs. See `/api/track-search` for the rationale.
   *
   * Reported when there are no results, because that is the case worth fixing.
   */
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < 2 || results.length > 0) return
    if (lastLoggedRef.current === trimmed) return
    lastLoggedRef.current = trimmed
    void navigator.sendBeacon?.(
      '/api/track-search',
      new Blob(
        [JSON.stringify({ queryLength: trimmed.length, resultCount: 0, scope: 'all' })],
        { type: 'application/json' },
      ),
    )
  }, [query, results.length])

  function choose(item: SearchItem) {
    writeRecent(item.title)
    setOpen(false)
    router.push(item.href)
  }

  function useRecent(term: string) {
    setQuery(term)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (event.key === 'Enter') {
      event.preventDefault()
      const item = results[Math.max(0, activeIndex)]
      if (item) choose(item)
    }
  }

  const showRecent = query.trim().length === 0 && recent.length > 0

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-modal bg-black/50" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className={cn(
            'fixed left-1/2 top-[12vh] z-modal w-[min(92vw,32rem)] -translate-x-1/2',
            'rounded-xl bg-white shadow-lg',
          )}
        >
          <DialogPrimitive.Title className="sr-only">Search the Nutrition Hub</DialogPrimitive.Title>

          <div className="flex items-center gap-2 border-b border-ink-100 px-4">
            <SearchIcon className="h-5 w-5 shrink-0 text-ink-400" aria-hidden="true" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setActiveIndex(0)
              }}
              onKeyDown={onKeyDown}
              placeholder="Search articles, foods and outreaches…"
              aria-label="Search the Nutrition Hub"
              role="combobox"
              aria-expanded="true"
              aria-controls={results.length > 0 ? 'search-results' : undefined}
              aria-autocomplete="list"
              className="w-full bg-transparent py-4 text-base text-ink-900 placeholder:text-ink-400 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-leaf-700"
            />
            <DialogPrimitive.Close
              aria-label="Close search"
              className="rounded-full p-1.5 text-ink-400 transition-colors hover:bg-paper-100 hover:text-ink-900"
            >
              <CloseIcon className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {status === 'loading' || (status === 'idle' && open) ? (
              <p className="p-4 text-sm text-ink-500">Loading search index…</p>
            ) : status === 'error' ? (
              <p className="p-4 text-sm text-ink-500">
                Search is unavailable right now. Try the search page below.
              </p>
            ) : showRecent ? (
              <div className="p-2">
                <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
                  Recent searches
                </p>
                <ul className="space-y-0.5">
                  {recent.map((term) => (
                    <li key={term}>
                      <button
                        type="button"
                        onClick={() => useRecent(term)}
                        className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-ink-700 transition-colors hover:bg-leaf-50 hover:text-leaf-800"
                      >
                        {term}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : query.trim().length === 0 ? (
              <p className="p-4 text-sm text-ink-500">
                Search across articles, Nigerian food profiles, downloadable resources and community
                outreaches. Try &ldquo;ewedu&rdquo;, &ldquo;anaemia&rdquo; or &ldquo;Kano&rdquo;.
              </p>
            ) : results.length === 0 ? (
              <p className="p-4 text-sm text-ink-500">
                No results for &ldquo;{query}&rdquo;. Try a different keyword.
              </p>
            ) : (
              <ul id="search-results" role="listbox" aria-label="Search results" className="space-y-0.5">
                {results.map((item, i) => (
                  <li key={item.id} role="option" aria-selected={i === activeIndex}>
                    <button
                      type="button"
                      onClick={() => choose(item)}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        'block w-full rounded-lg px-3 py-2.5 text-left transition-colors',
                        i === activeIndex ? 'bg-leaf-50' : 'hover:bg-paper-100',
                      )}
                    >
                      <span className="flex items-baseline gap-2">
                        <span
                          className={cn(
                            'inline-block rounded-sm border px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                            item.type === 'article' && 'border-leaf-200 bg-leaf-50 text-leaf-800',
                            item.type === 'foodProfile' && 'border-clay-200 bg-clay-50 text-clay-800',
                            item.type === 'outreach' && 'border-info/30 bg-info-light text-info-dark',
                            item.type === 'resource' && 'border-gold-200 bg-gold-50 text-gold-800',
                          )}
                        >
                          {TYPE_LABEL[item.type]}
                        </span>
                        <span
                          dangerouslySetInnerHTML={{ __html: highlightMatches(item.title, query) }}
                          className="font-medium text-ink-900"
                        />
                      </span>
                      {item.summary ? (
                        <span
                          dangerouslySetInnerHTML={{ __html: highlightMatches(item.summary, query) }}
                          className="mt-0.5 line-clamp-2 block text-sm text-ink-600"
                        />
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t border-ink-100 px-4 py-2 text-[11px] text-ink-400">
            <span className="hidden sm:inline">
              <kbd className="rounded border border-ink-200 px-1 font-mono">↑</kbd>{' '}
              <kbd className="rounded border border-ink-200 px-1 font-mono">↓</kbd> to navigate ·{' '}
              <kbd className="rounded border border-ink-200 px-1 font-mono">Enter</kbd> to open ·{' '}
            </span>
            <span>Use Esc to close</span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}