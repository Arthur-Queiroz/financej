<script setup lang="ts">
if (import.meta.client) {
  const { isSignedIn } = useAuth()
  if (isSignedIn.value) await navigateTo('/dashboard')
}
</script>

<template>
  <div
    class="min-h-dvh grid place-items-center"
    style="background: var(--bg);"
  >
    <div class="w-full max-w-sm px-4 flex flex-col items-center gap-6">
      <AppLogo :size="22" />
      <SignIn
        :appearance="{
          variables: {
            colorPrimary: 'oklch(0.88 0.22 130)',
            colorBackground: 'var(--surface)',
            colorText: 'var(--ink)',
            colorInputBackground: 'var(--surface-2)',
            colorInputText: 'var(--ink)',
            borderRadius: '14px'
          }
        }"
        routing="hash"
        sign-up-url="/sign-up"
        fallback-redirect-url="/dashboard"
      />
    </div>
  </div>
</template>
