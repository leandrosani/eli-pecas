// Arquivo: server/utils/session.ts
import type { H3Event } from 'h3'

export interface UserSession {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}

export async function getUserSession(event: H3Event) {
  const config = useRuntimeConfig(event)

  // 1. Senha Fixa e Longa (32 caracteres) para garantir a criptografia
  // Isso evita erros de "password too short"
  const password = 'minha-senha-super-secreta-com-32-chars-fixa'

  const session = await useSession(event, {
    password,
    name: 'eli-pecas-token', // Nome único para o cookie
    cookie: {
      // --- AQUI ESTÁ A CORREÇÃO ---
      // Forçamos FALSE. Em localhost (http) isso TEM que ser false.
      secure: false, 
      
      // LAX é obrigatório para o Google devolver o usuário logado
      sameSite: 'lax',
      
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 dias
    }
  })

  return session
}

export async function setUserSession(event: H3Event, user: UserSession) {
  const session = await getUserSession(event)
  await session.update({ user })
  return session
}

export async function clearUserSession(event: H3Event) {
  const session = await getUserSession(event)
  await session.clear()
}