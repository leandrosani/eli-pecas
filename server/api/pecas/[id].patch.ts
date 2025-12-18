import { prisma } from '../../utils/prisma'
import { getUserSession } from '../../utils/session'
import crypto from 'node:crypto'

// Função auxiliar para apagar imagem no Cloudinary
async function deleteFromCloudinary(imageUrl: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!imageUrl || !imageUrl.includes('cloudinary.com') || !apiKey || !apiSecret) return

  try {
    // 1. Extrair o Public ID da URL
    // Ex: .../image/upload/v1234/pecas/foto.jpg -> pecas/foto
    const regex = /\/v\d+\/(.+)\.[a-z]+$/
    const match = imageUrl.match(regex)
    if (!match) return

    const publicId = match[1]
    const timestamp = Math.round(new Date().getTime() / 1000)

    // 2. Gerar Assinatura de Segurança (SHA1) necessária para deletar
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex')

    // 3. Enviar pedido de delete para a API do Cloudinary
    const formData = new FormData()
    formData.append('public_id', publicId)
    formData.append('api_key', apiKey)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)

    await $fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData
    })
    
    console.log(`🗑️ Foto apagada do Cloudinary: ${publicId}`)
  } catch (error) {
    console.error('Erro ao apagar imagem do Cloudinary:', error)
    // Não bloqueamos o fluxo principal se a imagem falhar ao apagar, apenas logamos
  }
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const body = await readBody(event)
  const id = getRouterParam(event, 'id')

  if (!session.data.user) throw createError({ statusCode: 401, message: 'Login necessário' })
  if (!id) throw createError({ statusCode: 400, message: 'ID da peça é obrigatório' })

  // 1. Validação e Conversão de Tipos
  const preco = parseFloat(String(body.preco).replace(',', '.'))
  const quantidade = parseInt(String(body.quantidade))
  const ano = body.ano ? String(body.ano) : null
  
  if (isNaN(preco) || isNaN(quantidade)) {
    throw createError({ statusCode: 400, message: 'Preço ou quantidade inválidos' })
  }

  // 2. Processar exclusão de fotos antigas (enviadas pelo frontend)
  if (body.fotosParaRemover && Array.isArray(body.fotosParaRemover)) {
    // Executa em paralelo para não atrasar a resposta
    Promise.all(body.fotosParaRemover.map((url: string) => deleteFromCloudinary(url)))
      .catch(err => console.error('Falha na limpeza de fotos:', err))
  }

  // 3. Preparar a lista final de fotos para salvar
  let listaFotos = body.fotosExtras
  
  // Garante que é um array
  if (typeof listaFotos === 'string') {
    try { listaFotos = JSON.parse(listaFotos) } catch { listaFotos = [] }
  } else if (!Array.isArray(listaFotos)) {
    listaFotos = []
  }

  // Define a capa: se vier nula mas existirem fotos extras, usa a primeira
  let fotoCapa = body.fotoUrl
  if (!fotoCapa && listaFotos.length > 0) {
    fotoCapa = listaFotos[0]
  }

  try {
    // 4. Atualizar no Banco de Dados
    const peca = await prisma.peca.update({
      where: { id },
      data: {
        nome: body.nome?.toUpperCase(),
        marca: body.marca?.toUpperCase(),
        lado: body.lado?.toUpperCase(),
        modelo: body.modelo ? body.modelo.toUpperCase() : null, 
        ano: ano,
        estado: body.estado,
        detalhes: body.detalhes ? body.detalhes.toUpperCase() : null, 
        localizacao: body.localizacao ? body.localizacao.toUpperCase() : null, 
        preco: preco,
        quantidade: quantidade,
        
        // Atualiza campos de média
        fotoUrl: fotoCapa || null,
        fotosExtras: listaFotos, // Salva o array atualizado
        descricao: body.descricao || null,
        Link: body.Link || null
      }
    })

    return { success: true, id: peca.id } 

  } catch (error: any) {
    console.error('❌ Erro ao atualizar Peça:', error)
    throw createError({ 
      statusCode: 500, 
      message: 'Falha ao atualizar a peça: ' + (error.message || 'Erro desconhecido') 
    })
  }
})