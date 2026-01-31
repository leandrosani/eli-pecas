import { prisma } from '../../utils/prisma'

export default defineEventHandler(async (event) => {
  try {
    const despesas = await prisma.despesa.findMany({
      orderBy: {
        data: 'desc' // Ordena da mais recente para a mais antiga
      },
      include: {
        user: {
          select: { name: true } // Traz o nome de quem cadastrou (opcional)
        }
      }
    })

    return despesas
  } catch (error) {
    console.error('Erro ao listar despesas:', error)
    return []
  }
})