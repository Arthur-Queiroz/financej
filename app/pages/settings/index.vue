<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })

const { t } = useI18n()
const colorMode = useColorMode()
const { accent, ACCENTS } = useAccent()
const { user: clerkUser } = useUser()
const user = clerkUser as unknown as Ref<{
  imageUrl?: string
  hasImage?: boolean
  fullName?: string | null
  firstName?: string | null
  primaryEmailAddress?: { emailAddress?: string | null } | null
  setProfileImage: (params: { file: File | null }) => Promise<unknown>
  reload: () => Promise<unknown>
  update: (params: { firstName?: string, lastName?: string }) => Promise<unknown>
} | null | undefined>
const toast = useToast()
const { locales, currentLocale, CURRENCIES, currentCurrency, setLanguage, setCurrency } = useLocaleSettings()

const displayName = ref(user.value?.fullName || '')
const profileImageUrl = ref(user.value?.imageUrl || '')
const savingProfile = ref(false)
const fileInput = ref<HTMLInputElement>()
const forceUpdate = ref(0)

// Check if user has a custom profile image
const hasCustomImage = computed(() => {
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  forceUpdate.value // Touch the ref to register it as a reactive dependency

  // Check Clerk's hasImage property (most reliable)
  if (user.value && 'hasImage' in user.value) {
    return user.value.hasImage === true
  }

  // Check if imageUrl exists and is not a Clerk default/placeholder
  const currentUrl = profileImageUrl.value || user.value?.imageUrl || ''
  if (!currentUrl.trim()) return false

  const url = currentUrl.toLowerCase()
  const isClerkDefault = url.includes('img.clerk.com')
    || url.includes('gravatar')
    || url.includes('ui-avatars')
    || url.includes('dicebear')
    || url.includes('placeholder')

  return !isClerkDefault
})

watch(() => user.value?.fullName, (v) => {
  if (v) displayName.value = v
})
watch(() => user.value?.imageUrl, (v) => {
  profileImageUrl.value = v || ''
  forceUpdate.value++
})
watch(() => user.value?.hasImage, () => {
  forceUpdate.value++
})

function setTheme(mode: string) {
  colorMode.preference = mode
}

function setAccent(v: string) {
  accent.value = v
}

function triggerFileUpload() {
  fileInput.value?.click()
}

async function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file || !user.value) return

  try {
    savingProfile.value = true

    await user.value.setProfileImage({ file })
    await new Promise(resolve => setTimeout(resolve, 1000))
    await user.value.reload()

    profileImageUrl.value = user.value.imageUrl || ''
    forceUpdate.value++

    await nextTick()

    toast.add({ title: t('settings.toast_profile_updated'), color: 'success' })
  } catch (error) {
    console.error('Error uploading image:', error)
    toast.add({ title: t('settings.toast_profile_error'), color: 'error' })
  } finally {
    savingProfile.value = false
    if (target) target.value = ''
  }
}

async function removePhoto() {
  if (!user.value) return

  try {
    savingProfile.value = true

    await user.value.setProfileImage({ file: null })
    await new Promise(resolve => setTimeout(resolve, 1000))
    await user.value.reload()

    profileImageUrl.value = ''
    forceUpdate.value++

    await nextTick()

    toast.add({ title: t('settings.toast_profile_updated'), color: 'success' })
  } catch (error) {
    console.error('Error removing image:', error)
    toast.add({ title: t('settings.toast_profile_error'), color: 'error' })
  } finally {
    savingProfile.value = false
  }
}

async function saveProfile() {
  if (!user.value) return
  try {
    savingProfile.value = true
    await user.value.update({
      firstName: displayName.value.split(' ')[0] || displayName.value,
      lastName: displayName.value.split(' ').slice(1).join(' ') || ''
    })
    toast.add({ title: t('settings.toast_profile_updated'), color: 'success' })
  } catch (error) {
    console.error('Error updating profile:', error)
    toast.add({ title: t('settings.toast_profile_error'), color: 'error' })
  } finally {
    savingProfile.value = false
  }
}

const subNav = computed(() => [
  t('settings.general'),
  t('settings.privacy'),
  t('settings.notifications')
])
const activeSection = ref(t('settings.general'))
</script>

