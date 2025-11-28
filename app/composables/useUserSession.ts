// Arquivo: app/composables/useUserSession.ts
import type { UserSession } from '../../server/utils/session'

export const useUserSession = () => {
  const user = useState<UserSession | null>('user', () => null)
  const loggedIn = computed(() => !!user.value)

  async function fetch() {
    try {
      // CORREÇÃO: Pegamos os headers (incluindo cookies) da requisição atual
      // e passamos para a chamada da API.
      const headers = useRequestHeaders(['cookie'])
      
      const { user: serverUser } = await $fetch<{ user: UserSession }>('/api/auth/user', {
        headers // <--- O segredo está aqui!
      })
      
      user.value = serverUser
    } catch (e) {
      console.error('Erro ao buscar sessão:', e)
      user.value = null
    }
  }

  async function clear() {
    await $fetch('/api/auth/logout', { method: 'POST' })
    user.value = null
    await navigateTo('/login')
  }

  return {
    user,
    loggedIn,
    fetch,
    clear
  }
}