// Arquivo: nuxt.config.ts
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4,
  },

  // Habilita as ferramentas de dev
  devtools: { enabled: true },

  // Módulo de UI
  modules: ['@nuxt/ui'],

  // Configuração de Cores e Ícones
  colorMode: {
    preference: 'light'
  },

  app: {
    head: {
      // 1. Link para carregar a fonte Inter do Google Fonts
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
        }
      ]
    }
  },

  // CSS Global
  css: ['~/assets/css/main.css'],

  nitro: {
    // Diz ao Nuxt para compilar o código para rodar como Worker no Cloudflare
    preset: 'cloudflare-pages', 
    // É crucial para o Prisma funcionar. Não altere!
    experimental: {
        wasm: true
    }
  },

  // Variáveis de Ambiente
  runtimeConfig: {
    // VARIÁVEIS NOVAS
    sessionSecret: '',
    appPassword: '', // <-- CHAVE SECRETA DO LOGIN

    // VARIÁVEIS ANTIGAS REMOVIDAS
    // googleClientId: '',
    // googleClientSecret: '',
    // resendApiKey: '',

    public: {
      baseUrl: ''
    }
  }
})