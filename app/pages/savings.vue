<script setup lang="ts">
import { VAULT_INTERVAL, type Vault } from '~/composables/useCaixinhas'

definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t } = useI18n()
const { currentCurrency } = useLocaleSettings()
const { vaults, loading, refresh } = useCaixinhas()

const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDepositModal = ref(false)
const showWithdrawModal = ref(false)
const selectedVault = ref<Vault | null>(null)

function openEdit(vault: Vault) {
  selectedVault.value = vault
  showEditModal.value = true
}

function openDeposit(vault: Vault) {
  selectedVault.value = vault
  showDepositModal.value = true
}

function openWithdraw(vault: Vault) {
  selectedVault.value = vault
  showWithdrawModal.value = true
}

async function deleteVault(vault: Vault) {
  if (!confirm(t('savings.delete_confirm'))) return
  const { remove } = useCaixinhas()
  await remove(vault.id)
}

// Summary stats
const totalSaved = computed(() =>
  (vaults.value ?? []).reduce((s, v) => s + v.current, 0)
)

const monthlyReserved = computed(() =>
  (vaults.value ?? []).reduce((s, v) => {
    return s + v.perAmount * (VAULT_INTERVAL[v.interval].perYear / 12)
  }, 0)
)

const nearGoal = computed(() =>
  (vaults.value ?? []).filter(v => {
    if (!v.target) return false
    return (v.current / v.target) >= 0.75
  }).length
)

// Per-vault helpers
function vaultPct(v: Vault) {
  if (!v.target) return null
  return Math.min((v.current / v.target) * 100, 100)
}

function monthsToGoal(v: Vault) {
  if (!v.target) return null
  const perMonth = v.perAmount * (VAULT_INTERVAL[v.interval].perYear / 12)
  const remaining = v.target - v.current
  if (remaining <= 0) return 0
  return Math.ceil(remaining / perMonth)
}

function fmtMoney(n: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currentCurrency.value?.code ?? 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}

function fmtMoneyFull(n: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currentCurrency.value?.code ?? 'BRL',
  }).format(n)
}
</script>

