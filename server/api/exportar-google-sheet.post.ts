import { google } from 'googleapis'
import { readFileSync } from 'fs'
import { readBody } from 'h3'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const linhasFiltradas = body.rows // array de objetos do frontend

  if (!linhasFiltradas || !linhasFiltradas.length)
    return { success: false, message: 'Nenhum dado recebido' }

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT!)

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })

  const sheets = google.sheets({ version: 'v4', auth })

  const spreadsheetId = '1mAYLPFWFmMHjDaEaG_11ZEDrzzVPhHpGV0JYo6Cp7p8'
  const aba = 'Feed'

  // Headers do feed
  const headers = [
    'id', 'title', 'description', 'price', 'availability', 'condition', 'link',
    'image_link', 'additional_image_link', 'brand', 'google_product_category',
    'fb_product_category', 'quantity_to_sell_on_facebook'
  ]

  // Monta linhas do feed
  const rows = linhasFiltradas.map((row: any) => {

    // REGRA 1: OTIMIZAÇÃO DO TÍTULO
    let partes = [row.nome || '']
    const modelo = row.modelo || ''
    const ano = row.ano || ''
    const lado = row.lado || ''

    // Evita duplicar Modelo, Ano ou Lado se já estiverem no Nome
    if (modelo && !partes[0].toLowerCase().includes(modelo.toLowerCase())) partes.push(modelo)
    if (ano && !partes[0].includes(ano)) partes.push(ano)
    if (lado && !partes[0].toLowerCase().includes(lado.toLowerCase())) partes.push(lado)

    let tituloBase = partes.join(' ').replace(/\s+/g, ' ').trim()
    const marca = row.marca || ''

    // Se a marca não estiver no início (case insensitive), adiciona
    if (marca && !tituloBase.toLowerCase().startsWith(marca.toLowerCase())) {
      tituloBase = `${marca} ${tituloBase}`
    }
    const titulo = tituloBase.toUpperCase()

    // REGRA 2: HIGIENIZAÇÃO PROFUNDA (V2)
    // Estratégia: Quebrar o texto em frases/segmentos e eliminar qualquer um que contenha contatos
    let descricaoRaw = (row.descricao || '').replace(/\n/g, '. ')

    // Lista de palavras proibidas (gatilhos)
    const blockList = ['instagram', 'facebook', 'telefone', 'contato', 'ligue', 'zap', 'whats', 'fone', 'celular', 'tratar', 'chama no']

    // Split por pontuação que define fim de frase [. ! ?]
    const segments = descricaoRaw.split(/[.!?;]+/)

    const filteredSegments = segments.filter((seg: string) => {
      const lower = seg.toLowerCase()
      // Se tiver numero de telefone (mesmo sem a palavra "telefone") - Regex simplificada e abrangente
      const hasPhone = /(\(?\d{2}\)?\s?)?9?\d{4}[-\s]?\d{4}/.test(seg)
      if (hasPhone) return false

      // Se tiver palavra proibida
      return !blockList.some(badWord => lower.includes(badWord))
    })

    // Reconstrói usando o separador " - " visual
    let descricao = filteredSegments
      .map((s: string) => s.trim())
      .filter((s: string) => s.length > 2) // Remove fragmentos muito curtos
      .join(' - ')

    // Adiciona dados técnicos caso a descrição fique muito vazia
    if (descricao.length < 10) {
      descricao = `Peça para ${marca} ${modelo} ${ano} ${lado}`
    }

    // Regra 4 da solicitação: Finalizar com chamada simples
    descricao += ' - Peça Original com Garantia.'

    // Limpeza final de duplicidade de traços
    descricao = descricao.replace(/\s+-\s+/g, ' - ')

    // REGRA 3: LINK DO WHATSAPP
    const textoZap = `Tenho interesse no item: ${titulo}`
    const linkFinal = `https://wa.me/5527998814214?text=${encodeURIComponent(textoZap)}`

    // REGRA 4: CORREÇÃO DE IMAGEM
    const fixImage = (url: string) => url ? url.replace(/\.webp$/i, '.jpg') : ''
    const imagemPrincipal = fixImage(row.fotoUrl)

    let extraImages: string[] = []
    if (Array.isArray(row.fotosExtras)) extraImages = row.fotosExtras
    else if (typeof row.fotosExtras === 'string' && row.fotosExtras.trim().startsWith('[')) {
      try { extraImages = JSON.parse(row.fotosExtras) } catch (e) { extraImages = [] }
    }
    const imagensExtras = extraImages.map(fixImage).join(',')

    const precoFormatado = `${Number(row.preco || 0).toFixed(2)} BRL`

    // Condição
    let condicaoFeed = 'new'
    const est = (row.estado || '').toLowerCase()
    if (est.includes('usado')) condicaoFeed = 'used'
    if (est.includes('recondicionado')) condicaoFeed = 'refurbished'

    return [
      row.id,
      titulo,
      descricao,
      precoFormatado,
      row.quantidade > 0 ? 'in stock' : 'out of stock',
      condicaoFeed,
      linkFinal,
      imagemPrincipal,
      imagensExtras,
      marca || 'Genérico', // REGRA 5
      'Peças e acessórios para automóveis > Autopeças e acessórios',
      'Peças e acessórios para automóveis > Autopeças e acessórios',
      row.quantidade
    ]
  })

  // Limpa a aba
  await sheets.spreadsheets.values.clear({ spreadsheetId, range: aba })

  // Atualiza planilha com headers + dados
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: aba,
    valueInputOption: 'RAW',
    requestBody: { values: [headers, ...rows] }
  })

  return { success: true, updated: rows.length }
})