<template>
  <div
    class="p-4 md:p-7 pb-24 md:pb-7 flex flex-col gap-4 md:gap-6"
    style="color: var(--ink);"
  >
    <div
      class="md:grid"
      style="grid-template-columns: 220px 1fr; gap: 28px;"
    >
      <!-- Sub-nav (desktop) -->
      <div class="hidden md:block">
        <div
          class="text-sm mb-1"
          style="color: var(--ink-3);"
        >
          {{ t('settings.title') }}
        </div>
        <h1 style="font-size: 24px; font-weight: 600; letter-spacing: -0.025em; margin: 0 0 18px;">
          {{ t('settings.account') }}
        </h1>
        <div class="flex flex-col gap-0.5">
          <button
            v-for="item in subNav"
            :key="item"
            class="px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors"
            :style="{
              color: activeSection === item ? 'var(--ink)' : 'var(--ink-3)',
              background: activeSection === item ? 'var(--surface-2)' : 'transparent',
              fontFamily: 'var(--font-sans)'
            }"
            @click="activeSection = item"
          >
            {{ item }}
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex flex-col gap-5">
        <!-- Mobile header -->
        <div class="md:hidden">
          <h1 style="font-size: 24px; font-weight: 600; letter-spacing: -0.025em; margin: 0 0 12px;">
            {{ t('settings.title') }}
          </h1>
          <select
            v-model="activeSection"
            class="fm-input w-full"
            style="font-size: 14px;"
          >
            <option
              v-for="item in subNav"
              :key="item"
              :value="item"
            >
              {{ item }}
            </option>
          </select>
        </div>

        <!-- Geral Section -->
        <template v-if="activeSection === t('settings.general')">
          <!-- Profile card -->
          <section class="fm-card p-4 md:p-6">
            <div class="text-sm md:text-base font-semibold mb-1">
              {{ t('settings.profile') }}
            </div>
            <div
              class="text-xs mb-4"
              style="color: var(--ink-3);"
            >
              {{ t('settings.profile_subtitle') }}
            </div>

            <div class="flex flex-col md:flex-row gap-4 items-start">
              <!-- Profile photo -->
              <div class="flex flex-col items-center gap-2 w-full md:w-auto">
                <div class="relative w-20 h-20">
                  <template v-if="hasCustomImage">
                    <img
                      :key="user?.imageUrl"
                      :src="user?.imageUrl || profileImageUrl"
                      :alt="displayName"
                      class="w-full h-full rounded-full object-cover"
                      style="border: 2px solid var(--accent);"
                      @error="() => { profileImageUrl = ''; forceUpdate++ }"
                    >
                  </template>
                  <template v-else>
                    <div
                      class="w-full h-full rounded-full grid place-items-center text-3xl font-semibold"
                      style="background: linear-gradient(135deg, var(--accent), oklch(0.6 0.2 290)); color: var(--accent-ink);"
                    >
                      {{ (user?.firstName || displayName || 'U').charAt(0).toUpperCase() }}
                    </div>
                  </template>
                </div>
                <div class="flex gap-1.5">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/*"
                    class="hidden"
                    @change="handleFileUpload"
                  >
                  <button
                    class="fm-btn fm-btn--icon fm-btn--subtle"
                    style="width: 32px; height: 32px;"
                    :disabled="savingProfile"
                    :title="t('settings.upload_photo')"
                    @click="triggerFileUpload"
                  >
                    <UIcon
                      name="lucide:pencil"
                      class="w-3.5 h-3.5"
                    />
                  </button>
                  <button
                    v-if="hasCustomImage"
                    class="fm-btn fm-btn--icon fm-btn--ghost"
                    style="width: 32px; height: 32px;"
                    :disabled="savingProfile"
                    :title="t('settings.remove_photo')"
                    @click="removePhoto"
                  >
                    <UIcon
                      name="lucide:trash-2"
                      class="w-3.5 h-3.5"
                      style="color: var(--negative);"
                    />
                  </button>
                </div>
              </div>

              <!-- Form fields -->
              <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="fm-label mb-2">{{ t('settings.name') }}</label>
                  <input
                    v-model="displayName"
                    class="fm-input"
                  >
                </div>
                <div>
                  <label class="fm-label mb-2">{{ t('settings.email') }}</label>
                  <input
                    class="fm-input"
                    :value="user?.primaryEmailAddress?.emailAddress"
                    disabled
                    style="color: var(--ink-3);"
                  >
                </div>
              </div>
            </div>

            <!-- Save button -->
            <div
              class="flex justify-end mt-4 pt-4"
              style="border-top: 1px solid var(--border);"
            >
              <button
                class="fm-btn fm-btn--primary w-full md:w-auto"
                :disabled="savingProfile"
                @click="saveProfile"
              >
                <UIcon
                  v-if="savingProfile"
                  name="lucide:loader-2"
                  class="w-4 h-4 animate-spin"
                />
                <template v-else>
                  <UIcon
                    name="lucide:check"
                    class="w-4 h-4"
                  /> {{ t('settings.save_changes') }}
                </template>
              </button>
            </div>
          </section>

          <!-- Appearance -->
          <section class="fm-card p-4 md:p-6">
            <div class="text-sm md:text-base font-semibold mb-1">
              {{ t('settings.appearance') }}
            </div>
            <div
              class="text-xs mb-4"
              style="color: var(--ink-3);"
            >
              {{ t('settings.appearance_subtitle') }}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <!-- Theme -->
              <div>
                <div class="fm-label mb-2.5">
                  {{ t('settings.theme') }}
                </div>
                <div class="grid grid-cols-3 gap-2">
                  <button
                    v-for="mode in ['light', 'dark', 'system']"
                    :key="mode"
                    class="flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all"
                    :style="{
                      border: colorMode.preference === mode ? '2px solid var(--accent)' : '1px solid var(--border)',
                      background: 'var(--surface-2)',
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--ink)',
                      cursor: 'pointer'
                    }"
                    @click="setTheme(mode)"
                  >
                    <div
                      class="w-full rounded-lg overflow-hidden"
                      style="height: 48px; border: 1px solid var(--border);"
                      :style="{
                        background: mode === 'light' ? 'oklch(0.985 0.003 270)'
                          : mode === 'dark' ? 'oklch(0.135 0.008 270)'
                            : 'linear-gradient(90deg, oklch(0.985 0.003 270) 50%, oklch(0.135 0.008 270) 50%)'
                      }"
                    />
                    <span class="text-xs font-medium flex items-center gap-1">
                      <UIcon
                        :name="mode === 'light' ? 'lucide:sun' : mode === 'dark' ? 'lucide:moon' : 'lucide:monitor'"
                        class="w-3 h-3"
                      />
                      {{ mode === 'light' ? t('settings.light') : mode === 'dark' ? t('settings.dark') : t('settings.system') }}
                    </span>
                  </button>
                </div>
              </div>

              <!-- Accent -->
              <div>
                <div class="fm-label mb-2.5">
                  {{ t('settings.accent') }}
                </div>
                <div class="flex gap-2.5 flex-wrap">
                  <button
                    v-for="a in ACCENTS"
                    :key="a.value"
                    class="w-10 h-10 rounded-xl transition-all"
                    :style="{
                      background: a.value,
                      border: accent === a.value ? '2.5px solid var(--ink)' : '1px solid var(--border)',
                      boxShadow: accent === a.value ? `0 0 0 4px oklch(from ${a.value} l c h / 0.25)` : 'none',
                      cursor: 'pointer'
                    }"
                    :aria-label="a.name"
                    @click="setAccent(a.value)"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Locale -->
          <section class="fm-card p-4 md:p-6">
            <div class="text-sm md:text-base font-semibold mb-1">
              {{ t('settings.locale') }}
            </div>
            <div
              class="text-xs mb-4"
              style="color: var(--ink-3);"
            >
              {{ t('settings.locale_subtitle') }}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="fm-label mb-2">{{ t('settings.language') }}</label>
                <select
                  :value="currentLocale?.code"
                  class="fm-input"
                  style="cursor: pointer;"
                  @change="(e: Event) => setLanguage((e.target as HTMLSelectElement).value)"
                >
                  <option
                    v-for="loc in locales"
                    :key="loc.code"
                    :value="loc.code"
                  >
                    {{ loc.name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="fm-label mb-2">{{ t('settings.currency') }}</label>
                <select
                  :value="currentCurrency?.code"
                  class="fm-input"
                  style="cursor: pointer;"
                  @change="(e: Event) => setCurrency((e.target as HTMLSelectElement).value)"
                >
                  <option
                    v-for="curr in CURRENCIES"
                    :key="curr.code"
                    :value="curr.code"
                  >
                    {{ curr.symbol }} {{ curr.code }} — {{ curr.name }}
                  </option>
                </select>
              </div>
            </div>
          </section>
        </template>
        <!-- End Geral Section -->

        <!-- Privacy -->
        <section
          v-if="activeSection === t('settings.privacy')"
          class="fm-card p-4 md:p-6"
        >
          <div class="text-sm md:text-base font-semibold mb-1">
            {{ t('settings.privacy') }}
          </div>
          <div
            class="text-xs mb-4"
            style="color: var(--ink-3);"
          >
            {{ t('settings.privacy_subtitle') }}
          </div>
          <div
            class="text-center py-8 md:py-12"
            style="color: var(--ink-3);"
          >
            <UIcon
              name="lucide:lock"
              class="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-30"
            />
            <p class="text-sm">
              {{ t('settings.coming_soon') }}
            </p>
          </div>
        </section>

        <!-- Notifications -->
        <section
          v-if="activeSection === t('settings.notifications')"
          class="fm-card p-4 md:p-6"
        >
          <div class="text-sm md:text-base font-semibold mb-1">
            {{ t('settings.notifications') }}
          </div>
          <div
            class="text-xs mb-4"
            style="color: var(--ink-3);"
          >
            {{ t('settings.notifications_subtitle') }}
          </div>
          <div
            class="text-center py-8 md:py-12"
            style="color: var(--ink-3);"
          >
            <UIcon
              name="lucide:bell"
              class="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 opacity-30"
            />
            <p class="text-sm">
              {{ t('settings.coming_soon') }}
            </p>
          </div>
        </section>

        <!-- Sign out -->
        <div class="flex justify-end">
          <SignOutButton>
            <button class="fm-btn fm-btn--danger fm-btn--sm">
              <UIcon
                name="lucide:log-out"
                class="w-3.5 h-3.5"
              /> {{ t('settings.sign_out') }}
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  </div>
</template>
