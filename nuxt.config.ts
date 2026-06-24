// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@nuxt/image',
    '@clerk/nuxt',
    'nuxt-security',
    '@nuxtjs/google-fonts',
    '@nuxtjs/i18n',
    'nuxt-icons',
    '@vite-pwa/nuxt'
  ],

  imports: {
    presets: [
      { from: '~/utils/format', imports: ['fmtBRL', 'fmtPct', 'fmtDate', 'fmtDateFull', 'isoDate'] },
      { from: '~/utils/categories', imports: ['CATEGORIES', 'CATEGORY_LIST'] }
    ]
  },

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
  },

  routeRules: {
    // Clerk webhook receives raw POST from external service — CSRF must be disabled
    '/api/webhooks/**': { security: { xssValidator: false } }
  },

  // Don't emit server-side sourcemaps in the build (faster build, smaller output)
  sourcemap: { server: false },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  },

  googleFonts: {
    families: {
      'Geist': [400, 500, 600, 700],
      'Geist+Mono': [400, 500, 600]
    },
    display: 'swap'
  },

  i18n: {
    locales: [
      { code: 'pt-BR', name: 'Português (Brasil)', file: 'pt-BR.json' },
      { code: 'pt', name: 'Português', file: 'pt-BR.json' },
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'pt-BR',
    strategy: 'no_prefix',
    langDir: '../app/locales/'
  },

  icon: {
    // Only bundle the icons actually referenced in the code, instead of whole collections
    clientBundle: { scan: true }
  },

  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'financej',
      short_name: 'financej',
      description: 'Gerencie suas finanças pessoais com facilidade.',
      theme_color: '#0f172a',
      background_color: '#0f172a',
      display: 'standalone',
      display_override: ['standalone', 'minimal-ui'],
      lang: 'pt-BR',
      icons: [
        {
          src: '/pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/pwa-icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico,woff,woff2}'],
      navigateFallback: null
    },
    devOptions: {
      // Don't generate the service worker during `nuxt dev` — pure overhead locally
      enabled: false
    }
  },

  security: {
    // CSRF is not needed: all /api/* routes are protected by Clerk JWT session auth.
    // Traditional CSRF only applies to cookie-only auth with no origin check.
    csrf: false,
    headers: {
      contentSecurityPolicy: {
        'img-src': [
          '\'self\'',
          'data:',
          'https:',
          'https://*.clerk.com',
          'https://*.clerk.dev',
          'https://img.clerk.com',
          'https://images.clerk.dev'
        ]
      }
    }
  }
})
