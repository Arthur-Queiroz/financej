// Helper to get current locale from cookie or default
function getCurrentLocale(): string {
  if (import.meta.client) {
    return document.cookie.match(/i18n_redirected=([^;]+)/)?.[1] || 'pt-BR'
  }
  return 'pt-BR'
}

// Helper to get current currency from cookie or default
function getCurrentCurrency(): { code: string, symbol: string } {
  const currencies: Record<string, string> = {
    BRL: 'R$',
    USD: '$',
    EUR: '€',
    GBP: '£'
  }

  if (import.meta.client) {
    const code = document.cookie.match(/fm-currency=([^;]+)/)?.[1] || 'BRL'
    return { code, symbol: currencies[code] || 'R$' }
  }
  return { code: 'BRL', symbol: 'R$' }
}

export function fmtBRL(n: number, opts: { compact?: boolean } = {}): string {
  const locale = getCurrentLocale()
  const { symbol } = getCurrentCurrency()

  const abs = Math.abs(n)
  const formatted = opts.compact && abs >= 1000
    ? (abs / 1000).toLocaleString(locale, { maximumFractionDigits: 1 }) + 'k'
    : abs.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const sign = n < 0 ? '−' : ''
  return `${sign}${symbol} ${formatted}`
}

export function fmtPct(n: number, digits = 0): string {
  const locale = getCurrentLocale()
  return n.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  }) + '%'
}

export function fmtDate(d: string | Date): string {
  const locale = getCurrentLocale()
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString(locale, { day: '2-digit', month: 'short' }).replace('.', '')
}

export function fmtDateFull(d: string | Date): string {
  const locale = getCurrentLocale()
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

export function isoDate(d: Date = new Date()): string {
  return d.toISOString().split('T')[0]!
}
