import { describe, it, expect } from 'vitest'
import { Fragment, createElement, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  safeJsonLd,
  OrganizationJsonLd,
  BreadcrumbJsonLd,
  ArticleJsonLd,
  EventJsonLd,
  PersonJsonLd,
} from '../src/lib/seo/jsonLd'

function render(node: ReactNode): string {
  return renderToStaticMarkup(createElement(Fragment, null, node))
}

describe('safeJsonLd', () => {
  it('escapes "<" so payloads cannot break out of the script tag', () => {
    const html = safeJsonLd({ description: '</script><script>alert(1)</script>' })
    expect(html).toContain('\\u003c/script')
    expect(html).not.toContain('</script>')
  })

  it('escapes unicode line separators', () => {
    expect(safeJsonLd({ text: '\u2028' })).toContain('\\u2028')
  })
})

describe('OrganizationJsonLd', () => {
  it('renders an Organization graph with url and sameAs links', () => {
    const html = render(
      <OrganizationJsonLd
        name="NHECOF"
        url="http://localhost:3000/"
        sameAs={['https://facebook.com/nhecof', 'https://x.com/nhecof']}
      />,
    )
    expect(html).toContain('application/ld+json')
    expect(html).toContain('"@type":"Organization"')
    expect(html).toContain('"sameAs"')
  })

  it('omits url and sameAs when not provided', () => {
    const html = render(<OrganizationJsonLd name="NHECOF" />)
    expect(html).not.toContain('"url"')
    expect(html).not.toContain('"sameAs"')
  })
})

describe('BreadcrumbJsonLd', () => {
  it('renders a BreadcrumbList with absolute item URLs in order', () => {
    const html = render(
      <BreadcrumbJsonLd
        items={[
          { label: 'Home', href: '/' },
          { label: 'Nutrition Hub', href: '/nutrition' },
          { label: 'Iron' },
        ]}
      />,
    )
    expect(html).toContain('"@type":"BreadcrumbList"')
    expect(html).toContain('"position":1')
    expect(html).toContain(`"item":"${'http://localhost:3000'}/"`)
    expect(html).toContain(`"item":"${'http://localhost:3000'}/nutrition"`)
    expect(html).not.toContain('"item":"http://localhost:3000/nutrition/articles/iron')
  })

  it('renders nothing when there are no crumbs', () => {
    expect(render(<BreadcrumbJsonLd items={[]} />)).toBe('')
  })
})

describe('ArticleJsonLd', () => {
  const base = {
    title: 'Iron requirements in Nigerian diets',
    url: 'http://localhost:3000/nutrition/articles/iron',
    description: 'Evidence-based guidance on iron.',
    datePublished: '2026-01-15T09:00:00Z',
    author: { name: 'Dr Ada Obi', role: 'Author' },
  }

  it('emits an Article graph with a named author', () => {
    const html = render(<ArticleJsonLd {...base} />)
    expect(html).toContain('"@type":"Article"')
    expect(html).toContain('"name":"Dr Ada Obi"')
    expect(html).toContain('"author"')
  })

  it('gives the author an @id and url only when they have a public profile', () => {
    const html = render(
      <ArticleJsonLd
        {...base}
        author={{ ...base.author, profileHref: '/about#founder-heading' }}
      />,
    )
    expect(html).toContain('"@id":"http://localhost:3000/about#founder-heading"')
    expect(html).toContain('"url":"http://localhost:3000/about#founder-heading"')
  })

  it('never derives a profile URL from a slug alone', () => {
    // Regression: v1 has no /people route, so a slug-derived @id pointed at a
    // 404 and described something the page does not show.
    const html = render(<ArticleJsonLd {...base} author={{ ...base.author, profileHref: undefined }} />)
    expect(html).not.toContain('/people/')
    const json = JSON.parse(
      html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>')).replace(/\\u003c/g, '<'),
    )
    expect(json.author['@id']).toBeUndefined()
    expect(json.author.url).toBeUndefined()
    // The page's own @id is still present.
    expect(json.mainEntityOfPage['@id']).toBe(base.url)
  })

  it('includes a reviewedBy reviewer and articleSection when provided', () => {
    const html = render(
      <ArticleJsonLd
        {...base}
        reviewer={{ name: 'Prof B. Nwosu', role: 'Reviewer' }}
        section="Micronutrients"
      />,
    )
    expect(html).toContain('"reviewedBy"')
    expect(html).not.toContain('/people/')
    expect(html).toContain('"articleSection":"Micronutrients"')
  })

  it('does not emit reviewedBy without a named reviewer', () => {
    const html = render(<ArticleJsonLd {...base} reviewer={undefined} />)
    expect(html).not.toContain('"reviewedBy"')
  })

  it('emits dateModified equal to datePublished when not provided', () => {
    const html = render(<ArticleJsonLd {...base} />)
    expect(html).toContain('"dateModified":"2026-01-15T09:00:00Z"')
  })

  it('does not mark nutritional content as medical advice', () => {
    // Plan §12.2: never claim MedicalWebPage/medical advice the page does not give.
    const html = render(<ArticleJsonLd {...base} />)
    for (const forbidden of ['MedicalWebPage', 'MedicalCondition', 'MedicalBusiness', 'isPartOf']) {
      expect(html).not.toContain(forbidden)
    }
  })

  it('produces valid JSON with all Google-required Article properties', () => {
    const html = render(<ArticleJsonLd {...base} />)
    const json = JSON.parse(
      html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>')).replace(/\\u003c/g, '<'),
    )
    expect(json['@context']).toBe('https://schema.org')
    for (const key of ['@type', 'headline', 'datePublished', 'dateModified', 'author', 'url']) {
      expect(json[key]).toBeDefined()
    }
    expect(json.author['@type']).toBe('Person')
    expect(json.author.name).toBe('Dr Ada Obi')
  })
})

