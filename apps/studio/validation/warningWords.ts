/**
 * Words that trigger an editorial warning in health content.
 * These terms can be misleading or imply medical claims.
 */
export const warningWords = [
  'cure',
  'cures',
  'curing',
  'detox',
  'detoxify',
  'miracle',
  'guaranteed',
  'guarantee',
  'heals',
  'heal',
  'treats',
  'treat',
  'remedy',
  'remedies',
  'prevents',
  'prevent',
  'secret',
  'breakthrough',
  'supernatural',
  'magic',
  'magical',
  'instant',
  'immediate',
  'ultimate',
  'one weird',
  'big pharma',
  'conventional medicine',
  'alternative medicine',
] as const

export const warningWordsPattern = new RegExp(
  `\\b(?:${warningWords.join('|')})\\b`,
  'gi',
)
