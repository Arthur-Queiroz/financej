interface CategoryBreakdown {
  category: string
  amount: number
  percentageOfIncome: number
}

interface DashboardSummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  spentPercentage: number
  byCategory: CategoryBreakdown[]
}

export const useDashboard = (dates: Ref<{ from: string; to: string }>) => {
  const { data, pending, refresh } = useFetch<DashboardSummary>('/api/dashboard/summary', {
    query: computed(() => ({ from: dates.value.from, to: dates.value.to })),
    default: () => null,
    watch: [dates]
  })

  return { summary: data, loading: pending, refresh }
}
