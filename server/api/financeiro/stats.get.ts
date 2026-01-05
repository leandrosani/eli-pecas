import { defineEventHandler, getQuery, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const hoje = new Date()

    const ano = Number(query.ano) || hoje.getFullYear()
    const mes = query.mes !== undefined ? Number(query.mes) : hoje.getMonth() + 1
    const isAnual = mes === 0

    let inicioPeriodo: Date
    let fimPeriodo: Date

    if (isAnual) {
      inicioPeriodo = new Date(ano, 0, 1)
      fimPeriodo = new Date(ano, 11, 31, 23, 59, 59, 999)
    } else {
      inicioPeriodo = new Date(ano, mes - 1, 1)
      fimPeriodo = new Date(ano, mes, 0, 23, 59, 59, 999)
    }

    const dataCorteParado = new Date()
    dataCorteParado.setDate(dataCorteParado.getDate() - 90)

    const [
      vendasHistorico,
      despesasHistorico,
      movimentacoesPeriodo,
      despesasPeriodo,
      estoqueAtivo,
      configMeta
    ] = await Promise.all([
      prisma.historicoMovimentacao.findMany({
        where: { tipo: 'SAIDA' },
        select: { quantidade: true, peca: { select: { preco: true } } }
      }),

      prisma.despesa.findMany({ select: { valor: true } }),

      prisma.historicoMovimentacao.findMany({
        where: { createdAt: { gte: inicioPeriodo, lte: fimPeriodo } },
        include: { peca: true },
        orderBy: { createdAt: 'desc' }
      }),

      prisma.despesa.findMany({
        where: { data: { gte: inicioPeriodo, lte: fimPeriodo } },
        orderBy: { data: 'desc' }
      }),

      prisma.peca.findMany({
        where: { ativo: true, quantidade: { gt: 0 } },
        include: {
          movimentacoes: {
            where: { tipo: 'SAIDA' },
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      }),

      prisma.configuracao.findUnique({ where: { chave: 'META_MENSAL' } })
    ])

    // CAIXA (fluxo financeiro real)
    const receitaTotal = vendasHistorico.reduce(
      (acc, v) => acc + Number(v.peca?.preco || 0) * v.quantidade,
      0
    )

    const despesaTotal = despesasHistorico.reduce(
      (acc, d) => acc + Number(d.valor || 0),
      0
    )

    const saldoCaixa = receitaTotal - despesaTotal

    // DRE do período
    const vendasPeriodo = movimentacoesPeriodo.filter(m => m.tipo === 'SAIDA')

    const faturamentoPeriodo = vendasPeriodo.reduce(
      (acc, v) => acc + Number(v.peca?.preco || 0) * v.quantidade,
      0
    )

    const custoPeriodo = vendasPeriodo.reduce((acc, v) => {
      const custo = Number(v.peca?.custo || 0)
      return acc + custo * v.quantidade
    }, 0)

    const lucroOperacional = faturamentoPeriodo - custoPeriodo
    const margem = faturamentoPeriodo > 0 ? (lucroOperacional / faturamentoPeriodo) * 100 : 0

    // Meta
    const META_BASE = Number(configMeta?.valor || 0)
    const META_ALVO = isAnual ? META_BASE * 12 : META_BASE

    const progresso = META_ALVO > 0 ? Math.min((lucroOperacional / META_ALVO) * 100, 100) : 0
    const falta = Math.max(0, META_ALVO - lucroOperacional)

    const ehMesAtual =
      !isAnual &&
      hoje.getMonth() + 1 === mes &&
      hoje.getFullYear() === ano

    let ritmo = 0
    if (ehMesAtual && falta > 0) {
      const ultimoDia = fimPeriodo.getDate()
      const hojeDia = hoje.getDate()
      const diasRestantes = Math.max(1, ultimoDia - hojeDia)
      ritmo = falta / diasRestantes
    }

    // Estoque parado
    let custoParado = 0
    let vendaParado = 0
    let qtdParados = 0

    estoqueAtivo.forEach(p => {
      const ultimaVenda = p.movimentacoes[0]?.createdAt || p.createdAt
      if (new Date(ultimaVenda) < dataCorteParado) {
        custoParado += Number(p.custo || 0) * p.quantidade
        vendaParado += Number(p.preco || 0) * p.quantidade
        qtdParados++
      }
    })

    // Oportunidades
    const giro: Record<string, number> = {}
    vendasPeriodo.forEach(v => {
      giro[v.pecaId] = (giro[v.pecaId] || 0) + v.quantidade
    })

    const oportunidades = estoqueAtivo
      .map(p => {
        const preco = Number(p.preco || 0)
        const custo = Number(p.custo || 0)
        const lucroUnit = preco - custo
        const margem = preco > 0 ? (lucroUnit / preco) * 100 : 0

        return {
          id: p.id,
          nome: p.nome,
          modelo: p.modelo,
          estoque: p.quantidade,
          lucroUnit,
          lucroPotencial: lucroUnit * p.quantidade,
          margem,
          vendasRecentes: giro[p.id] || 0
        }
      })
      .filter(p => p.margem > 30 && (p.vendasRecentes > 0 || p.margem > 50))
      .sort((a, b) => b.lucroPotencial - a.lucroPotencial)
      .slice(0, 5)

    return {
      saldoCaixa,
      receitaTotal,
      despesaTotal,

      periodo: { tipo: isAnual ? 'anual' : 'mensal', mes, ano },

      meta: {
        alvo: META_ALVO,
        atual: lucroOperacional,
        progresso,
        falta,
        ritmo,
        ehMesAtual
      },

      parados: {
        qtd: qtdParados,
        custoTotal: custoParado,
        vendaTotal: vendaParado
      },

      oportunidades,

      extrato: {
        movimentacoes: movimentacoesPeriodo,
        despesas: despesasPeriodo
      }
    }
  } catch (err) {
    console.error(err)
    throw createError({ statusCode: 500, message: 'Erro interno financeiro.' })
  }
})