// Arquivo: nuxt.config.mobile.ts
// Usado APENAS para gerar o APK do Android
export default defineNuxtConfig({
  // 1. Desativa SSR: O app no celular não tem servidor Node.js, ele é apenas visual (SPA).
  ssr: false,

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },
  modules: ['@nuxt/ui'],

  colorMode: {
    preference: 'light'
  },

  app: {
    // Transição suave entre telas (parece app nativo)
    pageTransition: { name: 'page', mode: 'out-in' },
    head: {
      title: 'Eli Peças Mobile',
      meta: [
        // Impede o usuário de dar zoom com pinça (comportamento de app)
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  // 2. CONFIGURAR SAÍDA: O Capacitor busca a pasta 'dist' por padrão.
  nitro: {
    output: {
      publicDir: 'dist'
    }
  },

  // 3. CONEXÃO COM O BACKEND (Site Real)
  runtimeConfig: {
    // Chaves privadas vazias (o app não roda servidor local)
    sessionSecret: '',
    appPassword: '',
    
    public: {
      // O app vai ler os dados do seu site que JÁ ESTÁ NO AR.
      // Certifique-se que este link é o final e correto.
      baseUrl: 'https://eli-pecas.vercel.app' 
    }
  }
})