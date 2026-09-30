import NextLink from 'next/link'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Section } from '@/components/ui/Section'
import { ArrowRightIcon } from '@/components/icons'
import { ctaToButtonVariant } from './ctaVariant'

interface ParticipationProps {
  heading?: string
  description?: string
  actions?: Array<{ label: string; url: string; variant?: string }>
}

const DEFAULT_ACTIONS = [
  {
    label: 'Request an outreach',
    url: '/request-an-outreach',
    variant: 'primary',
  },
  {
    label: 'Partner with us',
    url: '/partner',
    variant: 'secondary',
  },
  {
    label: 'Volunteer',
    url: '/volunteer',
    variant: 'quiet',
  },
]

export function Participation({
  heading,
  description,
  actions,
}: ParticipationProps) {
  const resolvedActions =
    actions && actions.length > 0 ? actions : DEFAULT_ACTIONS

  return (
    <Section
      aria-labelledby="participation-heading"
      className="bg-paper-100"
      pattern="bottom"
      padding="none"
    >
      <Container width="wide" className="py-14 md:py-20">
        <div className="mx-auto max-w-xl text-center">
          <h2
            id="participation-heading"
            className="font-display text-2xl font-bold text-ink-900 md:text-3xl"
          >
            {heading || 'Get involved'}
          </h2>
          {description && (
            <p className="mt-3 text-base text-ink-600">{description}</p>
          )}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {resolvedActions.map((action) => (
            <div
              key={action.url}
              className="flex flex-col items-center rounded-xl border border-ink-100 bg-white p-6 text-center transition-shadow hover:shadow-md"
            >
              <h3 className="font-display text-lg font-semibold text-ink-900">
                {action.label}
              </h3>
              <div className="mt-4">
                <Button
                  variant={ctaToButtonVariant(action.variant)}
                  size="md"
                  asChild
                >
                  <NextLink href={action.url}>
                    {action.label}
                    <ArrowRightIcon className="h-4 w-4" />
                  </NextLink>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
