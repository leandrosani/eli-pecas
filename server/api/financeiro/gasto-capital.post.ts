import { defineEventHandler, readBody, createError } from 'h3'
import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { descricao, valor, observacao } = body

        if (!valor || Number(valor) <= 0) {
            throw createError({ statusCode: 400, message: 'Valor inválido.' })
        }

        // 1. Verificar Saldo do Capital
        // Recalculamos para garantir
        const [distribuicoesLoja, investimentosCapital] = await Promise.all([
            prisma.despesa.aggregate({
                where: {
                    categoria: 'DISTRIBUICAO',
                    descricao: { contains: 'LOJA' }
                },
                _sum: { valor: true }
            }),
            prisma.despesa.aggregate({
                where: { categoria: 'INVESTIMENTO_CAPITAL' },
                _sum: { valor: true }
            })
        ])

        const totalReservado = Number(distribuicoesLoja._sum.valor || 0)
        const totalGasto = Number(investimentosCapital._sum.valor || 0)
        const saldoAtual = totalReservado - totalGasto

        if (Number(valor) > saldoAtual) {
            throw createError({ statusCode: 400, message: `Saldo insuficiente no Capital da Loja. Disponível: R$ ${saldoAtual.toFixed(2)}` })
        }

        // 2. Criar Despesa de Capital
        const novaDespesa = await prisma.despesa.create({
            data: {
                descricao,
                categoria: 'INVESTIMENTO_CAPITAL', // Categoria chave para não afetar o operacional
                valor: Number(valor),
                formaPagamento: 'CAPITAL_LOJA',
                data: new Date(),
                observacao: observacao || 'Investimento via Capital da Loja'
            }
        })

        return { success: true, despesa: novaDespesa }

    } catch (error: any) {
        console.error('Erro ao gastar capital:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.message || 'Erro interno.'
        })
    }
})
