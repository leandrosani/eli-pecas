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
    const titulo = `${row.nome || ''} ${row.modelo || ''} ${row.ano || ''} ${row.lado || ''}`
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase()

    const descricao = row.descricao || titulo
    const precoFormatado = `${Number(row.preco || 0).toFixed(2)} BRL`

    // Condição
    let condicaoFeed = 'new'
    const est = (row.estado || '').toLowerCase()
    if (est.includes('usado')) condicaoFeed = 'used'
    if (est.includes('recondicionado')) condicaoFeed = 'refurbished'

    const linkFinal = row.Link || `https://elipecas.com/peca/${row.id}`

    let extraImages: string[] = []
    if (Array.isArray(row.fotosExtras)) extraImages = row.fotosExtras
    else if (typeof row.fotosExtras === 'string' && row.fotosExtras.trim().startsWith('[')) {
      try { extraImages = JSON.parse(row.fotosExtras) } catch(e){ extraImages = [] }
    }

    return [
      row.id,
      titulo,
      descricao,
      precoFormatado,
      row.quantidade > 0 ? 'in stock' : 'out of stock',
      condicaoFeed,
      linkFinal,
      row.fotoUrl || '',
      extraImages.join(','),
      'Original',
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
