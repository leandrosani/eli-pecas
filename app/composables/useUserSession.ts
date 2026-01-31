// Arquivo: app/composables/useUserSession.ts
import type { UserSession } from '../../server/utils/session'

export const useUserSession = () => {
  // 1. ESTADO: Variáveis reativas no navegador
  const user = useState<UserSession | null>('user', () => null)
  const loggedIn = computed(() => !!user.value)

  // 2. FUNÇÃO PRINCIPAL: Busca a sessão no backend (lê o cookie)
  async function fetch() {
    try {
      // Passa os cookies do navegador para o servidor validar a sessão
      const headers = useRequestHeaders(['cookie'])
      
      const { user: serverUser } = await $fetch<{ user: UserSession }>(
        '/api/auth/user', 
        { headers } // O servidor precisa do cookie para saber quem você é
      )
      
      user.value = serverUser
    } catch (e) {
      console.error('Erro ao buscar sessão:', e)
      user.value = null // Limpa o estado se a API falhar
    }
  }

  // 3. LOGOUT: Limpa o cookie no servidor e redireciona
  async function clear() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null // Limpa o estado local
    await navigateTo('/login') // Redireciona para o login
  }

  return {
    user,
    loggedIn,
    fetch,
    clear
  }
}