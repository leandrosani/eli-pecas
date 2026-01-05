import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const hoje = new Date()
    // Define o intervalo do mês atual
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    fimMes.setHours(23, 59, 59, 999)

    // Data de corte para considerar "Estoque Parado" (90 dias atrás)
    const dataCorteParado = new Date()
    dataCorteParado.setDate(dataCorteParado.getDate() - 90)

    // 1. CARREGAR DADOS (Otimizado com Promise.all)
    const [todasVendas, todasDespesas, vendasMes, estoqueAtivo] = await Promise.all([
      // A. Histórico total de Vendas (para Saldo em Caixa)
      prisma.historicoMovimentacao.findMany({
        where: { tipo: 'SAIDA' },
        select: {
          quantidade: true,
          peca: { select: { preco: true } }
        }
      }),
      
      // B. Histórico total de Despesas (para Saldo em Caixa)
      prisma.despesa.findMany({
        select: { valor: true }
      }),

      // C. Vendas do Mês Atual (para Meta e Lucro)
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
          // Precisamos da última movimentação para saber se está parado
          movimentacoes: { 
            take: 1, 
            orderBy: { createdAt: 'desc' } 
          }
        }
      })
    ])

    // --- CÁLCULO 1: SALDO EM CAIXA (O que tenho na mão) ---
    const receitaTotal = todasVendas.reduce((acc, mov) => acc + (Number(mov.peca?.preco || 0) * mov.quantidade), 0)
    const despesaTotal = todasDespesas.reduce((acc, desp) => acc + Number(desp.valor || 0), 0)
    const saldoCaixa = receitaTotal - despesaTotal

    // --- CÁLCULO 2: RESULTADO DO MÊS (Lucro Operacional) ---
    const faturamentoMes = vendasMes.reduce((acc, mov) => acc + (Number(mov.peca?.preco || 0) * mov.quantidade), 0)
    
    // Custo das Mercadorias Vendidas (CMV)
    const custoProdutosMes = vendasMes.reduce((acc, mov: any) => {
      // Tenta pegar o custo histórico (mov.custo), senão usa o atual (peca.custo)
      const custoUnitario = mov.custo ? Number(mov.custo) : Number(mov.peca?.custo || 0)
      return acc + (custoUnitario * mov.quantidade)
    }, 0)

    const lucroOperacional = faturamentoMes - custoProdutosMes

    // --- CÁLCULO 3: META MENSAL ---
    const META_LUCRO = 10000 // Podes ajustar este valor fixo ou criar uma tabela de metas
    const progressoMeta = Math.min((lucroOperacional / META_LUCRO) * 100, 100)

    // --- CÁLCULO 4: ESTOQUE PARADO (> 90 dias) ---
    let dinheiroCongeladoCusto = 0
    let dinheiroCongeladoVenda = 0
    let qtdItensParados = 0

    const itensParados = estoqueAtivo.filter(peca => {
      // Se não tem movimentação, usa a data de criação
      const dataUltimaMov = peca.movimentacoes[0]?.createdAt || peca.createdAt
      return new Date(dataUltimaMov) < dataCorteParado
    })

    itensParados.forEach(p => {
      dinheiroCongeladoCusto += Number(p.custo || 0) * p.quantidade
      dinheiroCongeladoVenda += Number(p.preco) * p.quantidade
      qtdItensParados++
    })

    // --- CÁLCULO 5: OPORTUNIDADES (Prioritários) ---
    // Regra: Margem > 30% E (Tem Giro Recente OU Margem > 50%)
    
    // Mapeia giro do mês para cruzar dados
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
        const margem = preco > 0 ? (lucroUnit / preco) * 100 : 0

        return {
          id: p.id,
          nome: p.nome,
          modelo: p.modelo,
          estoque: p.quantidade,
          preco,
          custo,
          lucroUnit,
          margem,
          vendasRecentes
        }
      })
      // Filtra apenas o "filé mignon" do estoque
      .filter(p => p.margem > 30 && (p.vendasRecentes > 0 || p.margem > 50))
      .sort((a, b) => b.lucroUnit - a.lucroUnit) // Ordena pelo maior lucro em R$
      .slice(0, 5) // Top 5

    // Retorno estruturado para o Frontend
    return {
      saldoCaixa,
      receitaTotal,
      despesaTotal,
      
      meta: {
        alvo: META_LUCRO,
        atual: lucroOperacional,
        progresso: progressoMeta
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
      message: 'Erro ao calcular indicadores financeiros: ' + (error.message || 'Erro interno')
    })
  }
})