import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const hoje = new Date()
    
    // 1. DEFINIÇÃO PRECISA DE DATAS
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    
    // Fim do mês (último milissegundo)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    fimMes.setHours(23, 59, 59, 999)

    // Data de corte para "Estoque Parado" (90 dias atrás)
    const dataCorteParado = new Date()
    dataCorteParado.setDate(dataCorteParado.getDate() - 90)

    // 2. CARREGAMENTO DE DADOS EM PARALELO (Performance)
    const [todasVendas, todasDespesas, vendasMes, estoqueAtivo, configMeta] = await Promise.all([
      // A. Histórico Total de Vendas (para Saldo em Caixa)
      prisma.historicoMovimentacao.findMany({
        where: { tipo: 'SAIDA' },
        select: { 
          quantidade: true, 
          peca: { select: { preco: true } } 
        }
      }),
      
      // B. Histórico Total de Despesas (para Saldo em Caixa)
      prisma.despesa.findMany({
        select: { valor: true }
      }),

      // C. Vendas do Mês Atual (para DRE/Lucro e Ritmo)
      prisma.historicoMovimentacao.findMany({
        where: { 
          tipo: 'SAIDA',
          createdAt: { gte: inicioMes, lte: fimMes }
        },
        include: {
          peca: { select: { id: true, nome: true, preco: true, custo: true } }
        }
      }),

      // D. Estoque Atual (para Oportunidades e Parados)
      prisma.peca.findMany({
        where: { ativo: true, quantidade: { gt: 0 } },
        include: {
          // Busca a última SAÍDA para saber se o item está encalhado de verdade
          movimentacoes: { 
            where: { tipo: 'SAIDA' },
            take: 1, 
            orderBy: { createdAt: 'desc' } 
          }
        }
      }),

      // E. Meta Mensal (Do Banco de Dados)
      prisma.configuracao.findUnique({
        where: { chave: 'META_MENSAL' }
      })
    ])

    // --- CÁLCULO 1: SALDO EM CAIXA (Regra de Ouro) ---
    // Nota: Considera que compras de estoque são lançadas como Despesa ('COMPRA DE LOTE')
    const receitaTotal = todasVendas.reduce((acc, mov) => acc + (Number(mov.peca?.preco || 0) * mov.quantidade), 0)
    const despesaTotal = todasDespesas.reduce((acc, desp) => acc + Number(desp.valor || 0), 0)
    
    const saldoCaixa = receitaTotal - despesaTotal

    // --- CÁLCULO 2: RESULTADO DO MÊS (Saúde Operacional) ---
    const faturamentoMes = vendasMes.reduce((acc, mov) => acc + (Number(mov.peca?.preco || 0) * mov.quantidade), 0)
    
    // CMV (Custo da Mercadoria Vendida)
    const custoProdutosMes = vendasMes.reduce((acc, mov: any) => {
      // Prioriza o custo gravado no histórico (snapshot), senão usa o atual da peça
      const custoUnitario = mov.custo ? Number(mov.custo) : Number(mov.peca?.custo || 0)
      return acc + (custoUnitario * mov.quantidade)
    }, 0)

    const lucroOperacional = faturamentoMes - custoProdutosMes
    const margem = faturamentoMes > 0 ? (lucroOperacional / faturamentoMes) * 100 : 0

    // --- CÁLCULO 3: META MENSAL DINÂMICA ---
    const META_LUCRO = configMeta?.valor ? Number(configMeta.valor) : 10000 // Padrão 10k se não configurado
    const progressoMeta = META_LUCRO > 0 ? Math.min((lucroOperacional / META_LUCRO) * 100, 100) : 0
    
    // Ritmo Diário
    const ultimoDiaMes = fimMes.getDate() // Ex: 30 ou 31
    const diaHoje = hoje.getDate()
    const diasRestantes = Math.max(1, ultimoDiaMes - diaHoje) // Evita divisão por zero
    
    const faltaParaMeta = Math.max(0, META_LUCRO - lucroOperacional)
    const ritmoDiario = faltaParaMeta > 0 ? (faltaParaMeta / diasRestantes) : 0

    // --- CÁLCULO 4: ESTOQUE PARADO (> 90 dias sem saída) ---
    let dinheiroCongeladoCusto = 0
    let dinheiroCongeladoVenda = 0
    let qtdItensParados = 0

    const itensParados = estoqueAtivo.filter(peca => {
      // Se tiver saída, usa a data da última saída. Se nunca saiu, usa a data de criação (entrada).
      const dataUltimaAtividade = peca.movimentacoes[0]?.createdAt || peca.createdAt
      return new Date(dataUltimaAtividade) < dataCorteParado
    })

    itensParados.forEach(p => {
      dinheiroCongeladoCusto += Number(p.custo || 0) * p.quantidade
      dinheiroCongeladoVenda += Number(p.preco) * p.quantidade
      qtdItensParados++
    })

    // --- CÁLCULO 5: OPORTUNIDADES (Prioritários) ---
    // Mapeia o giro do mês atual para saber o que está "quente"
    const giroPorPeca: Record<string, number> = {}
    vendasMes.forEach(v => {
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
        
        // 🚨 CORREÇÃO CRÍTICA: Cálculo do Lucro Potencial Total (Unitário * Estoque)
        const lucroPotencial = lucroUnit * p.quantidade

        return {
          id: p.id,
          nome: p.nome,
          modelo: p.modelo,
          estoque: p.quantidade,
          preco,
          custo,
          lucroUnit,
          lucroPotencial, // Novo campo essencial para ordenação
          margem: margemItem,
          vendasRecentes
        }
      })
      // Critério: Margem boa (>30%) E (Vendeu este mês OU Margem muito alta > 50%)
      .filter(p => p.margem > 30 && (p.vendasRecentes > 0 || p.margem > 50))
      // Ordena por Lucro Potencial (Quem coloca mais dinheiro no bolso se vender tudo)
      .sort((a, b) => b.lucroPotencial - a.lucroPotencial) 
      .slice(0, 5) // Top 5

    // Retorno final estruturado
    return {
      saldoCaixa,
      receitaTotal,
      despesaTotal,
      
      meta: {
        alvo: META_LUCRO,
        atual: lucroOperacional,
        progresso: progressoMeta,
        falta: faltaParaMeta,
        ritmo: ritmoDiario
      },

      parados: {
        qtd: qtdItensParados,
        custoTotal: dinheiroCongeladoCusto,
        vendaTotal: dinheiroCongeladoVenda
      },

      oportunidades
    }

  } catch (error: any) {
    console.error('Erro na API Financeira:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao processar indicadores: ' + (error.message || 'Erro interno')
    })
  }
})