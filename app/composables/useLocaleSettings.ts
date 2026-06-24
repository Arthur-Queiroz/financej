export const useLocaleSettings = () => {
  const { locale, locales, setLocale, t } = useI18n()
  const currency = useCookie<string>('fm-currency', {
    default: () => 'BRL',
    maxAge: 60 * 60 * 24 * 365 // 1 year
  })

  const CURRENCIES = computed(() => [
    { code: 'BRL', symbol: 'R$', name: t('currencies.brl') },
    { code: 'USD', symbol: '$', name: t('currencies.usd') },
    { code: 'EUR', symbol: '€', name: t('currencies.eur') },
    { code: 'GBP', symbol: '£', name: t('currencies.gbp') }
  ])

  const currentCurrency = computed(() =>
    CURRENCIES.value.find(c => c.code === currency.value) || CURRENCIES.value[0]
  )

  const currentLocale = computed(() =>
    locales.value.find((l: { code: string }) => l.code === locale.value)
  )

  const setLanguage = (code: string) => {
    setLocale(code)
  }

  const setCurrency = (code: string) => {
    currency.value = code
  }

  return {
    locale,
    locales,
    currency,
    CURRENCIES,
    currentCurrency,
    currentLocale,
    setLanguage,
    setCurrency
  }
}
