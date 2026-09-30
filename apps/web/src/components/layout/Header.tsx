'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type Dispatch,
  type SetStateAction,
} from 'react'
import NextLink from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/cn'
import {
  BasicsIcon,
  FoodsIcon,
  LifeStagesIcon,
  ConditionsIcon,
  HealthyLivingIcon,
  FoodSafetyIcon,
  MythsIcon,
  SearchIcon,
  MenuIcon,
  CloseIcon,
  ChevronDownIcon,
} from '@/components/icons'
import type { IconProps } from '@/components/icons'
import { NutritionSearchDialog } from '@/components/search/NutritionSearchDialog'
// NOTE (perf follow-up): the command palette bundles @radix-ui/react-dialog and
// minisearch into the header chunk that every route loads. Code-splitting it
// with `next/dynamic` is the obvious win, but the dialog renders its own
// trigger, so `ssr: false` would drop the search button out of the server HTML
// and cost accessibility and a layout shift. It needs a trigger/panel split
// first. Tracked in docs/quality-report.md.

/* ────────────────────────────────────────────────────────────────────────────
   Constants
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * Intrinsic size of /nhecof-logo.png (600x171). Declared rather than hard-coded
 * at the call site so `width`/`height` stay truthful, which is what lets Next
 * reserve the box and avoid a layout shift when the header paints. The rendered
 * height is driven by the `h-10` / `h-8` classes on the link.
 */
const LOGO_W = 600
const LOGO_H = 171

const NAV_ITEMS: Array<{ label: string; href: string; children?: boolean }> = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'What We Do', href: '/what-we-do' },
  { label: 'Nutrition Hub', href: '/nutrition', children: true },
  { label: 'Our Impact', href: '/impact' },
  { label: 'Get Involved', href: '/get-involved' },
]

const NUTRITION_TOPICS = [
  { label: 'Nutrition Basics', href: '/nutrition/articles?category=nutrition-basics', icon: BasicsIcon },
  { label: 'Food Groups & Composition', href: '/nutrition/articles?category=food-groups', icon: FoodsIcon },
  { label: 'Life Stages', href: '/nutrition/articles?category=life-stages', icon: LifeStagesIcon },
  { label: 'Health Conditions', href: '/nutrition/articles?category=health-conditions', icon: ConditionsIcon },
  { label: 'Healthy Living', href: '/nutrition/articles?category=healthy-living', icon: HealthyLivingIcon },
  { label: 'Food Safety', href: '/nutrition/articles?category=food-safety', icon: FoodSafetyIcon },
  { label: 'Myths & Facts', href: '/nutrition/articles?category=myths-facts', icon: MythsIcon },
] as const

/* ────────────────────────────────────────────────────────────────────────────
   Search dialog trigger (opens the command palette via NutritionSearchDialog)
   ──────────────────────────────────────────────────────────────────────────── */

const SearchTrigger = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement>
>(function SearchTrigger({ className, type = 'button', children, ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      {...rest}
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-ink-100 bg-paper-50 px-3 py-2 text-sm text-ink-500 transition-colors hover:bg-paper-100 hover:text-ink-700',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
        className,
      )}
    >
      {children}
    </button>
  )
})

function SearchTriggerContent() {
  return (
    <>
      <SearchIcon className="h-4 w-4" />
      <span className="hidden lg:inline">Search</span>
      <kbd className="ml-2 hidden rounded border border-ink-100 bg-paper-50 px-1.5 py-0.5 font-mono text-xs text-ink-400 lg:inline">
        /
      </kbd>
    </>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Nutrition Hub dropdown panel (desktop only)
   ──────────────────────────────────────────────────────────────────────────── */

function NutritionDropdown() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancelClose = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [])

  const scheduleClose = useCallback(() => {
    cancelClose()
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }, [cancelClose])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }

    function handleClickOutside(e: MouseEvent) {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div
      className="relative"
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex min-h-6 items-center gap-1 py-1.5 text-sm font-medium transition-colors',
          open ? 'text-leaf-700' : 'text-ink-700 hover:text-leaf-700',
        )}
      >
        Nutrition Hub
        <ChevronDownIcon
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-fast',
            open && 'rotate-180',
          )}
        />
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="Nutrition Hub topics"
          className="absolute left-1/2 top-full z-dropdown mt-2 w-72 -translate-x-1/2 rounded-xl border border-ink-100 bg-white p-2 shadow-lg"
        >
          <p className="mb-2 px-3 pt-1 text-xs font-semibold uppercase tracking-wide text-ink-400">
            Browse topics
          </p>
          <ul className="space-y-0.5">
            {NUTRITION_TOPICS.map((topic) => {
              const Icon = topic.icon as React.ComponentType<IconProps>
              return (
                <li key={topic.href}>
                  <NextLink
                    href={topic.href}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-ink-700 transition-colors hover:bg-leaf-50 hover:text-leaf-800',
                      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
                    )}
                  >
                    <Icon className="h-5 w-5 text-leaf-600" />
                    {topic.label}
                  </NextLink>
                </li>
              )
            })}
          </ul>
          <div className="mt-2 border-t border-ink-100 pt-2">
            <NextLink
              href="/nutrition"
              role="menuitem"
              onClick={() => setOpen(false)}
              className={cn(
                'block rounded-lg px-3 py-2.5 text-center text-sm font-semibold text-leaf-700 transition-colors hover:bg-leaf-50',
                'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
              )}
            >
              All nutrition resources
            </NextLink>
          </div>
        </div>
      )}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Mobile sheet navigation
   ──────────────────────────────────────────────────────────────────────────── */

interface MobileNavProps {
  open: boolean
  onClose: Dispatch<SetStateAction<boolean>>
}

