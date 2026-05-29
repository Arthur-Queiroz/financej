<script setup lang="ts">
const props = defineProps<{ pct: number; size?: number }>()

const size = computed(() => props.size ?? 200)
const r = computed(() => (size.value / 2) - 7)
const cx = computed(() => size.value / 2)
const cy = computed(() => size.value / 2)
const C = computed(() => 2 * Math.PI * r.value)
const len = computed(() => (props.pct / 100) * C.value)
const danger = computed(() => props.pct > 80)
const color = computed(() => danger.value ? 'var(--negative)' : 'var(--accent)')
</script>

<template>
  <div :style="{ position: 'relative', width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size">
      <circle :cx="cx" :cy="cy" :r="r" fill="none" stroke="var(--surface-2)" stroke-width="14" />
      <circle
        :cx="cx" :cy="cy" :r="r"
        fill="none"
        :stroke="color"
        stroke-width="14"
        :stroke-dasharray="`${len} ${C}`"
        stroke-linecap="round"
        :transform="`rotate(-90 ${cx} ${cy})`"
      />
    </svg>
    <div class="absolute inset-0 grid place-items-center text-center">
      <div>
        <div class="mono" style="font-size: 40px; font-weight: 500; letter-spacing: -0.03em; color: var(--ink);">
          {{ fmtPct(pct, 0) }}
        </div>
        <div class="text-xs mt-0.5" style="color: var(--ink-3);">da renda gasto</div>
      </div>
    </div>
  </div>
</template>
