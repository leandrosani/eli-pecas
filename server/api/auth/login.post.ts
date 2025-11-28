// Arquivo: server/api/auth/login.post.ts
// Usando o Prisma Global
import { prisma } from '../../utils/prisma'
import { setUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  const email = body.email
  const password = body.password

  // 1. VERIFICAÇÃO SIMPLES E SEGURA CONTRA A CHAVE SECRETA
  if (password !== config.appPassword || !email) {
    throw createError({ statusCode: 401, statusMessage: 'Credenciais inválidas.' })
  }

  // 2. CRIA/ATUALIZA o usuário no banco
  const user = await prisma.user.upsert({
    where: { email },
    update: { provider: 'secret' },
    create: {
      email,
      name: email.split('@')[0].toUpperCase(),
      provider: 'secret'
    },
  })

  // 3. CRIA A SESSÃO (Isso agora é imune a bugs do Google/Vercel)
  await setUserSession(event, {
    id: user.id,
    email: user.email,
    name: user.name || 'Admin',
    avatarUrl: user.avatarUrl
  })

  return { success: true }
})