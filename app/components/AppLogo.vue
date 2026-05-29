<script setup lang="ts">
const { size = 20, wordmark = true } = defineProps<{ size?: number; wordmark?: boolean }>()
</script>

<template>
  <div class="inline-flex items-center gap-2">
    <div
      :style="{
        width: `${size + 6}px`,
        height: `${size + 6}px`,
        borderRadius: '7px',
        background: 'var(--accent)',
        color: 'var(--accent-ink)',
        display: 'grid',
        placeItems: 'center',
        fontWeight: 700,
        fontSize: `${size - 4}px`,
        fontFamily: 'var(--font-mono)',
        letterSpacing: '-0.05em',
      }"
    >◐</div>
    <span
      v-if="wordmark"
      :style="{ fontWeight: 600, fontSize: `${size}px`, letterSpacing: '-0.02em', color: 'var(--ink)' }"
    >financej</span>
  </div>
</template>
