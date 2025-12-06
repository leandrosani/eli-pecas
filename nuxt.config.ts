// Arquivo: nuxt.config.ts

export default defineNuxtConfig({
  // Habilita SSR para o site funcionar corretamente na Vercel
  ssr: true,

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
      title: 'Eli Peças',
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  // Configuração padrão do Nitro (Vercel detecta automático)
  // Deixamos vazio para não forçar caminhos que quebrem o deploy
  nitro: {},

  runtimeConfig: {
    sessionSecret: '',
    appPassword: '',
    
    public: {
      // Deixe vazio aqui. A Vercel preenche com a variável de ambiente.
      baseUrl: '' 
    }
  }
})