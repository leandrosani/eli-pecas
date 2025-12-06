// Arquivo: nuxt.config.ts
export default defineNuxtConfig({
  // 1. App Mobile roda como SPA (Sem renderização no servidor do celular)
  ssr: false,

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  colorMode: { preference: 'light' },
  css: ['~/assets/css/main.css'],

  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Eli Peças Mobile',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' }
      ]
    }
  },

  nitro: {
    // Pasta de saída para o Capacitor
    output: {
      publicDir: 'dist'
    },
    // --- LIBERAR ACESSO DO CELULAR (CORS NA VERCEL) ---
    routeRules: {
      '/api/**': {
        cors: true,
        headers: {
          'Access-Control-Allow-Origin': '*', // Permite qualquer origem (App)
          'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
          'Access-Control-Allow-Credentials': 'true'
        }
      }
    }
  },

  runtimeConfig: {
    sessionSecret: '',
    appPassword: '',
    
    public: {
      // SEU LINK DA VERCEL (Onde o "cérebro" está)
      baseUrl: 'https://eli-pecas.vercel.app' 
    }
  }
})