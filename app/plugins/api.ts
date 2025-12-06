export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const baseURL = config.public.baseUrl

  // Força o $fetch a usar o link da Vercel
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL,
    
    // Cabeçalhos para funcionar no Android
    headers: {
      'Accept': 'application/json'
    },
    
    // Permite salvar o login (cookie/sessão)
    credentials: 'include', 

    async onResponseError({ response }) {
      console.error('Erro API Mobile:', response.status, response._data)
    }
  })
})