// Arquivo: nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2025-12-15',
  
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  // Adicione o módulo PWA aqui
  modules: [
    '@nuxt/ui',
    '@vite-pwa/nuxt' // <-- NOVO
  ],

  colorMode: {
    preference: 'light'
  },

  app: {
    head: {
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
        }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  // Configuração do PWA
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Eli Peças - Sistema',
      short_name: 'Eli Peças',
      description: 'Sistema de gestão Eli Peças',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      display: 'standalone',
      start_url: '/',
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
    },
    devOptions: {
      enabled: true,
      type: 'module'
    }
  },

  runtimeConfig: {
    sessionSecret: '',
    appPassword: '',
    public: {
      baseUrl: ''
    }
  }
})
