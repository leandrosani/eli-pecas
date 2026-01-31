import { prisma } from '../../utils/prisma'
import { getUserSession } from '../../utils/session'
import crypto from 'node:crypto'

// Função auxiliar para deletar imagem no Cloudinary
async function deleteFromCloudinary(imageUrl: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!imageUrl || !imageUrl.includes('cloudinary.com') || !apiKey || !apiSecret) return

  try {
    // 1. Extrair o Public ID da URL
    const regex = /\/v\d+\/(.+)\.[a-z]+$/
    const match = imageUrl.match(regex)
    if (!match) return

    const publicId = match[1]
    const timestamp = Math.round(new Date().getTime() / 1000)

    // 2. Gerar Assinatura de Segurança (SHA1)
    const paramsToSign = `public_id=${publicId}&timestamp=${timestamp}`
    const signature = crypto
      .createHash('sha1')
      .update(paramsToSign + apiSecret)
      .digest('hex')

    // 3. Chamar API de Delete do Cloudinary
    const formData = new FormData()
    formData.append('public_id', publicId)
    formData.append('api_key', apiKey)
    formData.append('timestamp', String(timestamp))
    formData.append('signature', signature)

    await $fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body: formData
    })
    
    console.log(`🗑️ Imagem deletada do Cloudinary: ${publicId}`)
  } catch (error) {
    console.error('Erro ao deletar imagem do Cloudinary:', error)
    // Não paramos o fluxo se der erro na imagem, priorizamos o banco
  }
}

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.data.user) throw createError({ statusCode: 401, message: 'Não autorizado' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'ID obrigatório' })

  // 1. Buscar a peça para pegar as URLs das fotos ANTES de desativar
  const peca = await prisma.peca.findUnique({
    where: { id },
    select: { fotoUrl: true, fotosExtras: true }
  })

  if (peca) {
    // 2. Deletar foto principal
    if (peca.fotoUrl) {
      await deleteFromCloudinary(peca.fotoUrl)
    }

    // 3. Deletar fotos extras (se for array ou string JSON)
    let extras = peca.fotosExtras
    // Tratamento para garantir que é array
    if (typeof extras === 'string') {
      try { extras = JSON.parse(extras) } catch (e) { extras = [] }
    }
    
    if (Array.isArray(extras)) {
      // Deleta todas as fotos extras em paralelo
      await Promise.all(extras.map(url => deleteFromCloudinary(url)))
    }
  }

  // 4. SOFT DELETE + LIMPEZA NO BANCO
  // Removemos as URLs do banco para não ficarem links quebrados apontando para nada
  await prisma.peca.update({
    where: { id },
    data: { 
      ativo: false,
      fotoUrl: null,       // Limpa a referência
      fotosExtras: []      // Limpa a lista extra
    }
  })

  return { success: true, message: 'Peça desativada e fotos removidas da nuvem.' }
})