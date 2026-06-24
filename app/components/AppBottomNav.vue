<script setup lang="ts">
type NavItem = { icon: string, label: string, to: string }

const props = defineProps<{
  items: NavItem[]
  isActive: (to: string) => boolean
}>()

// The bottom nav always receives the 5 primary nav items; expose them as a tuple
// so fixed-index access (navItems[0]..[4]) is known-defined for the template.
const navItems = computed(() => props.items as [NavItem, NavItem, NavItem, NavItem, NavItem])

const { t } = useI18n()
const showExpenseModal = useState('showExpenseModal', () => false)
const mobileMenuOpen = useState('mobileMenuOpen', () => false)

function openMenu() {
  mobileMenuOpen.value = true
}
</script>

<template>
  <nav class="bottom-nav">
    <!-- Menu button (left) -->
    <button
      class="nav-btn"
      type="button"
      @click="openMenu"
    >
      <div class="nav-btn-content">
        <UIcon
          name="lucide:menu"
          class="w-5 h-5"
        />
        <span class="nav-label">{{ t('nav.menu') }}</span>
      </div>
    </button>

    <!-- First nav item -->
    <NuxtLink
      :to="navItems[0].to"
      class="nav-btn"
    >
      <div
        class="nav-btn-content"
        :class="{ active: isActive(navItems[0].to) }"
      >
        <div class="nav-icon-wrapper">
          <UIcon
            :name="navItems[0].icon"
            class="w-5 h-5"
          />
          <div
            v-if="isActive(navItems[0].to)"
            class="active-indicator"
          />
        </div>
        <span class="nav-label">{{ navItems[0].label }}</span>
      </div>
    </NuxtLink>

    <!-- FAB (center) -->
    <div class="fab-wrapper">
      <button
        class="fab"
        @click="showExpenseModal = true"
      >
        <UIcon
          name="lucide:plus"
          class="w-6 h-6"
        />
      </button>
    </div>

    <!-- Second nav item -->
    <NuxtLink
      :to="navItems[1].to"
      class="nav-btn"
    >
      <div
        class="nav-btn-content"
        :class="{ active: isActive(navItems[1].to) }"
      >
        <div class="nav-icon-wrapper">
          <UIcon
            :name="navItems[1].icon"
            class="w-5 h-5"
          />
          <div
            v-if="isActive(navItems[1].to)"
            class="active-indicator"
          />
        </div>
        <span class="nav-label">{{ navItems[1].label }}</span>
      </div>
    </NuxtLink>

    <!-- Settings button (right) -->
    <NuxtLink
      :to="navItems[4].to"
      class="nav-btn"
    >
      <div
        class="nav-btn-content"
        :class="{ active: isActive(navItems[4].to) }"
      >
        <div class="nav-icon-wrapper">
          <UIcon
            :name="navItems[4].icon"
            class="w-5 h-5"
          />
          <div
            v-if="isActive(navItems[4].to)"
            class="active-indicator"
          />
        </div>
        <span class="nav-label">{{ navItems[4].label }}</span>
      </div>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 50;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  align-items: center;
  height: 68px;
  padding: 0 8px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
  background: oklch(from var(--bg) l c h / 0.94);
  backdrop-filter: blur(16px) saturate(180%);
  border-top: 1px solid var(--border);
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  border: none;
  background: transparent;
  cursor: pointer;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}

.nav-btn-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: var(--ink-mute);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-btn-content.active {
  color: var(--ink);
}

.nav-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 32px;
}

.active-indicator {
  position: absolute;
  bottom: -2px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  border-radius: 3px;
  background: var(--accent);
  animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.01em;
}

.fab-wrapper {
  display: grid;
  place-items: center;
}

.fab {
  width: 56px;
  height: 56px;
  margin-top: -24px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: var(--accent-ink);
  box-shadow:
    0 4px 16px -2px oklch(from var(--accent) l c h / 0.4),
    0 0 0 1px oklch(from var(--accent) calc(l - 0.1) c h / 0.3);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  -webkit-tap-highlight-color: transparent;
}

.fab:active {
  transform: scale(0.94);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

@media (min-width: 768px) {
  .bottom-nav {
    display: none !important;
  }
}
</style>