function MobileNav({ open, onClose }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Lock body scroll and remove the rest of the page from the accessibility
  // tree while the sheet is open (modal dialog semantics).
  useEffect(() => {
    if (!open) return
    const scrollY = window.scrollY
    document.body.style.position = 'fixed'
    document.body.style.top = `-${scrollY}px`
    document.body.style.width = '100%'
    const backgrounds = Array.from(document.querySelectorAll('main, footer'))
    const hadInert = new Map<Element, string | null>()
    for (const el of backgrounds) {
      hadInert.set(el, el.getAttribute('inert'))
      el.setAttribute('inert', '')
    }
    return () => {
      document.body.style.position = ''
      document.body.style.top = ''
      document.body.style.width = ''
      for (const el of backgrounds) {
        const original = hadInert.get(el) ?? null
        if (original === null) el.removeAttribute('inert')
        else el.setAttribute('inert', original)
      }
      window.scrollTo(0, scrollY)
    }
  }, [open])

  // Focus trap + ESC to close
  useEffect(() => {
    if (!open) return

    previousFocusRef.current = document.activeElement as HTMLElement
    // Small delay so the DOM is ready
    requestAnimationFrame(() => closeButtonRef.current?.focus())

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose(false)
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  // Restore focus on close
  useEffect(() => {
    if (!open && previousFocusRef.current) {
      previousFocusRef.current.focus()
      previousFocusRef.current = null
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-modal lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation menu">
      {/* Overlay */}
      <button
        type="button"
        aria-hidden="true"
        tabIndex={-1}
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => onClose(false)}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="fixed inset-y-0 left-0 flex w-full max-w-sm flex-col bg-paper-50 shadow-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-4">
          <span className="font-display text-lg font-bold text-leaf-900">Menu</span>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close menu"
            onClick={() => onClose(false)}
            className={cn(
              'rounded-full p-2 text-ink-500 transition-colors hover:bg-paper-100 hover:text-ink-900',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
            )}
          >
            <CloseIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Nav links */}
        <nav aria-label="Mobile navigation" className="flex-1 overflow-y-auto">
          <ul className="space-y-1 p-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <NextLink
                  href={item.href}
                  onClick={() => onClose(false)}
                  className={cn(
                    'block min-h-[44px] rounded-lg px-4 py-3 text-base font-medium text-ink-800 transition-colors hover:bg-leaf-50 hover:text-leaf-800',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
                  )}
                >
                  {item.label}
                </NextLink>
              </li>
            ))}
          </ul>

          {/* Nutrition Hub sub-topics */}
          <div className="border-t border-ink-100 px-4 pt-4 pb-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              Nutrition Hub
            </p>
            <ul className="space-y-0.5">
              {NUTRITION_TOPICS.map((topic) => {
                const Icon = topic.icon as React.ComponentType<IconProps>
                return (
                  <li key={topic.href}>
                    <NextLink
                      href={topic.href}
                      onClick={() => onClose(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-4 py-3 text-sm text-ink-700 transition-colors hover:bg-leaf-50 hover:text-leaf-800',
                        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
                      )}
                    >
                      <Icon className="h-5 w-5 text-leaf-600" />
                      {topic.label}
                    </NextLink>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* CTA pinned at bottom */}
        <div className="border-t border-ink-100 p-4">
          <NextLink
            href="/request-an-outreach"
            onClick={() => onClose(false)}
            className={cn(
              'flex min-h-[48px] items-center justify-center rounded-lg bg-palm-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-palm-700',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
            )}
          >
            Request an Outreach
          </NextLink>
        </div>
      </div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────────────
   Header component
   ──────────────────────────────────────────────────────────────────────────── */

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let ticking = false

    function handleScroll() {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10)
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      role="banner"
      className={cn(
        'sticky top-0 z-sticky border-b bg-paper-50 transition-all duration-normal',
        scrolled
          ? 'border-ink-100/60 shadow-sm backdrop-blur-sm'
          : 'border-paper-200',
      )}
    >
      <div className="mx-auto flex max-w-[var(--width-broad)] items-center justify-between gap-4 px-4 py-3 transition-all duration-normal sm:px-6 lg:px-8">
        {/* Logo */}
        <NextLink
          href="/"
          className={cn(
            'flex shrink-0 items-center transition-all duration-normal',
            scrolled ? 'h-8' : 'h-10',
          )}
          aria-label="NHECOF — Home"
        >
          <Image
            src="/nhecof-logo.png"
            alt=""
            width={LOGO_W}
            height={LOGO_H}
            priority
            sizes="150px"
            className="h-full w-auto"
          />
        </NextLink>

        {/* Desktop nav */}
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <NutritionDropdown key={item.href} />
            ) : (
              <NextLink
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-sm font-medium text-ink-700 transition-colors hover:bg-paper-100 hover:text-leaf-700',
                  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
                )}
              >
                {item.label}
              </NextLink>
            ),
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <NutritionSearchDialog
            shortcut="desktop"
            trigger={
              <SearchTrigger aria-label="Open search" className="hidden md:inline-flex">
                <SearchTriggerContent />
              </SearchTrigger>
            }
          />
          <NextLink
            href="/request-an-outreach"
            className={cn(
              'hidden rounded-lg bg-palm-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-palm-700',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white',
              'md:inline-block',
            )}
          >
            Request an Outreach
          </NextLink>

          {/* Mobile: search + hamburger */}
          <NutritionSearchDialog
            shortcut="mobile"
            trigger={
              <SearchTrigger aria-label="Open search" className="md:hidden">
                <SearchTriggerContent />
              </SearchTrigger>
            }
          />
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen(true)}
            className={cn(
              'rounded-lg p-2 text-ink-700 transition-colors hover:bg-paper-100 lg:hidden',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700',
            )}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={setMobileOpen} />
    </header>
  )
}
