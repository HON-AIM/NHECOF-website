import { describe, it, expect } from 'vitest'
import {
  matchesFilters,
  parseResourceFilters,
  resourceCountLabel,
} from '../src/features/resources/filter'

const guide = {
  type: 'guide',
  topics: 'anaemia nutrition-basics',
  audiences: 'health-workers families',
}
const video = {
  type: 'video',
  topics: 'food-safety',
  audiences: 'families',
}

describe('parseResourceFilters', () => {
  it('reads the supported filter keys', () => {
    expect(parseResourceFilters('?type=guide&topic=anaemia&audience=families')).toEqual({
      type: 'guide',
      topic: 'anaemia',
      audience: 'families',
    })
  })

  it('returns undefined for absent keys so the archive is unfiltered', () => {
    expect(parseResourceFilters('')).toEqual({
      type: undefined,
      topic: undefined,
      audience: undefined,
    })
  })

  it('ignores unknown query keys', () => {
    expect(parseResourceFilters('?page=2&sort=name')).toEqual({
      type: undefined,
      topic: undefined,
      audience: undefined,
    })
  })
})

describe('matchesFilters', () => {
  it('keeps everything when no filter is active', () => {
    expect(matchesFilters(guide, {})).toBe(true)
    expect(matchesFilters(video, {})).toBe(true)
  })

  it('matches on type', () => {
    expect(matchesFilters(guide, { type: 'guide' })).toBe(true)
    expect(matchesFilters(video, { type: 'guide' })).toBe(false)
  })

  it('matches on a topic held in a space-separated list', () => {
    expect(matchesFilters(guide, { topic: 'anaemia' })).toBe(true)
    expect(matchesFilters(guide, { topic: 'nutrition-basics' })).toBe(true)
    expect(matchesFilters(guide, { topic: 'food-safety' })).toBe(false)
  })

  it('matches on audience', () => {
    expect(matchesFilters(guide, { audience: 'health-workers' })).toBe(true)
    expect(matchesFilters(video, { audience: 'health-workers' })).toBe(false)
  })

  it('combines filters conjunctively', () => {
    expect(matchesFilters(guide, { type: 'guide', topic: 'anaemia' })).toBe(true)
    expect(matchesFilters(guide, { type: 'video', topic: 'anaemia' })).toBe(false)
    expect(matchesFilters(guide, { type: 'guide', audience: 'schools' })).toBe(false)
  })

  it('does not substring-match topic values', () => {
    // "anaemia" must not match a hypothetical "anaemia-guide" topic.
    expect(matchesFilters({ topics: 'anaemia-guide' }, { topic: 'anaemia' })).toBe(false)
  })

  it('treats missing metadata as no match rather than throwing', () => {
    expect(matchesFilters({}, { type: 'guide' })).toBe(false)
    expect(matchesFilters({ type: 'guide' }, { topic: 'anaemia' })).toBe(false)
    expect(matchesFilters({}, {})).toBe(true)
  })
})

describe('resourceCountLabel', () => {
  it('uses the singular for one result', () => {
    expect(resourceCountLabel(1, true)).toBe('1 resource found')
    expect(resourceCountLabel(1, false)).toBe('1 resource available')
  })

  it('uses the plural otherwise', () => {
    expect(resourceCountLabel(4, true)).toBe('4 resources found')
    expect(resourceCountLabel(0, true)).toBe('0 resources found')
  })
})
