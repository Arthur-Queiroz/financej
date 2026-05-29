<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t } = useI18n()
const { currentLocale } = useLocaleSettings()
const { incomes, loading, create, remove } = useIncomes()

const showForm = ref(false)
const label = ref('')
const amount = ref('')
const recurrence = ref('MONTHLY')
const effectiveFrom = ref(`${new Date().getFullYear()}-01-01`)
const saving = ref(false)
const toast = useToast()

const totalMonthly = computed(() =>
  (incomes.value ?? []).reduce((s, i) => s + Number(i.amount), 0)
)

const RECURRENCE_LABELS = computed(() => ({
  MONTHLY: t('income.monthly'),
  BIWEEKLY: t('income.biweekly'),
  WEEKLY: t('income.weekly')
}))

async function save() {
  if (!label.value || !amount.value) return
  saving.value = true
  try {
    await create({
      label: label.value,
      amount: parseFloat(amount.value.replace(',', '.')),
      recurrence: recurrence.value,
      effectiveFrom: effectiveFrom.value
    })
    toast.add({ title: t('income.toast_added'), color: 'success' })
    showForm.value = false
    label.value = ''
    amount.value = ''
  } catch {
    toast.add({ title: t('income.toast_error'), color: 'error' })
  } finally {
    saving.value = false
  }
}

async function del(id: string) {
  if (!confirm(t('income.confirm_remove'))) return
  await remove(id)
  toast.add({ title: t('income.toast_removed'), color: 'neutral' })
}
</script>

<template>
  <div class="p-7 pb-24 md:pb-7 flex flex-col gap-6" style="color: var(--ink);">

    <!-- Header -->
    <header class="flex items-end justify-between">
      <div>
        <div class="text-sm mb-1" style="color: var(--ink-3);">{{ t('settings.title') }}</div>
        <h1 style="font-size: 28px; font-weight: 600; letter-spacing: -0.025em; margin: 0;">{{ t('income.title') }}</h1>
        <p class="text-sm mt-1.5 max-w-lg" style="color: var(--ink-3);">
          {{ t('income.subtitle') }}
        </p>
      </div>
      <button class="fm-btn fm-btn--primary hidden md:flex" @click="showForm = !showForm">
        <UIcon name="lucide:plus" class="w-4 h-4" style="stroke-width: 2.4;" /> {{ t('income.add') }}
      </button>
    </header>

    <!-- Summary strip -->
    <section class="fm-card" style="padding: 22px; display: grid; grid-template-columns: repeat(2, 1fr); gap: 22px;">
      <div>
        <div class="fm-label mb-1.5">{{ t('income.total_monthly') }}</div>
        <div class="mono" style="font-size: 32px; font-weight: 500; letter-spacing: -0.025em; color: var(--positive);">
          {{ fmtBRL(totalMonthly) }}
        </div>
      </div>
      <div style="border-left: 1px solid var(--border); padding-left: 22px;">
        <div class="fm-label mb-1.5">{{ t('income.active_sources') }}</div>
        <div style="font-size: 32px; font-weight: 500; letter-spacing: -0.025em;">{{ incomes?.length ?? 0 }}</div>
      </div>
    </section>

    <!-- Add form -->
    <div v-if="showForm" class="fm-card" style="padding: 22px;">
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">{{ t('income.new_source') }}</div>
      <div class="grid grid-cols-2 gap-3 mb-3">
        <div class="col-span-2">
          <label class="fm-label mb-2">{{ t('income.label') }}</label>
          <input v-model="label" class="fm-input" :placeholder="t('income.label_placeholder')" />
        </div>
        <div>
          <label class="fm-label mb-2">{{ t('income.amount') }}</label>
          <input v-model="amount" class="fm-input" :placeholder="t('income.amount_placeholder')" inputmode="decimal" />
        </div>
        <div>
          <label class="fm-label mb-2">{{ t('income.recurrence') }}</label>
          <select v-model="recurrence" class="fm-input">
            <option value="MONTHLY">{{ t('income.monthly') }}</option>
            <option value="BIWEEKLY">{{ t('income.biweekly') }}</option>
            <option value="WEEKLY">{{ t('income.weekly') }}</option>
          </select>
        </div>
        <div>
          <label class="fm-label mb-2">{{ t('income.effective_from') }}</label>
          <input v-model="effectiveFrom" type="date" class="fm-input" />
        </div>
      </div>
      <div class="flex gap-2.5 justify-end mt-4" style="border-top: 1px solid var(--border); padding-top: 16px;">
        <button class="fm-btn fm-btn--ghost" @click="showForm = false">{{ t('income.cancel') }}</button>
        <button class="fm-btn fm-btn--primary" :disabled="saving" @click="save">
          <UIcon v-if="saving" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
          <span v-else>{{ t('income.save') }}</span>
        </button>
      </div>
    </div>

    <!-- Income list -->
    <section class="flex flex-col gap-3">
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="lucide:loader-2" class="w-5 h-5 animate-spin" style="color: var(--ink-3);" />
      </div>

      <div
        v-for="inc in incomes"
        :key="inc.id"
        class="fm-card"
        style="padding: 20px; display: grid; grid-template-columns: auto 1fr auto auto; align-items: center; gap: 18px;"
      >
        <div
          class="grid place-items-center rounded-xl"
          style="width: 48px; height: 48px; background: oklch(from var(--positive) l c h / 0.15); color: var(--positive);"
        >
          <UIcon name="lucide:wallet" class="w-5 h-5" />
        </div>
        <div>
          <div style="font-size: 15px; font-weight: 600;">{{ inc.label }}</div>
          <div class="flex items-center gap-4 mt-1.5 text-xs" style="color: var(--ink-3);">
            <span class="flex items-center gap-1"><UIcon name="lucide:repeat" class="w-3 h-3" /> {{ RECURRENCE_LABELS[inc.recurrence] }}</span>
            <span class="flex items-center gap-1"><UIcon name="lucide:calendar" class="w-3 h-3" /> {{ t('income.since') }} {{ new Date(inc.effectiveFrom).toLocaleDateString(currentLocale?.code || 'pt-BR', { month: 'short', year: 'numeric' }) }}</span>
            <span class="flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full" style="background: var(--positive);" /> {{ t('income.active') }}
            </span>
          </div>
        </div>
        <div class="mono font-medium text-xl" style="text-align: right;">{{ fmtBRL(Number(inc.amount)) }}</div>
        <div class="flex gap-1.5">
          <button class="fm-btn fm-btn--icon fm-btn--subtle" style="width: 36px; height: 36px;" @click="del(inc.id)">
            <UIcon name="lucide:trash-2" class="w-3.5 h-3.5" style="color: var(--negative);" />
          </button>
        </div>
      </div>

      <!-- Add prompt -->
      <button
        class="flex items-center justify-center gap-2 py-5 rounded-xl text-sm font-medium"
        style="border: 1.5px dashed var(--border-strong); background: transparent; color: var(--ink-3); font-family: var(--font-sans);"
        @click="showForm = true"
      >
        <UIcon name="lucide:plus" class="w-4 h-4" /> {{ t('income.add_more') }}
      </button>
    </section>
  </div>
</template>
