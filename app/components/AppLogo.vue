<script setup lang="ts">
const { size = 20, wordmark = true } = defineProps<{ size?: number; wordmark?: boolean }>()
</script>

<template>
  <div class="inline-flex items-center">
    <span v-if="wordmark" :style="{ fontWeight: 600, fontSize: `${size}px`, letterSpacing: '-0.02em' }">
      <span :style="{ color: 'var(--ink)' }">finance</span><span :style="{ color: 'var(--accent)', fontWeight: 700 }">J</span>
    </span>
  </div>
</template>
