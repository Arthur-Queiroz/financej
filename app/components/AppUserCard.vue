<script setup lang="ts">
const { user } = useUser()

const initials = computed(() => {
  const name = user.value?.fullName || user.value?.firstName || 'U'
  return name.charAt(0).toUpperCase()
})

// Check if user has a custom profile image
const hasCustomImage = computed(() => {
  // If Clerk provides hasImage property, use it
  if (user.value && 'hasImage' in user.value) {
    return user.value.hasImage === true
  }

  // Otherwise, check if imageUrl exists and is not a Clerk default
  const imageUrl = user.value?.imageUrl
  if (!imageUrl) return false

  const url = imageUrl.toLowerCase()
  const isClerkDefault = url.includes('img.clerk.com')
    || url.includes('gravatar')
    || url.includes('ui-avatars')

  return !isClerkDefault && imageUrl.trim() !== ''
})
</script>

<template>
  <div class="flex items-center gap-2.5 px-2">
    <div class="w-8 h-8 shrink-0">
      <template v-if="hasCustomImage">
        <img
          :src="user?.imageUrl"
          :alt="user?.fullName || user?.firstName"
          class="w-full h-full rounded-full object-cover"
          style="border: 1px solid var(--accent);"
        >
      </template>
      <template v-else>
        <div
          class="w-full h-full rounded-full grid place-items-center text-sm font-semibold"
          style="background: linear-gradient(135deg, var(--accent), oklch(0.6 0.2 290)); color: var(--accent-ink);"
        >
          {{ initials }}
        </div>
      </template>
    </div>
    <div class="flex-1 min-w-0">
      <div
        class="text-sm font-medium truncate"
        style="color: var(--ink);"
      >
        {{ user?.fullName || user?.firstName }}
      </div>
      <div
        class="text-xs truncate"
        style="color: var(--ink-3);"
      >
        {{ user?.primaryEmailAddress?.emailAddress }}
      </div>
    </div>
  </div>
</template>
