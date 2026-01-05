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
      sumDespesasGlobal, // Agora pegamos só a soma do banco
      movimentacoesPeriodo, 
      despesasPeriodo,       
      estoqueAtivo, 
      configMeta,
      todasPecas // <--- G. Adicionado para cálculo do Patrimônio
    ] = await Promise.all([
      // A. Vendas Globais (Mantido findMany pois preço está na relação, mas otimizado select)
      prisma.historicoMovimentacao.findMany({
        where: { tipo: 'SAIDA' },
        select: { 
          quantidade: true, 
          peca: { select: { preco: true } } 
        }
      }),
      // B. Soma Despesas Globais (OTIMIZADO: O banco soma pra gente)
      prisma.despesa.aggregate({
        _sum: { valor: true }
      }),

      // C. Movimentações do Período
      prisma.historicoMovimentacao.findMany({
        where: { createdAt: { gte: inicioPeriodo, lte: fimPeriodo } },
        include: {
          peca: { select: { id: true, nome: true, modelo: true, marca: true, preco: true, custo: true, lado: true, ano: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // D. Despesas do Período
      prisma.despesa.findMany({
        where: { data: { gte: inicioPeriodo, lte: fimPeriodo } },
        orderBy: { data: 'desc' }
      }),

      // E. Estoque (Itens com movimentação para cálculo de parados/oportunidades)
      prisma.peca.findMany({
        where: { ativo: true, quantidade: { gt: 0 } },
        include: {
          movimentacoes: { where: { tipo: 'SAIDA' }, take: 1, orderBy: { createdAt: 'desc' } }
        }
      }),

      // F. Meta
      prisma.configuracao.findUnique({ where: { chave: 'META_MENSAL' } }),

      // G. Todas as Peças Ativas (Novo: Para cálculo de Estoque Total e Patrimônio)
      prisma.peca.findMany({ where: { ativo: true } })
    ])

    // --- 1. SALDO EM CAIXA UNIVERSAL ---
    const receitaTotalGlobal = todasVendas.reduce((acc, mov) => acc + (Number(mov.peca?.preco || 0) * mov.quantidade), 0)
    // Pega a soma direta do aggregate. Se for null (banco vazio), usa 0.
    const despesaTotalGlobal = Number(sumDespesasGlobal._sum.valor || 0)
    
    const saldoCaixa = receitaTotalGlobal - despesaTotalGlobal

    // --- 2. RESULTADO DO PERÍODO (LUCRO) ---
    const vendasPeriodo = movimentacoesPeriodo.filter(m => m.tipo === 'SAIDA')
    
    const faturamentoPeriodo = vendasPeriodo.reduce((acc, mov) => acc + (Number(mov.peca?.preco || 0) * mov.quantidade), 0)
    
    // Lucro considera o Custo Histórico (se existir) ou o Custo Atual da peça
    const custoProdutosPeriodo = vendasPeriodo.reduce((acc, mov: any) => {
      // Prioridade: Custo gravado no histórico > Custo atual da peça > 0
      const custoUnitario = mov.custo ? Number(mov.custo) : Number(mov.peca?.custo || 0)
      return acc + (custoUnitario * mov.quantidade)
    }, 0)

    const lucroOperacional = faturamentoPeriodo - custoProdutosPeriodo
    const margem = faturamentoPeriodo > 0 ? (lucroOperacional / faturamentoPeriodo) * 100 : 0

    // --- 3. META ---
    const META_BASE = configMeta?.valor ? Number(configMeta.valor) : 0
    const META_ALVO = isAnual ? META_BASE * 12 : META_BASE

    const progressoMeta = META_ALVO > 0 
      ? Math.min((lucroOperacional / META_ALVO) * 100, 100) 
      : 0
    
    const ehMesAtual = !isAnual && (hoje.getMonth() + 1 === mes && hoje.getFullYear() === ano)
    let ritmoDiario = 0
    const faltaParaMeta = META_ALVO > 0 ? Math.max(0, META_ALVO - lucroOperacional) : 0
    
    if (ehMesAtual && META_ALVO > 0 && faltaParaMeta > 0) {
      const ultimoDiaMes = fimPeriodo.getDate()
      const diaHoje = hoje.getDate()
      const diasRestantes = Math.max(1, ultimoDiaMes - diaHoje)
      ritmoDiario = faltaParaMeta / diasRestantes
    }

    // --- 4. ESTOQUE PARADO ---
    let dinheiroCongeladoCusto = 0
    let qtdItensParados = 0
    let vendaTotalParados = 0

    const itensParados = estoqueAtivo.filter(peca => {
      const dataUltimaAtividade = peca.movimentacoes[0]?.createdAt || peca.createdAt
      return new Date(dataUltimaAtividade) < dataCorteParado
    })

    itensParados.forEach(p => {
      dinheiroCongeladoCusto += Number(p.custo || 0) * p.quantidade
      vendaTotalParados += Number(p.preco) * p.quantidade
      qtdItensParados++
    })

    // --- 5. OPORTUNIDADES ---
    const giroPorPeca: Record<string, number> = {}
    vendasPeriodo.forEach(v => {
      if (!giroPorPeca[v.pecaId]) giroPorPeca[v.pecaId] = 0
      giroPorPeca[v.pecaId] += v.quantidade
    })

    const oportunidades = estoqueAtivo
      .map(p => {
        const vendasRecentes = giroPorPeca[p.id] || 0
        const preco = Number(p.preco)
        const custo = Number(p.custo || 0)
        const lucroUnit = preco - custo
        const margemItem = preco > 0 ? (lucroUnit / preco) * 100 : 0
        const lucroPotencial = lucroUnit * p.quantidade

        return {
          id: p.id,
          nome: p.nome,
          modelo: p.modelo,
          estoque: p.quantidade,
          preco,
          custo,
          lucroUnit,
          lucroPotencial, 
          margem: margemItem,
          vendasRecentes
        }
      })
      // Filtro: Margem boa (>30%) E (teve venda recente OU a margem é excelente >50%)
      .filter(p => p.margem > 30 && (p.vendasRecentes > 0 || p.margem > 50))
      .sort((a, b) => b.lucroPotencial - a.lucroPotencial) 
      .slice(0, 10) // Aumentei para Top 10

    // --- 6. CÁLCULOS DO PATRIMÔNIO (Adicionado) ---
    // Usando todasPecas (que carregamos no Promise.all 'G')
    // Nota: Estamos usando Preço * Qtd conforme sua outra API, mas para contabilidade geralmente se usa Custo.
    const valorEstoque = todasPecas.reduce((acc, p) => acc + (Number(p.preco) * p.quantidade), 0)
    const itensEstoque = todasPecas.reduce((acc, p) => acc + p.quantidade, 0)

    return {
      saldoCaixa,
      receitaTotal: receitaTotalGlobal,
      despesaTotal: despesaTotalGlobal,
      
      // Novos campos adicionados:
      valorEstoque,
      itensEstoque,
      
      periodo: { tipo: isAnual ? 'anual' : 'mensal', mes, ano },
      meta: { alvo: META_ALVO, atual: lucroOperacional, progresso: progressoMeta, falta: faltaParaMeta, ritmo: ritmoDiario, ehMesAtual },
      parados: { qtd: qtdItensParados, custoTotal: dinheiroCongeladoCusto, vendaTotal: vendaTotalParados },
      oportunidades,
      extrato: { movimentacoes: movimentacoesPeriodo, despesas: despesasPeriodo }
    }

  } catch (error: any) {
    console.error('Erro API Financeira:', error)
    throw createError({ statusCode: 500, message: 'Erro interno no cálculo financeiro.' })
  }
})