import type { Metadata } from 'next'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import {
  getTopicCounts,
  getApprovedArticles,
  getFeaturedFoodProfile,
} from '@/features/nutrition/queries'
import { PageShell } from '@/components/layout/PageShell'
import { Container } from '@/components/ui/Container'
import { Link } from '@/components/ui/Link'
import { Badge } from '@/components/ui/Badge'
import { Card, CardBody, CardTitle, CardDescription } from '@/components/ui/Card'
import { generateBreadcrumbs } from '@/lib/generateBreadcrumbs'
import { NutritionIcon, ArticleIcon, FoodIcon, SearchIcon } from '@/components/icons'
import { formatDateLong } from '@/lib/format'

export const revalidate = 3600

export function generateMetadata(): Metadata {
  return buildMetadata({
    path: '/nutrition',
    fallbackTitle: 'Nutrition Hub',
    fallbackDescription:
      'Evidence-based Nigerian nutrition knowledge — articles, food profiles and practical healthy living guidance from NHECOF.',
  })
}

/** Editorial ordering for the topic-entry tiles (mirrors the header topics). */
const TOPIC_ORDER = [
  'nutrition-basics',
  'nigerian-foods',
  'food-groups',
  'life-stages',
  'health-conditions',
  'healthy-living',
  'food-safety',
  'myths-facts',
]

