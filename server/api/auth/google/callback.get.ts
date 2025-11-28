// Arquivo: server/api/auth/google/callback.get.ts
import { PrismaClient } from '@prisma/client'
import { setUserSession } from '../../../utils/session'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const code = query.code as string

  if (!code) {
    console.error('❌ ERRO: Código do Google não chegou!')
    return sendRedirect(event, '/login?erro=sem_codigo')
  }

  try {
    console.log('1. Trocando código por token...')
    const tokenResponse = await $fetch<{ access_token: string }>('https://oauth2.googleapis.com/token', {
      method: 'POST',
      body: {
        client_id: config.googleClientId,
        client_secret: config.googleClientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: `${config.public.baseUrl}/api/auth/google/callback`,
      },
    })

    console.log('2. Buscando dados do usuário no Google...')
    const googleUser = await $fetch<{ email: string, name: string, picture: string }>(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      }
    )
    console.log('   Dados recebidos:', googleUser.email)

    console.log('3. Salvando no Banco de Dados...')
    const user = await prisma.user.upsert({
      where: { email: googleUser.email },
      update: {
        name: googleUser.name,
        avatarUrl: googleUser.picture,
        provider: 'google'
      },
      create: {
        email: googleUser.email,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
        provider: 'google'
      },
    })
    console.log('   Usuário salvo/atualizado com ID:', user.id)

    console.log('4. Criando Sessão (Cookie)...')
    await setUserSession(event, {
      id: user.id,
      email: user.email,
      name: user.name || '',
      avatarUrl: user.avatarUrl
    })
    console.log('✅ Sessão criada! Redirecionando para Dashboard...')

    return sendRedirect(event, '/dashboard')

  } catch (error: any) {
    // AQUI É ONDE O BICHO PEGA
    console.error('❌ ERRO FATAL NO LOGIN:', error)
    
    // Se for erro do Prisma, mostra detalhes
    if (error.code) {
      console.error('   Código do erro Prisma:', error.code)
      console.error('   Meta:', error.meta)
    }

    return sendRedirect(event, '/login?erro=falha_sistema')
  }
})