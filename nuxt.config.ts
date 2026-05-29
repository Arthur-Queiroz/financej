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
    'nuxt-icons'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/': { prerender: true },
    // Clerk webhook receives raw POST from external service — CSRF must be disabled
    '/api/webhooks/**': { security: { xssValidator: false } }
  },

  security: {
    // CSRF is not needed: all /api/* routes are protected by Clerk JWT session auth.
    // Traditional CSRF only applies to cookie-only auth with no origin check.
    csrf: false,
    headers: {
      contentSecurityPolicy: {
        'img-src': [
          "'self'",
          'data:',
          'https:',
          'https://*.clerk.com',
          'https://*.clerk.dev',
          'https://img.clerk.com',
          'https://images.clerk.dev'
        ]
      }
    }
  },

  colorMode: {
    preference: 'dark',
    fallback: 'dark',
    classSuffix: ''
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
      { code: 'en', name: 'English', file: 'en.json' }
    ],
    defaultLocale: 'pt-BR',
    strategy: 'no_prefix',
    lazy: true,
    langDir: '../app/locales/'
  },

  imports: {
    presets: [
      { from: '~/utils/format', imports: ['fmtBRL', 'fmtPct', 'fmtDate', 'fmtDateFull', 'isoDate'] },
      { from: '~/utils/categories', imports: ['CATEGORIES', 'CATEGORY_LIST'] }
    ]
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})