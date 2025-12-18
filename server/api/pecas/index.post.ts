import { prisma } from '../../utils/prisma'
import { getUserSession } from '../../utils/session'
import { randomUUID } from 'node:crypto' 

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const body = await readBody(event)

  if (!session.data.user) throw createError({ statusCode: 401, message: 'Login necessário' })

  // 1. CONVERSÃO E VALIDAÇÃO DE TIPOS
  const preco = parseFloat(String(body.preco).replace(',', '.'))
  const quantidade = parseInt(String(body.quantidade)) || 1
  const ano = body.ano ? String(body.ano) : null
  
  if (isNaN(preco) || isNaN(quantidade)) {
    throw createError({ statusCode: 400, message: 'Preço ou quantidade inválidos' })
  }

  // 2. TRATAMENTO INTELIGENTE DE FOTOS
  let fotoCapa = body.fotoUrl
  let listaFotos = body.fotosExtras

  // Garante que listaFotos seja um Array real (Prisma precisa de String[], não string JSON)
  if (typeof listaFotos === 'string') {
    try {
      // Tenta fazer o parse se vier como string "[url1, url2]" do scraper
      listaFotos = JSON.parse(listaFotos)
    } catch (e) {
      listaFotos = [] 
    }
  } else if (!Array.isArray(listaFotos)) {
    listaFotos = []
  }

  // 🛑 LÓGICA DE CAPA: Se não foi definida capa, usa a primeira extra disponível
  if (!fotoCapa && listaFotos.length > 0) {
    fotoCapa = listaFotos[0]
  }

  try {
    // 3. CRIAÇÃO DA PEÇA
    const peca = await prisma.peca.create({
      data: {
        id: randomUUID(), // Gera ID manual (pois o schema não tem @default(uuid))
        
        nome: body.nome.toUpperCase(),
        marca: body.marca.toUpperCase(),
        lado: body.lado.toUpperCase(),
        modelo: body.modelo ? body.modelo.toUpperCase() : null, 
        ano: ano,
        estado: body.estado,
        detalhes: body.detalhes ? body.detalhes.toUpperCase() : null, 
        localizacao: body.localizacao ? body.localizacao.toUpperCase() : null, 
        preco: preco,
        quantidade: quantidade,
        ativo: true,
        
        fotoUrl: fotoCapa || null, 
        descricao: body.descricao || null,
        Link: body.Link || null,
        fotosExtras: listaFotos,   // Salva o array de URLs
        
        // ✅ CORREÇÃO: Voltando para 'movimentacoes' conforme o log de erro do Prisma sugeriu
        movimentacoes: {
          create: {
            id: randomUUID(), // ID manual para o histórico também
            tipo: 'ENTRADA',
            quantidade: quantidade,
            observacao: 'Cadastro inicial',
            userId: session.data.user.id
          }
        }
      }
    })

    return { success: true, id: peca.id } 

  } catch (error: any) {
    console.error('❌ Erro ao salvar Peça (Prisma):', error)
    throw createError({ 
      statusCode: 500, 
      message: 'Falha ao salvar a peça: ' + (error.message || 'Erro desconhecido') 
    })
  }
})