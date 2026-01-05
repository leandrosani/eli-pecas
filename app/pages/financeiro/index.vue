<template>
  <div class="p-4 pb-24 max-w-7xl mx-auto space-y-6">
    
    <!-- HEADER COM CONTROLES -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
          Painel Financeiro
        </h1>
        <p class="text-sm text-gray-500 font-medium">Sua bússola para tomada de decisão.</p>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <!-- Seletor de Mês -->
        <div class="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm h-9">
          <button @click="mudarMes(-1)" class="p-2 hover:bg-gray-100 rounded-l-lg text-gray-600 border-r border-gray-100">
            <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
          </button>
          <span class="px-3 py-1.5 text-sm font-bold text-gray-900 min-w-[100px] text-center capitalize select-none">
            {{ nomeMesAtual }}
          </span>
          <button @click="mudarMes(1)" :disabled="ehMesFuturo" class="p-2 hover:bg-gray-100 rounded-r-lg text-gray-600 border-l border-gray-100 disabled:opacity-50">
            <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
          </button>
        </div>

        <UButton icon="i-heroicons-arrow-path" color="gray" variant="soft" :loading="pending" @click="refresh" square />
        
        <UButton icon="i-heroicons-document-text" color="black" @click="abrirModalRelatorios">Relatórios</UButton>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="pending" class="py-20 text-center text-gray-400">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin mb-2" />
      <p>Calculando a rota do dinheiro...</p>
    </div>

    <!-- CONTEÚDO PRINCIPAL -->
    <template v-else-if="stats">
      
      <!-- 🎯 BLOCO 1: META MENSAL (EDITÁVEL) -->
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
          <div class="flex justify-between items-end mb-4">
            <div>
              <h2 class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                Meta de Lucro ({{ stats.periodo.tipo === 'anual' ? 'Anual' : 'Mês' }})
              </h2>
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-black">{{ formatarDinheiro(stats.meta.atual) }}</span>
                <span class="text-gray-400 font-medium">/ {{ formatarDinheiro(stats.meta.alvo) }}</span>
              </div>
            </div>
            <div class="text-right pr-12"> 
              <span class="text-3xl font-bold" :class="stats.meta.progresso >= 100 ? 'text-green-400' : 'text-blue-400'">
                {{ stats.meta.progresso.toFixed(0) }}%
              </span>
            </div>
          </div>

          <!-- Barra de Progresso -->
          <div class="w-full bg-gray-700 h-4 rounded-full overflow-hidden mb-4">
            <div 
              class="h-full rounded-full transition-all duration-1000 ease-out relative"
              :class="stats.meta.progresso >= 100 ? 'bg-green-500' : 'bg-blue-500'"
              :style="{ width: `${Math.min(stats.meta.progresso, 100)}%` }"
            >
              <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
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
              <span class="text-green-100 font-bold">Meta Batida!</span>
            </div>

            <div class="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 ml-auto">
              <span class="text-gray-400">Caixa Total (Acumulado):</span>
              <span class="text-emerald-400 ml-1 font-bold">{{ formatarDinheiro(stats.saldoCaixa) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- GRID DE AÇÃO -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- 🔥 OPORTUNIDADES -->
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
                    <div class="text-xs text-gray-500">{{ item.modelo }} • {{ item.estoque }} un em estoque</div>
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
                    Sem dados suficientes de venda recente ou cadastro de custo.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 🧊 PROBLEMAS -->
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

      <!-- EXTRATO DETALHADO -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="p-3 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row justify-between items-center gap-3">
          <h2 class="font-bold text-gray-700 flex items-center gap-2">
            <UIcon name="i-heroicons-list-bullet" class="text-gray-400" /> 
            Extrato do Período
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
                  <span v-if="mov.tipo === 'ENTRADA'" class="text-gray-400 text-xs font-normal">Estoque</span>
                  <span v-else>{{ getSinal(mov.tipo) }} {{ formatarDinheiro(mov.valor) }}</span>
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

    <!-- ✅ MODAL MANUAL DE META -->
    <div v-if="modalMetaAberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">Definir Meta</h3>
          <button @click="modalMetaAberto = false" class="text-gray-400 hover:text-gray-600"><UIcon name="i-heroicons-x-mark" class="w-6 h-6" /></button>
        </div>
        <div class="p-6">
          <p class="text-sm text-gray-500 mb-6">Qual o valor de <strong>LUCRO</strong> desejado?</p>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
            <input v-model="novaMeta" type="number" class="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-lg font-bold text-gray-900 focus:border-blue-500 outline-none" />
          </div>
        </div>
        <div class="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button @click="modalMetaAberto = false" class="px-4 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl">Cancelar</button>
          <button @click="salvarMeta" :disabled="salvandoMeta" class="px-6 py-2.5 bg-black text-white font-bold rounded-xl hover:bg-gray-800">{{ salvandoMeta ? 'Salvando...' : 'Salvar' }}</button>
        </div>
      </div>
    </div>

    <!-- ✅ MODAL MANUAL DE RELATÓRIOS -->
    <div v-if="modalRelatorioAberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-gray-500" />
            Relatórios PDF
          </h3>
          <button @click="modalRelatorioAberto = false" class="text-gray-400 hover:text-gray-600"><UIcon name="i-heroicons-x-mark" class="w-6 h-6" /></button>
        </div>
        <div class="p-6 space-y-4">
          <!-- Seletor de Período -->
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase mb-2 block">Período</label>
            <div class="flex gap-2">
              <button @click="periodoRelatorio = 'mensal'" :class="periodoRelatorio === 'mensal' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'" class="flex-1 py-2 rounded-lg text-sm font-bold border transition-colors">Mês Atual</button>
              <button @click="periodoRelatorio = 'anual'" :class="periodoRelatorio === 'anual' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'" class="flex-1 py-2 rounded-lg text-sm font-bold border transition-colors">Ano {{ anoSelecionado }}</button>
            </div>
          </div>
          
          <!-- Seletor de Tipo -->
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase mb-2 block">Conteúdo</label>
             <select v-model="filtroRelatorio" class="w-full p-2 bg-gray-50 border rounded-lg text-sm font-medium cursor-pointer">
               <option value="todos">Completo (Vendas + Despesas)</option>
               <option value="vendas">Apenas Vendas</option>
               <option value="despesas">Apenas Despesas</option>
               <option value="entradas">Apenas Entradas de Estoque</option>
             </select>
          </div>

          <button @click="imprimirRelatorio" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 mt-2">
            <UIcon name="i-heroicons-printer" class="w-5 h-5" /> Gerar PDF
          </button>
        </div>
      </div>
    </div>

    <!-- ÁREA DE IMPRESSÃO (Oculta na tela, visível no Print) -->
    <div id="print-area" class="hidden print:block bg-white text-black p-8 font-sans">
      <div class="text-center border-b-2 border-black pb-4 mb-6">
        <h1 class="text-2xl font-black uppercase tracking-wider">Relatório Financeiro - Eli Peças</h1>
        <p class="text-sm text-gray-600 uppercase font-bold">{{ periodoRelatorio === 'anual' ? `Ano ${anoSelecionado}` : nomeMesAtual }} | {{ filtroRelatorio.toUpperCase() }}</p>
      </div>

      <!-- Resumo do Período -->
      <div v-if="stats && filtroRelatorio === 'todos'" class="grid grid-cols-3 gap-4 mb-8 text-sm border-b pb-8">
         <div class="border p-2 rounded"><p class="text-gray-500 text-xs">Faturamento</p><p class="text-xl font-bold">{{ formatarDinheiro(stats.mes.faturamento) }}</p></div>
         <div class="border p-2 rounded"><p class="text-gray-500 text-xs">Lucro Operacional</p><p class="text-xl font-bold">{{ formatarDinheiro(stats.mes.lucroOperacional) }}</p></div>
         <div class="border p-2 rounded bg-gray-100"><p class="text-gray-500 text-xs">Caixa Atual</p><p class="text-xl font-bold">{{ formatarDinheiro(stats.saldoCaixa) }}</p></div>
      </div>

      <table class="w-full text-xs border-collapse">
        <thead><tr class="border-b-2 border-black"><th class="py-2 text-left">Data</th><th class="py-2 text-left">Descrição</th><th class="py-2 text-center">Tipo</th><th class="py-2 text-right">Valor</th></tr></thead>
        <tbody>
          <tr v-for="m in historicoFiltrado" :key="m.id" class="border-b border-gray-200">
             <td class="py-2">{{ new Date(m.data).toLocaleDateString() }}</td>
             <td class="py-2">{{ m.descricao || m.peca?.nome }} <span v-if="m.peca?.modelo">({{ m.peca.modelo }})</span></td>
             <td class="py-2 text-center uppercase font-bold text-[10px]">{{ getLabelTipo(m.tipo) }}</td>
             <td class="py-2 text-right font-bold">{{ m.tipo === 'DESPESA' ? '-' : (m.tipo === 'ENTRADA' ? '' : '+') }} {{ formatarDinheiro(m.valor) }}</td>
          </tr>
        </tbody>
      </table>
      
      <div class="mt-8 pt-4 border-t text-center text-[10px] text-gray-400">
        Gerado automaticamente pelo sistema Eli Peças em {{ new Date().toLocaleString() }}
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

definePageMeta({ layout: 'default' })

/* ===============================
 * DATA / NAVEGAÇÃO DE PERÍODO
 * =============================== */
const dataAtual = ref(new Date())

const nomeMesAtual = computed(() =>
  dataAtual.value.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
)

const anoSelecionado = computed(() => dataAtual.value.getFullYear())

const ehMesFuturo = computed(() => {
  const hoje = new Date()
  return (
    dataAtual.value.getFullYear() > hoje.getFullYear() ||
    (dataAtual.value.getFullYear() === hoje.getFullYear() &&
      dataAtual.value.getMonth() > hoje.getMonth())
  )
})

function mudarMes(delta: number) {
  const d = new Date(dataAtual.value)
  d.setMonth(d.getMonth() + delta)
  dataAtual.value = d
}

/* ===============================
 * RELATÓRIOS
 * =============================== */
const periodoRelatorio = ref<'mensal' | 'anual'>('mensal')
const filtroRelatorio = ref<'todos' | 'vendas' | 'despesas' | 'entradas'>('todos')

/* ===============================
 * PARAMS DA API
 * =============================== */
const params = computed(() => ({
  mes: periodoRelatorio.value === 'anual' ? 0 : dataAtual.value.getMonth() + 1,
  ano: dataAtual.value.getFullYear()
}))

const { data: stats, pending, refresh, error } = await useFetch(
  '/api/financeiro/stats',
  { query: params, lazy: true }
)

watch(periodoRelatorio, () => refresh())

/* ===============================
 * EXTRATO
 * =============================== */
const abas = [
  { label: 'Todos', value: 'todos' },
  { label: 'Vendas', value: 'saida' },
  { label: 'Entradas', value: 'entrada' },
  { label: 'Despesas', value: 'despesa' }
]

const abaAtiva = ref('todos')

const historicoFiltrado = computed(() => {
  if (!stats.value?.extrato) return []

  const movimentacoes =
    stats.value.extrato.movimentacoes?.map((m: any) => ({
      id: m.id,
      data: m.createdAt,
      tipo: m.tipo,
      valor:
        m.tipo === 'ENTRADA'
          ? 0
          : Number(m.peca?.preco || 0) * m.quantidade,
      peca: m.peca,
      descricao: ''
    })) || []

  const despesas =
    stats.value.extrato.despesas?.map((d: any) => ({
      id: d.id,
      data: d.data,
      tipo: 'DESPESA',
      valor: Number(d.valor),
      descricao: d.descricao,
      peca: null
    })) || []

  let lista = [...movimentacoes, ...despesas]

  if (!modalRelatorioAberto.value && abaAtiva.value !== 'todos') {
    lista = lista.filter(i =>
      i.tipo.toLowerCase().includes(abaAtiva.value)
    )
  }

  if (modalRelatorioAberto.value) {
    if (filtroRelatorio.value === 'vendas')
      lista = lista.filter(i => i.tipo === 'SAIDA')
    if (filtroRelatorio.value === 'despesas')
      lista = lista.filter(i => i.tipo === 'DESPESA')
    if (filtroRelatorio.value === 'entradas')
      lista = lista.filter(i => i.tipo === 'ENTRADA')
  }

  return lista.sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  )
})

/* ===============================
 * MODAIS / META
 * =============================== */
const modalMetaAberto = ref(false)
const modalRelatorioAberto = ref(false)

const novaMeta = ref('')
const salvandoMeta = ref(false)

function abrirModalMeta() {
  if (stats.value) novaMeta.value = String(stats.value.meta.alvo)
  modalMetaAberto.value = true
}

function abrirModalRelatorios() {
  modalRelatorioAberto.value = true
  periodoRelatorio.value = 'mensal'
  filtroRelatorio.value = 'todos'
}

async function salvarMeta() {
  if (!novaMeta.value) return
  salvandoMeta.value = true
  try {
    await $fetch('/api/financeiro/meta', {
      method: 'POST',
      body: { valor: novaMeta.value }
    })
    modalMetaAberto.value = false
    refresh()
  } finally {
    salvandoMeta.value = false
  }
}

function imprimirRelatorio() {
  setTimeout(() => {
    window.print()
    modalRelatorioAberto.value = false
    periodoRelatorio.value = 'mensal'
  }, 400)
}

/* ===============================
 * HELPERS VISUAIS
 * =============================== */
function formatarDinheiro(val: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(val || 0)
}

function getBadgeClass(tipo: string) {
  if (tipo === 'SAIDA') return 'bg-emerald-100 text-emerald-700'
  if (tipo === 'ENTRADA') return 'bg-blue-100 text-blue-700'
  return 'bg-red-100 text-red-700'
}

function getLabelTipo(tipo: string) {
  if (tipo === 'SAIDA') return 'Venda'
  if (tipo === 'ENTRADA') return 'Estoque'
  return 'Despesa'
}

function getValorClass(tipo: string) {
  if (tipo === 'SAIDA') return 'text-emerald-600'
  if (tipo === 'ENTRADA') return 'text-gray-400'
  return 'text-red-600'
}

function getSinal(tipo: string) {
  if (tipo === 'DESPESA') return '-'
  if (tipo === 'ENTRADA') return ''
  return '+'
}
</script>


<style>
@media print {
  body * { visibility: hidden; }
  #print-area, #print-area * { visibility: visible; }
  #print-area { position: absolute; left: 0; top: 0; width: 100%; min-height: 100vh; display: block !important; padding: 20px; background: white; }
  @page { margin: 0.5cm; }
}
</style>