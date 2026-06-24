import { describe, it, expect } from 'vitest'
import { CATEGORIES, CATEGORY_LIST } from '~/utils/categories'

describe('CATEGORIES', () => {
  it('has exactly 10 categories', () => {
    expect(Object.keys(CATEGORIES)).toHaveLength(10)
  })

  const requiredKeys: Array<keyof typeof CATEGORIES[string]> = ['key', 'label', 'token', 'icon']

  it.each(Object.entries(CATEGORIES))('%s has all required fields', (_, category) => {
    for (const field of requiredKeys) {
      expect(category[field]).toBeDefined()
      expect(typeof category[field]).toBe('string')
      expect((category[field] as string).length).toBeGreaterThan(0)
    }
  })

  it('all tokens follow --cat-* pattern', () => {
    for (const [key, cat] of Object.entries(CATEGORIES)) {
      expect(cat.token).toMatch(/^--cat-/)
    }
  })

  it('all icons follow lucide:* pattern', () => {
    for (const [key, cat] of Object.entries(CATEGORIES)) {
      expect(cat.icon).toMatch(/^lucide:/)
    }
  })

  it('key field matches object key', () => {
    for (const [key, cat] of Object.entries(CATEGORIES)) {
      expect(cat.key).toBe(key)
    }
  })

  it('has labels in Portuguese by default', () => {
    expect(CATEGORIES.FOOD.label).toBe('Alimentação')
    expect(CATEGORIES.SUBSCRIPTION.label).toBe('Assinatura')
    expect(CATEGORIES.LEISURE.label).toBe('Lazer')
    expect(CATEGORIES.INVESTMENT.label).toBe('Investimento')
    expect(CATEGORIES.OTHER.label).toBe('Outros')
  })

  it('has unique tokens across categories', () => {
    const tokens = Object.values(CATEGORIES).map(c => c.token)
    expect(new Set(tokens).size).toBe(tokens.length)
  })

  it('has unique icons across categories', () => {
    const icons = Object.values(CATEGORIES).map(c => c.icon)
    expect(new Set(icons).size).toBe(icons.length)
  })
})

describe('CATEGORY_LIST', () => {
  it('is an array of 10 items', () => {
    expect(Array.isArray(CATEGORY_LIST)).toBe(true)
    expect(CATEGORY_LIST).toHaveLength(10)
  })

  it('matches CATEGORIES values', () => {
    expect(CATEGORY_LIST).toEqual(Object.values(CATEGORIES))
  })

  it('each item is a CategoryMeta object', () => {
    for (const item of CATEGORY_LIST) {
      expect(item).toHaveProperty('key')
      expect(item).toHaveProperty('label')
      expect(item).toHaveProperty('token')
      expect(item).toHaveProperty('icon')
    }
  })
})
