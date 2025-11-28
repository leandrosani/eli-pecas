// Arquivo: app/middleware/auth.global.ts
export default defineNuxtRouteMiddleware(async (to) => {
  // Pega os dados do usuário atual
  const { loggedIn, user, fetch: refreshSession } = useUserSession()

  // Lista de páginas que NÃO precisam de login (públicas)
  const publicPages = ['/login']

  // Se a página for pública, deixa passar
  if (publicPages.includes(to.path)) {
    // Mas se ele já tá logado e tenta ir pro login, manda pro dashboard
    if (loggedIn.value) {
      return navigateTo('/dashboard')
    }
    return
  }

  // Se a página for privada (dashboard, etc) e não tiver usuário...
  if (!loggedIn.value) {
    // Tenta buscar a sessão no servidor uma última vez para garantir
    await refreshSession()
    
    // Se continuar sem usuário, manda pro Login
    if (!loggedIn.value) {
      return navigateTo('/login')
    }
  }
})