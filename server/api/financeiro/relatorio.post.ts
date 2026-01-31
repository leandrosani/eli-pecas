import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const mesesAtras = Number(body.meses) || 1

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
          tipo: { in: tiposMovimentacao as any }
        },
        include: {
          peca: { select: { nome: true, modelo: true, preco: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    // 3. Buscar Despesas
    let despesas: any[] = []

    if (tiposFiltro.includes('DESPESA')) {
      despesas = await prisma.despesa.findMany({
        where: {
          data: { gte: dataInicio, lte: dataFim }
        },
        orderBy: { data: 'desc' }
      })
    }

    // 4. Unificar e formatar
    const listaMovs = movimentacoes.map(m => {
      // ✅ LÓGICA DE SNAPSHOT
      // Se tiver snapshot (novo), usa ele. Se não (velho), usa o dado atual da peça.
      const nomeReal = m.nomeSnapshot || m.peca?.nome || 'Item Desconhecido'
      const modeloReal = m.modeloSnapshot || m.peca?.modelo || ''
      const precoReal = m.precoVenda ? Number(m.precoVenda) : Number(m.peca?.preco || 0)

      return {
        data: m.createdAt,
        descricao: `${nomeReal} (${modeloReal})`,
        tipo: m.tipo,
        valor: (precoReal * m.quantidade),
        qtd: m.quantidade
      }
    })

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

    // ✅ CORREÇÃO DOS TOTAIS (Para não somar estoque como dinheiro)

    // Receita: Soma apenas o que foi VENDIDO ('SAIDA')
    const totalReceita = resultadoFinal
      .filter(i => i.tipo === 'SAIDA')
      .reduce((acc, i) => acc + i.valor, 0)

    // Despesa: Soma apenas 'DESPESA'
    const totalDespesas = resultadoFinal
      .filter(i => i.tipo === 'DESPESA')
      .reduce((acc, i) => acc + i.valor, 0)

    // Entradas de Estoque (Apenas informativo, não soma no saldo financeiro)
    const totalEntradasEstoque = resultadoFinal
      .filter(i => i.tipo === 'ENTRADA')
      .reduce((acc, i) => acc + i.valor, 0)

    return {
      itens: resultadoFinal,
      resumo: {
        inicio: dataInicio,
        fim: dataFim,
        receita: totalReceita,
        despesa: totalDespesas,
        saldo: totalReceita - totalDespesas, // Saldo Real (Dinheiro que entrou - Dinheiro que saiu)
        valorEstoqueEntrada: totalEntradasEstoque // Envia separado caso queira mostrar no PDF
      }
    }

  } catch (error) {
    console.error('Erro relatorio:', error)
    throw createError({ statusCode: 500, message: 'Erro ao gerar dados.' })
  }
})