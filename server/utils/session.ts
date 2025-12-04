import type { H3Event } from 'h3'
import { prisma } from './prisma'

export interface UserSession {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}

export async function getUserSession(event: H3Event) {
  // Define um usuário padrão para o sistema (Admin)
  const email = 'admin@elipecas.com'
  
  try {
    // Tenta buscar ou criar o usuário no banco de dados REAL (Neon)
    // Isso garante que o ID retornado seja válido para relacionamentos
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: 'Admin Eli Peças',
        provider: 'system_auto'
      }
    })

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name || 'Admin',
          avatarUrl: user.avatarUrl
        }
      }
    }
  } catch (error) {
    console.error('❌ Erro crítico ao obter usuário:', error)
    // Retorna nulo para forçar erro de autorização se o banco falhar
    return { data: { user: null } }
  }
}

export async function setUserSession(event: H3Event, user: UserSession) {
  // Não faz nada
}

export async function clearUserSession(event: H3Event) {
  // Não faz nada
}