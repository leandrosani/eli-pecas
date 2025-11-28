// Arquivo: server/api/pecas/[id]/vender.post.ts
import { PrismaClient } from '@prisma/client'
import { getUserSession } from '../../../utils/session' // Note que subimos 3 níveis agora (../)

import { prisma } from '../../../utils/prisma'

export default defineEventHandler(async (event) => {
  // 1. Segurança
  const session = await getUserSession(event)
  if (!session.data.user) throw createError({ statusCode: 401, message: 'Login necessário' })

  // Pega o ID da pasta [id]
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)
  
  // Garante que é número inteiro
  const quantidadeVendida = parseInt(body.quantidade)

  if (!id) throw createError({ statusCode: 400, message: 'ID faltando' })
  if (!quantidadeVendida || quantidadeVendida < 1) throw createError({ statusCode: 400, message: 'Quantidade inválida' })

  // 2. Transação (Tudo ou Nada)
  return await prisma.$transaction(async (tx) => {
    
    // A. Busca a peça para checar saldo
    const peca = await tx.peca.findUnique({ where: { id } })
    
    if (!peca) throw createError({ statusCode: 404, message: 'Peça não encontrada' })
    
    if (peca.quantidade < quantidadeVendida) {
      throw createError({ 
        statusCode: 400, 
        statusMessage: `Estoque insuficiente. Tem apenas ${peca.quantidade}.` 
      })
    }

    // B. Atualiza o estoque (Diminui a quantidade)
    const pecaAtualizada = await tx.peca.update({
      where: { id },
      data: { quantidade: { decrement: quantidadeVendida } }
    })

    // C. Cria o Histórico (Registra a Venda/Saída)
    await tx.historicoMovimentacao.create({
      data: {
        tipo: 'SAIDA', // Importante: Marca como saída
        quantidade: quantidadeVendida,
        observacao: 'Venda realizada no balcão',
        pecaId: id,
        userId: session.data.user?.id
      }
    })

    return { success: true, novaQuantidade: pecaAtualizada.quantidade }
  })
})