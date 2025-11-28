// Arquivo: server/api/pecas/[id].get.ts
import { PrismaClient } from '@prisma/client'
import { getUserSession } from '../../utils/session'

import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // Proteção
  const session = await getUserSession(event)
  if (!session.data.user) throw createError({ statusCode: 401, message: 'Login necessário' })

  // Pega o ID da URL
  const id = getRouterParam(event, 'id')

  const peca = await prisma.peca.findUnique({
    where: { id }
  })

  if (!peca) {
    throw createError({ statusCode: 404, message: 'Peça não encontrada' })
  }

  return peca
})