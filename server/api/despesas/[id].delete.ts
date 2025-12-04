import { prisma } from '../../utils/prisma'
import { getUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.data.user) throw createError({ statusCode: 401, message: 'Não autorizado' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID faltando' })

  try {
    await prisma.despesa.delete({
      where: { id }
    })

    return { success: true }
  } catch (error) {
    throw createError({ statusCode: 500, message: 'Erro ao excluir despesa' })
  }
})