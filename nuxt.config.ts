// Arquivo: nuxt.config.ts
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: ['@nuxt/ui'],

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

  nitro: {
    preset: 'cloudflare-pages',        // ← CORRIGIDO AQUI
    compatibilityDate: '2024-04-03',
    cloudflare: {
      nodeCompat: true
    },
    prerender: {
      routes: ['/'],
      crawlLinks: true
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
