export type CategoryKey
  = | 'FOOD'
    | 'SUBSCRIPTION'
    | 'LEISURE'
    | 'PERSONAL_EXPENSE'
    | 'INVESTMENT'
    | 'EDUCATION'
    | 'RECURRING'
    | 'HOUSE'
    | 'TRANSPORT'
    | 'OTHER'

export interface CategoryMeta {
  key: CategoryKey
  label: string
  token: string
  icon: string
}

// Base category definitions (without labels)
const CATEGORY_BASE: Record<CategoryKey, Omit<CategoryMeta, 'label'> & { key: CategoryKey }> = {
  FOOD: { key: 'FOOD', token: '--cat-food', icon: 'lucide:shopping-bag' },
  SUBSCRIPTION: { key: 'SUBSCRIPTION', token: '--cat-subscription', icon: 'lucide:play' },
  LEISURE: { key: 'LEISURE', token: '--cat-leisure', icon: 'lucide:sparkles' },
  PERSONAL_EXPENSE: { key: 'PERSONAL_EXPENSE', token: '--cat-personal', icon: 'lucide:user' },
  INVESTMENT: { key: 'INVESTMENT', token: '--cat-investment', icon: 'lucide:trending-up' },
  EDUCATION: { key: 'EDUCATION', token: '--cat-education', icon: 'lucide:book-open' },
  RECURRING: { key: 'RECURRING', token: '--cat-recurring', icon: 'lucide:repeat' },
  HOUSE: { key: 'HOUSE', token: '--cat-house', icon: 'lucide:home' },
  TRANSPORT: { key: 'TRANSPORT', token: '--cat-transport', icon: 'lucide:car' },
  OTHER: { key: 'OTHER', token: '--cat-other', icon: 'lucide:circle-dot' }
}

// Helper to get translated categories
export function useCategories() {
  const { t } = useI18n()

  const CATEGORIES = computed<Record<string, CategoryMeta>>(() => ({
    FOOD: { ...CATEGORY_BASE.FOOD, label: t('categories.FOOD') },
    SUBSCRIPTION: { ...CATEGORY_BASE.SUBSCRIPTION, label: t('categories.SUBSCRIPTION') },
    LEISURE: { ...CATEGORY_BASE.LEISURE, label: t('categories.LEISURE') },
    PERSONAL_EXPENSE: { ...CATEGORY_BASE.PERSONAL_EXPENSE, label: t('categories.PERSONAL_EXPENSE') },
    INVESTMENT: { ...CATEGORY_BASE.INVESTMENT, label: t('categories.INVESTMENT') },
    EDUCATION: { ...CATEGORY_BASE.EDUCATION, label: t('categories.EDUCATION') },
    RECURRING: { ...CATEGORY_BASE.RECURRING, label: t('categories.RECURRING') },
    HOUSE: { ...CATEGORY_BASE.HOUSE, label: t('categories.HOUSE') },
    TRANSPORT: { ...CATEGORY_BASE.TRANSPORT, label: t('categories.TRANSPORT') },
    OTHER: { ...CATEGORY_BASE.OTHER, label: t('categories.OTHER') }
  }))

  const CATEGORY_LIST = computed(() => Object.values(CATEGORIES.value))

  return { CATEGORIES, CATEGORY_LIST }
}

// Legacy export for backwards compatibility (uses Portuguese by default)
export const CATEGORIES: Record<string, CategoryMeta> = {
  FOOD: { key: 'FOOD', label: 'Alimentação', token: '--cat-food', icon: 'lucide:shopping-bag' },
  SUBSCRIPTION: { key: 'SUBSCRIPTION', label: 'Assinatura', token: '--cat-subscription', icon: 'lucide:play' },
  LEISURE: { key: 'LEISURE', label: 'Lazer', token: '--cat-leisure', icon: 'lucide:sparkles' },
  PERSONAL_EXPENSE: { key: 'PERSONAL_EXPENSE', label: 'Gasto Pessoal', token: '--cat-personal', icon: 'lucide:user' },
  INVESTMENT: { key: 'INVESTMENT', label: 'Investimento', token: '--cat-investment', icon: 'lucide:trending-up' },
  EDUCATION: { key: 'EDUCATION', label: 'Estudo', token: '--cat-education', icon: 'lucide:book-open' },
  RECURRING: { key: 'RECURRING', label: 'Recorrente', token: '--cat-recurring', icon: 'lucide:repeat' },
  HOUSE: { key: 'HOUSE', label: 'Casa', token: '--cat-house', icon: 'lucide:home' },
  TRANSPORT: { key: 'TRANSPORT', label: 'Transporte', token: '--cat-transport', icon: 'lucide:car' },
  OTHER: { key: 'OTHER', label: 'Outros', token: '--cat-other', icon: 'lucide:circle-dot' }
}

export const CATEGORY_LIST = Object.values(CATEGORIES)
