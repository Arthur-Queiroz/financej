<script setup lang="ts">
const route = useRoute()
const { t } = useI18n()

const navItems = computed(() => [
  { icon: 'lucide:pie-chart', label: t('nav.dashboard'), to: '/dashboard' },
  { icon: 'lucide:list', label: t('nav.expenses'), to: '/expenses' },
  { icon: 'lucide:wallet', label: t('nav.incomes'), to: '/settings/income' },
  { icon: 'lucide:piggy-bank', label: t('nav.savings'), to: '/savings' },
  { icon: 'lucide:file-spreadsheet', label: t('nav.export'), to: '/export' },
  { icon: 'lucide:settings', label: t('nav.settings'), to: '/settings' }
])

function isActive(to: string) {
  // Exact match
  if (route.path === to) return true

  // Special case: /settings should only match /settings exactly, not /settings/income
  if (to === '/settings') return false

  // For other routes, match if path starts with route + /
  return to !== '/dashboard' && route.path.startsWith(to + '/')
}
</script>

<template>
  <div class="dash-shell fm-app">
    <!-- Desktop sidebar -->
    <aside class="dash-sidebar">
      <div style="padding: 0 8px;">
        <AppLogo />
      </div>

      <nav style="display: flex; flex-direction: column; gap: 2px;">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="dash-nav-item"
          :style="{
            background: isActive(item.to) ? 'var(--surface-2)' : 'transparent',
            color: isActive(item.to) ? 'var(--ink)' : 'var(--ink-3)'
          }"
        >
          <span
            v-if="isActive(item.to)"
            class="dash-nav-indicator"
          />
          <UIcon
            :name="item.icon"
            style="width: 16px; height: 16px; flex-shrink: 0;"
          />
          <span>{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <div style="margin-top: auto;">
        <AppUserCard />
      </div>
    </aside>

    <!-- Main content -->
    <main class="dash-main">
      <slot />
      <AppBottomNav
        :items="navItems"
        :is-active="isActive"
      />
    </main>

    <!-- Mobile Menu Drawer -->
    <AppMobileMenu />
  </div>
</template>

<style scoped>
.dash-shell {
  min-height: 100dvh;
}

/* ─── Mobile: stack vertically, no sidebar ─── */
.dash-sidebar { display: none; }
.dash-main {
  min-height: 100dvh;
  min-height: 100svh;
  background: var(--bg);
  padding-top: env(safe-area-inset-top, 0px);
}

/* ─── Desktop (≥ 768px): side-by-side grid ─── */
@media (min-width: 768px) {
  .dash-shell {
    display: grid;
    grid-template-columns: 240px 1fr;
  }

  .dash-main {
    padding-top: 0;
  }

  .dash-sidebar {
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: 24px 16px;
    padding-top: max(24px, env(safe-area-inset-top, 0px));
    border-right: 1px solid var(--border);
    background: var(--bg);
    position: sticky;
    top: 0;
    height: 100dvh;
    overflow-y: auto;
  }
}

.dash-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  position: relative;
  transition: background 0.12s, color 0.12s;
}

.dash-nav-indicator {
  position: absolute;
  left: -16px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  border-radius: 2px;
  background: var(--accent);
}
</style>
