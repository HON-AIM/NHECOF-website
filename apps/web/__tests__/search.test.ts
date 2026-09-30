import { describe, expect, it } from 'vitest'
import MiniSearch from 'minisearch'
import {
  normalizeSearchText,
  tokenizeSearchText,
  matchesAllTokens,
  highlightMatches,
} from '@/lib/search/normalize'

interface SearchItem {
  id: string
  type: 'article' | 'foodProfile' | 'outreach'
  title: string
  href: string
  summary: string
  keywords: string[]
}

const SEARCH_ITEMS: SearchItem[] = [
  {
    id: 'foodProfile-food-jute-leaves',
    type: 'foodProfile',
    title: 'Jute Leaves (Ewedu)',
    href: '/nutrition/foods/jute-leaves',
    summary: 'The slimy-textured green that powers ewedu soup.',
    keywords: [
      'Ẹfọ́ tẹ̀tẹ̀ (Yoruba)',
      'Rama (Hausa)',
      'Ahuhu (Igbo)',
      'Vegetables & Leaves',
    ],
  },
  {
    id: 'foodProfile-food-moringa',
    type: 'foodProfile',
    title: 'Moringa (Zogale)',
    href: '/nutrition/foods/moringa',
    summary: 'A leafy tree prized for its micronutrients.',
    keywords: ['Zogale (Hausa)', 'Vegetables & Leaves'],
  },
  {
    id: 'article-article-safe-food-notes',
    type: 'article',
    title: 'Safe Food Handling at Home',
    href: '/nutrition/articles/safe-food-handling',
    summary: 'Keep your kitchen safe for the whole family.',
    keywords: ['Food Safety'],
  },
]

/** Mirrors the command palette index configuration. */
function buildIndex() {
  return new MiniSearch({
    idField: 'id',
    fields: ['title', 'keywords', 'summary'],
    storeFields: ['id', 'type', 'title', 'href', 'summary'],
    tokenize: (text) => tokenizeSearchText(text),
    processTerm: (term) => normalizeSearchText(term).slice(0, 32),
    searchOptions: {
      prefix: true,
      combineWith: 'OR',
      boost: { title: 3, keywords: 2, summary: 1 },
    },
  })
}

function searchIds(query: string): string[] {
  const index = buildIndex()
  index.addAll(SEARCH_ITEMS)
  return index.search(query).map((hit) => hit.id as string)
}

describe('normalizeSearchText', () => {
  it('strips diacritics via NFD decomposition', () => {
    expect(normalizeSearchText('Ẹfọ́ tẹ̀tẹ̀')).toBe('efo tete')
    expect(normalizeSearchText('Èwà (Yoruba)')).toBe('ewa yoruba')
    expect(normalizeSearchText('Édó')).toBe('edo')
  })

  it('is case-insensitive', () => {
    expect(normalizeSearchText('MORINGA')).toBe('moringa')
    expect(normalizeSearchText('ẸFỌ́ TẸ̀TẸ̀')).toBe('efo tete')
  })

  it('collapses punctuation and whitespace', () => {
    expect(normalizeSearchText('  Ewedu  ,  ewedu  ')).toBe('ewedu ewedu')
  })
})

describe('tokenizeSearchText', () => {
  it('splits into unique normalized terms', () => {
    expect(tokenizeSearchText('Ewedu Ewedu!')).toEqual(['ewedu'])
    expect(tokenizeSearchText('Ẹfọ́ tẹ̀tẹ̀ (Yoruba)')).toEqual(['efo', 'tete', 'yoruba'])
  })

  it('returns an empty array for empty input', () => {
    expect(tokenizeSearchText('')).toEqual([])
    expect(tokenizeSearchText('   ')).toEqual([])
  })
})

describe('matchesAllTokens', () => {
  it('matches a diacritic alias with plain ASCII tokens', () => {
    expect(matchesAllTokens('efo', 'Ẹfọ́ tẹ̀tẹ̀ (Yoruba)')).toBe(true)
    expect(matchesAllTokens('efo tete', 'Ẹfọ́ tẹ̀tẹ̀ (Yoruba)')).toBe(true)
  })

  it('does not match partial token sets', () => {
    expect(matchesAllTokens('x efo', 'Ẹfọ́ tẹ̀tẹ̀ (Yoruba)')).toBe(false)
  })
})

describe('highlightMatches', () => {
  it('wraps matched terms in <mark>', () => {
    expect(highlightMatches('Ewedu soup is loved across the south', 'ewedu')).toContain(
      '<mark'
    )
    expect(highlightMatches('Ewedu soup', 'ewedu')).toContain('>Ewedu<')
  })

  it('returns the original text when query is empty', () => {
    expect(highlightMatches('Ewedu soup', '')).toBe('Ewedu soup')
  })
})

describe('command palette search (MiniSearch)', () => {
  it('finds jute leaves when the user types "efo"', () => {
    expect(searchIds('efo')).toContain('foodProfile-food-jute-leaves')
  })

  it('finds jute leaves via the plain alias "ewedu"', () => {
    expect(searchIds('ewedu')).toContain('foodProfile-food-jute-leaves')
  })

  it('finds jute leaves with multiple terms "efo tete"', () => {
    expect(searchIds('efo tete')).toContain('foodProfile-food-jute-leaves')
  })

  it('finds moringa via its Hausa alias "zogale"', () => {
    expect(searchIds('zogale')).toContain('foodProfile-food-moringa')
  })

  it('supports prefix matching ("mor")', () => {
    expect(searchIds('mor')).toContain('foodProfile-food-moringa')
  })

  it('matches case- and accent-insensitively on an accent-heavy query', () => {
    expect(searchIds('ẸFỌ')).toContain('foodProfile-food-jute-leaves')
  })
})