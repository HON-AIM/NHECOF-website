import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { notFound } from 'next/navigation'

/**
 * Styleguide — /styleguide
 *
 * Internal-only page showing every token and component in all states.
 * Disabled in production (returns 404). Noindex, excluded from sitemap.
 */

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/styleguide',
    fallbackTitle: 'Styleguide',
    fallbackDescription: 'Internal design system reference for NHECOF.',
    noindex: true,
  })
}

// Disable in production
const isProduction = process.env.NODE_ENV === 'production'

export default function StyleguidePage() {
  if (isProduction) notFound()

  return (
    <div className="mx-auto max-w-[var(--width-wide)] px-4 py-12 md:px-8">
      <header className="mb-12 border-b-2 border-ink-200 pb-8">
        <h1 className="font-display text-4xl font-bold text-leaf-900">
          NHECOF Design System
        </h1>
        <p className="mt-2 text-lg text-ink-600">
          Internal reference for tokens, components, and patterns.
        </p>
        <p className="mt-1 text-sm text-ink-400">
          This page is noindex and excluded from the sitemap. Disabled in production.
        </p>
      </header>

      {/* ── Colour Tokens ─────────────────────────────────────────────── */}
      <Section title="Colour Tokens">
        <TokenSwatchGroup title="Leaf (Primary)">
          <Swatch name="leaf-50" bg="bg-leaf-50" />
          <Swatch name="leaf-100" bg="bg-leaf-100" />
          <Swatch name="leaf-200" bg="bg-leaf-200" />
          <Swatch name="leaf-300" bg="bg-leaf-300" />
          <Swatch name="leaf-400" bg="bg-leaf-400" />
          <Swatch name="leaf-500" bg="bg-leaf-500" text="text-white" />
          <Swatch name="leaf-600" bg="bg-leaf-600" text="text-white" />
          <Swatch name="leaf-700" bg="bg-leaf-700" text="text-white" />
          <Swatch name="leaf-800" bg="bg-leaf-800" text="text-white" />
          <Swatch name="leaf-900" bg="bg-leaf-900" text="text-white" />
          <Swatch name="leaf-950" bg="bg-leaf-950" text="text-white" />
        </TokenSwatchGroup>
        <TokenSwatchGroup title="Palm Oil (Action/Accent)">
          <Swatch name="palm-50" bg="bg-palm-50" />
          <Swatch name="palm-100" bg="bg-palm-100" />
          <Swatch name="palm-200" bg="bg-palm-200" />
          <Swatch name="palm-300" bg="bg-palm-300" />
          <Swatch name="palm-400" bg="bg-palm-400" />
          <Swatch name="palm-500" bg="bg-palm-500" text="text-white" />
          <Swatch name="palm-600" bg="bg-palm-600" text="text-white" />
          <Swatch name="palm-700" bg="bg-palm-700" text="text-white" />
          <Swatch name="palm-800" bg="bg-palm-800" text="text-white" />
          <Swatch name="palm-900" bg="bg-palm-900" text="text-white" />
        </TokenSwatchGroup>
        <TokenSwatchGroup title="Zobo (Highlight/Caution)">
          <Swatch name="zobo-50" bg="bg-zobo-50" />
          <Swatch name="zobo-100" bg="bg-zobo-100" />
          <Swatch name="zobo-200" bg="bg-zobo-200" />
          <Swatch name="zobo-300" bg="bg-zobo-300" />
          <Swatch name="zobo-400" bg="bg-zobo-400" />
          <Swatch name="zobo-600" bg="bg-zobo-600" text="text-white" />
          <Swatch name="zobo-700" bg="bg-zobo-700" text="text-white" />
          <Swatch name="zobo-800" bg="bg-zobo-800" text="text-white" />
          <Swatch name="zobo-900" bg="bg-zobo-900" text="text-white" />
        </TokenSwatchGroup>
        <TokenSwatchGroup title="Paper (Backgrounds)">
          <Swatch name="paper-50" bg="bg-paper-50" />
          <Swatch name="paper-100" bg="bg-paper-100" />
          <Swatch name="paper-200" bg="bg-paper-200" />
          <Swatch name="paper-300" bg="bg-paper-300" />
          <Swatch name="paper-400" bg="bg-paper-400" />
        </TokenSwatchGroup>
        <TokenSwatchGroup title="Ink (Text)">
          <Swatch name="ink-100" bg="bg-ink-100" />
          <Swatch name="ink-200" bg="bg-ink-200" />
          <Swatch name="ink-300" bg="bg-ink-300" />
          <Swatch name="ink-400" bg="bg-ink-400" />
          <Swatch name="ink-500" bg="bg-ink-500" />
          <Swatch name="ink-600" bg="bg-ink-600" />
          <Swatch name="ink-700" bg="bg-ink-700" text="text-white" />
          <Swatch name="ink-800" bg="bg-ink-800" text="text-white" />
          <Swatch name="ink-900" bg="bg-ink-900" text="text-white" />
        </TokenSwatchGroup>
        <TokenSwatchGroup title="Semantic">
          <Swatch name="success" bg="bg-success" text="text-white" />
          <Swatch name="success-light" bg="bg-success-light" />
          <Swatch name="warning" bg="bg-warning" text="text-white" />
          <Swatch name="warning-light" bg="bg-warning-light" />
          <Swatch name="error" bg="bg-error" text="text-white" />
          <Swatch name="error-light" bg="bg-error-light" />
          <Swatch name="info" bg="bg-info" text="text-white" />
          <Swatch name="info-light" bg="bg-info-light" />
        </TokenSwatchGroup>
      </Section>

      {/* ── Typography ────────────────────────────────────────────────── */}
      <Section title="Typography">
        <div className="space-y-4">
          <div>
            <p className="text-5xl font-display font-bold text-ink-900">Display 5XL</p>
            <p className="text-xs text-ink-400">text-5xl font-display</p>
          </div>
          <div>
            <p className="text-4xl font-display font-bold text-ink-900">Display 4XL</p>
            <p className="text-xs text-ink-400">text-4xl font-display</p>
          </div>
          <div>
            <p className="text-3xl font-display font-semibold text-ink-900">Heading 3XL</p>
            <p className="text-xs text-ink-400">text-3xl font-display font-semibold</p>
          </div>
          <div>
            <p className="text-2xl font-display font-semibold text-ink-900">Heading 2XL</p>
            <p className="text-xs text-ink-400">text-2xl font-display font-semibold</p>
          </div>
          <div>
            <p className="text-xl font-display font-semibold text-ink-900">Heading XL</p>
            <p className="text-xs text-ink-400">text-xl font-display font-semibold</p>
          </div>
          <div>
            <p className="text-lg font-display font-semibold text-ink-900">Heading LG</p>
            <p className="text-xs text-ink-400">text-lg font-display font-semibold</p>
          </div>
          <div>
            <p className="text-base text-ink-900">Body text (base). The quick brown fox jumps over the lazy dog. Nutrition knowledge should be accessible to all Nigerians.</p>
            <p className="text-xs text-ink-400">text-base font-body</p>
          </div>
          <div>
            <p className="text-sm text-ink-600">Small text for captions and metadata.</p>
            <p className="text-xs text-ink-400">text-sm</p>
          </div>
          <div>
            <p className="text-xs text-ink-500">Extra small text for labels and disclaimers.</p>
            <p className="text-xs text-ink-400">text-xs</p>
          </div>
        </div>
      </Section>

      {/* ── Spacing ───────────────────────────────────────────────────── */}
      <Section title="Spacing Scale">
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map((n) => (
            <div key={n} className="flex items-center gap-4">
              <span className="w-12 text-xs text-ink-500">{n}</span>
              <div className={`h-4 bg-leaf-500`} style={{ width: `${n * 0.25}rem` }} />
              <span className="text-xs text-ink-400">{n * 4}px</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Radii ─────────────────────────────────────────────────────── */}
      <Section title="Border Radii">
        <div className="flex flex-wrap gap-4">
          {[
            { name: 'none', class: 'rounded-none' },
            { name: 'sm', class: 'rounded-sm' },
            { name: 'md', class: 'rounded-md' },
            { name: 'lg', class: 'rounded-lg' },
            { name: 'xl', class: 'rounded-xl' },
            { name: '2xl', class: 'rounded-2xl' },
            { name: 'leaf', class: 'rounded-leaf' },
            { name: 'full', class: 'rounded-full' },
          ].map(({ name, class: cls }) => (
            <div key={name} className="text-center">
              <div className={`h-16 w-16 bg-leaf-200 ${cls}`} />
              <p className="mt-1 text-xs text-ink-500">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Shadows ───────────────────────────────────────────────────── */}
      <Section title="Shadows">
        <div className="flex flex-wrap gap-8">
          {['shadow-xs', 'shadow-sm', 'shadow-md', 'shadow-lg'].map((s) => (
            <div key={s} className="text-center">
              <div className={`h-20 w-32 rounded-lg bg-white ${s}`} />
              <p className="mt-2 text-xs text-ink-500">{s}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Buttons ───────────────────────────────────────────────────── */}
      <Section title="Buttons">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-md bg-leaf-700 px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700">Primary MD</button>
            <button className="rounded-md bg-leaf-700 px-3 py-1.5 text-sm font-semibold text-white hover:bg-leaf-800">Primary SM</button>
            <button className="rounded-md bg-leaf-700 px-6 py-3 text-base font-semibold text-white hover:bg-leaf-800">Primary LG</button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-md bg-palm-600 px-4 py-2 text-sm font-semibold text-white hover:bg-palm-700">Secondary</button>
            <button className="rounded-md border border-ink-200 bg-transparent px-4 py-2 text-sm font-medium text-ink-700 hover:bg-paper-100">Quiet</button>
            <button className="bg-transparent text-sm font-medium text-leaf-700 underline underline-offset-4 hover:text-leaf-800">Link Button</button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button className="rounded-md bg-leaf-700 px-4 py-2 text-sm font-semibold text-white" aria-busy="true" disabled>
              <svg className="mr-2 inline h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /></svg>
              Loading…
            </button>
            <button className="rounded-md bg-ink-100 px-4 py-2 text-sm font-semibold text-ink-400 cursor-not-allowed" disabled>Disabled</button>
          </div>
        </div>
      </Section>

      {/* ── Badge ─────────────────────────────────────────────────────── */}
      <Section title="Badges">
        <div className="flex flex-wrap gap-2">
          {['default', 'success', 'warning', 'error', 'info', 'leaf', 'palm', 'zobo'].map((v) => (
            <span key={v} className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              v === 'success' ? 'bg-success-light text-success-dark' :
              v === 'warning' ? 'bg-warning-light text-warning-dark' :
              v === 'error' ? 'bg-error-light text-error-dark' :
              v === 'info' ? 'bg-info-light text-info-dark' :
              v === 'leaf' ? 'bg-leaf-100 text-leaf-800' :
              v === 'palm' ? 'bg-palm-100 text-palm-800' :
              v === 'zobo' ? 'bg-zobo-100 text-zobo-800' :
              'bg-ink-100 text-ink-700'
            }`}>{v}</span>
          ))}
        </div>
      </Section>

      {/* ── Eyebrow ───────────────────────────────────────────────────── */}
      <Section title="Eyebrows">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-leaf-700">Default Eyebrow</p>
          <p className="text-xs font-semibold uppercase tracking-widest text-palm-600">Accent Eyebrow</p>
          <p className="text-xs font-semibold uppercase tracking-widest text-zobo-600">Caution Eyebrow</p>
        </div>
      </Section>

      {/* ── Stat ──────────────────────────────────────────────────────── */}
      <Section title="Stat">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="text-center">
            <p className="text-4xl font-display font-bold text-leaf-700">600+</p>
            <p className="mt-1 text-lg text-ink-700">People Reached</p>
            <p className="text-sm text-ink-400">As of Dec 2025</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-display font-bold text-palm-600">3</p>
            <p className="mt-1 text-lg text-ink-700">Nigerian States</p>
            <p className="text-sm text-ink-400">As of Dec 2025</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-display font-bold text-zobo-600">10+</p>
            <p className="mt-1 text-lg text-ink-700">Outreaches Completed</p>
            <p className="text-sm text-ink-400">As of Dec 2025</p>
          </div>
        </div>
      </Section>

      {/* ── Callout ───────────────────────────────────────────────────── */}
      <Section title="Callouts">
        <div className="space-y-4">
          <div className="border-l-4 border-info rounded-r-lg bg-info-light p-4">
            <p className="font-semibold text-info-dark">Information</p>
            <p className="text-sm text-info-dark">This is an informational callout. It provides helpful context.</p>
          </div>
          <div className="border-l-4 border-warning rounded-r-lg bg-warning-light p-4">
            <p className="font-semibold text-warning-dark">Caution</p>
            <p className="text-sm text-warning-dark">This is a caution callout. It warns about important considerations.</p>
          </div>
          <div className="border-l-4 border-ink-400 border-dashed rounded-r-lg bg-paper-100 p-4">
            <p className="font-semibold text-ink-700">Educational Disclaimer</p>
            <p className="text-sm text-ink-600 italic">This content is for educational purposes only and is not a substitute for professional medical advice.</p>
          </div>
        </div>
      </Section>

      {/* ── Form Elements ─────────────────────────────────────────────── */}
      <Section title="Form Elements">
        <div className="space-y-6 max-w-md">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-800" htmlFor="demo-input">Text Input</label>
            <input id="demo-input" type="text" placeholder="Enter your name" className="w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-2 focus:outline-leaf-700 focus:outline-offset-2" />
            <p className="mt-1 text-xs text-ink-500">Help text goes here.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-800" htmlFor="demo-error">Input with Error</label>
            <input id="demo-error" type="text" defaultValue="invalid@" className="w-full rounded-md border border-error bg-white px-3 py-2 text-sm text-ink-900 focus:outline-2 focus:outline-error focus:outline-offset-2" aria-invalid="true" />
            <p className="mt-1 text-xs text-error">Please enter a valid email address.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-800" htmlFor="demo-textarea">Textarea</label>
            <textarea id="demo-textarea" rows={4} placeholder="Write your message…" className="w-full min-h-[120px] resize-y rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-2 focus:outline-leaf-700 focus:outline-offset-2" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-800" htmlFor="demo-select">Select</label>
            <select id="demo-select" className="w-full appearance-none rounded-md border border-ink-200 bg-white px-3 py-2 text-sm text-ink-900 focus:outline-2 focus:outline-leaf-700 focus:outline-offset-2">
              <option value="">Choose an option…</option>
              <option value="a">Option A</option>
              <option value="b">Option B</option>
              <option value="c">Option C</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="demo-checkbox" className="h-4 w-4 rounded border-ink-300 text-leaf-700 focus:ring-leaf-700" />
            <label htmlFor="demo-checkbox" className="text-sm text-ink-800">Checkbox label</label>
          </div>
          <fieldset>
            <legend className="text-sm font-medium text-ink-800">Radio Group</legend>
            <div className="mt-2 space-y-2">
              {['Option 1', 'Option 2', 'Option 3'].map((opt, i) => (
                <div key={opt} className="flex items-center gap-2">
                  <input type="radio" name="demo-radio" id={`radio-${i}`} defaultChecked={i === 0} className="h-4 w-4 border-ink-300 text-leaf-700 focus:ring-leaf-700" />
                  <label htmlFor={`radio-${i}`} className="text-sm text-ink-800">{opt}</label>
                </div>
              ))}
            </div>
          </fieldset>
        </div>
      </Section>

      {/* ── Card ──────────────────────────────────────────────────────── */}
      <Section title="Cards">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm">
            <div className="aspect-[16/10] bg-leaf-100" />
            <div className="p-5">
              <h3 className="font-display text-lg font-semibold text-ink-900">Article Card</h3>
              <p className="mt-1 text-sm text-ink-600 line-clamp-2">This is an example article card with a title, summary, and metadata.</p>
              <div className="mt-3 flex items-center gap-2 border-t border-ink-100 pt-3">
                <span className="inline-flex items-center rounded-full bg-leaf-100 px-2.5 py-0.5 text-xs font-medium text-leaf-800">Nutrition</span>
                <span className="text-xs text-ink-400">15 Jun 2025</span>
              </div>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm">
            <div className="aspect-[16/10] bg-palm-100" />
            <div className="p-5">
              <h3 className="font-display text-lg font-semibold text-ink-900">Food Card</h3>
              <p className="mt-1 text-sm text-ink-600 line-clamp-2">Millet is a drought-resistant cereal grain widely cultivated in Northern Nigeria.</p>
              <p className="mt-1 text-xs italic text-ink-400">Pennisetum glaucum</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-ink-100 bg-white shadow-sm">
            <div className="aspect-[16/10] bg-zobo-100" />
            <div className="p-5">
              <h3 className="font-display text-lg font-semibold text-ink-900">Outreach Card</h3>
              <p className="mt-1 text-sm text-ink-600 line-clamp-2">Community nutrition screening in Bodija, Ibadan.</p>
              <div className="mt-3 flex items-center gap-2 border-t border-ink-100 pt-3">
                <span className="inline-flex items-center rounded-full bg-success-light px-2.5 py-0.5 text-xs font-medium text-success-dark">Completed</span>
                <span className="text-xs text-ink-400">28 Dec 2025</span>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Skeleton ──────────────────────────────────────────────────── */}
      <Section title="Skeleton Loading">
        <div className="space-y-3 max-w-md">
          <div className="h-4 w-3/4 animate-pulse rounded bg-paper-200" />
          <div className="h-4 w-full animate-pulse rounded bg-paper-200" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-paper-200" />
          <div className="mt-4 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-paper-200" />
            <div className="space-y-2 flex-1">
              <div className="h-3 w-1/3 animate-pulse rounded bg-paper-200" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-paper-200" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Pattern Dividers ──────────────────────────────────────────── */}
      <Section title="Pattern Dividers">
        <p className="mb-2 text-sm text-ink-600">Diamonds variant:</p>
        <div className="mb-6 h-10 bg-paper-50">
          <svg width="100%" height="40" aria-hidden="true" className="text-leaf-300">
            <defs>
              <pattern id="sg-diamonds" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <path d="M12 2L22 12L12 22L2 12Z" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="40" fill="url(#sg-diamonds)" />
          </svg>
        </div>
        <p className="mb-2 text-sm text-ink-600">Waves variant:</p>
        <div className="mb-6 h-10 bg-paper-50">
          <svg width="100%" height="40" aria-hidden="true" className="text-palm-300">
            <defs>
              <pattern id="sg-waves" x="0" y="0" width="40" height="20" patternUnits="userSpaceOnUse">
                <path d="M0 10 Q10 0 20 10 T40 10" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </pattern>
            </defs>
            <rect width="100%" height="40" fill="url(#sg-waves)" />
          </svg>
        </div>
        <p className="mb-2 text-sm text-ink-600">Dots variant:</p>
        <div className="mb-6 h-10 bg-paper-50">
          <svg width="100%" height="40" aria-hidden="true" className="text-zobo-300">
            <defs>
              <pattern id="sg-dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="8" cy="8" r="2" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="40" fill="url(#sg-dots)" />
          </svg>
        </div>
      </Section>

      {/* ── Empty State ───────────────────────────────────────────────── */}
      <Section title="Empty State">
        <div className="rounded-lg border-2 border-dashed border-ink-200 py-12 text-center">
          <p className="text-5xl text-ink-300">📋</p>
          <p className="mt-4 text-lg font-semibold text-ink-700">No articles found</p>
          <p className="mt-1 text-sm text-ink-500">Try adjusting your search or filters.</p>
        </div>
      </Section>

      {/* ── Contrast Report Link ──────────────────────────────────────── */}
      <Section title="WCAG AA Contrast Report">
        <p className="text-sm text-ink-600">
          Run <code className="rounded bg-paper-200 px-1.5 py-0.5 font-mono text-xs">pnpm check:contrast</code> to verify all colour pairs meet WCAG AA thresholds (4.5:1 normal text, 3:1 large text and UI).
        </p>
      </Section>

      <div className="mt-16 border-t-2 border-ink-200 pt-8 text-center text-sm text-ink-400">
        NHECOF Design System — Internal Reference
      </div>
    </div>
  )
}

/* ── Helper Components ─────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 border-b border-ink-200 pb-2 font-display text-2xl font-semibold text-ink-900">
        {title}
      </h2>
      {children}
    </section>
  )
}

function TokenSwatchGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="mb-2 text-sm font-semibold text-ink-700">{title}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

function Swatch({ name, bg, text = 'text-ink-900' }: { name: string; bg: string; text?: string }) {
  return (
    <div className="text-center">
      <div className={`h-12 w-16 rounded-md border border-ink-200 ${bg}`} />
      <p className={`mt-1 text-xs ${text === 'text-white' ? 'text-ink-400' : 'text-ink-500'}`}>{name}</p>
    </div>
  )
}
