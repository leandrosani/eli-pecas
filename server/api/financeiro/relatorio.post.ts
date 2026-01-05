import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const mesesAtras = Number(body.meses) || 1
  
  // Agora recebemos um ARRAY de tipos ['SAIDA', 'ENTRADA', 'DESPESA']
  // Se não vier nada, assumimos tudo por padrão
  const tiposFiltro: string[] = Array.isArray(body.tipos) && body.tipos.length > 0 
    ? body.tipos 
    : ['SAIDA', 'ENTRADA', 'DESPESA']

  // 1. Calcular datas
  const dataFim = new Date()
  const dataInicio = new Date()
  dataInicio.setMonth(dataInicio.getMonth() - (mesesAtras - 1))
  dataInicio.setDate(1)
  dataInicio.setHours(0, 0, 0, 0)

  try {
    // 2. Buscar Movimentações (Vendas e Entradas)
    let movimentacoes: any[] = []
    
    // Filtra apenas se SAIDA ou ENTRADA estiverem na lista solicitada
    const tiposMovimentacao = tiposFiltro.filter(t => t === 'SAIDA' || t === 'ENTRADA')
    
    if (tiposMovimentacao.length > 0) {
      movimentacoes = await prisma.historicoMovimentacao.findMany({
        where: {
          createdAt: { gte: dataInicio, lte: dataFim },
          tipo: { in: tiposMovimentacao as any } // Filtra pelo array
        },
        include: {
          peca: { select: { nome: true, modelo: true, preco: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    // 3. Buscar Despesas
    let despesas: any[] = []
    
    // Só busca despesas se 'DESPESA' estiver na lista solicitada
    if (tiposFiltro.includes('DESPESA')) {
      despesas = await prisma.despesa.findMany({
        where: {
          data: { gte: dataInicio, lte: dataFim }
        },
        orderBy: { data: 'desc' }
      })
    }

    // 4. Unificar e formatar
    const listaMovs = movimentacoes.map(m => ({
      data: m.createdAt,
      descricao: `${m.peca?.nome || 'Item'} (${m.peca?.modelo || ''})`,
      tipo: m.tipo,
      // Se for SAIDA, é Receita (+). Se for ENTRADA, é neutro (0) no fluxo de caixa financeiro, mas registramos.
      valor: m.tipo === 'SAIDA' ? (Number(m.peca?.preco || 0) * m.quantidade) : 0,
      qtd: m.quantidade
    }))

    const listaDesps = despesas.map(d => ({
      data: d.data,
      descricao: d.descricao,
      tipo: 'DESPESA',
      valor: Number(d.valor),
      qtd: 1
    }))

    const resultadoFinal = [...listaMovs, ...listaDesps].sort((a, b) => 
      new Date(b.data).getTime() - new Date(a.data).getTime()
    )

    // Totais
    const totalEntradas = resultadoFinal.filter(i => i.tipo === 'SAIDA').reduce((acc, i) => acc + i.valor, 0)
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