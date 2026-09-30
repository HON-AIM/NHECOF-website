import NextLink from 'next/link'
import { Container } from '@/components/ui/Container'
import { Link } from '@/components/ui/Link'
import type { Program } from './queries'

interface WhatWeDoProps {
  programmes: Program[]
}

export function WhatWeDo({ programmes }: WhatWeDoProps) {
  if (!programmes || programmes.length === 0) return null

  return (
    <section aria-labelledby="what-we-do-heading" className="bg-paper-50">
      <Container width="wide" className="py-14 md:py-20">
        <h2
          id="what-we-do-heading"
          className="font-display text-2xl font-bold text-ink-900 md:text-3xl"
        >
          What we do
        </h2>
        <p className="mt-2 max-w-prose text-base text-ink-600">
          NHECOF works through structured programmes that bring nutrition
          education and preventive health support directly to communities.
        </p>

        <ol className="mt-10 space-y-0 divide-y divide-ink-100">
          {programmes.map((programme, index) => (
            <li
              key={programme._id}
              className="group flex gap-5 py-5 first:pt-0 last:pb-0"
            >
              {/* Number */}
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-leaf-100 font-display text-lg font-bold text-leaf-800 transition-colors group-hover:bg-leaf-200"
                aria-hidden="true"
              >
                {String(index + 1).padStart(2, '0')}
              </span>

              {/* Content */}
              <div className="min-w-0">
                <h3 className="font-display text-lg font-semibold text-ink-900">
                  <Link
                    href={`/what-we-do/${programme.slug.current}`}
                    variant="subtle"
                    className="hover:text-leaf-700"
                  >
                    {programme.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">
                  {programme.summary}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-8">
          <NextLink
            href="/what-we-do"
            className="text-sm font-semibold text-leaf-700 underline-offset-2 hover:underline"
          >
            Read more about our work
          </NextLink>
        </div>
      </Container>
    </section>
  )
}
