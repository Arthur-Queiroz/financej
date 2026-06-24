<script setup lang="ts">
const { CATEGORIES } = useCategories()
const props = defineProps<{ cat: string }>()
const meta = computed(() => CATEGORIES.value[props.cat])
</script>

<template>
  <span
    v-if="meta"
    class="fm-chip"
    :style="{ color: `var(${meta.token})` }"
  >
    <span
      class="inline-block rounded-sm"
      style="width: 8px; height: 8px; background: currentColor; flex-shrink: 0;"
    />
    <span style="color: var(--ink-2);">{{ meta.label }}</span>
  </span>
</template>
