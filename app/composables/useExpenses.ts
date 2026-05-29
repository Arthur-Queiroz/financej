export const useExpenses = (dates: Ref<{ from: string; to: string }>) => {
  const { data, pending, refresh } = useFetch('/api/expenses', {
    query: computed(() => ({ from: dates.value.from, to: dates.value.to })),
    default: () => [],
    watch: [dates]
  })

  const create = async (body: {
    amount: number
    category: string
    description?: string
    date: string
  }) => {
    await $fetch('/api/expenses', { method: 'POST', body })
    await refresh()
  }

  const update = async (id: string, body: Partial<{ amount: number; category: string; description: string; date: string }>) => {
    await $fetch(`/api/expenses/${id}`, { method: 'PUT', body })
    await refresh()
  }

  const remove = async (id: string) => {
    await $fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    await refresh()
  }

  return { expenses: data, loading: pending, refresh, create, update, remove }
}
