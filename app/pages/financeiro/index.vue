<template>
  <div class="p-4 pb-24 max-w-7xl mx-auto space-y-6">
    
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          Painel Financeiro
        </h1>
        <p class="text-sm text-gray-500 font-medium">Sua bússola para tomada de decisão.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm h-9">
          <button @click="mudarMes(-1)" class="px-2 h-full hover:bg-gray-100 rounded-l-lg text-gray-600 border-r border-gray-100">
            <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
          </button>
          <span class="px-3 text-sm font-bold text-gray-900 min-w-[110px] text-center capitalize select-none">
            {{ nomeMesAtual }}
          </span>
          <button @click="mudarMes(1)" :disabled="ehMesFuturo" class="px-2 h-full hover:bg-gray-100 rounded-r-lg text-gray-600 border-l border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
            <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
          </button>
        </div>

        <UButton icon="i-heroicons-arrow-path" color="gray" variant="soft" :loading="pending" @click="refresh" square />
        
        <UButton icon="i-heroicons-document-arrow-down" color="black" @click="abrirModalRelatorios">
          Baixar PDF
        </UButton>
      </div>
    </div>

    <div v-if="pending" class="py-20 text-center text-gray-400">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin mb-2" />
      <p>Calculando a rota do dinheiro...</p>
    </div>

    <template v-else-if="stats">
      
      <div class="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
        <button 
          @click="abrirModalMeta"
          class="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-lg backdrop-blur-sm transition-all z-20 cursor-pointer border border-white/10"
          title="Alterar Meta"
        >
          <UIcon name="i-heroicons-pencil-square" class="w-5 h-5 text-white" />
        </button>

        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16 pointer-events-none"></div>

        <div class="relative z-10">
          <div class="flex flex-col md:flex-row justify-between items-end mb-4 gap-4">
            <div>
              <h2 class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                Meta de Lucro ({{ nomeMesAtual }})
              </h2>
              <div class="flex items-baseline gap-2">
                <span class="text-3xl md:text-4xl font-black">{{ formatarDinheiro(stats.meta.atual) }}</span>
                <span class="text-gray-400 font-medium">/ {{ formatarDinheiro(stats.meta.alvo) }}</span>
              </div>
            </div>
            
            <div class="bg-white/10 px-4 py-2 rounded-xl border border-white/10 backdrop-blur-md">
              <p class="text-[10px] text-gray-300 uppercase tracking-wider font-bold mb-0.5">Saldo Disponível (Caixa)</p>
              <p class="text-2xl font-black text-emerald-400">{{ formatarDinheiro(stats.saldoCaixa) }}</p>
            </div>
          </div>

          <div class="w-full bg-gray-700 h-4 rounded-full overflow-hidden mb-4 relative">
            <div 
              class="h-full rounded-full transition-all duration-1000 ease-out relative"
              :class="stats.meta.progresso >= 100 ? 'bg-green-500' : 'bg-blue-500'"
              :style="{ width: `${Math.min(stats.meta.progresso, 100)}%` }"
            >
              <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
            <div class="absolute top-0 right-2 h-full flex items-center text-[10px] font-bold text-white drop-shadow-md">
               {{ stats.meta.progresso.toFixed(0) }}%
            </div>
          </div>

          <div class="flex flex-wrap gap-3 text-sm font-medium">
            <div v-if="stats.meta.ehMesAtual && stats.meta.falta > 0" class="bg-orange-500/20 px-3 py-1.5 rounded-lg border border-orange-500/30 flex items-center gap-2">
              <UIcon name="i-heroicons-bolt" class="w-4 h-4 text-orange-400" />
              <span class="text-orange-100">Ritmo Necessário:</span>
              <span class="text-white font-bold">{{ formatarDinheiro(stats.meta.ritmo) }} / dia</span>
            </div>
            <div v-else-if="stats.meta.falta <= 0" class="bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-500/30 flex items-center gap-2">
              <UIcon name="i-heroicons-check-badge" class="w-4 h-4 text-green-400" />
              <span class="text-green-100 font-bold">Meta Batida! Parabéns!</span>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div class="p-5 border-b border-gray-100 bg-orange-50/50">
            <h3 class="font-bold text-gray-900 flex items-center gap-2">
              <span class="bg-orange-100 text-orange-600 p-1.5 rounded-lg"><UIcon name="i-heroicons-fire" class="w-5 h-5" /></span>
              Produtos Prioritários
            </h3>
            <p class="text-xs text-gray-500 mt-1">Foco nestes itens: Alta margem + Estoque.</p>
          </div>
          
          <div class="flex-1 p-0 overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-500 font-medium border-b border-gray-100">
                <tr>
                  <th class="p-4 py-3">Peça</th>
                  <th class="p-4 py-3 text-right">Margem</th>
                  <th class="p-4 py-3 text-right">Lucro Potencial</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in stats.oportunidades" :key="item.id" class="group hover:bg-orange-50/30 transition-colors">
                  <td class="p-4 py-3">
                    <div class="font-bold text-gray-900">{{ item.nome }}</div>
                    <div class="text-xs text-gray-500">{{ item.modelo }} • {{ item.estoque }} un</div>
                  </td>
                  <td class="p-4 py-3 text-right">
                    <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded-md text-xs font-bold">{{ item.margem.toFixed(0) }}%</span>
                  </td>
                  <td class="p-4 py-3 text-right">
                    <div class="font-bold text-gray-900">{{ formatarDinheiro(item.lucroPotencial) }}</div>
                    <div class="text-[10px] text-gray-400">({{ formatarDinheiro(item.lucroUnit) }}/un)</div>
                  </td>
                </tr>
                <tr v-if="!stats.oportunidades.length">
                  <td colspan="3" class="p-8 text-center text-gray-400 text-xs">
                    Sem dados suficientes para sugerir oportunidades.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div class="p-5 border-b border-gray-100 bg-blue-50/50">
            <h3 class="font-bold text-gray-900 flex items-center gap-2">
              <span class="bg-blue-100 text-blue-600 p-1.5 rounded-lg"><UIcon name="i-heroicons-archive-box" class="w-5 h-5" /></span>
              Dinheiro Congelado
            </h3>
            <p class="text-xs text-gray-500 mt-1">Itens parados há mais de 90 dias.</p>
          </div>

          <div class="p-6 flex flex-col gap-6 justify-center h-full">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-500">Custo Travado</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatarDinheiro(stats.parados.custoTotal) }}</p>
              </div>
              <div class="text-right">
                <p class="text-sm text-gray-500">Itens Parados</p>
                <p class="text-2xl font-bold text-gray-900">{{ stats.parados.qtd }}</p>
              </div>
            </div>

            <div class="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <div class="flex gap-3 items-start">
                <UIcon name="i-heroicons-light-bulb" class="w-6 h-6 text-blue-500 mt-0.5" />
                <div>
                  <p class="text-sm font-bold text-blue-900 mb-1">Sugestão de Ação:</p>
                  <p class="text-sm text-blue-700 leading-snug">
                    Se liquidar com <strong>15% de desconto</strong>, libera 
                    <span class="font-black bg-white px-1 rounded">{{ formatarDinheiro(stats.parados.vendaTotal * 0.85) }}</span> 
                    em caixa.
                  </p>
                </div>
              </div>
            </div>
            
            <UButton block color="gray" variant="solid" to="/estoque">Ver Estoque</UButton>
          </div>
        </div>

      </div>

      <div class="mb-3 mt-6 border border-gray-200 shadow-sm w-full"></div>

      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="p-3 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-3">
          <h2 class="font-bold text-gray-700 flex items-center gap-2">
            <UIcon name="i-heroicons-list-bullet" class="text-gray-400" /> 
            Extrato do Mês
          </h2>
          
          <div class="flex gap-1 bg-gray-200/50 p-1 rounded-lg">
            <button 
              v-for="aba in abas" 
              :key="aba.value" 
              @click="abaAtiva = aba.value" 
              class="px-3 py-1 text-xs font-bold rounded-md transition-all"
              :class="abaAtiva === aba.value ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-gray-700'"
            >
              {{ aba.label }}
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-400 uppercase text-xs font-bold">
              <tr>
                <th class="py-3 px-4">Data</th>
                <th class="py-3 px-4">Descrição</th>
                <th class="py-3 px-4 text-center">Tipo</th>
                <th class="py-3 px-4 text-right">Valor</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="mov in historicoFiltrado" :key="mov.id" class="hover:bg-gray-50">
                <td class="py-3 px-4 text-gray-500 text-xs whitespace-nowrap">
                  {{ new Date(mov.data).toLocaleDateString('pt-BR') }}
                </td>
                <td class="py-3 px-4 font-medium text-gray-900">
                  {{ mov.descricao || mov.peca?.nome }} 
                  <span v-if="mov.peca?.modelo" class="text-gray-400 font-normal text-xs uppercase"> • {{ mov.peca.modelo }}</span>
                </td>
                <td class="py-3 px-4 text-center">
                  <span class="text-[10px] px-2 py-0.5 rounded border font-bold uppercase tracking-wider" :class="getBadgeClass(mov.tipo)">
                    {{ getLabelTipo(mov.tipo) }}
                  </span>
                </td>
                <td class="py-3 px-4 text-right font-mono font-bold whitespace-nowrap" :class="getValorClass(mov.tipo)">
                  {{ getSinal(mov.tipo) }} {{ formatarDinheiro(mov.valor) }}
                </td>
              </tr>
              <tr v-if="!historicoFiltrado.length">
                <td colspan="4" class="py-12 text-center text-gray-400 text-xs">
                  Nenhum registro encontrado para este filtro.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </template>

    <div v-else-if="error" class="py-20 text-center bg-white rounded-2xl border border-red-100">
      <p class="text-red-500 font-bold mb-2">Erro ao carregar dados.</p>
      <p class="text-xs text-gray-400 mb-4">{{ error.message }}</p>
      <UButton size="sm" color="red" variant="soft" class="mt-2" @click="refresh">Tentar novamente</UButton>
    </div>

    <div v-if="modalMetaAberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UIcon name="i-heroicons-adjustments-horizontal" class="w-5 h-5 text-gray-500" />
            Definir Meta
          </h3>
          <button @click="modalMetaAberto = false" class="text-gray-400 hover:text-gray-600 p-1 rounded-md">
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>
        <div class="p-6">
          <p class="text-sm text-gray-500 mb-6">Qual o valor de <strong>LUCRO LÍQUIDO</strong> que deseja atingir este mês?</p>
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Valor Alvo (R$)</label>
            <div class="relative">
              <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
              <input v-model="novaMeta" type="number" placeholder="Ex: 15000" class="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:border-blue-500 focus:ring-0 outline-none transition-all" />
            </div>
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button @click="modalMetaAberto = false" class="px-4 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors text-sm">Cancelar</button>
          <button @click="salvarMeta" :disabled="salvandoMeta" class="px-6 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 text-sm">
            <UIcon v-if="salvandoMeta" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            {{ salvandoMeta ? 'Salvando...' : 'Salvar Meta' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="modalRelatorioAberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UIcon name="i-heroicons-document-arrow-down" class="w-5 h-5 text-gray-700" />
            Gerar Relatório PDF
          </h3>
          <button @click="modalRelatorioAberto = false" class="text-gray-400 hover:text-gray-600">
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>

        <div class="p-6 space-y-6">
          
          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">📅 Período de Análise</label>
            <select v-model="periodoRelatorio" class="w-full p-3 border-2 border-gray-200 rounded-xl bg-white font-medium text-gray-900 focus:border-black focus:ring-0">
              <option v-for="op in opcoesPeriodo" :key="op.value" :value="op.value">
                {{ op.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-bold text-gray-700 mb-2">Filtro por Tipo</label>
            <div class="space-y-2">
              <label 
                v-for="tipo in opcoesTipo" 
                :key="tipo.value"
                class="flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all"
                :class="tipoRelatorio === tipo.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'"
              >
                <input type="radio" v-model="tipoRelatorio" :value="tipo.value" class="w-4 h-4 text-blue-600 focus:ring-blue-500">
                <span class="text-sm font-medium" :class="tipoRelatorio === tipo.value ? 'text-blue-900' : 'text-gray-700'">
                  {{ tipo.label }}
                </span>
              </label>
            </div>
          </div>

        </div>

        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button @click="modalRelatorioAberto = false" class="px-4 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors text-sm">
            Cancelar
          </button>
          
          <button 
            @click="baixarPDF" 
            :disabled="gerandoPDF"
            class="px-6 py-2 bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center gap-2 text-sm disabled:opacity-70"
          >
            <UIcon v-if="gerandoPDF" name="i-heroicons-arrow-path" class="w-4 h-4 animate-spin" />
            <UIcon v-else name="i-heroicons-arrow-down-tray" class="w-4 h-4" />
            {{ gerandoPDF ? 'Gerando...' : 'Baixar PDF' }}
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

definePageMeta({ layout: 'default' })

// ----------------------------------------------------
// NAVEGAÇÃO E DATA
// ----------------------------------------------------
const dataAtual = ref(new Date())
const nomeMesAtual = computed(() => dataAtual.value.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }))
const ehMesFuturo = computed(() => {
  const hoje = new Date()
  return dataAtual.value > hoje
})

function mudarMes(delta: number) {
  const d = new Date(dataAtual.value)
  d.setMonth(d.getMonth() + delta)
  dataAtual.value = d
  refresh()
}

const params = computed(() => ({
  mes: dataAtual.value.getMonth() + 1,
  ano: dataAtual.value.getFullYear()
}))

// ----------------------------------------------------
// FETCH DE DADOS (KPIs)
// ----------------------------------------------------
const { data: stats, pending, refresh, error } = await useFetch('/api/financeiro/stats', { query: params, lazy: true })

// ----------------------------------------------------
// TABELA DO EXTRATO (FRONTEND FILTER)
// ----------------------------------------------------
const abas = [
  { label: 'Todos', value: 'todos' },
  { label: 'Vendas', value: 'saida' },
  { label: 'Entradas', value: 'entrada' },
  { label: 'Despesas', value: 'despesa' }
]
const abaAtiva = ref('todos')

const historicoFiltrado = computed(() => {
  if (!stats.value || !stats.value.extrato) return []
  
  const movs = (stats.value.extrato.movimentacoes || []).map((m: any) => ({
    id: m.id, data: m.createdAt, tipo: m.tipo, 
    valor: Number(m.peca?.preco || 0) * m.quantidade, peca: m.peca, descricao: ''
  }))

  const desps = (stats.value.extrato.despesas || []).map((d: any) => ({
    id: d.id, data: d.data, tipo: 'DESPESA', valor: Number(d.valor), descricao: d.descricao, peca: null
  }))

  let lista = [...movs, ...desps]
  if (abaAtiva.value === 'saida') lista = lista.filter(i => i.tipo === 'SAIDA')
  else if (abaAtiva.value === 'entrada') lista = lista.filter(i => i.tipo === 'ENTRADA')
  else if (abaAtiva.value === 'despesa') lista = lista.filter(i => i.tipo === 'DESPESA')

  return lista.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
})

// ----------------------------------------------------
// MODAL META
// ----------------------------------------------------
const modalMetaAberto = ref(false)
const novaMeta = ref('')
const salvandoMeta = ref(false)

function abrirModalMeta() {
  if (stats.value) novaMeta.value = String(stats.value.meta.alvo)
  modalMetaAberto.value = true
}

async function salvarMeta() {
  if (!novaMeta.value) return
  salvandoMeta.value = true
  try { await $fetch('/api/financeiro/meta', { method: 'POST', body: { valor: novaMeta.value } }); modalMetaAberto.value = false; refresh() } catch {} finally { salvandoMeta.value = false }
}

// ----------------------------------------------------
// RELATÓRIO PDF (API + JSPDF)
// ----------------------------------------------------
const modalRelatorioAberto = ref(false)
const gerandoPDF = ref(false)
const periodoRelatorio = ref(1) // Meses
const tipoRelatorio = ref('todos')

const opcoesPeriodo = Array.from({ length: 12 }, (_, i) => ({
  label: i === 0 ? 'Mês Atual' : `Últimos ${i + 1} meses`,
  value: i + 1
}))

const opcoesTipo = [
  { label: 'Tudo (Extrato Completo)', value: 'todos' },
  { label: 'Apenas Vendas', value: 'saida' },
  { label: 'Apenas Entradas de Estoque', value: 'entrada' },
  { label: 'Apenas Despesas', value: 'despesa' }
]

function abrirModalRelatorios() {
  modalRelatorioAberto.value = true
}

async function baixarPDF() {
  gerandoPDF.value = true
  try {
    // 1. CHAMA A API QUE CRIAMOS PARA PEGAR DADOS DE X MESES
    const dados = await $fetch('/api/financeiro/relatorio', {
      method: 'POST',
      body: {
        meses: periodoRelatorio.value,
        tipo: tipoRelatorio.value
      }
    })

    // 2. GERA O PDF NO CLIENTE
    const doc = new jsPDF()
    
    // Cabeçalho
    doc.setFontSize(18)
    doc.text('Relatório Financeiro - Eli Peças', 14, 15)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 22)
    doc.text(`Período de Análise: Últimos ${periodoRelatorio.value} meses`, 14, 27)

    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32); // Linha separadora

    // Resumo Financeiro
    doc.setFontSize(12)
    doc.setTextColor(0)
    doc.text('Resumo do Período:', 14, 40)
    
    doc.setFontSize(10)
    doc.setTextColor(0, 128, 0) // Verde Escuro
    doc.text(`Receita/Vendas: ${formatarDinheiro(dados.resumo.receita)}`, 14, 48)
    
    doc.setTextColor(180, 0, 0) // Vermelho
    doc.text(`Despesas Totais: ${formatarDinheiro(dados.resumo.despesa)}`, 80, 48)
    
    const corSaldo = dados.resumo.saldo >= 0 ? [0, 0, 0] : [220, 0, 0]
    doc.setTextColor(corSaldo[0], corSaldo[1], corSaldo[2])
    doc.setFont("helvetica", "bold");
    doc.text(`Saldo Líquido: ${formatarDinheiro(dados.resumo.saldo)}`, 140, 48)

    // Tabela
    const colunas = ["Data", "Descrição", "Tipo", "Valor (R$)"]
    const linhas = dados.itens.map((item: any) => [
      new Date(item.data).toLocaleDateString('pt-BR'),
      item.descricao,
      item.tipo === 'SAIDA' ? 'VENDA' : (item.tipo === 'ENTRADA' ? 'ENTRADA' : 'DESPESA'),
      formatarDinheiro(item.valor)
    ])

    autoTable(doc, {
      startY: 55,
      head: [colunas],
      body: linhas,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40] }, // Cabeçalho preto
      styles: { fontSize: 8 },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold' } // Coluna Valor alinhada a direita
      },
      didParseCell: function (data) {
        // Pinta valores de despesa de vermelho na tabela
        if (data.section === 'body' && data.column.index === 3) {
          const rawRow = dados.itens[data.row.index];
          if (rawRow.tipo === 'DESPESA') {
            data.cell.styles.textColor = [180, 0, 0];
          } else {
            data.cell.styles.textColor = [0, 128, 0];
          }
        }
      }
    })

    // Download
    doc.save(`relatorio_eli_pecas_${new Date().toISOString().split('T')[0]}.pdf`)
    modalRelatorioAberto.value = false

  } catch (e) {
    alert('Erro ao gerar PDF. Verifique sua conexão.')
    console.error(e)
  } finally {
    gerandoPDF.value = false
  }
}

// ----------------------------------------------------
// HELPERS
// ----------------------------------------------------
function formatarDinheiro(val: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0) }

function getBadgeClass(tipo: string) {
  if (tipo === 'SAIDA') return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  if (tipo === 'ENTRADA') return 'bg-blue-100 text-blue-700 border-blue-200'
  return 'bg-red-100 text-red-700 border-red-200'
}

function getLabelTipo(tipo: string) {
  if (tipo === 'SAIDA') return 'Venda'
  if (tipo === 'ENTRADA') return 'Estoque'
  return 'Despesa'
}

function getValorClass(tipo: string) {
  if (tipo === 'SAIDA' || tipo === 'ENTRADA') return 'text-emerald-600'
  return 'text-red-600'
}

function getSinal(tipo: string) {
  if (tipo === 'DESPESA') return '-'
  return '+'
}
</script>