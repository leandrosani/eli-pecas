// Arquivo: server/api/pecas/[id].delete.ts
import { PrismaClient } from '@prisma/client'
import { getUserSession } from '../../utils/session'

import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.data.user) throw createError({ statusCode: 401, message: 'Não autorizado' })

  const id = getRouterParam(event, 'id')

  // AGORA FAZEMOS O SOFT DELETE
  // Não apagamos nada, apenas marcamos ativo = false
  await prisma.peca.update({
    where: { id },
    data: { ativo: false }
  })

  return { success: true }
})