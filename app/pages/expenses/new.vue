<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t } = useI18n()
const { CATEGORY_LIST } = useCategories()
const { currentCurrency } = useLocaleSettings()

const router = useRouter()
const amount = ref('')
const category = ref('FOOD')
const description = ref('')
const date = ref(isoDate())
const loading = ref(false)
const toast = useToast()

const { create } = useExpenses(ref({ from: '', to: '' }))

async function submit() {
  if (!amount.value) return
  loading.value = true
  try {
    await create({
      amount: parseFloat(amount.value.replace(',', '.')),
      category: category.value,
      description: description.value || undefined,
      date: date.value
    })
    toast.add({ title: t('expense.toast_saved'), color: 'success' })
    router.push('/dashboard')
  } catch {
    toast.add({ title: t('expense.toast_error'), color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col h-dvh" style="background: var(--bg); color: var(--ink);">
    <!-- App bar -->
    <div class="flex items-center gap-3 px-5 py-3 pt-safe">
      <button class="fm-btn fm-btn--icon fm-btn--subtle" style="width: 36px; height: 36px;" @click="router.back()">
        <UIcon name="lucide:chevron-left" class="w-5 h-5" />
      </button>
      <span style="font-size: 16px; font-weight: 600;">{{ t('expense.new') }}</span>
    </div>

    <div class="flex-1 overflow-y-auto px-5 pb-4">
      <!-- Big amount display -->
      <div class="text-center py-8">
        <div class="fm-label mb-2">{{ t('expense.amount') }}</div>
        <div class="mono inline-flex items-baseline gap-2" style="font-size: 48px; font-weight: 500; letter-spacing: -0.03em;">
          <span style="font-size: 20px; color: var(--ink-3);">{{ currentCurrency?.symbol }}</span>
          <input
            v-model="amount"
            class="bg-transparent outline-none border-none w-40 text-center"
            style="font-size: 48px; font-weight: 500; font-family: var(--font-mono); color: var(--ink);"
            :placeholder="t('expense.amount_placeholder')"
            inputmode="decimal"
          />
        </div>
      </div>

      <!-- Category grid -->
      <div class="mb-5">
        <div class="fm-label mb-2.5">{{ t('expense.category') }}</div>
        <div class="grid grid-cols-4 gap-1.5">
          <button
            v-for="cat in CATEGORY_LIST"
            :key="cat.key"
            class="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-all"
            :style="{
              background: category === cat.key ? `oklch(from var(${cat.token}) l c h / 0.16)` : 'transparent',
              border: `1px solid ${category === cat.key ? `var(${cat.token})` : 'var(--border)'}`,
              fontFamily: 'var(--font-sans)',
            }"
            @click="category = cat.key"
          >
            <div
              class="w-7 h-7 rounded-lg grid place-items-center"
              :style="{
                background: category === cat.key ? `var(${cat.token})` : 'var(--surface-2)',
                color: category === cat.key ? 'var(--accent-ink)' : `var(${cat.token})`
              }"
            >
              <UIcon :name="cat.icon" class="w-3.5 h-3.5" />
            </div>
            <span class="text-[10px] text-center leading-tight" style="color: var(--ink-2);">{{ cat.label }}</span>
          </button>
        </div>
      </div>

      <!-- Date -->
      <div class="mb-4">
        <label class="fm-label mb-2">{{ t('expense.date') }}</label>
        <input v-model="date" type="date" class="fm-input" />
      </div>

      <!-- Description -->
      <div>
        <label class="fm-label mb-2">{{ t('expense.description') }} <span style="text-transform: none; color: var(--ink-mute); font-weight: 400; letter-spacing: 0;">{{ t('expense.optional') }}</span></label>
        <textarea v-model="description" class="fm-input fm-textarea" :placeholder="t('expense.description_placeholder')" />
      </div>
    </div>

    <!-- Sticky bottom -->
    <div class="px-5 py-4 pb-safe-or-4" style="border-top: 1px solid var(--border); background: var(--bg);">
      <button
        class="fm-btn fm-btn--primary fm-btn--lg w-full"
        :disabled="loading || !amount"
        @click="submit"
      >
        <UIcon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
        <template v-else>{{ t('expense.save') }} <UIcon name="lucide:check" class="w-4 h-4" /></template>
      </button>
    </div>
  </div>
</template>
