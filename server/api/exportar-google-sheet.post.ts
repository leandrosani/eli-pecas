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

    // === REGRA 1: TÍTULO ESTRITO ===
    // Ordem: Nome da Peça, Montadora, Modelo, Ano do Carro, Lado.
    const nome = (row.nome || '').trim()
    const montadora = (row.marca || '').trim() // Usando 'marca' como Montadora
    const modelo = (row.modelo || '').trim()
    const ano = (row.ano || '').trim()
    const lado = (row.lado || '').trim()

    // Base do Título: Inicia com o Nome da Peça
    let tituloParts = [nome]

    // 1. Montadora: Adiciona se não estiver no nome (case insensitive)
    if (montadora && !nome.toLowerCase().includes(montadora.toLowerCase())) {
      tituloParts.push(montadora)
    }

    // 2. Modelo: Adiciona se não presente
    // Verificamos contra todo o acumulado para evitar redundância
    if (modelo && !tituloParts.join(' ').toLowerCase().includes(modelo.toLowerCase())) {
      tituloParts.push(modelo)
    }

    // 3. Ano: Adiciona se não presente
    if (ano && !tituloParts.join(' ').includes(ano)) {
      tituloParts.push(ano)
    }

    // 4. Lado: Adiciona se não presente
    if (lado && !tituloParts.join(' ').toLowerCase().includes(lado.toLowerCase())) {
      tituloParts.push(lado)
    }

    let titulo = tituloParts.join(' ').replace(/\s+/g, ' ').trim()

    // Verifica 'Original' nos dados
    const isOriginal = (row.descricao || '').toLowerCase().includes('original') ||
      (row.nome || '').toLowerCase().includes('original') ||
      (row.observacoes || '').toLowerCase().includes('original')

    // 5. OBS/Original: Adiciona 'Original' ao final do título se aplicável e não presente
    if (isOriginal && !titulo.toLowerCase().includes('original')) {
      titulo += ' Original'
    }

    // Capitalização simples / Manter como está vindo do banco, apenas garantindo espaços


    // === REGRA 2: DESCRIÇÃO ESTRUTURADA (3 BLOCOS) ===

    // Bloco 1: Dados Técnicos
    // Marca: Honda / Stanley
    // Modelo: Fit (Geração 3 – Facelift) -> Aqui só temos 'modelo' cru.
    // O user deu exemplo formatado, mas usaremos os dados que temos.
    const codigo = row.codigo || row.sku || '' // Tenta pegar código se existir

    // Helper para Title Case
    const toTitleCase = (str: string) => {
      // Pequena função para capitalizar (Fit, Honda, Esquerdo)
      return str.toLowerCase().replace(/(?:^|\s)\S/g, (a) => a.toUpperCase())
    }

    // Tratamento do Lado com contexto
    let ladoRaw = (lado || '').trim()
    let ladoFmt = toTitleCase(ladoRaw || 'N/A')

    // Adiciona contexto
    if (ladoRaw.toLowerCase() === 'esquerdo' || ladoRaw.toLowerCase() === 'lado esquerdo') {
      ladoFmt = 'Esquerdo (Motorista)'
    } else if (ladoRaw.toLowerCase() === 'direito' || ladoRaw.toLowerCase() === 'lado direito') {
      ladoFmt = 'Direito (Passageiro)'
    }

    let bloco1 = [
      `Marca: ${toTitleCase(montadora || 'N/A')}`,
      `Modelo: ${toTitleCase(modelo || 'N/A')}`,
      `Ano: ${ano || 'N/A'}`,
      `Lado: ${ladoFmt}`
    ]
    if (codigo) bloco1.push(`Código: ${codigo}`)


    // Bloco 2: Observações
    // Deve conter "Original", "Ótimo estado", e outras observações limpas.
    // Removemos o boilerplate antigo primeiro.
    const boilerplateToRemove = '(Elipeças: Peças Usadas de Excelência - Qualidade e Economia Garantidas - )'
    let rawDesc = (row.descricao || '')
      .replace(boilerplateToRemove, '')
      .replace(/\(ref\.?\s*aprox\)?/gi, '')
      .trim()

    let bloco2 = []

    // Adiciona "Original" explicitamente no topo do bloco 2 se for original
    if (isOriginal) bloco2.push('Original')

    // Processa a descrição original para extrair informações relevantes (que não sejam lixo/contato)
    // Divide por quebras de linha ou hífens para tentar separar tópicos
    let descLines = rawDesc.split(/[\n]/) // Split por linhas primeiro

    descLines.forEach((line: string) => {
      let cleanLine = line.trim()
      if (!cleanLine) return

      const lower = cleanLine.toLowerCase()
      // Filtros de exclusão (Blacklist de termos proibidos na descrição)
      const blacklist = [
        'original', // Já adicionado no inicio
        'elipeças',
        'garantia',
        'somos especialistas',
        'faça seu pedido',
        'contato',
        'telefone',
        'qualidade e economia',
        'instagram',
        '@elipecas',
        '99881-4214',
        '998814214'
      ]

      if (blacklist.some(term => lower.includes(term))) return

      // Filtra campos técnicos repetidos (Se a descrição original já tiver "Marca: ...")
      if (lower.startsWith('marca:') ||
        lower.startsWith('modelo:') ||
        lower.startsWith('ano:') ||
        lower.startsWith('lado:') ||
        lower.startsWith('código:') ||
        lower.startsWith('codigo:')) return

      // Se a linha for muito longa e contiver separadores, pode tentar quebrar mais?
      // Por enquanto, assume que o usuário digitou algo razoável.
      if (cleanLine.length > 2) bloco2.push(cleanLine)
    })

    // Adiciona "Ótimo estado" se não houver menção específica de estado nas observações
    const estadoStr = (row.estado || '').toLowerCase()
    const temEstadoNaObs = bloco2.some(l => l.toLowerCase().includes('estado') || l.toLowerCase().includes('novo'))
    if (!temEstadoNaObs) {
      // Se tiver "novo" Mas também tiver "usado", é "Estado de Novo" -> "Excelente Estado"
      // Ou se for "seminovo"
      if ((estadoStr.includes('novo') && estadoStr.includes('usado')) || estadoStr.includes('semi')) {
        bloco2.push('Excelente Estado')
      }
      else if (estadoStr.includes('novo')) {
        // Apenas se for estritamente novo e não usado
        bloco2.push('Produto Novo')
      }
      else {
        bloco2.push('Ótimo estado')
      }
    }

    // Bloco 3: Rodapé Fixo
    let bloco3 = [
      'Produto com garantia'
    ]

    // Junta tudo com quebras de linha duplas entre blocos
    const descricao = [
      bloco1.join('\n'),
      bloco2.join('\n'),
      bloco3.join('\n')
    ].filter(b => b.length > 0).join('\n\n')


    // === OUTROS CAMPOS ===
    // Link Principal (Prioridade: Link cadastrado > Link WhatsApp)
    let linkFinal = (row.Link || row.link || '').trim()

    if (!linkFinal) {
      const textoZap = `Tenho interesse no item: ${titulo}`
      linkFinal = `https://wa.me/5527998814214?text=${encodeURIComponent(textoZap)}`
    }

    // Imagem
    const fixImage = (url: string) => url ? url.replace(/\.webp$/i, '.jpg') : ''
    const imagemPrincipal = fixImage(row.fotoUrl)

    let extraImages: string[] = []
    if (Array.isArray(row.fotosExtras)) extraImages = row.fotosExtras
    else if (typeof row.fotosExtras === 'string' && row.fotosExtras.trim().startsWith('[')) {
      try { extraImages = JSON.parse(row.fotosExtras) } catch (e) { extraImages = [] }
    }
    const imagensExtras = extraImages.map(fixImage).join(',')

    const precoFormatado = `${Number(row.preco || 0).toFixed(2)} BRL`

    // Condição Feed
    let condicaoFeed = 'new'
    if (estadoStr.includes('usado')) condicaoFeed = 'used'
    if (estadoStr.includes('recondicionado')) condicaoFeed = 'used' // Solicitado: Recondicionado = Used

    // Categorias Google/Facebook (Texto Completo)

    // Default
    let categoria = 'Veículos e peças > Peças e acessórios para veículos'
    const nomeLower = nome.toLowerCase()

    // 1. Iluminação Dianteira (Farol)
    if (nomeLower.includes('farol')) {
      categoria = 'Veículos e peças > Peças e acessórios para veículos > Peças de iluminação > Conjuntos de faróis para veículos'
    }
    // 2. Iluminação Traseira (Lanterna)
    else if (nomeLower.includes('lanterna')) {
      categoria = 'Veículos e peças > Peças e acessórios para veículos > Peças de iluminação > Conjuntos de luzes traseiras para veículos'
    }
    // 3. Retrovisores
    else if (nomeLower.includes('retrovisor')) {
      categoria = 'Veículos e peças > Peças e acessórios para veículos > Espelhos para veículos'
    }
    // 4. Carroceria (Lataria em geral)
    else if (
      nomeLower.includes('parachoque') ||
      nomeLower.includes('para-choque') ||
      nomeLower.includes('capo') ||
      nomeLower.includes('capô') ||
      nomeLower.includes('grade') ||
      nomeLower.includes('paralama') ||
      nomeLower.includes('porta')
    ) {
      categoria = 'Veículos e peças > Peças e acessórios para veículos > Carroceria e acessórios para veículos'
    }
    // 5. Outros (Painel, etc) -> Cai no Default

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
      montadora || 'Genérico',
      categoria, // google_product_category
      categoria, // fb_product_category (Igual ao Google)
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
