// Arquivo: server/api/pecas/index.post.ts
import { PrismaClient } from '@prisma/client'
import { getUserSession } from '../../utils/session'

import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  // 1. Proteção: Só quem está logado pode criar peças
  const session = await getUserSession(event)
  if (!session.data.user) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }

  // 2. Recebe os dados do formulário
  const body = await readBody(event)

  // 3. Validação básica
  if (!body.nome || !body.marca || !body.preco) {
    throw createError({ statusCode: 400, message: 'Campos obrigatórios faltando' })
  }

  try {
    // 4. Salva no Banco de Dados
    const peca = await prisma.peca.create({
      data: {
        nome: body.nome,
        marca: body.marca,
        modelo: body.modelo || '',
        ano: body.ano || null, // ✅ CORRIGIDO - salva como string
        estado: body.estado,
        detalhes: body.detalhes,
        preco: parseFloat(body.preco), // Garante que é número decimal
        quantidade: parseInt(body.quantidade) || 1,
        fotoUrl: body.fotoUrl || null,
        localizacao: body.localizacao || null,
        
        // Vamos registrar que houve uma entrada no histórico automaticamente
        movimentacoes: {
          create: {
            tipo: 'ENTRADA',
            quantidade: parseInt(body.quantidade) || 1,
            observacao: 'Cadastro inicial',
            userId: session.data.user.id
          }
        }
      }
    })

    return { success: true, peca }

  } catch (error) {
    console.error('Erro ao criar peça:', error)
    throw createError({ statusCode: 500, message: 'Erro no banco de dados' })
  }
})
