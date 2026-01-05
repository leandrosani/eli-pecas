// server/api/financeiro/relatorio.post.ts
import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const mesesAtras = Number(body.meses) || 1 // 1 = mês atual, 12 = último ano
  const filtroTipo = body.tipo || 'todos' // 'todos', 'saida', 'entrada', 'despesa'

  // 1. Calcular datas
  const dataFim = new Date() // Hoje
  const dataInicio = new Date()
  
  // Se for 1 mês, é do dia 1 do mês atual. Se for 2, é dia 1 do mês passado, etc.
  dataInicio.setMonth(dataInicio.getMonth() - (mesesAtras - 1))
  dataInicio.setDate(1) // Começo do mês calculado
  dataInicio.setHours(0, 0, 0, 0)

  try {
    // 2. Buscar Movimentações (Vendas e Entradas)
    let movimentacoes: any[] = []
    
    if (filtroTipo === 'todos' || filtroTipo === 'saida' || filtroTipo === 'entrada') {
      const tipoFiltro = filtroTipo === 'todos' ? undefined : filtroTipo.toUpperCase()
      
      movimentacoes = await prisma.historicoMovimentacao.findMany({
        where: {
          createdAt: { gte: dataInicio, lte: dataFim },
          tipo: tipoFiltro // Se undefined, traz tudo
        },
        include: {
          peca: { select: { nome: true, modelo: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    // 3. Buscar Despesas
    let despesas: any[] = []
    
    if (filtroTipo === 'todos' || filtroTipo === 'despesa') {
      despesas = await prisma.despesa.findMany({
        where: {
          data: { gte: dataInicio, lte: dataFim }
        },
        orderBy: { data: 'desc' }
      })
    }

    // 4. Unificar e formatar para o PDF
    const listaMovs = movimentacoes.map(m => ({
      data: m.createdAt,
      descricao: `${m.peca?.nome || 'Item'} (${m.peca?.modelo || ''})`,
      tipo: m.tipo, // SAIDA ou ENTRADA
      valor: Number(m.peca?.preco || 0) * m.quantidade,
      qtd: m.quantidade
    }))

    const listaDesps = despesas.map(d => ({
      data: d.data,
      descricao: d.descricao,
      tipo: 'DESPESA',
      valor: Number(d.valor),
      qtd: 1
    }))

    // Junta tudo e ordena por data
    const resultadoFinal = [...listaMovs, ...listaDesps].sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    )

    // Totais para o cabeçalho do PDF
    const totalEntradas = resultadoFinal.filter(i => i.tipo === 'SAIDA' || i.tipo === 'ENTRADA').reduce((acc, i) => acc + i.valor, 0)
    const totalSaidas = resultadoFinal.filter(i => i.tipo === 'DESPESA').reduce((acc, i) => acc + i.valor, 0)

    return {
      itens: resultadoFinal,
      resumo: {
        inicio: dataInicio,
        fim: dataFim,
        receita: totalEntradas,
        despesa: totalSaidas,
        saldo: totalEntradas - totalSaidas
      }
    }

  } catch (error) {
    console.error('Erro relatorio:', error)
    throw createError({ statusCode: 500, message: 'Erro ao gerar dados.' })
  }
})