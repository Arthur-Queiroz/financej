<script setup lang="ts">
const { CATEGORIES } = useCategories()
const props = defineProps<{ cat: string, size?: number }>()
const meta = computed(() => CATEGORIES.value[props.cat])
</script>

<template>
  <div
    v-if="meta"
    :style="{
      width: `${size ?? 40}px`,
      height: `${size ?? 40}px`,
      borderRadius: '10px',
      background: `oklch(from var(${meta.token}) l c h / 0.16)`,
      color: `var(${meta.token})`,
      display: 'grid',
      placeItems: 'center',
      flexShrink: 0
    }"
  >
    <UIcon
      :name="meta.icon"
      :style="{ width: `${(size ?? 40) * 0.45}px`, height: `${(size ?? 40) * 0.45}px` }"
    />
  </div>
</template>
