<script setup lang="ts">
import type { Vault } from '~/composables/useCaixinhas'

const props = defineProps<{ vault: Vault | null }>()
const emit = defineEmits<{ saved: [] }>()
const open = defineModel<boolean>()

const { t } = useI18n()
const { currentCurrency } = useLocaleSettings()
const { deposit } = useCaixinhas()
const toast = useToast()

const amountStr = ref('')
const note = ref('')
const date = ref(isoDate())
const loading = ref(false)

watch(open, (val) => {
  if (val) {
    amountStr.value = ''
    note.value = ''
    date.value = isoDate()
  }
})

async function submit() {
  if (!props.vault || !amountStr.value || !date.value) return
  loading.value = true
  try {
    await deposit(props.vault.id, {
      amount: parseFloat(amountStr.value.replace(',', '.')),
      note: note.value || undefined,
      date: date.value
    })
    toast.add({ title: t('savings.deposit_toast_saved'), color: 'success' })
    emit('saved')
    open.value = false
  } catch (e: unknown) {
    const msg = (e as { data?: { message?: string }, message?: string })?.data?.message
      ?? (e as { message?: string })?.message ?? 'Erro'
    toast.add({ title: t('savings.deposit_toast_error'), description: msg, color: 'error' })
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
        <div
          class="flex justify-between items-start"
          style="padding: 24px 24px 0;"
        >
          <div>
            <div class="fm-label mb-1.5">
              {{ t('savings.deposit_subtitle') }} {{ vault?.name }}
            </div>
            <h2 style="font-size: 20px; font-weight: 600; letter-spacing: -0.02em; color: var(--ink); margin: 0;">
              {{ t('savings.deposit_title') }}
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

        <!-- Vault info pill -->
        <div
          v-if="vault"
          class="flex items-center gap-2.5"
          style="padding: 14px 24px;"
        >
          <div
            class="grid place-items-center shrink-0 rounded-xl"
            style="width: 36px; height: 36px;"
            :style="{ background: `oklch(from ${vault.color} l c h / 0.16)`, color: vault.color }"
          >
            <UIcon
              :name="vault.icon"
              class="w-4 h-4"
            />
          </div>
          <div>
            <div style="font-size: 14px; font-weight: 600;">
              {{ vault.name }}
            </div>
            <div
              v-if="vault.target"
              style="font-size: 12px; color: var(--ink-3);"
            >
              {{ currentCurrency?.symbol }}{{ vault.current.toLocaleString('pt-BR') }}
              {{ t('savings.of') }}
              {{ currentCurrency?.symbol }}{{ vault.target.toLocaleString('pt-BR') }}
            </div>
          </div>
        </div>

        <!-- Form -->
        <div style="padding: 0 24px 8px; display: flex; flex-direction: column; gap: 16px;">
          <!-- Amount -->
          <div>
            <label class="fm-label mb-2">{{ t('savings.deposit_amount') }}</label>
            <div class="relative">
              <span
                class="mono absolute left-4 top-1/2 -translate-y-1/2 font-medium"
                style="color: var(--ink-3); font-size: 22px;"
              >{{ currentCurrency?.symbol }}</span>
              <input
                v-model="amountStr"
                class="fm-input fm-input--big"
                style="padding-left: 60px;"
                inputmode="decimal"
                placeholder="0,00"
              >
            </div>
          </div>

          <!-- Date -->
          <div>
            <label class="fm-label mb-2">{{ t('savings.deposit_date') }}</label>
            <input
              v-model="date"
              type="date"
              class="fm-input"
            >
          </div>

          <!-- Note -->
          <div>
            <label class="fm-label mb-2">
              {{ t('savings.deposit_note') }}
              <span style="text-transform: none; color: var(--ink-mute); letter-spacing: 0; font-weight: 400;">· opcional</span>
            </label>
            <input
              v-model="note"
              class="fm-input"
              :placeholder="t('savings.deposit_note_placeholder')"
            >
          </div>
        </div>

        <!-- Footer -->
        <div
          class="flex justify-end gap-2.5"
          style="padding: 20px 24px; border-top: 1px solid var(--border); margin-top: 8px;"
        >
          <button
            class="fm-btn fm-btn--ghost"
            @click="open = false"
          >
            {{ t('savings.deposit_cancel') }}
          </button>
          <button
            class="fm-btn fm-btn--primary"
            :disabled="loading || !amountStr"
            @click="submit"
          >
            <UIcon
              v-if="loading"
              name="lucide:loader-2"
              class="w-4 h-4 animate-spin"
            />
            <template v-else>
              {{ t('savings.deposit_save') }}
              <UIcon
                name="lucide:piggy-bank"
                class="w-4 h-4"
              />
            </template>
          </button>
        </div>
      </div>
    </template>
  </UModal>
</template>
