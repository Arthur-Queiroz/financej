<script setup lang="ts">
const props = defineProps<{
  data: { value: number, color: string }[]
  size?: number
  thickness?: number
}>()

const size = computed(() => props.size ?? 160)
const thickness = computed(() => props.thickness ?? 20)

const segments = computed(() => {
  const total = props.data.reduce((s, d) => s + d.value, 0)
  if (!total) return []
  const r = (size.value - thickness.value) / 2
  const C = 2 * Math.PI * r
  const gap = 0.012
  let acc = 0
  return props.data.map((d) => {
    const frac = d.value / total
    const len = Math.max(C * (frac - gap), 1)
    const offset = -acc * C
    acc += frac
    return { ...d, r, C, len, offset }
  })
})

const cx = computed(() => size.value / 2)
const cy = computed(() => size.value / 2)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
  >
    <circle
      :cx="cx"
      :cy="cy"
      :r="segments[0]?.r ?? 70"
      fill="none"
      stroke="var(--surface-2)"
      :stroke-width="thickness"
    />
    <circle
      v-for="(seg, i) in segments"
      :key="i"
      :cx="cx"
      :cy="cy"
      :r="seg.r"
      fill="none"
      :stroke="seg.color"
      :stroke-width="thickness"
      :stroke-dasharray="`${seg.len} ${seg.C - seg.len}`"
      :stroke-dashoffset="seg.offset"
      :transform="`rotate(-90 ${cx} ${cy})`"
      stroke-linecap="butt"
    />
    <slot />
  </svg>
</template>
