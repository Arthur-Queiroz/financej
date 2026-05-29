<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { period, dates, tabs } = usePeriod()
const { expenses, loading, remove } = useExpenses(dates)
const showModal = useState('showExpenseModal', () => false)
const toast = useToast()

async function del(id: string) {
  if (!confirm('Remover este gasto?')) return
  await remove(id)
  toast.add({ title: 'Gasto removido', color: 'neutral' })
}

const total = computed(() =>
  (expenses.value ?? []).reduce((s, e) => s + Number(e.amount), 0)
)
</script>

<template>
  <div class="p-7 pb-24 md:pb-7 flex flex-col gap-6" style="color: var(--ink);">

    <!-- Header -->
    <header class="flex items-center justify-between">
      <div>
        <h1 style="font-size: 28px; font-weight: 600; letter-spacing: -0.025em; margin: 0;">Gastos</h1>
        <div class="text-sm mt-1" style="color: var(--ink-3);">
          {{ expenses?.length ?? 0 }} lançamento{{ (expenses?.length ?? 0) !== 1 ? 's' : '' }} ·
          {{ fmtBRL(total) }}
        </div>
      </div>
      <button class="fm-btn fm-btn--primary hidden md:flex" @click="showModal = true">
        <UIcon name="lucide:plus" class="w-4 h-4" style="stroke-width: 2.4;" /> Registrar gasto
      </button>
    </header>

    <!-- Period filter -->
    <div class="fm-tab-group">
      <span
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ active: period === tab.key }"
        @click="period = tab.key"
      >{{ tab.label }}</span>
    </div>

    <!-- List -->
    <div class="fm-card" style="padding: 0; overflow: hidden;">
      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="lucide:loader-2" class="w-5 h-5 animate-spin" style="color: var(--ink-3);" />
      </div>

      <div v-else-if="!expenses?.length" class="text-center py-12 text-sm" style="color: var(--ink-3);">
        Nenhum gasto no período.
      </div>

      <template v-else>
        <div
          v-for="(exp, i) in expenses"
          :key="exp.id"
        >
          <div class="flex items-center gap-3 px-5 group">
            <div class="flex-1">
              <ExpenseRow :exp="exp" />
            </div>
            <button
              class="fm-btn fm-btn--icon fm-btn--subtle opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              style="width: 32px; height: 32px;"
              @click="del(exp.id)"
            >
              <UIcon name="lucide:trash-2" class="w-3.5 h-3.5" style="color: var(--negative);" />
            </button>
          </div>
          <div v-if="i < expenses.length - 1" class="fm-divider mx-5" style="opacity: 0.5;" />
        </div>
      </template>
    </div>

  </div>

  <ExpenseModal v-model="showModal" @saved="refreshNuxtData()" />
</template>
