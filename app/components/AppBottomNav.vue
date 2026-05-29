<script setup lang="ts">
defineProps<{
  items: { icon: string; label: string; to: string }[]
  isActive: (to: string) => boolean
}>()

const showExpenseModal = useState('showExpenseModal', () => false)
</script>

<template>
  <nav
    class="bottom-nav fixed bottom-0 left-0 right-0 z-50 grid pb-safe"
    :style="{
      gridTemplateColumns: 'repeat(5, 1fr)',
      height: '64px',
      background: 'oklch(from var(--bg) l c h / 0.92)',
      backdropFilter: 'blur(14px)',
      borderTop: '1px solid var(--border)',
      alignItems: 'center',
      padding: '0 12px 8px',
    }"
  >
    <NuxtLink
      v-for="(item, i) in items.slice(0, 2)"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center gap-1"
      :style="{ color: isActive(item.to) ? 'var(--ink)' : 'var(--ink-mute)' }"
    >
      <UIcon :name="item.icon" :class="isActive(item.to) ? 'w-5 h-5' : 'w-5 h-5'" />
      <span class="text-[10px] font-medium">{{ item.label }}</span>
    </NuxtLink>

    <!-- FAB -->
    <div class="grid place-items-center">
      <button
        class="w-13 h-13 rounded-full grid place-items-center"
        style="background: var(--accent); color: var(--accent-ink); margin-top: -20px; box-shadow: 0 8px 20px -4px oklch(from var(--accent) l c h / 0.5);"
        @click="showExpenseModal = true"
      >
        <UIcon name="lucide:plus" class="w-6 h-6" style="stroke-width: 2.4;" />
      </button>
    </div>

    <NuxtLink
      v-for="item in items.slice(3, 5)"
      :key="item.to"
      :to="item.to"
      class="flex flex-col items-center gap-1"
      :style="{ color: isActive(item.to) ? 'var(--ink)' : 'var(--ink-mute)' }"
    >
      <UIcon :name="item.icon" class="w-5 h-5" />
      <span class="text-[10px] font-medium">{{ item.label }}</span>
    </NuxtLink>
  </nav>
</template>

<style scoped>
@media (min-width: 768px) {
  .bottom-nav { display: none !important; }
}
</style>
