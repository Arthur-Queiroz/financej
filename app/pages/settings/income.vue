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
const oneTimeDate = ref(new Date().toISOString().slice(0, 10))
const saving = ref(false)
const toast = useToast()

const recurringIncomes = computed(() => (incomes.value ?? []).filter(i => i.recurrence !== 'ONE_TIME'))
const oneTimeIncomes = computed(() => (incomes.value ?? []).filter(i => i.recurrence === 'ONE_TIME'))

const totalMonthly = computed(() =>
  recurringIncomes.value.reduce((s, i) => s + Number(i.amount), 0)
)

const isOneTime = computed(() => recurrence.value === 'ONE_TIME')

const RECURRENCE_LABELS = computed(() => ({
  MONTHLY: t('income.monthly'),
  BIWEEKLY: t('income.biweekly'),
  WEEKLY: t('income.weekly'),
  ONE_TIME: t('income.one_time')
}))

const labelPlaceholder = computed(() =>
  isOneTime.value ? t('income.one_time_label_placeholder') : t('income.label_placeholder')
)

async function save() {
  if (!label.value || !amount.value) return
  saving.value = true
  try {
    const date = isOneTime.value ? oneTimeDate.value : effectiveFrom.value
    await create({
      label: label.value,
      amount: parseFloat(amount.value.replace(',', '.')),
      recurrence: recurrence.value,
      effectiveFrom: date,
      effectiveTo: isOneTime.value ? date : undefined
    })
    toast.add({ title: isOneTime.value ? t('income.toast_one_time_added') : t('income.toast_added'), color: 'success' })
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

function formatDate(d: string | Date) {
  return new Date(d).toLocaleDateString(currentLocale?.value?.code || 'pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div
    class="p-4 md:p-7 pb-24 md:pb-7 flex flex-col gap-5 md:gap-6"
    style="color: var(--ink);"
  >
    <!-- Header -->
    <header class="flex items-end justify-between gap-4">
      <div class="flex-1">
        <div
          class="text-sm mb-1"
          style="color: var(--ink-3);"
        >
          {{ t('settings.title') }}
        </div>
        <h1 style="font-size: 24px; md:font-size: 28px; font-weight: 600; letter-spacing: -0.025em; margin: 0;">
          {{ t('income.title') }}
        </h1>
        <p
          class="text-sm mt-1.5 max-w-lg"
          style="color: var(--ink-3);"
        >
          {{ t('income.subtitle') }}
        </p>
      </div>
      <button
        class="fm-btn fm-btn--primary hidden md:flex"
        @click="showForm = !showForm"
      >
        <UIcon
          name="lucide:plus"
          class="w-4 h-4"
          style="stroke-width: 2.4;"
        /> {{ t('income.add') }}
      </button>
    </header>

    <!-- Summary strip -->
    <section
      class="fm-card grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
      style="padding: 18px;"
    >
      <div>
        <div class="fm-label mb-1.5">
          {{ t('income.total_monthly') }}
        </div>
        <div
          class="mono"
          style="font-size: 28px; font-weight: 500; letter-spacing: -0.025em; color: var(--positive);"
        >
          {{ fmtBRL(totalMonthly) }}
        </div>
      </div>
      <div class="md:border-l md:border-[var(--border)] md:pl-6 pt-5 md:pt-0 border-t md:border-t-0 border-[var(--border)]">
        <div class="fm-label mb-1.5">
          {{ t('income.active_sources') }}
        </div>
        <div style="font-size: 28px; font-weight: 500; letter-spacing: -0.025em;">
          {{ recurringIncomes.length }}
        </div>
      </div>
      <div class="md:border-l md:border-[var(--border)] md:pl-6 pt-5 md:pt-0 border-t md:border-t-0 border-[var(--border)]">
        <div class="fm-label mb-1.5">
          {{ t('income.one_time_count') }}
        </div>
        <div style="font-size: 28px; font-weight: 500; letter-spacing: -0.025em;">
          {{ oneTimeIncomes.length }}
        </div>
      </div>
    </section>

    <!-- Add form -->
    <div
      v-if="showForm"
      class="fm-card"
      style="padding: 18px;"
    >
      <div style="font-size: 16px; font-weight: 600; margin-bottom: 16px;">
        {{ t('income.new_source') }}
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <!-- Type selector (full width, first) -->
        <div class="md:col-span-2">
          <label class="fm-label mb-2">{{ t('income.recurrence') }}</label>
          <select
            v-model="recurrence"
            class="fm-input"
          >
            <option value="MONTHLY">
              {{ t('income.monthly') }}
            </option>
            <option value="BIWEEKLY">
              {{ t('income.biweekly') }}
            </option>
            <option value="WEEKLY">
              {{ t('income.weekly') }}
            </option>
            <option value="ONE_TIME">
              {{ t('income.one_time') }}
            </option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="fm-label mb-2">{{ t('income.label') }}</label>
          <input
            v-model="label"
            class="fm-input"
            :placeholder="labelPlaceholder"
          >
        </div>
        <div>
          <label class="fm-label mb-2">{{ t('income.amount') }}</label>
          <input
            v-model="amount"
            class="fm-input"
            :placeholder="t('income.amount_placeholder')"
            inputmode="decimal"
          >
        </div>
        <div>
          <label class="fm-label mb-2">{{ isOneTime ? t('income.one_time_date') : t('income.effective_from') }}</label>
          <input
            v-if="isOneTime"
            v-model="oneTimeDate"
            type="date"
            class="fm-input"
          >
          <input
            v-else
            v-model="effectiveFrom"
            type="date"
            class="fm-input"
          >
        </div>
      </div>
      <div
        class="flex gap-2.5 justify-end mt-4"
        style="border-top: 1px solid var(--border); padding-top: 16px;"
      >
        <button
          class="fm-btn fm-btn--ghost"
          @click="showForm = false"
        >
          {{ t('income.cancel') }}
        </button>
        <button
          class="fm-btn fm-btn--primary"
          :disabled="saving"
          @click="save"
        >
          <UIcon
            v-if="saving"
            name="lucide:loader-2"
            class="w-4 h-4 animate-spin"
          />
          <span v-else>{{ t('income.save') }}</span>
        </button>
      </div>
    </div>

    <!-- Recurring incomes -->
    <section class="flex flex-col gap-3">
      <div
        v-if="recurringIncomes.length > 0"
        class="fm-label"
        style="padding-left: 2px;"
      >
        {{ t('income.recurring_section') }}
      </div>

      <div
        v-if="loading"
        class="flex justify-center py-8"
      >
        <UIcon
          name="lucide:loader-2"
          class="w-5 h-5 animate-spin"
          style="color: var(--ink-3);"
        />
      </div>

      <div
        v-for="inc in recurringIncomes"
        :key="inc.id"
        class="fm-card"
        style="padding: 16px;"
      >
        <div class="flex items-start gap-3">
          <div
            class="grid place-items-center rounded-xl flex-shrink-0"
            style="width: 44px; height: 44px; background: oklch(from var(--positive) l c h / 0.15); color: var(--positive);"
          >
            <UIcon
              name="lucide:wallet"
              class="w-5 h-5"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 mb-2">
              <div style="font-size: 15px; font-weight: 600;">
                {{ inc.label }}
              </div>
              <div
                class="mono font-medium text-lg flex-shrink-0"
                style="color: var(--positive);"
              >
                {{ fmtBRL(Number(inc.amount)) }}
              </div>
            </div>
            <div
              class="flex flex-wrap items-center gap-3 text-xs"
              style="color: var(--ink-3);"
            >
              <span class="flex items-center gap-1"><UIcon
                name="lucide:repeat"
                class="w-3 h-3"
              /> {{ RECURRENCE_LABELS[inc.recurrence] }}</span>
              <span class="flex items-center gap-1"><UIcon
                name="lucide:calendar"
                class="w-3 h-3"
              /> {{ t('income.since') }} {{ new Date(inc.effectiveFrom).toLocaleDateString(currentLocale?.value?.code || 'pt-BR', { month: 'short', year: 'numeric' }) }}</span>
              <span class="flex items-center gap-1">
                <span
                  class="w-1.5 h-1.5 rounded-full"
                  style="background: var(--positive);"
                /> {{ t('income.active') }}
              </span>
            </div>
          </div>
          <button
            class="fm-btn fm-btn--icon fm-btn--subtle flex-shrink-0"
            style="width: 36px; height: 36px;"
            @click="del(inc.id)"
          >
            <UIcon
              name="lucide:trash-2"
              class="w-3.5 h-3.5"
              style="color: var(--negative);"
            />
          </button>
        </div>
      </div>
    </section>

    <!-- One-time incomes -->
    <section
      v-if="oneTimeIncomes.length > 0"
      class="flex flex-col gap-3"
    >
      <div
        class="fm-label"
        style="padding-left: 2px;"
      >
        {{ t('income.one_time_section') }}
      </div>

      <div
        v-for="inc in oneTimeIncomes"
        :key="inc.id"
        class="fm-card"
        style="padding: 16px;"
      >
        <div class="flex items-start gap-3">
          <div
            class="grid place-items-center rounded-xl flex-shrink-0"
            style="width: 44px; height: 44px; background: oklch(from var(--accent) l c h / 0.15); color: var(--accent);"
          >
            <UIcon
              name="lucide:circle-dollar-sign"
              class="w-5 h-5"
            />
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-start justify-between gap-2 mb-2">
              <div style="font-size: 15px; font-weight: 600;">
                {{ inc.label }}
              </div>
              <div
                class="mono font-medium text-lg flex-shrink-0"
                style="color: var(--positive);"
              >
                {{ fmtBRL(Number(inc.amount)) }}
              </div>
            </div>
            <div
              class="flex flex-wrap items-center gap-3 text-xs"
              style="color: var(--ink-3);"
            >
              <span class="flex items-center gap-1"><UIcon
                name="lucide:calendar"
                class="w-3 h-3"
              /> {{ t('income.received_on') }} {{ formatDate(inc.effectiveFrom) }}</span>
              <span
                class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                style="background: oklch(from var(--accent) l c h / 0.12); color: var(--accent);"
              >
                <UIcon
                  name="lucide:zap"
                  class="w-3 h-3"
                /> {{ t('income.one_time_badge') }}
              </span>
            </div>
          </div>
          <button
            class="fm-btn fm-btn--icon fm-btn--subtle flex-shrink-0"
            style="width: 36px; height: 36px;"
            @click="del(inc.id)"
          >
            <UIcon
              name="lucide:trash-2"
              class="w-3.5 h-3.5"
              style="color: var(--negative);"
            />
          </button>
        </div>
      </div>
    </section>

    <!-- Add prompt -->
    <button
      class="flex items-center justify-center gap-2 py-5 rounded-xl text-sm font-medium"
      style="border: 1.5px dashed var(--border-strong); background: transparent; color: var(--ink-3); font-family: var(--font-sans);"
      @click="showForm = true"
    >
      <UIcon
        name="lucide:plus"
        class="w-4 h-4"
      /> {{ t('income.add_more') }}
    </button>
  </div>
</template>
