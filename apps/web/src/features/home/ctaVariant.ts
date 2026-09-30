export type ButtonVariant = 'primary' | 'secondary' | 'quiet'

/**
 * Map a Sanity CTA variant (`primary` | `secondary` | `outline`) onto the
 * Button variants supported by the design system. `outline` has no direct
 * Button equivalent, so it renders as `secondary`. A missing variant falls
 * back to the caller-provided default so positional CTAs keep their intent.
 */
export function ctaToButtonVariant(
  variant: string | undefined,
  fallback: ButtonVariant = 'primary',
): ButtonVariant {
  if (variant === 'primary') return 'primary'
  if (variant === 'secondary' || variant === 'outline') return 'secondary'
  if (variant === 'quiet') return 'quiet'
  return fallback
}