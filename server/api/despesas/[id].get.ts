import { prisma } from '../../utils/prisma'
import { getUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  // Opcional: verificar se está logado
  // if (!session.data.user) throw createError({ statusCode: 401, message: 'Não autorizado' })

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, message: 'ID não fornecido' })
  }

  const despesa = await prisma.despesa.findUnique({
    where: { id }
  })

  if (!despesa) {
    throw createError({ statusCode: 404, message: 'Despesa não encontrada' })
  }

  return despesa
})