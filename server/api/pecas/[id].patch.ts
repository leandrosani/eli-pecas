// Arquivo: server/api/pecas/[id].patch.ts
import { PrismaClient } from '@prisma/client'
import { getUserSession } from '../../utils/session'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.data.user) throw createError({ statusCode: 401, message: 'Login necessário' })

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) throw createError({ statusCode: 400, message: 'ID obrigatório' })

  try {
    const atualizado = await prisma.peca.update({
      where: { id },
      data: {
        nome: body.nome,
        marca: body.marca,
        modelo: body.modelo,
        ano: body.ano ? parseInt(body.ano) : null,
        preco: parseFloat(body.preco),
        quantidade: parseInt(body.quantidade),
        estado: body.estado,
        // --- AQUI ESTAVA FALTANDO ---
        detalhes: body.detalhes 
        // ---------------------------
      }
    })
    return { success: true, peca: atualizado }
  } catch (error) {
    console.error('Erro ao atualizar:', error)
    throw createError({ statusCode: 500, message: 'Erro ao salvar alterações' })
  }
})