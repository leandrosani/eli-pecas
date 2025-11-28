// Arquivo: server/api/auth/google.get.ts
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // --- DEBUG: VAI APARECER NO SEU TERMINAL ---
  //console.log('--- TENTATIVA DE LOGIN ---')
  //console.log('CLIENT ID LIDO:', config.googleClientId)
  //console.log('BASE URL LIDA:', config.public.baseUrl)
  // ------------------------------------------

  const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth'
  
  const params = new URLSearchParams({
    client_id: config.googleClientId,
    redirect_uri: `${config.public.baseUrl}/api/auth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'offline',
    prompt: 'consent'
  })

  return sendRedirect(event, `${GOOGLE_AUTH_URL}?${params.toString()}`)
})