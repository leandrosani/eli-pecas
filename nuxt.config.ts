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