// nuxt.config.ts
export default defineNuxtConfig({
  future: { compatibilityVersion: 4 },
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  colorMode: { preference: 'light' },
  app: {
    head: {
      link: [{
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
      }]
    }
  },
  css: ['~/assets/css/main.css'],
  nitro: {
    preset: 'cloudflare_pages',
    compatibilityDate: '2025-07-15', // ou a data mais recente que seu Nitro / Cloudflare recomende
    cloudflare: {
      // chave correta para o config do Nitro
      nodeCompat: true
    },
    prerender: {
      routes: ['/'],
      crawlLinks: true
    }
  },
  runtimeConfig: {
    sessionSecret: process.env.NUXT_SESSION_SECRET,
    appPassword: process.env.NUXT_APP_PASSWORD,
    databaseUrl: process.env.DATABASE_URL,
    public: {
      baseUrl: process.env.NUXT_PUBLIC_BASE_URL
    }
  }
})
