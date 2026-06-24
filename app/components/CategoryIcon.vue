<script setup lang="ts">
const { CATEGORIES } = useCategories()
defineProps<{ cat: string, size?: number }>()
</script>

<template>
  <div
    v-if="CATEGORIES[cat]"
    :style="{
      width: `${size ?? 40}px`,
      height: `${size ?? 40}px`,
      borderRadius: '10px',
      background: `oklch(from var(${CATEGORIES[cat].token}) l c h / 0.16)`,
      color: `var(${CATEGORIES[cat].token})`,
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0
    }"
  >
    <UIcon
      :name="CATEGORIES[cat].icon"
      :style="{ width: `${(size ?? 40) * 0.45}px`, height: `${(size ?? 40) * 0.45}px` }"
    />
  </div>
</template>
