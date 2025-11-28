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