'use client'

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { ShareIcon } from '@/components/icons'

interface ShareButtonsProps {
  title: string
  shareUrl: string
  className?: string
}

const baseClasses =
  'inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-ink-200 bg-white px-3 py-1.5 text-sm font-medium text-ink-700 transition-colors hover:bg-paper-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700'

export function ShareButtons({ title, shareUrl, className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const waText = encodeURIComponent(`${title} — ${shareUrl}`)
  const fbUrl = encodeURIComponent(shareUrl)
  const xText = encodeURIComponent(title)
  const xUrl = encodeURIComponent(shareUrl)

  return (
    <div
      role="group"
      aria-label="Share this page"
      className={cn('flex flex-wrap items-center gap-2', className)}
    >
      <span className="flex items-center gap-1.5 text-sm text-ink-500">
        <ShareIcon className="h-4 w-4" />
        Share
      </span>
      <a
        href={`https://wa.me/?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on WhatsApp"
        className={baseClasses}
      >
        WhatsApp
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${fbUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on Facebook"
        className={baseClasses}
      >
        Facebook
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${xText}&url=${xUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Share on X"
        className={baseClasses}
      >
        X
      </a>
      <button type="button" onClick={copyLink} aria-label="Copy link" className={baseClasses}>
        {copied ? 'Copied' : 'Copy link'}
      </button>
    </div>
  )
}