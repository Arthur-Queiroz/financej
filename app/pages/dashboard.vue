<script setup lang="ts">
import { CATEGORIES } from '~/utils/categories'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t } = useI18n()
const { currentLocale } = useLocaleSettings()
const { user } = useUser()
const firstName = computed(() => user.value?.firstName || t('dashboard.you', 'você'))

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return t('dashboard.greeting_morning')
  if (h < 18) return t('dashboard.greeting_afternoon')
  return t('dashboard.greeting_evening')
})

const todayLabel = computed(() =>
  new Date().toLocaleDateString(currentLocale.value?.code || 'pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
)

const { period, dates, tabs } = usePeriod()
const { summary, loading: summaryLoading } = useDashboard(dates)
const { expenses, loading: expLoading } = useExpenses(dates)

const showModal = useState('showExpenseModal', () => false)

const donutData = computed(() =>
  (summary.value?.byCategory ?? []).map(c => ({
    value: c.amount,
    color: `var(${CATEGORIES[c.category]?.token ?? '--ink-3'})`
  }))
)

const categoryItems = computed(() =>
  (summary.value?.byCategory ?? []).map(c => ({ category: c.category, amount: c.amount }))
)
</script>

<template>
  <div class="flex flex-col gap-6 p-7 pb-24 md:pb-7" style="color: var(--ink);">

    <!-- Header -->
    <header class="flex items-start justify-between">
      <div>
        <div class="text-sm mb-1" style="color: var(--ink-3);">{{ todayLabel }}</div>
        <h1 style="font-size: 28px; font-weight: 600; letter-spacing: -0.025em; margin: 0;">
          {{ greeting }}, {{ firstName }}
        </h1>
      </div>
      <div class="hidden md:flex items-center gap-2.5">
        <NuxtLink to="/export">
          <button class="fm-btn fm-btn--ghost">
            <UIcon name="lucide:download" class="w-4 h-4" /> {{ t('dashboard.export') }}
          </button>
        </NuxtLink>
        <button class="fm-btn fm-btn--primary" @click="showModal = true">
          <UIcon name="lucide:plus" class="w-4 h-4" style="stroke-width: 2.4;" /> {{ t('dashboard.register') }}
        </button>
      </div>
    </header>

    <!-- Period filter -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div class="fm-tab-group">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: period === tab.key }"
          @click="period = tab.key"
        >{{ tab.label }}</span>
      </div>
      <div class="hidden md:flex items-center gap-1.5 text-sm" style="color: var(--ink-3);">
        <UIcon name="lucide:calendar" class="w-3.5 h-3.5" />
        <span>{{ dates.from }} — {{ dates.to }}</span>
      </div>
    </div>

    <!-- Hero card -->
    <section class="fm-card fm-card--glow" style="padding: 28px;">
      <div v-if="summaryLoading" class="flex items-center justify-center py-8">
        <UIcon name="lucide:loader-2" class="w-6 h-6 animate-spin" style="color: var(--ink-3);" />
      </div>
      <div v-else class="grid md:grid-cols-[1.4fr_1fr] gap-7 items-center">
        <div>
          <div class="fm-label mb-2">{{ t('dashboard.balance') }}</div>
          <div
            class="mono"
            style="font-size: clamp(36px, 5vw, 56px); font-weight: 500; letter-spacing: -0.035em; line-height: 1;"
            :style="{ color: (summary?.balance ?? 0) >= 0 ? 'var(--accent)' : 'var(--negative)' }"
          >
            {{ fmtBRL(summary?.balance ?? 0) }}
          </div>
          <div class="flex gap-5 mt-5 text-sm flex-wrap">
            <div>
              <div style="color: var(--ink-3); margin-bottom: 4px;">{{ t('dashboard.income') }}</div>
              <div class="mono font-medium text-base">{{ fmtBRL(summary?.totalIncome ?? 0) }}</div>
            </div>
            <div class="hidden md:block w-px" style="background: var(--border);" />
            <div>
              <div style="color: var(--ink-3); margin-bottom: 4px;">{{ t('dashboard.expenses') }}</div>
              <div class="mono font-medium text-base" style="color: var(--negative);">
                −{{ fmtBRL(summary?.totalExpenses ?? 0).replace('R$ ', '').replace('$ ', '') }}
              </div>
            </div>
            <div class="hidden md:block w-px" style="background: var(--border);" />
            <div class="hidden md:block">
              <div style="color: var(--ink-3); margin-bottom: 4px;">{{ expenses?.length ?? 0 }} {{ t('dashboard.entries') }}</div>
              <div class="font-medium text-base">
                {{ t('dashboard.average') }} {{ fmtBRL((summary?.totalExpenses ?? 0) / Math.max(expenses?.length ?? 1, 1)) }}
              </div>
            </div>
          </div>
          <!-- Mobile progress bar -->
          <div class="md:hidden mt-4">
            <div class="h-1.5 rounded-full overflow-hidden" style="background: var(--surface-2);">
              <div
                class="h-full rounded-full"
                style="background: var(--accent); transition: width 0.5s ease;"
                :style="{ width: `${Math.min(summary?.spentPercentage ?? 0, 100)}%` }"
              />
            </div>
            <div class="flex justify-between mt-2 text-xs" style="color: var(--ink-3);">
              <span>{{ fmtPct(summary?.spentPercentage ?? 0, 0) }} {{ t('dashboard.used') }}</span>
              <span class="mono">{{ fmtBRL(summary?.totalExpenses ?? 0, { compact: true }) }} / {{ fmtBRL(summary?.totalIncome ?? 0, { compact: true }) }}</span>
            </div>
          </div>
        </div>
        <div class="hidden md:grid place-items-center">
          <ChartsPercentRing :pct="summary?.spentPercentage ?? 0" />
        </div>
      </div>
    </section>

    <!-- Breakdown + Recent grid -->
    <section class="grid md:grid-cols-[1.1fr_1fr] gap-5">

      <!-- Category breakdown -->
      <div class="fm-card" style="padding: 24px; display: flex; flex-direction: column; gap: 18px;">
        <div class="flex items-center justify-between">
          <div>
            <div style="font-size: 16px; font-weight: 600; color: var(--ink);">{{ t('dashboard.by_category') }}</div>
            <div class="text-xs mt-0.5" style="color: var(--ink-3);">{{ categoryItems.length }} {{ t('dashboard.active_categories') }}</div>
          </div>
        </div>
        <div v-if="summaryLoading" class="flex justify-center py-6">
          <UIcon name="lucide:loader-2" class="w-5 h-5 animate-spin" style="color: var(--ink-3);" />
        </div>
        <div v-else-if="categoryItems.length" class="grid md:grid-cols-[160px_1fr] gap-6 items-center">
          <div class="relative mx-auto" style="width: 160px; height: 160px;">
            <ChartsDonutChart :data="donutData" :size="160" :thickness="20" />
            <div class="absolute inset-0 grid place-items-center text-center">
              <div>
                <div class="text-[10px] fm-label">{{ t('dashboard.total') }}</div>
                <div class="mono font-medium" style="font-size: 18px;">
                  {{ fmtBRL(summary?.totalExpenses ?? 0, { compact: true }) }}
                </div>
              </div>
            </div>
          </div>
          <ChartsCategoryBars :items="categoryItems" />
        </div>
        <div v-else class="text-sm text-center py-6" style="color: var(--ink-3);">
          {{ t('dashboard.no_expenses') }}
        </div>
      </div>

      <!-- Recent expenses -->
      <div class="fm-card" style="padding: 24px; display: flex; flex-direction: column;">
        <div class="flex items-center justify-between mb-2">
          <div>
            <div style="font-size: 16px; font-weight: 600; color: var(--ink);">{{ t('dashboard.recent') }}</div>
            <div class="text-xs mt-0.5" style="color: var(--ink-3);">{{ t('dashboard.recent_subtitle') }}</div>
          </div>
          <button class="fm-btn fm-btn--subtle fm-btn--sm">
            {{ t('dashboard.see_all') }} <UIcon name="lucide:arrow-right" class="w-3.5 h-3.5" />
          </button>
        </div>
        <div v-if="expLoading" class="flex justify-center py-6">
          <UIcon name="lucide:loader-2" class="w-5 h-5 animate-spin" style="color: var(--ink-3);" />
        </div>
        <template v-else>
          <template v-for="(exp, i) in (expenses ?? []).slice(0, 7)" :key="exp.id">
            <ExpenseRow :exp="exp" />
            <div v-if="i < Math.min((expenses?.length ?? 0), 7) - 1" class="fm-divider" style="opacity: 0.6;" />
          </template>
          <div v-if="!expenses?.length" class="text-sm text-center py-6" style="color: var(--ink-3);">
            {{ t('dashboard.no_expenses') }}
          </div>
        </template>
      </div>
    </section>

    <!-- Mobile Income Button -->
    <NuxtLink to="/settings/income" class="md:hidden">
      <button class="fm-btn fm-btn--ghost w-full flex items-center justify-center gap-2">
        <UIcon name="lucide:wallet" class="w-4 h-4" />
        {{ t('income.title') }}
        <UIcon name="lucide:arrow-right" class="w-4 h-4 ml-auto" />
      </button>
    </NuxtLink>

  </div>

  <!-- Expense Modal -->
  <ExpenseModal v-model="showModal" @saved="refreshNuxtData()" />
</template>
