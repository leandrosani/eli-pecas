// Arquivo: server/api/auth/user.get.ts
import { getUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  console.log('🔍 Frontend perguntou: "Quem sou eu?"')
  
  const session = await getUserSession(event)
  
  if (!session.data.user) {
    console.log('❌ Resposta: Ninguém (Cookie vazio ou inválido)')
    return { user: null }
  }

  console.log('✅ Resposta: É o usuário', session.data.user.email)
  return { user: session.data.user }
})