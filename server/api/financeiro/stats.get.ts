import { defineEventHandler, getQuery, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const hoje = new Date()

    // Tratamento de Data
    let ano = Number(query.ano) || hoje.getFullYear()
    let mes = query.mes !== undefined ? Number(query.mes) : (hoje.getMonth() + 1)
    const isAnual = mes === 0

    let inicioPeriodo: Date
    let fimPeriodo: Date

    if (isAnual) {
      inicioPeriodo = new Date(ano, 0, 1)
      fimPeriodo = new Date(ano, 11, 31, 23, 59, 59, 999)
    } else {
      inicioPeriodo = new Date(ano, mes - 1, 1)
      fimPeriodo = new Date(ano, mes, 0)
      fimPeriodo.setHours(23, 59, 59, 999)
    }

    const dataCorteParado = new Date()
    dataCorteParado.setDate(dataCorteParado.getDate() - 90)

    // --- CARREGAMENTO OTIMIZADO ---
    const [
      todasVendas,
      sumDespesasGlobal,
      movimentacoesPeriodo,
      despesasPeriodo,
      estoqueAtivo,
      configMeta,
      todasPecas // <--- G. Traz todas as peças ativas
    ] = await Promise.all([
      // A. Vendas Globais
      prisma.historicoMovimentacao.findMany({
        where: { tipo: 'SAIDA' },
        select: { quantidade: true, precoVenda: true, peca: { select: { preco: true } } } // ✅ Select precoVenda
      }),
      // B. Soma Despesas
      prisma.despesa.aggregate({ _sum: { valor: true } }),

      // C. Movimentações do Período
      prisma.historicoMovimentacao.findMany({
        where: { createdAt: { gte: inicioPeriodo, lte: fimPeriodo } },
        include: { peca: { select: { id: true, nome: true, modelo: true, marca: true, preco: true, custo: true, lado: true, localizacao: true, Link: true, ano: true } } },
        orderBy: { createdAt: 'desc' }
      }),

      // D. Despesas do Período
      prisma.despesa.findMany({
        where: { data: { gte: inicioPeriodo, lte: fimPeriodo } },
        orderBy: { data: 'desc' }
      }),

      // E. Estoque para Parados/Oportunidades
      prisma.peca.findMany({
        where: { ativo: true, quantidade: { gt: 0 } },
        include: {
          // CORREÇÃO: Trazemos a última movimentação de QUALQUER tipo (Entrada ou Saída)
          // Isso garante que se houve entrada de estoque recente, não considere parado.
          movimentacoes: {
            take: 1,
            orderBy: { createdAt: 'desc' }
          }
        }
      }),

      // F. Meta
      prisma.configuracao.findUnique({ where: { chave: 'META_MENSAL' } }),

      // G. Todas as Peças (Para contagem total)
      prisma.peca.findMany({
        where: { ativo: true },
        select: { preco: true, quantidade: true }
      })
    ])

    // --- CÁLCULOS FINANCEIROS ---
    const receitaTotalGlobal = todasVendas.reduce((acc, mov: any) => {
      // ✅ SNAPSHOT FIX
      const precoReal = mov.precoVenda ? Number(mov.precoVenda) : Number(mov.peca?.preco || 0)
      return acc + (precoReal * mov.quantidade)
    }, 0)
    const despesaTotalGlobal = Number(sumDespesasGlobal._sum.valor || 0)
    const saldoCaixa = receitaTotalGlobal - despesaTotalGlobal

    // --- CÁLCULOS DO PERÍODO ---
    const vendasPeriodo = movimentacoesPeriodo.filter(m => m.tipo === 'SAIDA')
    const faturamentoPeriodo = vendasPeriodo.reduce((acc, mov) => {
      // ✅ SNAPSHOT FIX
      const precoReal = mov.precoVenda ? Number(mov.precoVenda) : Number(mov.peca?.preco || 0)
      return acc + (precoReal * mov.quantidade)
    }, 0)
    const custoProdutosPeriodo = vendasPeriodo.reduce((acc, mov: any) => {
      const custoUnitario = mov.custo ? Number(mov.custo) : Number(mov.peca?.custo || 0)
      return acc + (custoUnitario * mov.quantidade)
    }, 0)
    const lucroOperacional = faturamentoPeriodo - custoProdutosPeriodo
    const margem = faturamentoPeriodo > 0 ? (lucroOperacional / faturamentoPeriodo) * 100 : 0

    // --- META ---
    const META_BASE = configMeta?.valor ? Number(configMeta.valor) : 0
    const META_ALVO = isAnual ? META_BASE * 12 : META_BASE
    const progressoMeta = META_ALVO > 0 ? Math.min((lucroOperacional / META_ALVO) * 100, 100) : 0

    const ehMesAtual = !isAnual && (hoje.getMonth() + 1 === mes && hoje.getFullYear() === ano)
    let ritmoDiario = 0
    const faltaParaMeta = META_ALVO > 0 ? Math.max(0, META_ALVO - lucroOperacional) : 0

    if (ehMesAtual && META_ALVO > 0 && faltaParaMeta > 0) {
      const ultimoDiaMes = fimPeriodo.getDate()
      const diaHoje = hoje.getDate()
      const diasRestantes = Math.max(1, ultimoDiaMes - diaHoje)
      ritmoDiario = faltaParaMeta / diasRestantes
    }

    // --- ESTOQUE PARADO ---
    let dinheiroCongeladoCusto = 0
    let qtdItensParados = 0
    let vendaTotalParados = 0

    const itensParados = estoqueAtivo.filter(peca => {
      // CORREÇÃO: Verifica data da última movimentação (qualquer tipo) OU data de criação
      const dataUltimaAtividade = peca.movimentacoes[0]?.createdAt || peca.createdAt
      return new Date(dataUltimaAtividade) < dataCorteParado
    })

    itensParados.forEach(p => {
      dinheiroCongeladoCusto += Number(p.custo || 0) * p.quantidade
      vendaTotalParados += Number(p.preco) * p.quantidade
      qtdItensParados++
    })

    // --- OPORTUNIDADES ---
    const giroPorPeca: Record<string, number> = {}
    vendasPeriodo.forEach(v => { if (!giroPorPeca[v.pecaId]) giroPorPeca[v.pecaId] = 0; giroPorPeca[v.pecaId] += v.quantidade })

    const oportunidades = estoqueAtivo
      .map(p => {
        const vendasRecentes = giroPorPeca[p.id] || 0
        const preco = Number(p.preco)
        const custo = Number(p.custo || 0)
        const lucroUnit = preco - custo
        const margemItem = preco > 0 ? (lucroUnit / preco) * 100 : 0
        const lucroPotencial = lucroUnit * p.quantidade
        return { id: p.id, nome: p.nome, modelo: p.modelo, estoque: p.quantidade, preco, custo, lucroUnit, lucroPotencial, margem: margemItem, vendasRecentes }
      })
      .filter(p => p.margem > 30 && (p.vendasRecentes > 0 || p.margem > 50))
      .sort((a, b) => b.lucroPotencial - a.lucroPotencial)
      .slice(0, 5)

    // --- 6. CÁLCULOS DO PATRIMÔNIO (Correção Final) ---
    // Valor total (Preço Venda * Qtd)
    const valorEstoque = todasPecas.reduce((acc, p) => acc + (Number(p.preco) * p.quantidade), 0)
    // Quantidade Física (Soma das quantidades)
    const itensEstoque = todasPecas.reduce((acc, p) => acc + p.quantidade, 0)
    // Quantidade de Cadastros (Número de SKUs/Linhas)
    const totalCadastros = todasPecas.length

    return {
      saldoCaixa,
      receitaTotal: receitaTotalGlobal,
      despesaTotal: despesaTotalGlobal,

      valorEstoque,
      itensEstoque,   // Qtd física total
      totalCadastros, // Qtd de linhas cadastradas

      periodo: { tipo: isAnual ? 'anual' : 'mensal', mes, ano },
      meta: { alvo: META_ALVO, atual: lucroOperacional, progresso: progressoMeta, falta: faltaParaMeta, ritmo: ritmoDiario, ehMesAtual },
      parados: { qtd: qtdItensParados, custoTotal: dinheiroCongeladoCusto, vendaTotal: vendaTotalParados },
      oportunidades,
      extrato: { movimentacoes: movimentacoesPeriodo, despesas: despesasPeriodo }
    }

  } catch (error: any) {
    console.error('Erro API Financeira:', error)
    throw createError({ statusCode: 500, message: 'Erro interno.' })
  }
})