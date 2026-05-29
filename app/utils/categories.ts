export type CategoryKey =
  | 'FOOD'
  | 'SUBSCRIPTION'
  | 'ENTERTAINMENT'
  | 'PERSONAL_EXPENSE'
  | 'INVESTMENT'
  | 'EDUCATION'
  | 'RECURRING'
  | 'PERSONAL_PURCHASE'

export interface CategoryMeta {
  key: CategoryKey
  label: string
  token: string
  icon: string
}

// Base category definitions (without labels)
const CATEGORY_BASE: Record<CategoryKey, Omit<CategoryMeta, 'label'> & { key: CategoryKey }> = {
  FOOD:             { key: 'FOOD',             token: '--cat-food',          icon: 'lucide:shopping-bag' },
  SUBSCRIPTION:     { key: 'SUBSCRIPTION',     token: '--cat-subscription',  icon: 'lucide:play' },
  ENTERTAINMENT:    { key: 'ENTERTAINMENT',    token: '--cat-entertainment', icon: 'lucide:sparkles' },
  PERSONAL_EXPENSE: { key: 'PERSONAL_EXPENSE', token: '--cat-personal',      icon: 'lucide:user' },
  INVESTMENT:       { key: 'INVESTMENT',       token: '--cat-investment',    icon: 'lucide:trending-up' },
  EDUCATION:        { key: 'EDUCATION',        token: '--cat-education',     icon: 'lucide:book-open' },
  RECURRING:        { key: 'RECURRING',        token: '--cat-recurring',     icon: 'lucide:repeat' },
  PERSONAL_PURCHASE:{ key: 'PERSONAL_PURCHASE',token: '--cat-purchase',      icon: 'lucide:gift' },
}

// Helper to get translated categories
export function useCategories() {
  const { t } = useI18n()

  const CATEGORIES = computed<Record<CategoryKey, CategoryMeta>>(() => ({
    FOOD:             { ...CATEGORY_BASE.FOOD,             label: t('categories.FOOD') },
    SUBSCRIPTION:     { ...CATEGORY_BASE.SUBSCRIPTION,     label: t('categories.SUBSCRIPTION') },
    ENTERTAINMENT:    { ...CATEGORY_BASE.ENTERTAINMENT,    label: t('categories.ENTERTAINMENT') },
    PERSONAL_EXPENSE: { ...CATEGORY_BASE.PERSONAL_EXPENSE, label: t('categories.PERSONAL_EXPENSE') },
    INVESTMENT:       { ...CATEGORY_BASE.INVESTMENT,       label: t('categories.INVESTMENT') },
    EDUCATION:        { ...CATEGORY_BASE.EDUCATION,        label: t('categories.EDUCATION') },
    RECURRING:        { ...CATEGORY_BASE.RECURRING,        label: t('categories.RECURRING') },
    PERSONAL_PURCHASE:{ ...CATEGORY_BASE.PERSONAL_PURCHASE,label: t('categories.PERSONAL_PURCHASE') },
  }))

  const CATEGORY_LIST = computed(() => Object.values(CATEGORIES.value))

  return { CATEGORIES, CATEGORY_LIST }
}

// Legacy export for backwards compatibility (uses Portuguese by default)
export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  FOOD:             { key: 'FOOD',             label: 'Alimento',       token: '--cat-food',          icon: 'lucide:shopping-bag' },
  SUBSCRIPTION:     { key: 'SUBSCRIPTION',     label: 'Assinatura',     token: '--cat-subscription',  icon: 'lucide:play' },
  ENTERTAINMENT:    { key: 'ENTERTAINMENT',    label: 'Entretenimento', token: '--cat-entertainment', icon: 'lucide:sparkles' },
  PERSONAL_EXPENSE: { key: 'PERSONAL_EXPENSE', label: 'Gasto Pessoal',  token: '--cat-personal',      icon: 'lucide:user' },
  INVESTMENT:       { key: 'INVESTMENT',       label: 'Investimento',   token: '--cat-investment',    icon: 'lucide:trending-up' },
  EDUCATION:        { key: 'EDUCATION',        label: 'Estudo',         token: '--cat-education',     icon: 'lucide:book-open' },
  RECURRING:        { key: 'RECURRING',        label: 'Recorrente',     token: '--cat-recurring',     icon: 'lucide:repeat' },
  PERSONAL_PURCHASE:{ key: 'PERSONAL_PURCHASE',label: 'Compra Pessoal', token: '--cat-purchase',      icon: 'lucide:gift' },
}

export const CATEGORY_LIST = Object.values(CATEGORIES)
