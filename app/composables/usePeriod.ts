export type PeriodKey = 'week' | 'month' | 'year' | 'custom'

function startOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const r = new Date(d)
  r.setDate(d.getDate() + diff)
  r.setHours(0, 0, 0, 0)
  return r
}

export const usePeriod = () => {
  const { t } = useI18n()
  const period = ref<PeriodKey>('month')
  const customFrom = ref('')
  const customTo = ref('')

  const dates = computed<{ from: string, to: string }>(() => {
    const now = new Date()
    const today = isoDate(now)
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')

    if (period.value === 'week') {
      const monday = startOfWeek(now)
      const sunday = new Date(monday)
      sunday.setDate(monday.getDate() + 6)
      return { from: isoDate(monday), to: isoDate(sunday) }
    }
    if (period.value === 'month') {
      // Use the full calendar month so income proration covers all 30/31 days
      const lastDay = new Date(year, now.getMonth() + 1, 0)
      return { from: `${year}-${month}-01`, to: isoDate(lastDay) }
    }
    if (period.value === 'year') {
      const lastDay = new Date(year, 11, 31)
      return { from: `${year}-01-01`, to: isoDate(lastDay) }
    }
    return { from: customFrom.value || `${year}-${month}-01`, to: customTo.value || today }
  })

  const tabs = computed(() => [
    { key: 'week' as PeriodKey, label: t('period.week') },
    { key: 'month' as PeriodKey, label: t('period.month') },
    { key: 'year' as PeriodKey, label: t('period.year') },
    { key: 'custom' as PeriodKey, label: t('period.custom') }
  ])

  return { period, customFrom, customTo, dates, tabs }
}
