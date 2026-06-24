<script setup lang="ts">
import type { Expense } from '@prisma/client'

const { t } = useI18n()

const open = defineModel<boolean>()

defineProps<{
  expenses: Expense[] | null
  loading?: boolean
}>()
</script>

<template>
  <UModal
    v-model:open="open"
    :ui="{
      content: 'rounded-3xl shadow-[--shadow-pop] p-0 max-w-[90vw] md:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col modal-with-border'
    }"
  >
    <template #content>
      <div style="display: flex; flex-direction: column; height: 100%;">
        <!-- Header -->
        <div style="padding: 24px; border-bottom: 1px solid var(--border); flex-shrink: 0;">
          <div class="flex items-center justify-between">
            <div>
              <h2 style="font-size: 20px; font-weight: 600; color: var(--ink); margin: 0;">
                {{ t('dashboard.all_expenses', 'Todas as Despesas') }}
              </h2>
              <p
                class="text-sm mt-1"
                style="color: var(--ink-3);"
              >
                {{ expenses?.length ?? 0 }} {{ t('dashboard.entries', 'lançamentos') }}
              </p>
            </div>
            <button
              class="fm-btn fm-btn--icon fm-btn--subtle"
              style="width: 32px; height: 32px;"
              :aria-label="t('expense.cancel', 'Cancelar')"
              @click="open = false"
            >
              <UIcon
                name="lucide:x"
                class="w-4 h-4"
              />
            </button>
          </div>
        </div>

        <!-- Content -->
        <div
          class="modal-scroll-content"
          style="padding: 24px; overflow-y: auto; flex: 1; min-height: 0;"
        >
          <div
            v-if="loading"
            class="flex justify-center py-12"
          >
            <UIcon
              name="lucide:loader-2"
              class="w-6 h-6 animate-spin"
              style="color: var(--ink-3);"
            />
          </div>

          <div
            v-else-if="!expenses || expenses.length === 0"
            class="text-center py-12"
          >
            <UIcon
              name="lucide:inbox"
              class="w-12 h-12 mx-auto mb-3"
              style="color: var(--ink-mute);"
            />
            <p
              class="text-sm"
              style="color: var(--ink-3);"
            >
              {{ t('dashboard.no_expenses', 'Nenhuma despesa no período.') }}
            </p>
          </div>

          <div v-else>
            <template
              v-for="(exp, i) in expenses"
              :key="exp.id"
            >
              <ExpenseRow
                :exp="exp"
                :show-date="true"
              />
              <div
                v-if="i < expenses.length - 1"
                class="fm-divider"
                style="opacity: 0.4;"
              />
            </template>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.modal-with-border {
  border: 1px solid var(--border);
}

.modal-scroll-content {
  /* Hide scrollbar but keep scroll functionality */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.modal-scroll-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}
</style>
