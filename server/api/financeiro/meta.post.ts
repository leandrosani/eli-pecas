import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const novaMeta = Number(body.valor)

  // Validação simples
  if (!novaMeta || novaMeta <= 0) {
    throw createError({ statusCode: 400, message: 'Valor inválido para a meta.' })
  }

  try {
    // Usa UPSERT: Cria se não existir, Atualiza se já existir
    // Nota: 'prisma.configuracao' deve estar em minúsculo (padrão do Prisma Client)
    await prisma.configuracao.upsert({
      where: { chave: 'META_MENSAL' },
      update: { valor: String(novaMeta) },
      create: { 
        chave: 'META_MENSAL',
        valor: String(novaMeta)
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao salvar meta:', error)
    throw createError({ statusCode: 500, message: 'Erro ao salvar configuração.' })
  }
})