// Arquivo: server/api/dashboard/stats.get.ts
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  // Pega mês/ano da URL ou usa o atual
  const hoje = new Date()
  const mes = query.mes ? parseInt(query.mes as string) : (hoje.getMonth() + 1)
  const ano = query.ano ? parseInt(query.ano as string) : hoje.getFullYear()

  // Define o intervalo de datas (Primeiro ao último dia do mês escolhido)
  const dataInicio = new Date(ano, mes - 1, 1)
  const dataFim = new Date(ano, mes, 0, 23, 59, 59)

  // 1. Total em Estoque (Apenas peças ATIVAS)
  const todasPecas = await prisma.peca.findMany({ where: { ativo: true } })
  const valorEstoque = todasPecas.reduce((acc, p) => acc + (Number(p.preco) * p.quantidade), 0)
  const itensEstoque = todasPecas.reduce((acc, p) => acc + p.quantidade, 0)

  // 2. Movimentações do Mês Escolhido (Vendas e Entradas)
  const historicoMes = await prisma.historicoMovimentacao.findMany({
    where: {
      createdAt: {
        gte: dataInicio,
        lte: dataFim
      }
    },
    include: { peca: true },
    orderBy: { createdAt: 'desc' }
  })

  // 3. Calcula Faturamento do Mês (Só soma as SAIDAS)
  const faturamentoMes = historicoMes
    .filter(h => h.tipo === 'SAIDA')
    .reduce((acc, h) => acc + (Number(h.peca.preco) * h.quantidade), 0)

  const vendasCount = historicoMes.filter(h => h.tipo === 'SAIDA').length

  return {
    valorEstoque,
    itensEstoque,
    faturamentoMes,
    vendasCount,
    historicoMes
  }
})