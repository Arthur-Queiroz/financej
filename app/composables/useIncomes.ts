export const useIncomes = () => {
  const { data, pending, refresh } = useFetch('/api/incomes', {
    default: () => []
  })

  const create = async (body: {
    label: string
    amount: number
    recurrence: string
    effectiveFrom: string
    effectiveTo?: string
  }) => {
    await $fetch('/api/incomes', { method: 'POST', body })
    await refresh()
  }

  const update = async (id: string, body: object) => {
    await $fetch(`/api/incomes/${id}`, { method: 'PUT', body })
    await refresh()
  }

  const remove = async (id: string) => {
    await $fetch(`/api/incomes/${id}`, { method: 'DELETE' })
    await refresh()
  }

  return { incomes: data, loading: pending, refresh, create, update, remove }
}
