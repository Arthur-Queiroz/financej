<script setup lang="ts">
const { CATEGORIES } = useCategories()
defineProps<{ cat: string }>()
</script>

<template>
  <span
    v-if="CATEGORIES[cat]"
    class="fm-chip"
    :style="{ color: `var(${CATEGORIES[cat].token})` }"
  >
    <span
      class="inline-block rounded-sm"
      style="width: 8px; height: 8px; background: currentColor; flex-shrink: 0;"
    />
    <span style="color: var(--ink-2);">{{ CATEGORIES[cat].label }}</span>
  </span>
</template>
