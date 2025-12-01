export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],

  css: ['~/assets/css/main.css'],

  nitro: {
    preset: 'cloudflare-pages',
    compatibilityDate: '2024-04-03',
    serveStatic: true,
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
