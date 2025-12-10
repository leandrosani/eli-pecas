import { prisma } from '../../utils/prisma'
import { getUserSession } from '../../utils/session'

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

  try {
    // 2. CRIAÇÃO DA PEÇA (O objeto 'peca' é retornado pelo Prisma com relacionamentos)
    const peca = await prisma.peca.create({
      data: {
        nome: body.nome.toUpperCase(),
        marca: body.marca.toUpperCase(),
        lado: body.lado.toUpperCase(),
        modelo: body.modelo.toUpperCase(), 
        ano: ano,
        estado: body.estado,
        detalhes: body.detalhes ? body.detalhes.toUpperCase() : null, 
        localizacao: body.localizacao ? body.localizacao.toUpperCase() : null, 
        preco: preco,
        quantidade: quantidade,
        ativo: true,
        
        // ⚠️ O bloco 'movimentacoes' cria o relacionamento circular que causa a falha de serialização
        movimentacoes: {
          create: {
            tipo: 'ENTRADA',
            quantidade: quantidade,
            observacao: 'Cadastro inicial',
            userId: session.data.user.id
          }
        }
      }
    })

    // 3. RETORNO CORRIGIDO: Retorna apenas o ID para evitar JSON Circular.
    return { success: true, id: peca.id } 

  } catch (error) {
    console.error('❌ Erro ao salvar Peça (Prisma):', error)
    throw createError({ statusCode: 500, message: 'Falha ao salvar a peça no banco de dados.' })
  }
})