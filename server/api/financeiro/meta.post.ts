import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const novaMeta = Number(body.valor)

  if (!novaMeta || novaMeta <= 0) {
    throw createError({ statusCode: 400, message: 'Valor inválido' })
  }

  // Usa UPSERT: Se existe, atualiza. Se não existe, cria.
  // CORREÇÃO: 'prisma.configuracao' deve ser minúsculo
  await prisma.configuracao.upsert({
    where: { chave: 'META_MENSAL' },
    update: { valor: String(novaMeta) },
    create: { 
      chave: 'META_MENSAL',
      valor: String(novaMeta)
    }
  })

  return { success: true }
})