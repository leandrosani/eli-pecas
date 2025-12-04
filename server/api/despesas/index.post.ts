import { prisma } from '../../utils/prisma'
import { getUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  
  // Verifica login (Se estiver usando o bypass de admin, vai passar)
  if (!session.data.user) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }

  const body = await readBody(event)

  // Validação
  if (!body.descricao || !body.valor || !body.categoria) {
    throw createError({ statusCode: 400, message: 'Campos obrigatórios faltando' })
  }

  try {
    const despesa = await prisma.despesa.create({
      data: {
        descricao: body.descricao,
        categoria: body.categoria,
        // Garante que o valor venha como número decimal correto
        valor: parseFloat(String(body.valor).replace(',', '.')),
        formaPagamento: body.formaPagamento || 'OUTROS',
        // Garante que a data seja um objeto Date válido
        data: body.data ? new Date(body.data) : new Date(),
        observacao: body.observacao || null,
        userId: session.data.user.id
      }
    })

    return { success: true, id: despesa.id }

  } catch (error) {
    console.error('Erro ao salvar despesa:', error)
    throw createError({ statusCode: 500, message: 'Erro interno ao salvar despesa' })
  }
})