export default async function NutritionHubPage() {
  const [topicCounts, latest, featuredFood] = await Promise.all([
    getTopicCounts(),
    getApprovedArticles(undefined, undefined, undefined, 1, 3),
    getFeaturedFoodProfile(),
  ])

  // Editorial order, topics with content only (a Myths & Facts tile stays hidden
  // until that category actually has approved content).
  const orderedTopics = topicCounts
    .filter((t) => t.count > 0)
    .sort((a, b) => {
      const ai = TOPIC_ORDER.indexOf(a.category.slug.current)
      const bi = TOPIC_ORDER.indexOf(b.category.slug.current)
      return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
    })

  return (
    <PageShell
      title="Nutrition Hub"
      eyebrow="Learn"
      description="Explore evidence-based nutrition knowledge tailored for Nigerian communities."
      breadcrumbs={generateBreadcrumbs('/nutrition')}
    >
      <Container>
        {/* Search first — the fastest route into the hub */}
        <section className="mb-14" aria-labelledby="hub-search-heading">
          <h2 id="hub-search-heading" className="mb-3 font-display text-2xl font-semibold text-ink-900">
            Search the hub
          </h2>
          <form action="/nutrition/search" method="get" role="search" className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="sr-only" htmlFor="hub-search-input">
              Search the Nutrition Hub
            </label>
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                id="hub-search-input"
                type="search"
                name="q"
                placeholder="Search articles, foods and outreaches…"
                className="w-full rounded-lg border border-ink-200 bg-white py-3 pl-9 pr-4 text-base text-ink-800 placeholder:text-ink-400 focus:border-leaf-700 focus:outline-2 focus:outline-offset-2 focus:outline-leaf-700"
              />
            </div>
            <button
              type="submit"
              className="rounded-lg bg-leaf-700 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-leaf-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf-700"
            >
              Search
            </button>
          </form>
          <p className="mt-2 text-xs text-ink-500">
            Tip: press <kbd className="rounded border border-ink-200 px-1 font-mono">/</kbd> anywhere to
            open instant search.
          </p>
        </section>

        {/* Topic-entry tiles driven by live counts */}
        <section className="mb-16">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold text-ink-900">Browse by Topic</h2>
            <span className="text-sm text-ink-500">{orderedTopics.length} topics</span>
          </div>

          {orderedTopics.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {orderedTopics.map(({ category, count }) => (
                <Link
                  key={category._id}
                  href={`/nutrition/articles?category=${category.slug.current}`}
                  className="group block"
                >
                  <Card className="h-full transition-shadow group-hover:shadow-md">
                    <CardBody>
                      <div className="flex items-start justify-between gap-3">
                        <NutritionIcon
                          topic={category.slug.current}
                          className="mb-3 h-8 w-8 text-leaf-600"
                        />
                        <Badge variant="leaf" size="sm">
                          {count} {count === 1 ? 'item' : 'items'}
                        </Badge>
                      </div>
                      <CardTitle className="group-hover:text-leaf-700 transition-colors">
                        {category.title}
                      </CardTitle>
                      {category.description ? (
                        <CardDescription>{category.description}</CardDescription>
                      ) : null}
                    </CardBody>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-ink-500 italic">
              Topics will appear here once categories are published in the CMS.
            </p>
          )}
        </section>

        {/* Quick links — kept stable for tests and deep navigation */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-2xl font-semibold text-ink-900">Quick Links</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <Link href="/nutrition/articles" className="group block">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardBody className="flex flex-row items-start gap-4">
                  <ArticleIcon className="mt-1 h-10 w-10 shrink-0 text-leaf-600" />
                  <div>
                    <CardTitle className="group-hover:text-leaf-700 transition-colors">
                      All Articles
                    </CardTitle>
                    <CardDescription>
                      Evidence-based nutrition articles written and reviewed by qualified professionals.
                    </CardDescription>
                  </div>
                </CardBody>
              </Card>
            </Link>
            <Link href="/nutrition/foods" className="group block">
              <Card className="h-full transition-shadow group-hover:shadow-md">
                <CardBody className="flex flex-row items-start gap-4">
                  <FoodIcon className="mt-1 h-10 w-10 shrink-0 text-palm-600" />
                  <div>
                    <CardTitle className="group-hover:text-palm-700 transition-colors">
                      Nigerian Food Profiles
                    </CardTitle>
                    <CardDescription>
                      Nutrient information, healthy preparation ideas and practical guidance for common Nigerian foods.
                    </CardDescription>
                  </div>
                </CardBody>
              </Card>
            </Link>
          </div>
        </section>

        {/* Latest articles + editor-chosen featured food */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="font-display text-2xl font-semibold text-ink-900">Latest from the Hub</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {latest.articles.map((article) => (
              <Link
                key={article._id}
                href={`/nutrition/articles/${article.slug.current}`}
                className="group block h-full"
              >
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardBody>
                    <div className="mb-2 flex flex-wrap gap-1">
                      {article.categories?.slice(0, 2).map((cat) => (
                        <Badge key={cat._id} variant="leaf" className="text-xs">
                          {cat.title}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="group-hover:text-leaf-700 transition-colors">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="mt-2">{article.summary}</CardDescription>
                    <div className="mt-4 flex items-center justify-between text-xs text-ink-500">
                      <span>{article.author?.name}</span>
                      <time dateTime={article.publishedAt}>{formatDateLong(article.publishedAt)}</time>
                    </div>
                  </CardBody>
                </Card>
              </Link>
            ))}

            {featuredFood ? (
              <Card className="h-full bg-leaf-50 border-leaf-100">
                <CardBody>
                  <Badge variant="palm" className="mb-3">Editor&apos;s Pick</Badge>
                  <CardTitle>
                    <Link
                      href={`/nutrition/foods/${featuredFood.slug.current}`}
                      className="hover:text-palm-700 transition-colors"
                    >
                      {featuredFood.title}
                    </Link>
                  </CardTitle>
                  {featuredFood.aliases && featuredFood.aliases.length > 0 ? (
                    <p className="mt-1 text-sm text-ink-500 italic">
                      Also known as: {featuredFood.aliases.join(', ')}
                    </p>
                  ) : null}
                  <CardDescription className="mt-2">{featuredFood.summary}</CardDescription>
                </CardBody>
              </Card>
            ) : null}
          </div>
        </section>

        <section className="rounded-lg bg-paper-50 border border-paper-200 p-8">
          <h2 className="font-display text-xl font-semibold text-ink-900 mb-3">
            Educational Notice
          </h2>
          <p className="text-ink-700 leading-relaxed">
            The information in the Nutrition Hub is for educational purposes only.
            It is not a substitute for professional medical advice, diagnosis or treatment.
            Always consult a qualified healthcare provider for personalised guidance.
          </p>
        </section>
      </Container>
    </PageShell>
  )
}