<script setup lang="ts">
const emit = defineEmits<{ close: []; saved: [] }>()
const open = defineModel<boolean>()

const { t } = useI18n()
const { CATEGORY_LIST } = useCategories()
const { currentCurrency } = useLocaleSettings()

const amount = ref('')
const category = ref('FOOD')
const description = ref('')
const date = ref(isoDate())
const loading = ref(false)
const keepAdding = ref(false)
const toast = useToast()

const { create } = useExpenses(ref({ from: '', to: '' }))

async function submit() {
  if (!amount.value || !category.value || !date.value) return
  loading.value = true
  try {
    await create({
      amount: parseFloat(amount.value.replace(',', '.')),
      category: category.value,
      description: description.value || undefined,
      date: date.value
    })
    toast.add({ title: t('expense.toast_saved'), color: 'success' })
    emit('saved')
    if (keepAdding.value) {
      amount.value = ''
      description.value = ''
      date.value = isoDate()
    } else {
      open.value = false
    }
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string }; message?: string })?.data?.message
      ?? (e as { message?: string })?.message
      ?? 'Erro desconhecido'
    toast.add({ title: t('expense.toast_error'), description: msg, color: 'error' })
    console.error('[ExpenseModal] save error:', e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal v-model:open="open" :ui="{ content: 'rounded-3xl shadow-[--shadow-pop] p-0 max-w-[540px]' }">
    <template #content>
      <div style="padding: 28px; background: var(--surface); border-radius: 24px; border: 2px solid var(--accent);">
        <!-- Header -->
        <div class="flex justify-between items-start mb-6">
          <div>
            <div class="fm-label mb-1.5">{{ t('expense.new_entry') }}</div>
            <h2 style="font-size: 22px; font-weight: 600; letter-spacing: -0.02em; color: var(--ink); margin: 0;">{{ t('expense.title') }}</h2>
          </div>
          <button class="fm-btn fm-btn--icon fm-btn--subtle" style="width: 32px; height: 32px;" @click="open = false">
            <UIcon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>

        <!-- Amount -->
        <div class="mb-5">
          <label class="fm-label mb-2">{{ t('expense.amount') }}</label>
          <div class="relative">
            <span class="mono absolute left-4 top-1/2 -translate-y-1/2 font-medium" style="color: var(--ink-3); font-size: 22px;">{{ currentCurrency?.symbol }}</span>
            <input
              v-model="amount"
              class="fm-input fm-input--big"
              style="padding-left: 60px;"
              :placeholder="t('expense.amount_placeholder')"
              inputmode="decimal"
            />
          </div>
        </div>

        <!-- Date + Category selects -->
        <div class="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label class="fm-label mb-2">{{ t('expense.date') }}</label>
            <input v-model="date" type="date" class="fm-input" />
          </div>
          <div>
            <label class="fm-label mb-2">{{ t('expense.category') }}</label>
            <select v-model="category" class="fm-input">
              <option v-for="cat in CATEGORY_LIST" :key="cat.key" :value="cat.key">{{ cat.label }}</option>
            </select>
          </div>
        </div>

        <!-- Category quick picker -->
        <div class="mb-5">
          <div class="fm-label mb-2.5">{{ t('expense.shortcut') }}</div>
          <div class="grid grid-cols-4 gap-2">
            <button
              v-for="cat in CATEGORY_LIST"
              :key="cat.key"
              class="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all"
              :style="{
                background: category === cat.key ? `oklch(from var(${cat.token}) l c h / 0.18)` : 'var(--surface-2)',
                border: `1px solid ${category === cat.key ? `var(${cat.token})` : 'var(--border)'}`,
                color: category === cat.key ? `var(${cat.token})` : 'var(--ink-2)',
                fontFamily: 'var(--font-sans)',
              }"
              @click="category = cat.key"
            >
              <UIcon :name="cat.icon" class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">{{ cat.label }}</span>
            </button>
          </div>
        </div>

        <!-- Description -->
        <div class="mb-6">
          <label class="fm-label mb-2">
            {{ t('expense.description') }} <span style="text-transform: none; color: var(--ink-mute); letter-spacing: 0; font-weight: 400;">{{ t('expense.optional') }}</span>
          </label>
          <textarea v-model="description" class="fm-input fm-textarea" :placeholder="t('expense.description_placeholder')" />
        </div>

        <!-- Footer -->
        <div class="flex justify-between items-center pt-5" style="border-top: 1px solid var(--border);">
          <label class="flex items-center gap-2 text-sm cursor-pointer select-none" style="color: var(--ink-2);">
            <span
              class="relative inline-block rounded-full"
              style="width: 36px; height: 22px; background: var(--surface-3);"
              @click="keepAdding = !keepAdding"
            >
              <span
                class="absolute top-0.5 rounded-full transition-transform"
                style="width: 18px; height: 18px; background: var(--ink-3);"
                :style="{ left: keepAdding ? '16px' : '2px', background: keepAdding ? 'var(--accent)' : 'var(--ink-3)' }"
              />
            </span>
            {{ t('expense.keep_adding') }}
          </label>
          <div class="flex gap-2.5">
            <button class="fm-btn fm-btn--ghost" @click="open = false">{{ t('expense.cancel') }}</button>
            <button class="fm-btn fm-btn--primary" :disabled="loading" @click="submit">
              <UIcon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
              <template v-else>{{ t('expense.save') }} <UIcon name="lucide:check" class="w-4 h-4" /></template>
            </button>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
