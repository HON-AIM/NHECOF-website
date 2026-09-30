import { describe, it, expect } from 'vitest'
import {
  contactSchema,
  outreachRequestSchema,
  partnershipSchema,
  nigerianPhone,
  optionalNigerianPhone,
  requiredNigerianPhone,
  OUTREACH_STEP_FIELDS,
} from '../src/features/forms/schemas'

const CONTACT_VALID = {
  name: 'Ada Okafor',
  email: 'ada@example.com',
  telephone: '0803 123 4567',
  subject: 'Volunteering',
  message: 'I would like to volunteer as a translator for Hausa materials.',
  privacyConsent: true,
}

const OUTREACH_VALID = {
  organisationName: 'Okpanam Women Group',
  contactName: 'Ngozi Eze',
  contactRole: 'Coordinator',
  email: 'ngozi@example.com',
  telephone: '+2348031234567',
  community: 'Okpanam community',
  lga: 'Oshimili North',
  state: 'Delta',
  audienceSize: '101–300',
  targetAudience: 'Women',
  venueAvailability: 'Venue secured',
  healthConcerns: 'Anaemia and child nutrition during the dry season.',
  preferredDate: 'A Saturday in November',
  supportType: 'Nutrition education session',
  privacyConsent: true,
}

const PARTNERSHIP_VALID = {
  organisation: 'Bright Ideas Media Ltd',
  contactPerson: 'Tunde Bakare',
  email: 'tunde@example.com',
  telephone: '2348035557788',
  partnershipInterest: 'Media or communications partnership',
  proposedContribution: 'Free airtime and production support for a 6-episode radio series.',
  privacyConsent: true,
}

describe('nigerianPhone', () => {
  it('normalises local-format numbers to E.164', () => {
    expect(nigerianPhone.parse('0803 123 4567')).toBe('+2348031234567')
    expect(nigerianPhone.parse('08031234567')).toBe('+2348031234567')
  })

  it('normalises +234 and 234 prefixed numbers', () => {
    expect(nigerianPhone.parse('+2348031234567')).toBe('+2348031234567')
    expect(nigerianPhone.parse('2348031234567')).toBe('+2348031234567')
  })

  it('rejects numbers that are not Nigerian mobile prefixes', () => {
    expect(() => nigerianPhone.parse('0700123456')).toThrow()
    expect(() => nigerianPhone.parse('12345')).toThrow()
    expect(() => nigerianPhone.parse('abcxyz')).toThrow()
  })

  it('rejects too-short numbers', () => {
    expect(() => nigerianPhone.parse('080312')).toThrow()
  })
})

describe('optionalNigerianPhone', () => {
  it('returns undefined when empty', () => {
    expect(optionalNigerianPhone.parse('')).toBeUndefined()
  })

  it('normalises when populated', () => {
    expect(optionalNigerianPhone.parse('0803 000 1111')).toBe('+2348030001111')
  })
})

describe('requiredNigerianPhone', () => {
  it('rejects empty strings', () => {
    expect(() => requiredNigerianPhone.parse('')).toThrow()
  })

  it('accepts valid numbers', () => {
    expect(requiredNigerianPhone.parse('0805 123 4567')).toBe('+2348051234567')
  })
})

describe('contactSchema', () => {
  it('accepts a valid submission', () => {
    const result = contactSchema.safeParse(CONTACT_VALID)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.telephone).toBe('+2348031234567')
    }
  })

  it('requires privacy consent', () => {
    const result = contactSchema.safeParse({ ...CONTACT_VALID, privacyConsent: false })
    expect(result.success).toBe(false)
  })

  it('requires a real email', () => {
    const result = contactSchema.safeParse({ ...CONTACT_VALID, email: 'not-an-email' })
    expect(result.success).toBe(false)
  })

  it('requires a subject from the known list', () => {
    const result = contactSchema.safeParse({ ...CONTACT_VALID, subject: 'Not a subject' })
    expect(result.success).toBe(false)
  })

  it('rejects an over-long message (boundary)', () => {
    const result = contactSchema.safeParse({ ...CONTACT_VALID, message: 'x'.repeat(4001) })
    expect(result.success).toBe(false)
  })

  it('rejects a too-short message (boundary)', () => {
    const result = contactSchema.safeParse({ ...CONTACT_VALID, message: 'short' })
    expect(result.success).toBe(false)
  })

  it('accepts an optional telephone', () => {
    const result = contactSchema.safeParse({ ...CONTACT_VALID, telephone: undefined })
    expect(result.success).toBe(true)
  })

  it('accepts the hidden honeypot when empty', () => {
    const result = contactSchema.safeParse({ ...CONTACT_VALID, website: '' })
    expect(result.success).toBe(true)
  })

  it('trims and lower-cases the email', () => {
    const result = contactSchema.safeParse({ ...CONTACT_VALID, email: '  Ada@EXAMPLE.com  ' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.email).toBe('ada@example.com')
    }
  })
})

describe('outreachRequestSchema', () => {
  it('accepts a valid submission', () => {
    const result = outreachRequestSchema.safeParse(OUTREACH_VALID)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.telephone).toBe('+2348031234567')
    }
  })

  it('requires contact details', () => {
    const result = outreachRequestSchema.safeParse({ ...OUTREACH_VALID, contactName: '' })
    expect(result.success).toBe(false)
  })

  it('accepts any of the 36 states + FCT', () => {
    for (const state of ['Lagos', 'Ogun', 'FCT (Abuja)']) {
      const result = outreachRequestSchema.safeParse({ ...OUTREACH_VALID, state })
      expect(result.success).toBe(true)
    }
  })

  it('rejects an unknown state', () => {
    const result = outreachRequestSchema.safeParse({ ...OUTREACH_VALID, state: 'Atlantis' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing phone (needed for planning calls)', () => {
    const result = outreachRequestSchema.safeParse({
      ...OUTREACH_VALID,
      telephone: '',
    })
    expect(result.success).toBe(false)
  })

  it('rejects bad support types', () => {
    const result = outreachRequestSchema.safeParse({ ...OUTREACH_VALID, supportType: 'Everything' })
    expect(result.success).toBe(false)
  })
})

describe('partnershipSchema', () => {
  it('accepts a valid enquiry', () => {
    const result = partnershipSchema.safeParse(PARTNERSHIP_VALID)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.telephone).toBe('+2348035557788')
    }
  })

  it('requires a chosen partnership interest', () => {
    const result = partnershipSchema.safeParse({ ...PARTNERSHIP_VALID, partnershipInterest: '' })
    expect(result.success).toBe(false)
  })

  it('requires consent', () => {
    const result = partnershipSchema.safeParse({ ...PARTNERSHIP_VALID, privacyConsent: false })
    expect(result.success).toBe(false)
  })

  it('requires a proposed contribution', () => {
    const result = partnershipSchema.safeParse({ ...PARTNERSHIP_VALID, proposedContribution: '' })
    expect(result.success).toBe(false)
  })
})

describe('step field coverage', () => {
  it('outreach steps cover every required path', () => {
    const covered = new Set(Object.values(OUTREACH_STEP_FIELDS).flat())
    expect(covered.has('organisationName')).toBe(true)
    expect(covered.has('state')).toBe(true)
    expect(covered.has('supportType')).toBe(true)
  })
})