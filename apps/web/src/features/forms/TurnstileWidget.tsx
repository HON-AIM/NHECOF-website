'use client'

/**
 * Client-side Cloudflare Turnstile wrapper.
 *
 * Real mode: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is set → loads the official
 * script and renders the widget (invisible mode). The solved token is passed
 * back via `onTokenChange` and submitted alongside the form.
 *
 * Test mode: no site key is configured (local development / e2e before real
 * credentials exist) → a hidden token equal to `TURNSTILE_TEST_TOKEN` is set
 * manually. The server only accepts it while it is itself in test mode.
 *
 * The widget is fully keyboard operable and announces itself to screen
 * readers (the checkbox label follows Cloudflare's own guidance).
 */

import { useEffect, useState } from 'react'
import { TURNSTILE_TEST_TOKEN } from '@/features/forms/constants'

interface TurnstileWidgetProps {
  onTokenChange: (token: string) => void
  testMode?: boolean
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export function TurnstileWidget({ onTokenChange, testMode }: TurnstileWidgetProps) {
  const [scriptReady, setScriptReady] = useState(false)

  const isTestMode = testMode ?? !SITE_KEY

  // Test mode needs no script: emit the fixed token immediately.
  useEffect(() => {
    if (!isTestMode) return
    onTokenChange(TURNSTILE_TEST_TOKEN)
  }, [isTestMode])

  // Real mode: inject the Turnstile script once, render explicitly.
  useEffect(() => {
    if (isTestMode || scriptReady) return

    let cancelled = false
    const existed = document.getElementById('cf-turnstile-script') !== null

    function render() {
      if (!cancelled && typeof (window as unknown as { turnstile?: { render: unknown } }).turnstile !== 'undefined') {
        const id = 'cf-turnstile'
        const container = document.getElementById(id)
        const turnstile = (window as unknown as { turnstile: { render: (el: HTMLElement, o: Record<string, unknown>) => void } }).turnstile
        if (container && !container.hasChildNodes()) {
          turnstile.render(container, {
            sitekey: SITE_KEY,
            size: 'invisible',
            callback: (token: string) => onTokenChange(token),
          })
        }
      }
    }

    if (!existed) {
      const script = document.createElement('script')
      script.id = 'cf-turnstile-script'
      script.src = SCRIPT_SRC
      script.async = true
      script.defer = true
      script.onload = () => {
        setScriptReady(true)
        render()
      }
      document.head.appendChild(script)
    } else if (!scriptReady) {
      const whenLoaded =
        typeof (window as unknown as { turnstile?: unknown }).turnstile !== 'undefined'
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              const script = document.getElementById('cf-turnstile-script') as HTMLScriptElement
              if (script.onload) {
                const existing = script.onload as () => void
                script.onload = () => {
                  existing()
                  resolve()
                }
              } else {
                resolve()
              }
            })
      void whenLoaded.then(() => {
        setScriptReady(true)
        render()
      })
    }

    return () => {
      cancelled = true
    }
  }, [isTestMode, scriptReady, onTokenChange])

  if (isTestMode) {
    return (
      <p className="sr-only" role="note">
        Form protection test mode — no challenge required.
      </p>
    )
  }

  return (
    <div>
      <div id="cf-turnstile" className="cf-turnstile" aria-label="Security check" />
    </div>
  )
}