import { prisma } from '../../utils/prisma'
import { getUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.data.user) throw createError({ statusCode: 401, message: 'Login necessário' })

  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  if (!id) throw createError({ statusCode: 400, message: 'ID obrigatório' })
  
  try {
    // 1. CONVERSÃO DE TIPOS
    const precoFinal = body.preco ? parseFloat(String(body.preco).replace(',', '.')) : undefined
    const quantidadeFinal = body.quantidade ? parseInt(String(body.quantidade)) : undefined
    const anoFinal = body.ano ? String(body.ano) : null
    
    // CAMPOS NOVOS/AJUSTADOS
    const localizacaoFinal = body.localizacao || null 
    const detalhesFinal = body.detalhes || null
    const modeloFinal = body.modelo || null
    const ladoFinal = body.lado || null
    const fotoUrlFinal = body.fotoUrl || null // ✅ INCLUÍDO AQUI
    
    const pecaAtualizada = await prisma.peca.update({
      where: { id },
      data: {
        nome: body.nome,
        marca: body.marca,          // Montadora
        lado: ladoFinal,            // Lado da Peça
        estado: body.estado,
        modelo: modeloFinal,        // Modelo do carro
        ano: anoFinal,
        preco: precoFinal,
        quantidade: quantidadeFinal,
        detalhes: detalhesFinal,    // Observações
        localizacao: localizacaoFinal, 
        fotoUrl: fotoUrlFinal,      // ✅ SALVA A NOVA URL DA FOTO
        updatedAt: new Date()
      }
    })
    
    // 2. RETORNO CORRIGIDO: Retorna apenas o ID para evitar JSON Circular.
    return { success: true, id: pecaAtualizada.id }

  } catch (error) {
    console.error('❌ Erro FATAL no PATCH da Peça:', error)
    throw createError({ statusCode: 500, message: 'Falha ao processar a atualização. Verifique os logs do servidor.' })
  }
})