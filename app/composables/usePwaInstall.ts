export const usePwaInstall = () => {
  const canInstall = ref(false)
  const deferredPrompt = ref<any>(null)

  if (import.meta.client) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt.value = e
      canInstall.value = true
    })

    window.addEventListener('appinstalled', () => {
      canInstall.value = false
      deferredPrompt.value = null
    })
  }

  async function install() {
    if (!deferredPrompt.value) return
    await deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') {
      canInstall.value = false
      deferredPrompt.value = null
    }
  }

  function dismiss() {
    canInstall.value = false
  }

  return { canInstall, install, dismiss }
}
