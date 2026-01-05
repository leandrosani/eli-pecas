import { defineEventHandler, getQuery, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)
    const hoje = new Date()
    
    let mes = Number(query.mes) || (hoje.getMonth() + 1)
    let ano = Number(query.ano) || hoje.getFullYear()

    // 1. AJUSTE DE DATAS (CRÍTICO PARA FECHAMENTO)
    const inicioMes = new Date(ano, mes - 1, 1)
    // Pega o primeiro dia do próximo mês e subtrai 1ms para pegar o último instante deste mês
    const fimMes = new Date(ano, mes, 1)
    fimMes.setMilliseconds(-1)

    const dataCorteParado = new Date()
    dataCorteParado.setDate(dataCorteParado.getDate() - 90)

    // 2. CARREGAR DADOS
    const [
      todasVendas, 
      todasDespesas, 
      movimentacoesMes, 
      despesasMes,      
      estoqueAtivo, 
      configMeta
    ] = await Promise.all([
      // A. Histórico GLOBAL (para Saldo em Caixa Real)
      prisma.historicoMovimentacao.findMany({
        where: { tipo: 'SAIDA' },
        select: { 
          quantidade: true, 
          custo: true, // Custo histórico (snapshot)
          peca: { select: { preco: true, custo: true } } // Custo atual (fallback)
        }
      }),
      prisma.despesa.findMany({ select: { valor: true } }),

      // B. Movimentações do MÊS (DRE)
      prisma.historicoMovimentacao.findMany({
        where: { createdAt: { gte: inicioMes, lte: fimMes } },
        include: {
          peca: { select: { id: true, nome: true, modelo: true, marca: true, preco: true, custo: true, lado: true, ano: true } }
        },
        orderBy: { createdAt: 'desc' }
      }),

      // C. Despesas do MÊS
      prisma.despesa.findMany({
        where: { data: { gte: inicioMes, lte: fimMes } },
        orderBy: { data: 'desc' }
      }),

      // D. Estoque Atual (Com filtro correto de 'SAIDA' para detectar parados)
      prisma.peca.findMany({
        where: { ativo: true, quantidade: { gt: 0 } },
        include: {
          movimentacoes: { 
            where: { tipo: 'SAIDA' }, // Só considera que mexeu se vendeu
            take: 1, 
            orderBy: { createdAt: 'desc' } 
          }
        }
      }),

      // E. Meta
      prisma.configuracao.findUnique({ where: { chave: 'META_MENSAL' } })
    ])

    // --- CÁLCULO 1: SALDO EM CAIXA REAL (CORREÇÃO APLICADA) ---
    // Receita Bruta Total
    const receitaTotalGlobal = todasVendas.reduce((acc, mov) => acc + (Number(mov.peca?.preco || 0) * mov.quantidade), 0)
    
    // Custo Total das Peças Vendidas (Para abater do caixa se não estiver nas despesas, ou para DRE acumulado)
    // Se você lança "Compra de Lote" nas despesas, usar essa linha pode duplicar a saída. 
    // Mas conforme sua solicitação de "Correção Conceitual", vamos calcular o custo vendido:
    const custoTotalVendido = todasVendas.reduce((acc, mov) => {
      const custoUnit = mov.custo ? Number(mov.custo) : Number(mov.peca?.custo || 0)
      return acc + (custoUnit * mov.quantidade)
    }, 0)

    const despesaTotalGlobal = todasDespesas.reduce((acc, desp) => acc + Number(desp.valor || 0), 0)
    
    // Fórmula ajustada conforme solicitado: Receita - Despesas - Custo do que saiu
    // Nota: Isso mostra o "Lucro Líquido Acumulado em Caixa"
    const saldoCaixa = receitaTotalGlobal - despesaTotalGlobal - custoTotalVendido

    // --- CÁLCULO 2: RESULTADO DO MÊS SELECIONADO ---
    const vendasMes = movimentacoesMes.filter(m => m.tipo === 'SAIDA')
    
    const faturamentoMes = vendasMes.reduce((acc, mov) => acc + (Number(mov.peca?.preco || 0) * mov.quantidade), 0)
    
    const custoProdutosMes = vendasMes.reduce((acc, mov: any) => {
      const custoUnitario = mov.custo ? Number(mov.custo) : Number(mov.peca?.custo || 0)
      return acc + (custoUnitario * mov.quantidade)
    }, 0)

    const lucroOperacional = faturamentoMes - custoProdutosMes
    const margem = faturamentoMes > 0 ? (lucroOperacional / faturamentoMes) * 100 : 0

    // --- CÁLCULO 3: META E RITMO (CORREÇÃO DE ZERO) ---
    const META_LUCRO = configMeta?.valor ? Number(configMeta.valor) : 0
    
    // Evita divisão por zero se a meta não estiver definida
    const progressoMeta = META_LUCRO > 0 
      ? Math.min((lucroOperacional / META_LUCRO) * 100, 100) 
      : 0
    
    const ehMesAtual = hoje.getMonth() + 1 === mes && hoje.getFullYear() === ano
    let ritmoDiario = 0
    
    // CORREÇÃO: Calcula falta sempre, independente se é mês atual ou passado
    const faltaParaMeta = META_LUCRO > 0 ? Math.max(0, META_LUCRO - lucroOperacional) : 0
    
    // O Ritmo só faz sentido se for mês atual e ainda faltar algo
    if (ehMesAtual && META_LUCRO > 0 && faltaParaMeta > 0) {
      const ultimoDiaMes = fimMes.getDate()
      const diaHoje = hoje.getDate()
      const diasRestantes = Math.max(1, ultimoDiaMes - diaHoje)
      
      ritmoDiario = faltaParaMeta / diasRestantes
    }

    // --- CÁLCULO 4: ESTOQUE PARADO ---
    let dinheiroCongeladoCusto = 0
    let qtdItensParados = 0
    let vendaTotalParados = 0

    const itensParados = estoqueAtivo.filter(peca => {
      // Se nunca teve SAÍDA, considera a data de criação (entrada no sistema)
      const dataUltimaAtividade = peca.movimentacoes[0]?.createdAt || peca.createdAt
      return new Date(dataUltimaAtividade) < dataCorteParado
    })

    itensParados.forEach(p => {
      dinheiroCongeladoCusto += Number(p.custo || 0) * p.quantidade
      vendaTotalParados += Number(p.preco) * p.quantidade
      qtdItensParados++
    })

    // --- CÁLCULO 5: OPORTUNIDADES ---
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
        
        // CORREÇÃO: Adicionado lucroPotencial para o frontend não quebrar
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
      
      meta: {
        alvo: META_LUCRO,
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

      extrato: {
        movimentacoes: movimentacoesMes,
        despesas: despesasMes
      }
    }

  } catch (error: any) {
    console.error('Erro API Financeira:', error)
    throw createError({ statusCode: 500, message: 'Erro interno.' })
  }
})