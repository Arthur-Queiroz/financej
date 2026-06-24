export interface Vault {
  id: string
  name: string
  icon: string
  color: string
  target: number | null
  perAmount: number
  interval: 'WEEKLY' | 'MONTHLY' | 'YEARLY'
  current: number
  createdAt: string
  updatedAt: string
}

export interface VaultDeposit {
  id: string
  vaultId: string
  amount: number
  note: string | null
  date: string
  createdAt: string
}

export const VAULT_INTERVAL = {
  WEEKLY: { labelKey: 'savings.weekly', shortKey: 'savings.per_week', perYear: 52 },
  MONTHLY: { labelKey: 'savings.monthly', shortKey: 'savings.per_month', perYear: 12 },
  YEARLY: { labelKey: 'savings.yearly', shortKey: 'savings.per_year', perYear: 1 }
} as const

export const VAULT_ICONS = [
  { icon: 'lucide:shield', labelKey: 'savings.icon_emergency' },
  { icon: 'lucide:plane', labelKey: 'savings.icon_travel' },
  { icon: 'lucide:home', labelKey: 'savings.icon_home' },
  { icon: 'lucide:target', labelKey: 'savings.icon_goal' },
  { icon: 'lucide:gift', labelKey: 'savings.icon_gift' },
  { icon: 'lucide:trending-up', labelKey: 'savings.icon_invest' },
  { icon: 'lucide:book-open', labelKey: 'savings.icon_study' },
  { icon: 'lucide:shopping-bag', labelKey: 'savings.icon_shopping' }
] as const

export const VAULT_COLORS = [
  'oklch(0.8 0.13 220)',
  'oklch(0.85 0.14 195)',
  'oklch(0.78 0.16 290)',
  'oklch(0.78 0.2 25)',
  'oklch(0.85 0.2 145)',
  'oklch(0.82 0.16 60)'
] as const

export const useCaixinhas = () => {
  const { data, pending, refresh } = useFetch<Vault[]>('/api/vaults', {
    default: () => []
  })

  const create = async (body: Omit<Vault, 'id' | 'current' | 'createdAt' | 'updatedAt'>) => {
    await $fetch('/api/vaults', { method: 'POST', body })
    await refresh()
  }

  const update = async (id: string, body: Partial<Omit<Vault, 'id' | 'current' | 'createdAt' | 'updatedAt'>>) => {
    await $fetch(`/api/vaults/${id}`, { method: 'PUT', body })
    await refresh()
  }

  const remove = async (id: string) => {
    await $fetch(`/api/vaults/${id}`, { method: 'DELETE' })
    await refresh()
  }

  const deposit = async (vaultId: string, body: { amount: number, note?: string, date: string }) => {
    await $fetch(`/api/vaults/${vaultId}/deposit`, { method: 'POST', body })
    await refresh()
  }

  const withdraw = async (vaultId: string, body: { amount: number, note?: string, date: string }) => {
    await $fetch(`/api/vaults/${vaultId}/withdraw`, { method: 'POST', body })
    await refresh()
  }

  const removeDeposit = async (vaultId: string, depositId: string) => {
    await $fetch(`/api/vaults/${vaultId}/deposits/${depositId}`, { method: 'DELETE' })
    await refresh()
  }

  return { vaults: data, loading: pending, refresh, create, update, remove, deposit, withdraw, removeDeposit }
}
