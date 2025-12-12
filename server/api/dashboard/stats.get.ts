import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  
  const hoje = new Date()
  const mes = query.mes ? parseInt(query.mes as string) : (hoje.getMonth() + 1)
  const ano = query.ano ? parseInt(query.ano as string) : hoje.getFullYear()

  const dataInicio = new Date(ano, mes - 1, 1)
  const dataFim = new Date(ano, mes, 0, 23, 59, 59)

  // 1. Estoque Geral
  const todasPecas = await prisma.peca.findMany({ where: { ativo: true } })
  const valorEstoque = todasPecas.reduce((acc, p) => acc + (Number(p.preco) * p.quantidade), 0)
  const itensEstoque = todasPecas.reduce((acc, p) => acc + p.quantidade, 0)
  
  const estoqueBaixo = todasPecas
    .filter(p => p.quantidade <= 3)
    .sort((a, b) => a.quantidade - b.quantidade)
    .slice(0, 5)
    .map(p => ({ id: p.id, nome: p.nome, quantidade: p.quantidade, modelo: p.modelo, lado: p.lado }))

  // 2. Movimentações
  const historicoMes = await prisma.historicoMovimentacao.findMany({
    where: { createdAt: { gte: dataInicio, lte: dataFim } },
    include: { peca: true },
    orderBy: { createdAt: 'desc' }
  })

  // 3. Despesas
  const despesasMes = await prisma.despesa.findMany({
    where: { data: { gte: dataInicio, lte: dataFim } },
    orderBy: { data: 'desc' }
  })

  // 4. Cálculos
  const vendas = historicoMes.filter(h => h.tipo === 'SAIDA')
  const faturamentoMes = vendas.reduce((acc, h) => acc + (Number(h.peca.preco) * h.quantidade), 0)
  const totalDespesas = despesasMes.reduce((acc, d) => acc + Number(d.valor), 0)
  const balancoLiquido = faturamentoMes - totalDespesas
  const vendasCount = vendas.length
  const ticketMedio = vendasCount > 0 ? faturamentoMes / vendasCount : 0
  const despesasCount = despesasMes.length

  // 5. Ranking de Vendas (ATUALIZADO COM ANO E MARCA/LADO)
  // Adicionei 'ano' e 'marca' na tipagem e no objeto
  const rankingVendas: Record<string, { nome: string, marca: string, ano: string, modelo: string, lado: string | null, qtd: number, total: number }> = {}
  
  vendas.forEach(venda => {
    const id = venda.pecaId
    if (!rankingVendas[id]) {
      rankingVendas[id] = { 
        nome: venda.peca.nome,
        modelo: venda.peca.modelo,
        lado: venda.peca.lado,
        marca: venda.peca.marca, // No seu sistema, isso é o Lado
        ano: venda.peca.ano,     // Ano do carro
        qtd: 0, 
        total: 0 
      }
    }
    rankingVendas[id].qtd += venda.quantidade
    rankingVendas[id].total += Number(venda.peca.preco) * venda.quantidade
  })

  const topProdutos = Object.values(rankingVendas)
    .sort((a, b) => b.qtd - a.qtd)
    .slice(0, 3)

  return {
    valorEstoque,
    itensEstoque,
    estoqueBaixo,
    faturamentoMes,
    totalDespesas,
    balancoLiquido,
    ticketMedio,
    vendasCount,
    despesasCount,
    topProdutos,
    historicoMes,
    despesasMes 
  }
})