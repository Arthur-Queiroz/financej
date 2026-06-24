import { describe, it, expect } from 'vitest'
import { fmtBRL, fmtPct, fmtDate, fmtDateFull, isoDate } from '~/utils/format'

describe('fmtBRL', () => {
  it('formats zero', () => {
    expect(fmtBRL(0)).toBe('R$ 0,00')
  })

  it('formats a positive integer', () => {
    const result = fmtBRL(1500)
    expect(result).toContain('R$')
    expect(result).toContain('1.500,00')
  })

  it('formats a positive decimal', () => {
    const result = fmtBRL(1500.5)
    expect(result).toContain('R$')
    expect(result).toContain('1.500,50')
  })

  it('formats a negative value with minus sign', () => {
    const result = fmtBRL(-50)
    expect(result).toContain('\u2212')
    expect(result).toContain('50,00')
  })

  it('formats value less than one', () => {
    const result = fmtBRL(0.75)
    expect(result).toContain('0,75')
  })

  it('compact format for thousands', () => {
    const result = fmtBRL(1500, { compact: true })
    expect(result).toContain('R$')
    expect(result).toContain('k')
  })

  it('compact format for less than 1000 does not compact', () => {
    const result = fmtBRL(500, { compact: true })
    expect(result).toContain('500,00')
    expect(result).not.toContain('k')
  })

  it('compact format for negative thousands', () => {
    const result = fmtBRL(-2500, { compact: true })
    expect(result).toContain('\u2212')
    expect(result).toContain('k')
  })

  it('returns string type', () => {
    expect(typeof fmtBRL(100)).toBe('string')
  })
})

describe('fmtPct', () => {
  it('formats zero percent', () => {
    expect(fmtPct(0)).toBe('0%')
  })

  it('formats integer percent', () => {
    expect(fmtPct(75)).toBe('75%')
  })

  it('formats with one decimal digit', () => {
    const result = fmtPct(75.5, 1)
    expect(result).toContain('75')
    expect(result).toContain('%')
  })

  it('formats value over 100', () => {
    const result = fmtPct(150)
    expect(result).toContain('150%')
  })

  it('returns string type', () => {
    expect(typeof fmtPct(50)).toBe('string')
  })
})

describe('fmtDate', () => {
  it('formats an ISO date string', () => {
    const result = fmtDate('2025-06-23')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })

  it('formats a Date object', () => {
    const result = fmtDate(new Date(2025, 5, 23))
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('returns string type', () => {
    expect(typeof fmtDate('2025-01-15')).toBe('string')
  })
})

describe('fmtDateFull', () => {
  it('formats an ISO date string in full format', () => {
    const result = fmtDateFull('2025-06-23')
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(5)
  })

  it('formats a Date object in full format', () => {
    const result = fmtDateFull(new Date(2025, 11, 25))
    expect(result).toBeTruthy()
    expect(typeof result).toBe('string')
  })

  it('returns string type', () => {
    expect(typeof fmtDateFull('2025-03-10')).toBe('string')
  })
})

describe('isoDate', () => {
  it('returns ISO 8601 date string from a Date object', () => {
    const result = isoDate(new Date(2025, 5, 23))
    expect(result).toBe('2025-06-23')
  })

  it('returns today when no argument provided', () => {
    const result = isoDate()
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('handles year boundary correctly', () => {
    const result = isoDate(new Date(2025, 0, 1))
    expect(result).toBe('2025-01-01')
  })

  it('handles month boundary correctly', () => {
    const result = isoDate(new Date(2025, 11, 31))
    expect(result).toBe('2025-12-31')
  })

  it('pads single-digit month and day', () => {
    const result = isoDate(new Date(2025, 0, 5))
    expect(result).toBe('2025-01-05')
  })
})
