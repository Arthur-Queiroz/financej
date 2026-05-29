<script setup lang="ts">
const { CATEGORIES } = useCategories()

defineProps<{
  items: { category?: string; key?: string; amount: number }[]
  compact?: boolean
}>()
</script>

<template>
  <div class="flex flex-col" :style="{ gap: compact ? '10px' : '14px' }">
    <div
      v-for="item in items"
      :key="item.category ?? item.key"
      class="grid items-center"
      style="grid-template-columns: 120px 1fr 70px; gap: 12px;"
    >
      <div class="flex items-center gap-2 min-w-0">
        <span
          class="shrink-0"
          style="width: 8px; height: 8px; border-radius: 3px;"
          :style="{ background: `var(${CATEGORIES[item.category ?? item.key ?? '']?.token ?? '--ink-3'})` }"
        />
        <span class="text-sm font-medium truncate" style="color: var(--ink-2);">
          {{ CATEGORIES[item.category ?? item.key ?? '']?.label ?? item.category ?? item.key }}
        </span>
      </div>
      <div class="relative h-2 rounded-full overflow-hidden" style="background: var(--surface-2);">
        <div
          class="absolute inset-0 rounded-full"
          :style="{
            width: `${(item.amount / Math.max(...items.map(i => i.amount))) * 100}%`,
            background: `var(${CATEGORIES[item.category ?? item.key ?? '']?.token ?? '--accent'})`
          }"
        />
      </div>
      <div class="mono text-sm font-medium text-right" style="color: var(--ink);">
        {{ fmtBRL(item.amount).replace('R$ ', '') }}
      </div>
    </div>
  </div>
</template>
