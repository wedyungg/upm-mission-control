// https://nuxt.com/docs/api/configuration/nuxt-config
const defaultSupabaseUrl = 'https://zfngjgcuznqixulfrhec.supabase.co'
const defaultSupabaseKey = 'sb_publishable_X23l7Hab27PdcB2i8ceEoQ__l49f_6l'

// Guard against obsolete dead Supabase URL in environment variables
const supabaseUrl = (!process.env.SUPABASE_URL || process.env.SUPABASE_URL.includes('uixvorekmbopxiotehgh'))
  ? defaultSupabaseUrl
  : process.env.SUPABASE_URL

const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || defaultSupabaseKey

export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@nuxtjs/supabase',
    '@pinia/nuxt',
    '@vueuse/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  ui: {
    global: true,
  },

  supabase: {
    url: supabaseUrl,
    key: supabaseKey,
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: ['/login'],
    },
  },

  runtimeConfig: {
    // 🔒 PRIVATE SECTON: Aman, hanya bisa dibaca oleh server (Edge Functions / API Routes)
    waToken: process.env.WA_TOKEN ?? '',
    waTarget: process.env.WA_TARGET ?? '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    geminiApiKey: process.env.GEMINI_API_KEY ?? '',
    
    // 🌐 PUBLIC SECTION: Bisa dibaca oleh browser (Hanya untuk ID biasa/URL)
    public: {
      googleClientId:        process.env.GOOGLE_CLIENT_ID          ?? '',
      googleDriveFolderId:   process.env.GOOGLE_DRIVE_FOLDER_ID    ?? '',
      googleDriveFolderName: process.env.GOOGLE_DRIVE_FOLDER_NAME  ?? 'SISTEM DASHBOARD UPM',
      supabaseUrl:           supabaseUrl,
    },
  },

  app: {
    head: {
      title: 'Dashboard UPM',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' },
        { name: 'theme-color', content: '#0f172a' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },

  tailwindcss: {
    config: {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Plus Jakarta Sans', 'sans-serif'],
            mono: ['JetBrains Mono', 'monospace'],
          },
          colors: {
            brand: {
              blue:   '#3b82f6',
              green:  '#22c55e',
              orange: '#f97316',
              red:    '#ef4444',
              yellow: '#eab308',
              purple: '#a855f7',
              teal:   '#14b8a6',
            },
          },
        },
      },
    },
  },

  typescript: {
    strict: true,
  },

  compatibilityDate: '2024-04-03',
})
