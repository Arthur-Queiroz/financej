<script setup lang="ts">
import { VAULT_ICONS, VAULT_COLORS, VAULT_INTERVAL, type Vault } from '~/composables/useCaixinhas'

const props = defineProps<{ vault?: Vault }>()
const emit = defineEmits<{ saved: [] }>()
const open = defineModel<boolean>()

const { t } = useI18n()
const { currentCurrency } = useLocaleSettings()
const { create, update } = useCaixinhas()
const toast = useToast()

const isEditing = computed(() => !!props.vault)

const name = ref('')
const icon = ref(VAULT_ICONS[0].icon)
const color = ref(VAULT_COLORS[0])
const targetStr = ref('')
const perAmountStr = ref('')
const interval = ref<'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY')
const loading = ref(false)

watch(open, (val) => {
  if (!val) return
  if (props.vault) {
    name.value = props.vault.name
    icon.value = props.vault.icon
    color.value = props.vault.color
    targetStr.value = props.vault.target ? String(props.vault.target) : ''
    perAmountStr.value = String(props.vault.perAmount)
    interval.value = props.vault.interval
  } else {
    name.value = ''
    icon.value = VAULT_ICONS[0].icon
    color.value = VAULT_COLORS[0]
    targetStr.value = ''
    perAmountStr.value = ''
    interval.value = 'MONTHLY'
  }
})

const perAmount = computed(() => parseFloat(perAmountStr.value.replace(',', '.')) || 0)
const target = computed(() => parseFloat(targetStr.value.replace(',', '.')) || null)

const projectionMonths = computed(() => {
  if (!target.value || !perAmount.value) return null
  const perMonth = perAmount.value * (VAULT_INTERVAL[interval.value].perYear / 12)
  const currentSaved = props.vault?.current ?? 0
  const remaining = target.value - currentSaved
  if (remaining <= 0) return 0
  return Math.ceil(remaining / perMonth)
})

const intervalShortKey = computed(() => VAULT_INTERVAL[interval.value].shortKey)

async function submit() {
  if (!name.value || !perAmountStr.value) return
  loading.value = true
  try {
    const body = {
      name: name.value,
      icon: icon.value,
      color: color.value,
      target: target.value,
      perAmount: perAmount.value,
      interval: interval.value
    }
    if (isEditing.value) {
      await update(props.vault!.id, body)
      toast.add({ title: t('savings.toast_updated'), color: 'success' })
    } else {
      await create(body)
      toast.add({ title: t('savings.toast_created'), color: 'success' })
    }
    emit('saved')
    open.value = false
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string }, message?: string })?.data?.message
      ?? (e as { message?: string })?.message ?? 'Erro'
    toast.add({ title: t('savings.toast_error'), description: msg, color: 'error' })
  } finally {
    loading.value = false
  }
}

