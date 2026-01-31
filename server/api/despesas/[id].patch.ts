import { prisma } from '../../utils/prisma'
import { getUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.data.user) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) throw createError({ statusCode: 400, message: 'ID obrigatório' })

  try {
    const despesaAtualizada = await prisma.despesa.update({
      where: { id },
      data: {
        descricao: body.descricao,
        categoria: body.categoria,
        // Garante conversão correta de tipos
        valor: body.valor ? parseFloat(String(body.valor).replace(',', '.')) : undefined,
        formaPagamento: body.formaPagamento,
        data: body.data ? new Date(body.data) : undefined,
        observacao: body.observacao
      }
    })

    return { success: true, despesa: despesaAtualizada }

  } catch (error) {
    console.error('Erro ao atualizar despesa:', error)
    throw createError({ statusCode: 500, message: 'Erro ao salvar alterações' })
  }
})