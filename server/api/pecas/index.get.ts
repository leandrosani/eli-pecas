// Arquivo: server/api/pecas/index.get.ts
import { PrismaClient } from '@prisma/client'
import { getUserSession } from '../../utils/session'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.data.user) throw createError({ statusCode: 401, message: 'Não autorizado' })

  const query = getQuery(event)
  const busca = query.busca as string

  const pecas = await prisma.peca.findMany({
    where: {
      // --- FILTRO NOVO ---
      ativo: true, // Só traz peças ativas!
      // -------------------
      
      OR: busca ? [
        { nome: { contains: busca, mode: 'insensitive' } },
        { marca: { contains: busca, mode: 'insensitive' } },
        { modelo: { contains: busca, mode: 'insensitive' } }
      ] : undefined
    },
    orderBy: { createdAt: 'desc' }
  })

  return pecas
})