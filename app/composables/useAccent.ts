export const ACCENTS = [
  { name: 'Lime',   value: 'oklch(0.88 0.22 130)' },
  { name: 'Violeta', value: 'oklch(0.8 0.18 290)'  },
  { name: 'Cyan',   value: 'oklch(0.85 0.14 220)' },
  { name: 'Coral',  value: 'oklch(0.78 0.2 25)'   },
]

export const useAccent = () => {
  const accent = useCookie<string>('fm-accent', {
    default: () => ACCENTS[0]!.value,
    sameSite: 'lax'
  })

  if (import.meta.client) {
    watch(accent, (v) => {
      document.documentElement.style.setProperty('--accent', v)
    }, { immediate: true })
  }

  return { accent, ACCENTS }
}
