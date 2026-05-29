<script setup lang="ts">
const { accent } = useAccent()

useHead({
  meta: [{ name: 'viewport', content: 'width=device-width, initial-scale=1' }],
  link: [{ rel: 'icon', href: '/favicon.ico' }],
  htmlAttrs: { lang: 'pt-BR' },
  style: [{ id: 'accent', textContent: computed(() => `:root { --accent: ${accent.value}; }`) }]
})

useSeoMeta({
  title: 'financej',
  description: 'Gerencie suas finanças pessoais com facilidade.'
})
</script>

<template>
  <UApp class="fm-app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