function fmtAmount(n: number | null) {
  if (!n) return ''
  return new Intl.NumberFormat('pt-BR', { style: 'decimal', maximumFractionDigits: 0 }).format(n)
}
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'rounded-3xl shadow-[--shadow-pop] p-0 max-w-[90vw] md:max-w-[560px] max-h-[90vh] overflow-hidden flex flex-col' }"
  >
    <template #content>
      <div class="vault-modal-container">
        <div class="vault-modal-scroll">
          <!-- Header -->
          <div class="flex justify-between items-start mb-6">
            <div>
              <div class="fm-label mb-1.5">
                {{ t('savings.new_reserve') }}
              </div>
              <h2 style="font-size: 22px; font-weight: 600; letter-spacing: -0.02em; color: var(--ink); margin: 0;">
                {{ isEditing ? t('savings.edit_title') : t('savings.create_title') }}
              </h2>
            </div>
            <button
              class="fm-btn fm-btn--icon fm-btn--subtle"
              style="width: 32px; height: 32px;"
              @click="open = false"
            >
              <UIcon
                name="lucide:x"
                class="w-4 h-4"
              />
            </button>
          </div>

          <!-- Avatar + Name -->
          <div class="flex gap-3 items-end mb-5">
            <div
              class="shrink-0 grid place-items-center rounded-xl"
              style="width: 52px; height: 52px; border-radius: 14px;"
              :style="{ background: `oklch(from ${color} l c h / 0.16)`, color }"
            >
              <UIcon
                :name="icon"
                class="w-6 h-6"
              />
            </div>
            <div style="flex: 1;">
              <label class="fm-label mb-2">{{ t('savings.name') }}</label>
              <input
                v-model="name"
                class="fm-input"
                :placeholder="t('savings.name_placeholder')"
              >
            </div>
          </div>

          <!-- Icon picker -->
          <div class="mb-5">
            <div class="fm-label mb-2.5">
              {{ t('savings.icon') }}
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="opt in VAULT_ICONS"
                :key="opt.icon"
                class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left"
                :style="{
                  background: icon === opt.icon ? `oklch(from ${color} l c h / 0.16)` : 'var(--surface-2)',
                  border: `1px solid ${icon === opt.icon ? color : 'var(--border)'}`,
                  color: icon === opt.icon ? color : 'var(--ink-2)',
                  fontFamily: 'var(--font-sans)'
                }"
                @click="icon = opt.icon"
              >
                <UIcon
                  :name="opt.icon"
                  class="w-4 h-4 shrink-0"
                />
                <span>{{ t(opt.labelKey) }}</span>
              </button>
            </div>
          </div>

          <!-- Color picker -->
          <div class="mb-5">
            <div class="fm-label mb-2.5">
              {{ t('savings.color') }}
            </div>
            <div class="flex gap-2.5 flex-wrap">
              <button
                v-for="c in VAULT_COLORS"
                :key="c"
                class="rounded-xl transition-all"
                style="width: 38px; height: 38px;"
                :style="{
                  background: c,
                  border: c === color ? '2px solid var(--ink)' : '1px solid var(--border)',
                  boxShadow: c === color ? `0 0 0 3px oklch(from ${c} l c h / 0.28)` : 'none'
                }"
                @click="color = c"
              />
            </div>
          </div>

          <!-- Target (optional) -->
          <div class="mb-5">
            <label class="fm-label mb-2">
              {{ t('savings.target') }}
              <span style="text-transform: none; color: var(--ink-mute); letter-spacing: 0; font-weight: 400;">{{ t('savings.target_optional') }}</span>
            </label>
            <div class="relative">
              <span
                class="mono absolute left-4 top-1/2 -translate-y-1/2 font-medium"
                style="color: var(--ink-3); font-size: 15px;"
              >{{ currentCurrency?.symbol }}</span>
              <input
                v-model="targetStr"
                class="fm-input"
                style="padding-left: 46px;"
                inputmode="decimal"
                placeholder="0,00"
              >
            </div>
          </div>

          <!-- Interval -->
          <div class="mb-5">
            <div class="fm-label mb-2.5">
              {{ t('savings.interval') }}
            </div>
            <div
              class="fm-tab-group"
              style="width: 100%; display: grid; grid-template-columns: repeat(3, 1fr);"
            >
              <span
                v-for="[key, meta] in Object.entries(VAULT_INTERVAL)"
                :key="key"
                class="tab"
                :class="{ active: interval === key }"
                style="text-align: center; cursor: pointer;"
                @click="interval = key as 'WEEKLY' | 'MONTHLY' | 'YEARLY'"
              >{{ t(meta.labelKey) }}</span>
            </div>
          </div>

          <!-- Per amount -->
          <div class="mb-5">
            <label class="fm-label mb-2">{{ t('savings.per_amount') }} {{ t(intervalShortKey) }}</label>
            <div class="relative">
              <span
                class="mono absolute left-4 top-1/2 -translate-y-1/2 font-medium"
                style="color: var(--ink-3); font-size: 22px;"
              >{{ currentCurrency?.symbol }}</span>
              <input
                v-model="perAmountStr"
                class="fm-input fm-input--big"
                style="padding-left: 60px;"
                inputmode="decimal"
                placeholder="0,00"
              >
            </div>
          </div>

          <!-- Projection callout -->
          <div
            v-if="projectionMonths !== null && projectionMonths > 0 && target && perAmount"
            class="flex gap-3 items-center mb-2"
            style="padding: 14px; border-radius: 14px; background: oklch(from var(--accent) l c h / 0.10); border: 1px solid oklch(from var(--accent) l c h / 0.25);"
          >
            <div
              class="grid place-items-center shrink-0 rounded-xl"
              style="width: 36px; height: 36px; background: var(--accent); color: var(--accent-ink);"
            >
              <UIcon
                name="lucide:trending-up"
                class="w-4 h-4"
              />
            </div>
            <div style="font-size: 13px; color: var(--ink-2); line-height: 1.4;">
              {{ t('savings.projection', {
                amount: `${currentCurrency?.symbol}${fmtAmount(perAmount)}`,
                unit: t(intervalShortKey),
                target: `${currentCurrency?.symbol}${fmtAmount(target)}`,
                months: projectionMonths
              }) }}
            </div>
          </div>
          <div
            v-else-if="projectionMonths === 0"
            class="flex gap-2 items-center mb-2 text-sm"
            style="color: var(--accent);"
          >
            <UIcon
              name="lucide:party-popper"
              class="w-4 h-4"
            />
            {{ t('savings.goal_reached') }}
          </div>
        </div>

        <!-- Footer -->
        <div class="vault-modal-footer">
          <button
            class="fm-btn fm-btn--ghost"
            @click="open = false"
          >
            {{ t('savings.cancel') }}
          </button>
          <button
            class="fm-btn fm-btn--primary"
            :disabled="loading || !name || !perAmountStr"
            @click="submit"
          >
            <UIcon
              v-if="loading"
              name="lucide:loader-2"
              class="w-4 h-4 animate-spin"
            />
            <template v-else>
              {{ isEditing ? t('savings.save') : t('savings.create_title') }}
              <UIcon
                name="lucide:check"
                class="w-4 h-4"
              />
            </template>
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.vault-modal-container {
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  background: var(--surface);
  border-radius: 24px;
  border: 3px solid var(--accent);
  overflow: hidden;
}

.vault-modal-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 28px 28px 0;
  scrollbar-width: none;
}
.vault-modal-scroll::-webkit-scrollbar { display: none; }

.vault-modal-footer {
  flex-shrink: 0;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px 28px;
  border-top: 1px solid var(--border);
  background: var(--surface);
}
</style>
