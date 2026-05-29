<script setup lang="ts">
const { CATEGORIES } = useCategories()

defineProps<{
  exp: { id: string; amount: string | number; category: string; description?: string | null; date: string }
  dense?: boolean
  showDate?: boolean
}>()
</script>

<template>
  <div
    class="grid items-center"
    :style="{
      gridTemplateColumns: 'auto 1fr auto',
      gap: '14px',
      padding: dense ? '10px 0' : '14px 0',
    }"
  >
    <CategoryIcon :cat="exp.category" :size="dense ? 36 : 40" />
    <div class="min-w-0">
      <div class="text-sm font-medium truncate" style="color: var(--ink);">
        {{ exp.description || CATEGORIES[exp.category]?.label }}
      </div>
      <div class="text-xs flex items-center gap-1.5 mt-0.5" style="color: var(--ink-3);">
        <span>{{ CATEGORIES[exp.category]?.label }}</span>
        <template v-if="showDate !== false">
          <span style="opacity: 0.5;">·</span>
          <span>{{ fmtDate(exp.date) }}</span>
        </template>
      </div>
    </div>
    <div class="mono text-sm font-medium" style="color: var(--ink);">
      −{{ fmtBRL(Number(exp.amount)).replace('R$ ', '') }}
    </div>
  </div>
</template>
