<script setup lang="ts">
const { user } = useUser()
const { t } = useI18n()
const route = useRoute()

const mobileMenuOpen = useState('mobileMenuOpen', () => false)

const navItems = computed(() => [
  { icon: 'lucide:pie-chart',         label: t('nav.dashboard'),  to: '/dashboard' },
  { icon: 'lucide:list',              label: t('nav.expenses'),   to: '/expenses' },
  { icon: 'lucide:wallet',            label: t('nav.incomes'),    to: '/settings/income' },
  { icon: 'lucide:piggy-bank',        label: t('nav.savings'),    to: '/savings' },
  { icon: 'lucide:file-spreadsheet',  label: t('nav.export'),     to: '/export' },
  { icon: 'lucide:settings',          label: t('nav.settings'),   to: '/settings' },
])

function isActive(to: string) {
  if (route.path === to) return true
  if (to === '/settings') return false
  return to !== '/dashboard' && route.path.startsWith(to + '/')
}

function navigateTo(to: string) {
  mobileMenuOpen.value = false
}

// Swipe gesture handling
const swipeState = ref({
  isDragging: false,
  startX: 0,
  currentX: 0,
  startedFromEdge: false,
})

const drawerTransform = ref(0)
const overlayOpacity = ref(0)
const isAnimating = ref(false)

const EDGE_THRESHOLD = 20 // px from left edge to trigger swipe
const DRAWER_WIDTH = 280
const OPEN_THRESHOLD = DRAWER_WIDTH * 0.5 // 50% of drawer width

function handleTouchStart(e: TouchEvent) {
  if (isAnimating.value) return

  const touch = e.touches[0]
  const startX = touch.clientX

  // Check if swipe started from left edge or from open drawer
  const startedFromEdge = startX <= EDGE_THRESHOLD
  const startedFromDrawer = mobileMenuOpen.value && startX <= DRAWER_WIDTH

  if (startedFromEdge || startedFromDrawer) {
    swipeState.value = {
      isDragging: true,
      startX,
      currentX: startX,
      startedFromEdge: !mobileMenuOpen.value,
    }
  }
}

function handleTouchMove(e: TouchEvent) {
  if (!swipeState.value.isDragging) return

  const touch = e.touches[0]
  swipeState.value.currentX = touch.clientX

  const deltaX = swipeState.value.currentX - swipeState.value.startX

  if (swipeState.value.startedFromEdge) {
    // Opening gesture - only allow right swipe
    const newTransform = Math.max(0, Math.min(deltaX, DRAWER_WIDTH))
    drawerTransform.value = newTransform
    overlayOpacity.value = newTransform / DRAWER_WIDTH

    if (newTransform > 0 && !mobileMenuOpen.value) {
      mobileMenuOpen.value = true
    }
  } else {
    // Closing gesture - only allow left swipe
    const newTransform = Math.max(-DRAWER_WIDTH, Math.min(0, deltaX))
    drawerTransform.value = newTransform
    overlayOpacity.value = 1 + (newTransform / DRAWER_WIDTH)
  }
}

function handleTouchEnd() {
  if (!swipeState.value.isDragging) return

  isAnimating.value = true
  const deltaX = swipeState.value.currentX - swipeState.value.startX

  if (swipeState.value.startedFromEdge) {
    // Opening gesture
    if (deltaX > OPEN_THRESHOLD) {
      // Open fully
      drawerTransform.value = 0
      overlayOpacity.value = 1
      mobileMenuOpen.value = true
    } else {
      // Close
      drawerTransform.value = -DRAWER_WIDTH
      overlayOpacity.value = 0
      setTimeout(() => {
        mobileMenuOpen.value = false
        drawerTransform.value = 0
      }, 300)
    }
  } else {
    // Closing gesture
    if (deltaX < -OPEN_THRESHOLD) {
      // Close fully
      drawerTransform.value = -DRAWER_WIDTH
      overlayOpacity.value = 0
      setTimeout(() => {
        mobileMenuOpen.value = false
        drawerTransform.value = 0
      }, 300)
    } else {
      // Stay open
      drawerTransform.value = 0
      overlayOpacity.value = 1
    }
  }

  swipeState.value.isDragging = false
  setTimeout(() => {
    isAnimating.value = false
  }, 300)
}

