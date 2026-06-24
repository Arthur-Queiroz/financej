<script setup lang="ts">
const { accent } = useAccent()

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black' }
  ],
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
    <VitePwaManifest />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <PwaInstallBanner />
  </UApp>
</template>
