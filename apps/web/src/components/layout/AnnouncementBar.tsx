'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/cn'

interface AnnouncementBarProps {
  id: string
  text: string
  className?: string
}

function getDismissedIds(): Set<string> {
  if (typeof window === 'undefined') return new Set()
  try {
    const raw = localStorage.getItem('nhecof-dismissed-announcements')
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function setDismissedIds(ids: Set<string>) {
  try {
    localStorage.setItem(
      'nhecof-dismissed-announcements',
      JSON.stringify([...ids]),
    )
  } catch {
    // localStorage unavailable — silently fail
  }
}

export function AnnouncementBar({ id, text, className }: AnnouncementBarProps) {
  const [visible, setVisible] = useState<boolean | null>(null)

  useEffect(() => {
    const dismissed = getDismissedIds()
    setVisible(!dismissed.has(id))
  }, [id])

  function dismiss() {
    const dismissed = getDismissedIds()
    dismissed.add(id)
    setDismissedIds(dismissed)
    setVisible(false)
  }

  // Render nothing during SSR or when dismissed to prevent layout shift
  if (visible !== true) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'relative bg-clay-600 px-4 py-2.5 text-center text-sm font-medium text-white',
        className,
      )}
    >
      <p>{text}</p>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
