<script setup lang="ts">
import { VAULT_INTERVAL, type Vault } from '~/composables/useCaixinhas'

const props = defineProps<{ vault: Vault | null }>()
const emit = defineEmits<{ saved: [] }>()
const open = defineModel<boolean>()

const { t } = useI18n()
const { currentCurrency } = useLocaleSettings()
const { withdraw } = useCaixinhas()
const toast = useToast()

const amountStr = ref('')
const note = ref('')
const date = ref(isoDate())
const loading = ref(false)
const confirmed = ref(false)

watch(open, (val) => {
  if (val) {
    amountStr.value = ''
    note.value = ''
    date.value = isoDate()
    confirmed.value = false
  }
})

const amount = computed(() => parseFloat(amountStr.value.replace(',', '.')) || 0)

// Calculate how many months this withdrawal delays the goal
const delayMonths = computed(() => {
  if (!props.vault?.target || !amount.value) return null
  const perMonth = props.vault.perAmount * (VAULT_INTERVAL[props.vault.interval].perYear / 12)
  if (perMonth <= 0) return null
  return Math.ceil(amount.value / perMonth)
})

const hasGoal = computed(() => !!props.vault?.target)

function fmtMoney(n: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currentCurrency.value?.code ?? 'BRL',
  }).format(n)
}

async function submit() {
  if (!props.vault || !amountStr.value || !date.value) return
  loading.value = true
  try {
    await withdraw(props.vault.id, {
      amount: amount.value,
      note: note.value || undefined,
      date: date.value
    })
    toast.add({ title: t('savings.withdraw_toast_saved'), color: 'success' })
    emit('saved')
    open.value = false
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string }; message?: string })?.data?.message
      ?? (e as { message?: string })?.message ?? 'Erro'
    toast.add({ title: t('savings.withdraw_toast_error'), description: msg, color: 'error' })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{ content: 'rounded-3xl shadow-[--shadow-pop] p-0 max-w-[90vw] md:max-w-[440px] overflow-hidden flex flex-col' }"
  >
    <template #content>
      <div style="background: var(--surface); border-radius: 24px; border: 1px solid var(--border); overflow: hidden;">
        <!-- Header -->
        <div class="flex justify-between items-start" style="padding: 24px 24px 0;">
          <div>
            <div class="fm-label mb-1.5">{{ t('savings.withdraw_subtitle') }} {{ vault?.name }}</div>
            <h2 style="font-size: 20px; font-weight: 600; letter-spacing: -0.02em; color: var(--ink); margin: 0;">{{ t('savings.withdraw_title') }}</h2>
          </div>
          <button class="fm-btn fm-btn--icon fm-btn--subtle" style="width: 32px; height: 32px;" @click="open = false">
            <UIcon name="lucide:x" class="w-4 h-4" />
          </button>
        </div>

        <!-- Vault pill -->
        <div v-if="vault" class="flex items-center gap-2.5" style="padding: 14px 24px;">
          <div
            class="grid place-items-center shrink-0 rounded-xl"
            style="width: 36px; height: 36px;"
            :style="{ background: `oklch(from ${vault.color} l c h / 0.16)`, color: vault.color }"
          >
            <UIcon :name="vault.icon" class="w-4 h-4" />
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 600;">{{ vault.name }}</div>
            <div style="font-size: 12px; color: var(--ink-3);">
              {{ t('savings.total_saved') }}: {{ fmtMoney(vault.current) }}
            </div>
          </div>
        </div>

        <!-- Form -->
        <div style="padding: 0 24px; display: flex; flex-direction: column; gap: 16px;">
          <!-- Amount -->
          <div>
            <label class="fm-label mb-2">{{ t('savings.withdraw_amount') }}</label>
            <div class="relative">
              <span class="mono absolute left-4 top-1/2 -translate-y-1/2 font-medium" style="color: var(--ink-3); font-size: 22px;">{{ currentCurrency?.symbol }}</span>
              <input
                v-model="amountStr"
                class="fm-input fm-input--big"
                style="padding-left: 60px;"
                inputmode="decimal"
                placeholder="0,00"
              />
            </div>
          </div>

          <!-- Date -->
          <div>
            <label class="fm-label mb-2">{{ t('savings.withdraw_date') }}</label>
            <input v-model="date" type="date" class="fm-input" />
          </div>

          <!-- Note -->
          <div>
            <label class="fm-label mb-2">
              {{ t('savings.withdraw_note') }}
              <span style="text-transform: none; color: var(--ink-mute); letter-spacing: 0; font-weight: 400;">· opcional</span>
            </label>
            <input v-model="note" class="fm-input" :placeholder="t('savings.withdraw_note_placeholder')" />
          </div>

          <!-- Warning banner -->
          <div
            v-if="amount > 0"
            style="padding: 14px; border-radius: 14px; background: oklch(from var(--negative) l c h / 0.10); border: 1px solid oklch(from var(--negative) l c h / 0.30);"
          >
            <div class="flex items-start gap-3">
              <UIcon name="lucide:triangle-alert" class="w-4 h-4 shrink-0 mt-0.5" style="color: var(--negative);" />
              <div>
                <div style="font-size: 13px; font-weight: 600; color: var(--negative); margin-bottom: 4px;">
                  {{ t('savings.withdraw_warning_title') }}
                </div>
                <div style="font-size: 13px; color: var(--ink-2); line-height: 1.5;">
                  <template v-if="hasGoal && delayMonths">
                    {{ t('savings.withdraw_warning_delay', {
                      amount: fmtMoney(amount),
                      months: delayMonths,
                      unit: delayMonths === 1 ? t('savings.withdraw_warning_delay_month') : t('savings.withdraw_warning_delay_months')
                    }) }}
                  </template>
                  <template v-else>
                    {{ t('savings.withdraw_warning_no_target') }}
                  </template>
                </div>
              </div>
            </div>
            <!-- Confirmation checkbox -->
            <label class="flex items-center gap-2.5 mt-3 cursor-pointer" style="font-size: 13px; color: var(--ink-2);">
              <input v-model="confirmed" type="checkbox" class="rounded" style="accent-color: var(--negative); width: 16px; height: 16px;" />
              {{ t('savings.withdraw_warning_confirm') }}
            </label>
          </div>
        </div>

        <!-- Footer -->
        <div class="flex justify-end gap-2.5" style="padding: 20px 24px; border-top: 1px solid var(--border); margin-top: 20px;">
          <button class="fm-btn fm-btn--ghost" @click="open = false">{{ t('savings.withdraw_cancel') }}</button>
          <button
            class="fm-btn"
            style="background: oklch(from var(--negative) l c h / 0.15); color: var(--negative); border: 1px solid oklch(from var(--negative) l c h / 0.3);"
            :disabled="loading || !amountStr || !confirmed"
            @click="submit"
          >
            <UIcon v-if="loading" name="lucide:loader-2" class="w-4 h-4 animate-spin" />
            <template v-else>
              {{ t('savings.withdraw_confirm') }}
              <UIcon name="lucide:arrow-up-from-line" class="w-4 h-4" />
            </template>
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>
