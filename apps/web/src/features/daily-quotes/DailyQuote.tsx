'use client'

import { useEffect, useRef, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { ShareIcon } from '@/components/icons'

interface QuoteOfDayPayload {
  slot: 'scheduled' | 'evergreen' | null
  day: string
  quote: {
    _id: string
    text: string
    attribution: string
    topic?: string | null
    sourceUrl?: string | null
    sharingPermitted: boolean
  } | null
}

const TOPIC_LABELS: Record<string, string> = {
  nutrition: 'Nutrition',
  'healthy-living': 'Healthy Living',
  'maternal-health': 'Maternal Health',
  'child-nutrition': 'Child Nutrition',
  'food-safety': 'Food Safety',
  'general-wellness': 'General Wellness',
}

const FETCH_RETRIES = 2
const FETCH_BACKOFF_MS = 400

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    }, { once: true })
  })
}

/**
 * Fetches the quote of the day. Retries a couple of times with a short
 * backoff so a transient failure (e.g. a route still compiling in dev, a
 * mid-deploy request) never permanently hides the quote section.
 */
async function fetchQuote(signal: AbortSignal): Promise<QuoteOfDayPayload | null> {
  let attempt = 0
  while (attempt <= FETCH_RETRIES) {
    try {
      const response = await fetch('/api/quote', { signal, headers: { 'Accept': 'application/json' } })
      if (!response.ok) throw new Error(`quote API returned ${response.status}`)
      return (await response.json()) as QuoteOfDayPayload
    } catch {
      if (attempt >= FETCH_RETRIES) return null
      attempt += 1
      await delay(FETCH_BACKOFF_MS * attempt, signal)
    }
  }
  return null
}

function ShareButton({
  href,
  label,
  onClick,
  children,
}: {
  href?: string
  label: string
  onClick?: () => void
  children: React.ReactNode
}) {
  const className =
    'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-ink-700 transition hover:bg-leaf-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700'
  if (href) {
    return (
      <a className={className} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick} aria-label={label}>
        {children}
      </a>
    )
  }
  return (
    <button type="button" className={className} onClick={onClick}>
      {children}
    </button>
  )
}

export function DailyQuote() {
  const [payload, setPayload] = useState<QuoteOfDayPayload | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const rootRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetchQuote(controller.signal)
      .then((data) => {
        setPayload(data)
        setLoaded(true)
      })
      .catch(() => {
        setLoaded(true)
      })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    function onPointerDown(event: MouseEvent | TouchEvent) {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setMenuOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [menuOpen])

  const quote = loaded && payload?.quote ? payload.quote : null
  if (!quote) return null

  const topicLabel = quote.topic ? TOPIC_LABELS[quote.topic] ?? null : null
  const attribution = quote.attribution || 'NHECOF'
  const shareText = `"${quote.text}" — ${attribution}`
  const shareHref = (target: string) => {
    const url = typeof window !== 'undefined' ? window.location.origin : ''
    const params =
      target === 'wa'
        ? encodeURIComponent(`${shareText}\n${url}`)
        : target === 'fb'
          ? `u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`
          : `text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
    return target === 'wa'
      ? `https://wa.me/?text=${params}`
      : target === 'fb'
        ? `https://www.facebook.com/sharer/sharer.php?${params}`
        : `https://twitter.com/intent/tweet?${params}`
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${window.location.origin}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section aria-label="Quote of the day" ref={rootRef} className="bg-paper-100">
      <Container width="prose" className="py-10 md:py-14">
        <div className="flex items-start justify-between gap-6">
          <div className="min-w-0">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-leaf-700">
              {topicLabel ? topicLabel : 'Quote of the day'}
            </p>
            <blockquote className="border-l-4 border-palm-500 pl-5 md:pl-6">
              <p className="font-display text-2xl leading-snug text-ink-900 md:text-3xl">
                “{quote.text}”
              </p>
              <footer className="mt-4 text-sm text-ink-600">
                — {attribution}
                {quote.sourceUrl && (
                  <>
                    {' · '}
                    <a
                      href={quote.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline decoration-leaf-300 underline-offset-2 hover:text-leaf-700"
                    >
                      Source
                    </a>
                  </>
                )}
              </footer>
            </blockquote>
          </div>

          {quote.sharingPermitted && (
            <div className="relative shrink-0">
<button
                  type="button"
                  aria-expanded={menuOpen}
                  aria-controls="quote-share-menu"
                  onClick={() => setMenuOpen((open) => !open)}
                  className="inline-flex items-center gap-2 rounded-md border border-leaf-200 bg-white px-3 py-2 text-sm font-medium text-leaf-800 transition hover:border-leaf-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700"
                >
                  <ShareIcon className="h-4 w-4" />
                  Share
                </button>
                {menuOpen && (
                  <div
                    id="quote-share-menu"
                    className="absolute right-0 top-full z-20 mt-2 min-w-[12rem] rounded-lg border border-paper-200 bg-white p-1.5 shadow-lg"
                  >
                  <ShareButton
                    href={shareHref('wa')}
                    label="Share on WhatsApp"
                    onClick={() => setMenuOpen(false)}
                  >
                    WhatsApp
                  </ShareButton>
                  <ShareButton
                    href={shareHref('fb')}
                    label="Share on Facebook"
                    onClick={() => setMenuOpen(false)}
                  >
                    Facebook
                  </ShareButton>
                  <ShareButton
                    href={shareHref('x')}
                    label="Share on X"
                    onClick={() => setMenuOpen(false)}
                  >
                    X (Twitter)
                  </ShareButton>
                  <ShareButton label="Copy quote and link" onClick={() => void copyLink()}>
                    {copied ? 'Copied' : 'Copy link'}
                  </ShareButton>
                </div>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}