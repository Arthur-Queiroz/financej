<script setup lang="ts">
const { canInstall, install, dismiss } = usePwaInstall()
const { t } = useI18n()
const visible = ref(true)

function onDismiss() {
  visible.value = false
  dismiss()
}

async function onInstall() {
  await install()
  visible.value = false
}
</script>

<template>
  <Teleport to="body">
    <Transition name="pwa-banner">
      <div
        v-if="canInstall && visible"
        class="pwa-banner"
      >
        <div class="pwa-banner-content">
          <div>
            <p class="pwa-banner-title">
              {{ t('pwa.install_title') }}
            </p>
            <p class="pwa-banner-desc">
              {{ t('pwa.install_description') }}
            </p>
          </div>
          <div class="pwa-banner-actions">
            <UButton
              variant="ghost"
              size="sm"
              @click="onDismiss"
            >
              {{ t('pwa.dismiss') }}
            </UButton>
            <UButton
              size="sm"
              color="primary"
              @click="onInstall"
            >
              {{ t('pwa.install_button') }}
            </UButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.pwa-banner {
  position: fixed;
  bottom: 16px;
  left: 16px;
  right: 16px;
  z-index: 9999;
  background: var(--surface-1);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 16px 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,.24);
}

@media (min-width: 768px) {
  .pwa-banner {
    left: auto;
    width: 400px;
  }
}

.pwa-banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.pwa-banner-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  margin: 0 0 2px;
}

.pwa-banner-desc {
  font-size: 12px;
  color: var(--ink-3);
  margin: 0;
}

.pwa-banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.pwa-banner-enter-active,
.pwa-banner-leave-active {
  transition: opacity .3s, transform .3s;
}

.pwa-banner-enter-from,
.pwa-banner-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
