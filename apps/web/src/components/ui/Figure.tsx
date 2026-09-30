import { cn } from './Card'
import { LEAF_CUT_PATH } from './LeafCutFrame'
import { ResponsiveImage, type ResponsiveImageSource } from './ResponsiveImage'

interface FigureProps {
  src?: string
  image?: ResponsiveImageSource
  alt: string
  caption?: string
  credit?: string
  decorative?: boolean
  consentStatus?: 'cleared' | 'pending' | 'not-for-publication'
  containsMinors?: boolean
  /** Mark the LCP image (home hero) so it loads eagerly. */
  priority?: boolean
  className?: string
}

export function Figure({
  src,
  image,
  alt,
  caption,
  credit,
  decorative,
  consentStatus = 'pending',
  containsMinors,
  priority = false,
  className,
}: FigureProps) {
  const isCleared = consentStatus === 'cleared'
  const showImage = isCleared && Boolean(src || image?.asset?._ref)

  return (
    <figure className={cn('relative', className)}>
      <div className="relative overflow-hidden rounded-leaf">
        <div
          style={{
            clipPath: LEAF_CUT_PATH,
          }}
        >
          {showImage ? (
            <ResponsiveImage
              src={src}
              image={image}
              alt={alt}
              decorative={decorative}
              ratio="4/3"
              displayWidth={1200}
              priority={priority}
              className="aspect-[4/3] w-full object-cover"
            />
          ) : (
            <div
              role="img"
              aria-label={decorative ? undefined : alt}
              className="flex aspect-[4/3] w-full items-center justify-center border-2 border-dashed border-ink-200 bg-paper-100 px-4 text-center text-sm text-ink-500"
            >
              Image pending consent
            </div>
          )}
        </div>
        {containsMinors ? (
          <span className="absolute right-3 top-3 rounded-full bg-warning-light px-2 py-0.5 text-xs font-medium text-warning-dark shadow-sm">
            Guardian consent on file
          </span>
        ) : null}
      </div>
      {caption ? (
        <figcaption className="mt-2 px-1 text-sm italic text-ink-600">{caption}</figcaption>
      ) : null}
      {credit ? <p className="mt-1 px-1 text-xs text-ink-400">Credit: {credit}</p> : null}
    </figure>
  )
}