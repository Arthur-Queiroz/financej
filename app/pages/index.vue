<script setup lang="ts">
// useAuth is client-only in @clerk/nuxt
if (import.meta.client) {
  const { isSignedIn } = useAuth()
  if (isSignedIn.value) await navigateTo('/dashboard')
}
</script>

<template>
  <div class="min-h-dvh grid place-items-center" style="background: var(--bg); color: var(--ink);">
    <div class="text-center flex flex-col items-center gap-8 px-6">
      <AppLogo :size="32" />
      <div>
        <h1 style="font-size: 40px; font-weight: 700; letter-spacing: -0.03em; margin: 0 0 12px;">
          Suas finanças,<br />sob controle.
        </h1>
        <p class="text-base max-w-sm mx-auto" style="color: var(--ink-3);">
          Acompanhe despesas, compare com sua renda e exporte relatórios em Excel. Simples assim.
        </p>
      </div>
      <div class="flex gap-3 flex-wrap justify-center">
        <NuxtLink to="/sign-in">
          <button class="fm-btn fm-btn--primary fm-btn--lg">Entrar</button>
        </NuxtLink>
        <NuxtLink to="/sign-up">
          <button class="fm-btn fm-btn--ghost fm-btn--lg">Criar conta</button>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
