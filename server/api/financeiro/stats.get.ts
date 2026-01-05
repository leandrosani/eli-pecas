import { defineEventHandler, getQuery, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const hoje = new Date()
    
    // AJUSTE 1: Tratamento robusto de Mês/Ano
    let ano = Number(query.ano) || hoje.getFullYear()
    // Se mes vier como "0" (do frontend filtro anual), tratamos como 0. Se vier vazio, assume mês atual.
    let mes = query.mes !== undefined ? Number(query.mes) : (hoje.getMonth() + 1)
    
    const isAnual = mes === 0

    let inicioPeriodo: Date
    let fimPeriodo: Date

    if (isAnual) {
      // Ano inteiro (01/Jan a 31/Dez)
      inicioPeriodo = new Date(ano, 0, 1)
      fimPeriodo = new Date(ano, 11, 31, 23, 59, 59, 999)
    } else {
      // Mês específico
      inicioPeriodo = new Date(ano, mes - 1, 1)
      // Último dia do mês
      fimPeriodo = new Date(ano, mes, 0)
      fimPeriodo.setHours(23, 59, 59, 999)
    }

    const dataCorteParado = new Date()
    dataCorteParado.setDate(dataCorteParado.getDate() - 90)

    // 2. CARREGAR DADOS
    const [
      todasVendas, 
      todasDespesas, 
      movimentacoesPeriodo, 
      despesasPeriodo,      
      estoqueAtivo, 
      configMeta
    ] = await Promise.all([
      // A. Histórico GLOBAL (para Saldo em Caixa Acumulado - Sempre total)
      prisma.historicoMovimentacao.findMany({
        where: { tipo: 'SAIDA' },
        select: { 
          quantidade: true, 
          peca: { select: { preco: true } } 
        }
      }),
      // B. Despesas Totais
      prisma.despesa.findMany({ select: { valor: true } }),

      // C. Movimentações do PERÍODO SELECIONADO (Mês ou Ano)
      prisma.historicoMovimentacao.findMany({
        where: { createdAt: { gte: inicioPeriodo, lte: fimPeriodo } },
        include: {
          peca: { select: { id: true, nome: true, modelo: true, marca: true, preco: true, custo: true, lado: true, ano: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // D. Despesas do PERÍODO SELECIONADO
      prisma.despesa.findMany({
        where: { data: { gte: inicioPeriodo, lte: fimPeriodo } },
        orderBy: { data: 'desc' }
      }),

      // E. Estoque Atual (Sempre atual para parados/oportunidades)
      prisma.peca.findMany({
        where: { ativo: true, quantidade: { gt: 0 } },
        include: {
          movimentacoes: { where: { tipo: 'SAIDA' }, take: 1, orderBy: { createdAt: 'desc' } }
        }
      }),

      // F. Meta
      prisma.configuracao.findUnique({ where: { chave: 'META_MENSAL' } })
    ])

    // --- CÁLCULO 1: SALDO EM CAIXA (AJUSTE 3: Correção Conceitual) ---
    // Regra: Caixa = Dinheiro que entrou - Dinheiro que saiu.
    // Não subtraímos o custo da peça vendida aqui porque a compra do estoque já foi lançada como Despesa.
    const receitaTotalGlobal = todasVendas.reduce((acc, mov) => acc + (Number(mov.peca?.preco || 0) * mov.quantidade), 0)
    const despesaTotalGlobal = todasDespesas.reduce((acc, desp) => acc + Number(desp.valor || 0), 0)
    
    const saldoCaixa = receitaTotalGlobal - despesaTotalGlobal

    // --- CÁLCULO 2: RESULTADO DO PERÍODO (DRE / Competência) ---
    const vendasPeriodo = movimentacoesPeriodo.filter(m => m.tipo === 'SAIDA')
    
    const faturamentoPeriodo = vendasPeriodo.reduce((acc, mov) => acc + (Number(mov.peca?.preco || 0) * mov.quantidade), 0)
    
    // CMV (Custo da Mercadoria Vendida) - Usado para calcular Lucro Operacional
    const custoProdutosPeriodo = vendasPeriodo.reduce((acc, mov: any) => {
      const custoUnitario = mov.custo ? Number(mov.custo) : Number(mov.peca?.custo || 0)
      return acc + (custoUnitario * mov.quantidade)
    }, 0)

    const lucroOperacional = faturamentoPeriodo - custoProdutosPeriodo
    const margem = faturamentoPeriodo > 0 ? (lucroOperacional / faturamentoPeriodo) * 100 : 0

    // --- CÁLCULO 3: META E RITMO (AJUSTE 2: Meta Mensal vs Anual) ---
    const META_BASE = configMeta?.valor ? Number(configMeta.valor) : 0
    
    // Se for relatório anual, projetamos a meta mensal x12 para ter uma base de comparação
    const META_ALVO = isAnual ? META_BASE * 12 : META_BASE

    const progressoMeta = META_ALVO > 0 
      ? Math.min((lucroOperacional / META_ALVO) * 100, 100) 
      : 0
    
    // Ritmo só faz sentido se for o mês atual específico (não anual)
    const ehMesAtual = !isAnual && (hoje.getMonth() + 1 === mes && hoje.getFullYear() === ano)
    let ritmoDiario = 0
    const faltaParaMeta = META_ALVO > 0 ? Math.max(0, META_ALVO - lucroOperacional) : 0
    
    if (ehMesAtual && META_ALVO > 0 && faltaParaMeta > 0) {
      const ultimoDiaMes = fimPeriodo.getDate()
      const diaHoje = hoje.getDate()
      const diasRestantes = Math.max(1, ultimoDiaMes - diaHoje)
      ritmoDiario = faltaParaMeta / diasRestantes
    }

    // --- CÁLCULO 4: ESTOQUE PARADO ---
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

    // --- CÁLCULO 5: OPORTUNIDADES (Com Lucro Potencial Total) ---
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
        
        // AJUSTE: Retornando Lucro Potencial Total (Unitário * Estoque)
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
      .filter(p => p.margem > 30 && (p.vendasRecentes > 0 || p.margem > 50))
      .sort((a, b) => b.lucroPotencial - a.lucroPotencial) 
      .slice(0, 5)

    return {
      saldoCaixa,
      receitaTotal: receitaTotalGlobal,
      despesaTotal: despesaTotalGlobal,
      
      periodo: {
        tipo: isAnual ? 'anual' : 'mensal',
        mes,
        ano
      },

      meta: {
        alvo: META_ALVO,
        atual: lucroOperacional,
        progresso: progressoMeta,
        falta: faltaParaMeta,
        ritmo: ritmoDiario,
        ehMesAtual
      },

      parados: {
        qtd: qtdItensParados,
        custoTotal: dinheiroCongeladoCusto,
        vendaTotal: vendaTotalParados
      },

      oportunidades,

      // AJUSTE 4: Retornando dados brutos para o front montar as tabelas
      extrato: {
        movimentacoes: movimentacoesPeriodo,
        despesas: despesasPeriodo
      }
    }

  } catch (error: any) {
    console.error('Erro API Financeira:', error)
    throw createError({ statusCode: 500, message: 'Erro interno.' })
  }
})