describe('EventJsonLd', () => {
  it('emits a scheduled offline event with a Place location', () => {
    const html = render(
      <EventJsonLd
        name="Community nutrition workshop"
        startDate="2026-06-10T09:00:00Z"
        description="Free workshop for pregnant women."
        url="http://localhost:3000/outreaches/community-nutrition"
        venueName="Lafia town hall"
        addressLocality="Lafia"
        addressRegion="Nasarawa"
      />,
    )
    expect(html).toContain('"@type":"Event"')
    expect(html).toContain('"eventStatus":"https://schema.org/EventScheduled"')
    expect(html).toContain('"eventAttendanceMode":"https://schema.org/OfflineEventAttendanceMode"')
    expect(html).toContain('"@type":"Place"')
    expect(html).toContain('"addressLocality":"Lafia"')
  })
})

describe('PersonJsonLd', () => {
  it('emits a standalone Person graph with a context', () => {
    const html = render(<PersonJsonLd name="Dr Ada Obi" role="Reviewer" />)
    const json = JSON.parse(
      html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>')).replace(/\\u003c/g, '<'),
    )
    expect(json['@context']).toBe('https://schema.org')
    expect(json['@type']).toBe('Person')
    expect(json.name).toBe('Dr Ada Obi')
    expect(json.jobTitle).toBe('Reviewer')
  })

  it('omits @id and url when the person has no public profile', () => {
    const html = render(<PersonJsonLd name="Dr Ada Obi" />)
    expect(html).not.toContain('"@id"')
    expect(html).not.toContain('"url"')
    expect(html).not.toContain('/people/')
  })

  it('points @id and url at the supplied public profile', () => {
    const html = render(<PersonJsonLd name="Founder" profileHref="/about#founder-heading" />)
    expect(html).toContain('"@id":"http://localhost:3000/about#founder-heading"')
  })
})

describe('structured data safety', () => {
  it('escapes script-breaking characters in every graph type', () => {
    const hostile = 'Nutrition </script><script>alert(1)</script>'
    const articleProps = {
      title: hostile,
      url: 'http://localhost:3000/nutrition/articles/x',
      description: hostile,
      datePublished: '2026-01-01T00:00:00Z',
      author: { name: hostile },
    }
    const graphs = [
      render(<OrganizationJsonLd name={hostile} />),
      render(<ArticleJsonLd {...articleProps} />),
      render(<EventJsonLd name={hostile} startDate="2026-06-10T09:00:00Z" />),
      render(<BreadcrumbJsonLd items={[{ label: hostile, href: '/' }]} />),
      render(<PersonJsonLd name={hostile} />),
    ]
    for (const html of graphs) {
      expect(html).not.toContain('</script><script>')
      expect(html).toContain('\\u003c/script')
    }
  })

  it('produces a valid JSON-LD payload for the Organization graph', () => {
    const html = render(<OrganizationJsonLd name="NHECOF" url="http://localhost:3000" />)
    const json = JSON.parse(
      html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>')).replace(/\\u003c/g, '<'),
    )
    expect(json['@context']).toBe('https://schema.org')
    expect(json['@type']).toBe('Organization')
    expect(json.name).toBe('NHECOF')
  })
})