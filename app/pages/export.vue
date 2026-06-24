<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t } = useI18n()
const { CATEGORY_LIST } = useCategories()
const { period, dates, tabs, customFrom, customTo } = usePeriod()
const { currentLocale } = useLocaleSettings()
const loading = ref(false)
const toast = useToast()

async function download() {
  loading.value = true
  try {
    const resp = await $fetch('/api/export', {
      query: {
        from: dates.value.from,
        to: dates.value.to,
        locale: currentLocale.value?.code || 'pt-BR'
      },
      responseType: 'blob'
    })
    const url = URL.createObjectURL(resp as unknown as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${t('export.filename')}-${dates.value.from}-${dates.value.to}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    toast.add({ title: t('export.toast_success'), color: 'success' })
  } catch {
    toast.add({ title: t('export.toast_error'), color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div
    class="p-4 md:p-7 pb-24 md:pb-7 max-w-4xl mx-auto"
    style="color: var(--ink);"
  >
    <header class="mb-6">
      <div
        class="text-sm mb-1"
        style="color: var(--ink-3);"
      >
        {{ t('export.section') }}
      </div>
      <h1 style="font-size: 28px; font-weight: 600; letter-spacing: -0.025em; margin: 0;">
        {{ t('export.title') }}
      </h1>
      <p
        class="text-sm mt-2 max-w-2xl"
        style="color: var(--ink-3);"
      >
        {{ t('export.description') }} <code
          class="mono text-xs px-1.5 py-0.5 rounded"
          style="background: var(--surface-2);"
        >.xlsx</code>
        {{ t('export.description_suffix') }}
      </p>
    </header>

    <!-- Period -->
    <div class="fm-card mb-4 p-4 md:p-5">
      <div class="fm-label mb-3">
        {{ t('export.period') }}
      </div>
      <div class="fm-tab-group mb-3">
        <span
          v-for="tab in tabs"
          :key="tab.key"
          class="tab"
          :class="{ active: period === tab.key }"
          @click="period = tab.key"
        >{{ tab.label }}</span>
      </div>
      <div
        v-if="period === 'custom'"
        class="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mt-2"
      >
        <input
          v-model="customFrom"
          type="date"
          class="fm-input"
        >
        <UIcon
          name="lucide:arrow-right"
          class="w-4 h-4"
          style="color: var(--ink-3);"
        />
        <input
          v-model="customTo"
          type="date"
          class="fm-input"
        >
      </div>
      <div
        v-else
        class="text-sm mt-1"
        style="color: var(--ink-3);"
      >
        {{ dates.from }} → {{ dates.to }}
      </div>
    </div>

    <!-- Content options -->
    <div class="fm-card mb-4 p-4 md:p-5">
      <div class="fm-label mb-3">
        {{ t('export.content') }}
      </div>
      <div class="flex flex-col gap-3">
        <label
          v-for="item in [t('export.content_expenses_list'), t('export.content_summary'), t('export.content_breakdown')]"
          :key="item"
          class="flex items-center gap-3 text-sm cursor-pointer"
          style="color: var(--ink-2);"
        >
          <span
            class="w-4 h-4 rounded grid place-items-center shrink-0"
            style="background: var(--accent);"
          >
            <UIcon
              name="lucide:check"
              class="w-3 h-3"
              style="color: var(--accent-ink);"
            />
          </span>
          {{ item }}
        </label>
      </div>
    </div>

    <!-- Categories -->
    <div class="fm-card mb-6 p-4 md:p-5">
      <div class="flex justify-between items-center mb-3">
        <div class="fm-label">
          {{ t('export.categories_included') }}
        </div>
        <span
          class="text-xs"
          style="color: var(--ink-3);"
        >{{ CATEGORY_LIST.length }} {{ t('export.of') }} {{ CATEGORY_LIST.length }}</span>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <span
          v-for="cat in CATEGORY_LIST"
          :key="cat.key"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          :style="{
            background: `oklch(from var(${cat.token}) l c h / 0.16)`,
            color: `var(${cat.token})`
          }"
        >
          <span
            class="w-1.5 h-1.5 rounded-full"
            style="background: currentColor;"
          />
          {{ cat.label }}
        </span>
      </div>
    </div>

    <!-- CTA -->
    <div class="flex justify-end">
      <button
        class="fm-btn fm-btn--primary fm-btn--lg w-full md:w-auto"
        :disabled="loading"
        @click="download"
      >
        <UIcon
          v-if="loading"
          name="lucide:loader-2"
          class="w-4 h-4 animate-spin"
        />
        <template v-else>
          <UIcon
            name="lucide:download"
            class="w-4 h-4"
          /> {{ t('export.generate') }}
        </template>
      </button>
    </div>
  </div>
</template>
