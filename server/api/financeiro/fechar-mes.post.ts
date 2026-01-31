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

        // 3. Cálculos da Distribuição
        const distLeandro = saldoDisponivel * 0.47
        const distElias = saldoDisponivel * 0.28
        const distLoja = saldoDisponivel * 0.25

        // Data de referência (hoje)
        const dataHoje = new Date()
        const mesAno = dataHoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })

        // 4. Executar transação (Distribuir = Criar Despesas de Saída)
        await prisma.$transaction([
            // Leandro
            prisma.despesa.create({
                data: {
                    descricao: `Distr. Lucro - LEANDRO (47%) - ${mesAno}`,
                    categoria: 'DISTRIBUICAO', // Categoria especial
                    valor: distLeandro,
                    formaPagamento: 'TRANSFERENCIA',
                    data: dataHoje,
                    observacao: 'Fechamento de Caixa Mensal'
                }
            }),
            // Elias
            prisma.despesa.create({
                data: {
                    descricao: `Distr. Lucro - ELIAS (28%) - ${mesAno}`,
                    categoria: 'DISTRIBUICAO',
                    valor: distElias,
                    formaPagamento: 'TRANSFERENCIA',
                    data: dataHoje,
                    observacao: 'Fechamento de Caixa Mensal'
                }
            }),
            // Loja
            prisma.despesa.create({
                data: {
                    descricao: `Distr. Lucro - LOJA (25%) - ${mesAno}`,
                    categoria: 'DISTRIBUICAO',
                    valor: distLoja,
                    formaPagamento: 'RESERVA',
                    data: dataHoje,
                    observacao: 'Fechamento de Caixa Mensal - Reserva de Capital'
                }
            })
        ])

        return {
            success: true,
            message: 'Fechamento realizado com sucesso!',
            distribuicao: {
                total: saldoDisponivel,
                leandro: distLeandro,
                elias: distElias,
                loja: distLoja
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