onMounted(() => {
  if (import.meta.client) {
    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: true })
    document.addEventListener('touchend', handleTouchEnd, { passive: true })
  }
})

onUnmounted(() => {
  if (import.meta.client) {
    document.removeEventListener('touchstart', handleTouchStart)
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
  }
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <!-- Overlay -->
      <Transition name="fade">
        <div
          v-if="mobileMenuOpen"
          class="drawer-overlay"
          :style="{
            opacity: swipeState.isDragging ? overlayOpacity : undefined,
            transition: swipeState.isDragging ? 'none' : undefined,
          }"
          @click="mobileMenuOpen = false"
        />
      </Transition>

      <!-- Drawer -->
      <Transition name="slide">
        <div
          v-if="mobileMenuOpen"
          class="drawer-container"
          :style="{
            transform: swipeState.isDragging ? `translateX(${drawerTransform}px)` : undefined,
            transition: swipeState.isDragging ? 'none' : undefined,
          }"
        >
          <div class="mobile-menu">
            <!-- Header -->
            <div class="menu-header">
              <AppLogo :size="24" />
              <UButton
                icon="lucide:x"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="mobileMenuOpen = false"
              />
            </div>

            <!-- User Card -->
            <div class="user-section">
              <AppUserCard />
            </div>

            <!-- Navigation -->
            <nav class="menu-nav">
              <NuxtLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="menu-nav-item"
                :class="{ 'active': isActive(item.to) }"
                @click="navigateTo(item.to)"
              >
                <div class="nav-item-content">
                  <div class="nav-icon-container">
                    <UIcon :name="item.icon" class="w-5 h-5" />
                  </div>
                  <span class="nav-item-label">{{ item.label }}</span>
                </div>
                <div v-if="isActive(item.to)" class="active-bar" />
              </NuxtLink>
            </nav>

            <!-- Footer Actions -->
            <div class="menu-footer">
              <div class="footer-divider" />
              <a
                href="https://github.com/Arthur-Queiroz/financej"
                target="_blank"
                rel="noopener noreferrer"
                class="footer-link"
              >
                <UIcon name="lucide:github" class="w-4 h-4" />
                <span>GitHub</span>
                <UIcon name="lucide:external-link" class="w-3.5 h-3.5 ml-auto opacity-50" />
              </a>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
/* Overlay */
.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 9998;
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Drawer Container */
.drawer-container {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  max-width: 85vw;
  z-index: 9999;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg);
  overflow-y: auto;
}

.menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  padding-top: max(20px, env(safe-area-inset-top));
  border-bottom: 1px solid var(--border);
}

.user-section {
  padding: 20px 16px;
  border-bottom: 1px solid var(--border);
}

.menu-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 12px;
  overflow-y: auto;
}

.menu-nav-item {
  position: relative;
  display: flex;
  align-items: center;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-item-content {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  padding: 12px 14px;
  color: var(--ink-mute);
  transition: color 0.2s;
}

.menu-nav-item.active .nav-item-content {
  color: var(--ink);
}

.menu-nav-item:not(.active):active {
  background: var(--surface-1);
  transform: scale(0.98);
}

.nav-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: transparent;
  transition: all 0.2s;
}

.menu-nav-item.active .nav-icon-container {
  background: oklch(from var(--accent) l c h / 0.12);
  color: var(--accent);
}

.nav-item-label {
  font-size: 15px;
  font-weight: 500;
  letter-spacing: -0.01em;
}

.active-bar {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  border-radius: 0 3px 3px 0;
  background: var(--accent);
}

.menu-footer {
  padding: 12px 12px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
}

.footer-divider {
  height: 1px;
  background: var(--border);
  margin-bottom: 12px;
}

.footer-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  color: var(--ink-mute);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.footer-link:active {
  background: var(--surface-1);
  transform: scale(0.98);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-100%);
}

@media (min-width: 768px) {
  .drawer-overlay,
  .drawer-container {
    display: none !important;
  }
}
</style>
