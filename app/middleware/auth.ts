export default defineNuxtRouteMiddleware(() => {
  // useAuth is only available in the Vue/client context — skip on SSR
  if (import.meta.server) return

  const { userId } = useAuth()
  if (!userId.value) {
    return navigateTo('/sign-in')
  }
})