<template>
  <div id="savings-content" class="flex flex-col gap-6 p-7 pb-24 md:pb-7">

    <!-- Header -->
    <header class="flex items-start justify-between">
      <div>
        <div class="text-sm mb-1" style="color: var(--ink-3);">{{ t('savings.section') }}</div>
        <h1 style="font-size: 28px; font-weight: 600; letter-spacing: -0.025em; margin: 0;">{{ t('savings.title') }}</h1>
        <p class="mt-1.5 text-sm" style="color: var(--ink-3); max-width: 500px;">{{ t('savings.subtitle') }}</p>
      </div>
      <button class="fm-btn fm-btn--primary" @click="showCreateModal = true">
        <UIcon name="lucide:plus" class="w-4 h-4" style="stroke-width: 2.4;" />
        <span class="hidden sm:inline">{{ t('savings.new') }}</span>
      </button>
    </header>

    <!-- Summary strip -->
    <section class="fm-card fm-card--glow" style="padding: 24px; display: grid; grid-template-columns: 1fr; gap: 20px;" :style="{ gridTemplateColumns: 'repeat(3, 1fr)' }">
      <!-- Total saved -->
      <div>
        <div class="fm-label mb-1.5">{{ t('savings.total_saved') }}</div>
        <div class="mono" style="font-size: 32px; font-weight: 500; letter-spacing: -0.025em; color: var(--accent);">
          {{ fmtMoney(totalSaved) }}
        </div>
      </div>
      <!-- Monthly reserved -->
      <div style="border-left: 1px solid var(--border); padding-left: 24px;" class="hidden md:block">
        <div class="fm-label mb-1.5">{{ t('savings.monthly_reserved') }}</div>
        <div class="mono" style="font-size: 24px; font-weight: 500;">{{ fmtMoney(monthlyReserved) }}</div>
      </div>
      <!-- Active vaults -->
      <div style="border-left: 1px solid var(--border); padding-left: 24px;" class="hidden md:block">
        <div class="fm-label mb-1.5">{{ t('savings.active_vaults') }}</div>
        <div style="font-size: 24px; font-weight: 500;">{{ vaults?.length ?? 0 }}</div>
        <div v-if="nearGoal > 0" class="text-xs mt-1" style="color: var(--ink-3);">{{ nearGoal }} perto da meta</div>
      </div>
    </section>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-12">
      <UIcon name="lucide:loader-2" class="w-6 h-6 animate-spin" style="color: var(--ink-3);" />
    </div>

    <!-- Empty state -->
    <div
      v-else-if="!vaults?.length"
      class="fm-card flex flex-col items-center justify-center gap-4 py-16"
    >
      <div
        class="grid place-items-center rounded-2xl"
        style="width: 64px; height: 64px; background: oklch(from var(--accent) l c h / 0.12);"
      >
        <UIcon name="lucide:piggy-bank" class="w-8 h-8" style="color: var(--accent);" />
      </div>
      <p class="text-sm text-center" style="color: var(--ink-3); max-width: 280px;">{{ t('savings.no_vaults') }}</p>
    </div>

    <!-- Vault grid -->
    <section v-else class="grid md:grid-cols-2 gap-4">
      <article
        v-for="vault in vaults"
        :key="vault.id"
        class="fm-card flex flex-col gap-4"
        style="padding: 22px;"
      >
        <!-- Top row: avatar + name + menu -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div
              class="grid place-items-center shrink-0 rounded-xl"
              style="width: 44px; height: 44px;"
              :style="{ background: `oklch(from ${vault.color} l c h / 0.16)`, color: vault.color }"
            >
              <UIcon :name="vault.icon" class="w-5 h-5" />
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 600;">{{ vault.name }}</div>
              <div class="flex items-center gap-1.5 mt-0.5" style="font-size: 12px; color: var(--ink-3);">
                <UIcon name="lucide:repeat" class="w-3 h-3" />
                {{ fmtMoneyFull(vault.perAmount) }}/{{ t(VAULT_INTERVAL[vault.interval].shortKey) }}
              </div>
            </div>
          </div>
          <!-- Actions -->
          <div class="flex items-center gap-1">
            <button class="fm-btn fm-btn--icon fm-btn--subtle" style="width: 32px; height: 32px;" :title="t('savings.edit')" @click="openEdit(vault)">
              <UIcon name="lucide:pencil" class="w-3.5 h-3.5" />
            </button>
            <button class="fm-btn fm-btn--icon fm-btn--subtle" style="width: 32px; height: 32px;" :title="t('savings.delete')" @click="deleteVault(vault)">
              <UIcon name="lucide:trash-2" class="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <!-- Amount -->
        <div class="flex items-baseline gap-2">
          <span class="mono" style="font-size: 28px; font-weight: 500; letter-spacing: -0.02em;">
            {{ fmtMoneyFull(vault.current) }}
          </span>
          <span v-if="vault.target" style="font-size: 13px; color: var(--ink-3);">
            {{ t('savings.of') }} {{ fmtMoneyFull(vault.target) }}
          </span>
        </div>

        <!-- Progress bar -->
        <div v-if="vaultPct(vault) !== null">
          <div style="height: 8px; border-radius: 999px; background: var(--surface-2); overflow: hidden;">
            <div
              style="height: 100%; border-radius: 999px; transition: width 0.6s ease;"
              :style="{ width: `${vaultPct(vault)}%`, background: vault.color }"
            />
          </div>
          <div class="flex justify-between mt-2" style="font-size: 12px; color: var(--ink-3);">
            <span :style="{ color: vault.color, fontWeight: 600 }">{{ Math.round(vaultPct(vault)!) }}%</span>
            <span v-if="monthsToGoal(vault) === 0" style="color: var(--accent);">{{ t('savings.goal_reached') }}</span>
            <span v-else>{{ t('savings.months_to_goal', { n: monthsToGoal(vault), unit: monthsToGoal(vault) === 1 ? t('savings.month') : t('savings.months') }) }}</span>
          </div>
        </div>
        <div v-else class="flex items-center gap-1.5 text-xs" style="color: var(--ink-3); padding: 4px 0;">
          <UIcon name="lucide:flag" class="w-3 h-3" />
          {{ t('savings.no_target') }}
        </div>

        <!-- Footer: deposit + withdraw -->
        <div class="flex justify-between items-center pt-3" style="border-top: 1px solid var(--border);">
          <button class="fm-btn fm-btn--subtle fm-btn--sm" style="color: var(--ink-3);" @click="openWithdraw(vault)">
            <UIcon name="lucide:arrow-up-from-line" class="w-3.5 h-3.5" />
            {{ t('savings.withdraw') }}
          </button>
          <button class="fm-btn fm-btn--subtle fm-btn--sm" @click="openDeposit(vault)">
            <UIcon name="lucide:plus" class="w-3.5 h-3.5" />
            {{ t('savings.deposit_now') }}
          </button>
        </div>
      </article>
    </section>

  </div>

  <!-- Modals -->
  <CaixinhaModal v-model="showCreateModal" @saved="refresh()" />
  <CaixinhaModal v-model="showEditModal" :vault="selectedVault ?? undefined" @saved="refresh()" />
  <DepositModal v-model="showDepositModal" :vault="selectedVault" @saved="refresh()" />
  <WithdrawModal v-model="showWithdrawModal" :vault="selectedVault" @saved="refresh()" />
</template>
