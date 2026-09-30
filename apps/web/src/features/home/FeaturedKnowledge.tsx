import NextLink from 'next/link'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { Link } from '@/components/ui/Link'
import { formatDateShort } from '@/lib/format'
import type { ArticleSummary, FoodProfileSummary } from './queries'

interface FeaturedKnowledgeProps {
  article: ArticleSummary | null
  foodProfile: FoodProfileSummary | null
}

function ArticleCard({ article }: { article: ArticleSummary }) {
  return (
    <article className="group relative rounded-xl border border-ink-100 bg-white p-6 transition-shadow hover:shadow-md">
      <div className="flex flex-wrap gap-2">
        {article.categories?.slice(0, 2).map((cat) => (
          <Badge key={cat.slug?.current} variant="leaf">
            {cat.title}
          </Badge>
        ))}
      </div>

      <h3 className="mt-3 font-display text-xl font-semibold text-ink-900 group-hover:text-leaf-700">
        <NextLink href={`/nutrition/articles/${article.slug.current}`}>
          <span className="absolute inset-0" />
          {article.title}
        </NextLink>
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-600">
        {article.summary}
      </p>

      <div className="mt-4 flex items-center gap-3 text-xs text-ink-400">
        {article.author?.name && <span>By {article.author.name}</span>}
        {article.publishedAt && (
          <time dateTime={article.publishedAt}>
            {formatDateShort(article.publishedAt)}
          </time>
        )}
      </div>
    </article>
  )
}

function FoodProfileCard({
  foodProfile,
}: {
  foodProfile: FoodProfileSummary
}) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-ink-100 bg-leaf-50 transition-shadow hover:shadow-md">
      {/* Decorative leaf-cut top edge */}
      <div className="h-2 bg-leaf-700" />

      <div className="p-6">
        <Badge variant="leaf">Food Profile</Badge>

        <h3 className="mt-3 font-display text-xl font-semibold text-ink-900 group-hover:text-leaf-700">
          <NextLink href={`/nutrition/foods/${foodProfile.slug.current}`}>
            <span className="absolute inset-0" />
            {foodProfile.title}
          </NextLink>
        </h3>

        {foodProfile.aliases && foodProfile.aliases.length > 0 && (
          <p className="mt-1 text-xs text-ink-400">
            Also known as: {foodProfile.aliases.join(', ')}
          </p>
        )}

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-600">
          {foodProfile.summary}
        </p>

        <div className="mt-4">
          <Link
            href={`/nutrition/foods/${foodProfile.slug.current}`}
            variant="branded"
            className="text-sm"
          >
            View full profile
          </Link>
        </div>
      </div>
    </article>
  )
}

export function FeaturedKnowledge({
  article,
  foodProfile,
}: FeaturedKnowledgeProps) {
  if (!article && !foodProfile) return null

  return (
    <section
      aria-labelledby="featured-knowledge-heading"
      className="bg-paper-100"
    >
      <Container width="wide" className="py-14 md:py-20">
        <h2
          id="featured-knowledge-heading"
          className="font-display text-2xl font-bold text-ink-900 md:text-3xl"
        >
          Featured knowledge
        </h2>
        <p className="mt-2 max-w-prose text-base text-ink-600">
          Read our latest evidence-based content on nutrition and preventive
          health.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          {article && <ArticleCard article={article} />}
          {foodProfile && <FoodProfileCard foodProfile={foodProfile} />}
        </div>
      </Container>
    </section>
  )
}
