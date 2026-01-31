import type { H3Event } from 'h3'
import { prisma } from './prisma'

export interface UserSession {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}

// Obtém a sessão do cookie
export async function getUserSession(event: H3Event) {
  const config = useRuntimeConfig(event)
  
  // O Prisma é importado aqui para ser usado em rotas que precisam de acesso ao DB (ex: login.post)
  
  // Configuração padrão de sessão via Cookie
  const session = await useSession(event, {
    password: config.sessionSecret || 'fallback-senha-secreta-longa',
    name: 'eli-pecas-session',
    cookie: {
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    }
  })

  return session
}

// Salva a sessão no cookie
export async function setUserSession(event: H3Event, user: UserSession) {
  const session = await getUserSession(event)
  await session.update({ user })
  return session
}

// Limpa a sessão no cookie
export async function clearUserSession(event: H3Event) {
  const session = await getUserSession(event)
  await session.clear()
}