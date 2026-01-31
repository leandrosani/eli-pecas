import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'


export default defineEventHandler(async (event) => {
    // Logic updated to 100% Store Capital allocation
    try {
        const body = await readBody(event)
        const { senha } = body

        // 1. Validação de Segurança
        if (senha !== '12345678') {
            throw createError({ statusCode: 401, message: 'Senha incorreta.' })
        }

        // 2. Calcular Saldo Atual (Global)
        // Trazemos o saldo "ao vivo" para garantir consistência
        const [todasVendas, sumDespesas] = await Promise.all([
            prisma.historicoMovimentacao.findMany({
                where: { tipo: 'SAIDA' },
                select: { quantidade: true, precoVenda: true, peca: { select: { preco: true } } }
            }),
            prisma.despesa.aggregate({ _sum: { valor: true } })
        ])

        const receitaTotal = todasVendas.reduce((acc, mov: any) => {
            const precoReal = mov.precoVenda ? Number(mov.precoVenda) : Number(mov.peca?.preco || 0)
            return acc + (precoReal * mov.quantidade)
        }, 0)

        const despesaTotal = Number(sumDespesas._sum.valor || 0)
        const saldoDisponivel = receitaTotal - despesaTotal

        if (saldoDisponivel <= 0) {
            throw createError({ statusCode: 400, message: 'Não há saldo positivo para distribuir.' })
        }

        // 3. Alocação 100% para Capital da Loja
        const valorCapitalLoja = saldoDisponivel

        // Data de referência (hoje)
        const dataHoje = new Date()
        const mesAno = dataHoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

        // 4. Executar transação (Distribuir = Criar Despesas de Saída)
        // Cria apenas UMA despesa de distribuição que joga tudo para a Loja
        await prisma.$transaction([
            prisma.despesa.create({
                data: {
                    descricao: `Fechamento Mensal - Retido para Capital da Loja (100%) - ${mesAno}`,
                    categoria: 'DISTRIBUICAO',
                    valor: valorCapitalLoja,
                    formaPagamento: 'RESERVA',
                    data: dataHoje,
                    observacao: 'Lucro líquido do mês transferido integralmente para Reserva/Capital de Giro da Loja.'
                }
            })
        ])

        return {
            success: true,
            message: 'Fechamento realizado com sucesso!',
            distribuicao: {
                total: saldoDisponivel,
                capitalLoja: valorCapitalLoja
            }
        }

    } catch (error: any) {
        console.error('Erro ao fechar mês:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Erro interno ao processar fechamento.'
        })
    }
})
