import { defineEventHandler, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const hoje = new Date()
    // Datas para filtro do mês atual
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
    fimMes.setHours(23, 59, 59, 999)

    // 1. CARREGAR DADOS (Histórico e Mês Atual)
    const [todasVendas, todasDespesas, vendasMes] = await Promise.all([
      // A. Todas as vendas da história (para Saldo em Caixa)
      prisma.historicoMovimentacao.findMany({
        where: { tipo: 'SAIDA' },
        select: {
          quantidade: true,
          pecaId: true,
          peca: {
            select: { preco: true, nome: true }
          }
        }
      }),
      
      // B. Todas as despesas da história
      prisma.despesa.findMany({
        select: { valor: true }
      }),

      // C. Vendas só deste mês (para DRE/Lucro e Alertas)
      prisma.historicoMovimentacao.findMany({
        where: { 
          tipo: 'SAIDA',
          createdAt: { gte: inicioMes, lte: fimMes }
        },
        include: {
          peca: {
            select: { nome: true, preco: true, custo: true }
          }
        }
      })
    ])

    // 2. CÁLCULO DO SALDO EM CAIXA (GLOBAL)
    const receitaTotal = todasVendas.reduce((acc, mov) => {
      const preco = Number(mov.peca?.preco || 0)
      return acc + (preco * mov.quantidade)
    }, 0)

    const despesaTotal = todasDespesas.reduce((acc, desp) => {
      return acc + Number(desp.valor || 0)
    }, 0)

    const saldoCaixa = receitaTotal - despesaTotal

    // 3. INDICADORES DO MÊS (Saúde Operacional)
    const faturamentoMes = vendasMes.reduce((acc, mov) => {
      const preco = Number(mov.peca?.preco || 0)
      return acc + (preco * mov.quantidade)
    }, 0)
    
    // Custo das Mercadorias Vendidas (CMV) no Mês
    const custoProdutosMes = vendasMes.reduce((acc, mov: any) => {
      // Prioriza o custo gravado no histórico (se existir), senão usa o da peça
      // Nota: mov.custo pode vir null se for venda antiga
      const custoUnitario = mov.custo ? Number(mov.custo) : Number(mov.peca?.custo || 0)
      return acc + (custoUnitario * mov.quantidade)
    }, 0)

    const lucroOperacional = faturamentoMes - custoProdutosMes
    const margem = faturamentoMes > 0 ? (lucroOperacional / faturamentoMes) * 100 : 0

    // 4. CURVA ABC (Top Produtos - Histórico)
    // Agrupa vendas por produto para ver quem fatura mais
    const vendasPorPeca: Record<string, { nome: string, total: number, qtd: number }> = {}

    todasVendas.forEach(mov => {
      if (!mov.peca) return
      const id = mov.pecaId
      if (!vendasPorPeca[id]) {
        vendasPorPeca[id] = { nome: mov.peca.nome, total: 0, qtd: 0 }
      }
      vendasPorPeca[id].total += Number(mov.peca.preco) * mov.quantidade
      vendasPorPeca[id].qtd += mov.quantidade
    })

    const topProdutos = Object.values(vendasPorPeca)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5) // Top 5

    // 5. ALERTAS DE PREJUÍZO (Itens com margem < 20% no mês)
    const alertasPrejuizo = vendasMes
      .map((mov: any) => {
        if (!mov.peca) return null
        
        const venda = Number(mov.peca.preco)
        // Usa any para contornar erro de tipagem caso o prisma client não tenha atualizado ainda
        const custo = mov.custo ? Number(mov.custo) : Number(mov.peca.custo || 0)
        
        const lucroItem = venda - custo
        const margemItem = venda > 0 ? (lucroItem / venda) * 100 : 0
        
        return {
          peca: mov.peca.nome,
          venda,
          custo,
          margem: margemItem,
          data: mov.createdAt
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null && item.margem < 20)
      .slice(0, 5)

    return {
      saldoCaixa,
      receitaTotal,
      despesaTotal,
      mes: {
        faturamento: faturamentoMes,
        custoProdutos: custoProdutosMes,
        lucroOperacional,
        margem
      },
      topProdutos,
      alertasPrejuizo
    }

  } catch (error: any) {
    console.error('Erro na API Financeira:', error)
    throw createError({
      statusCode: 500,
      message: 'Erro ao processar dados financeiros: ' + (error.message || 'Erro interno')
    })
  }
})