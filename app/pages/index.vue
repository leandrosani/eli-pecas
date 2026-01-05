<template>
  <div class="p-4 pb-24 max-w-7xl mx-auto space-y-6">

    <!-- 1. HEADER COM SAUDAÇÃO E RESUMO DO DIA -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">
          Olá, Administrador 👋
        </h1>
        <p class="text-sm text-gray-500 font-medium">Resumo operacional de hoje, {{ dataHoje }}.</p>
      </div>
      
      <!-- Card de Vendas do Dia (Destaque Absoluto) -->
      <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-emerald-200 flex items-center gap-4 w-full md:w-auto">
        <div class="bg-white/20 p-2 rounded-xl">
          <UIcon name="i-heroicons-currency-dollar" class="w-8 h-8 text-white" />
        </div>
        <div>
          <p class="text-xs font-bold text-emerald-100 uppercase tracking-wider">Vendas Hoje</p>
          <p class="text-2xl font-black">{{ formatarDinheiro(resumoDia.totalVendas) }}</p>
        </div>
        <div class="h-8 w-[1px] bg-white/30 mx-2"></div>
        <div class="text-center">
          <p class="text-xl font-bold leading-none">{{ resumoDia.qtdVendas }}</p>
          <p class="text-[10px] uppercase font-bold text-emerald-100">Peças</p>
        </div>
      </div>
    </div>

    <!-- 2. ATALHOS RÁPIDOS (O QUE VOCÊ MAIS USA) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      
      <NuxtLink to="/estoque" class="group bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col items-center justify-center gap-2 h-32">
        <div class="bg-blue-50 text-blue-600 p-3 rounded-full group-hover:scale-110 transition-transform">
          <UIcon name="i-heroicons-magnifying-glass" class="w-8 h-8" />
        </div>
        <span class="font-bold text-gray-700 group-hover:text-blue-700">Buscar Peça</span>
      </NuxtLink>

      <NuxtLink to="/estoque/criar" class="group bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-800 transition-all flex flex-col items-center justify-center gap-2 h-32">
        <div class="bg-gray-100 text-gray-800 p-3 rounded-full group-hover:scale-110 transition-transform">
          <UIcon name="i-heroicons-plus" class="w-8 h-8" />
        </div>
        <span class="font-bold text-gray-700 group-hover:text-gray-900">Cadastrar Peça</span>
      </NuxtLink>

      <NuxtLink to="/despesas/criar" class="group bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-red-300 transition-all flex flex-col items-center justify-center gap-2 h-32">
        <div class="bg-red-50 text-red-600 p-3 rounded-full group-hover:scale-110 transition-transform">
          <UIcon name="i-heroicons-banknotes" class="w-8 h-8" />
        </div>
        <span class="font-bold text-gray-700 group-hover:text-red-700">Lançar Despesa</span>
      </NuxtLink>

      <NuxtLink to="/financeiro" class="group bg-white p-4 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col items-center justify-center gap-2 h-32">
        <div class="bg-emerald-50 text-emerald-600 p-3 rounded-full group-hover:scale-110 transition-transform">
          <UIcon name="i-heroicons-chart-pie" class="w-8 h-8" />
        </div>
        <span class="font-bold text-gray-700 group-hover:text-emerald-700">Ver Lucro</span>
      </NuxtLink>

    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- 3. ÚLTIMAS MOVIMENTAÇÕES (FEED DE ATIVIDADE) -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div class="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 class="font-bold text-gray-900 flex items-center gap-2">
            <UIcon name="i-heroicons-clock" class="text-gray-500" />
            Aconteceu Recentemente
          </h3>
          <UButton to="/estoque" size="xs" variant="ghost" color="gray">Ver tudo</UButton>
        </div>

        <div class="divide-y divide-gray-100">
          <div v-for="mov in ultimasMovimentacoes" :key="mov.id" class="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
            <!-- Ícone -->
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              :class="mov.tipo === 'SAIDA' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'"
            >
              <UIcon :name="mov.tipo === 'SAIDA' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-archive-box-arrow-down'" class="w-5 h-5" />
            </div>

            <!-- Texto -->
            <div class="flex-1 min-w-0">
              <p class="text-sm font-bold text-gray-900 truncate">
                {{ mov.tipo === 'SAIDA' ? 'Venda realizada' : 'Estoque adicionado' }}
              </p>
              <p class="text-xs text-gray-500 truncate">
                {{ mov.peca?.nome }} ({{ mov.peca?.modelo }}) - {{ mov.quantidade }} un.
              </p>
            </div>

            <!-- Valor/Data -->
            <div class="text-right">
              <p class="text-sm font-bold" :class="mov.tipo === 'SAIDA' ? 'text-emerald-600' : 'text-gray-400'">
                {{ mov.tipo === 'SAIDA' ? '+' : '' }}{{ formatarDinheiro(Number(mov.peca?.preco || 0) * mov.quantidade) }}
              </p>
              <p class="text-[10px] text-gray-400">
                {{ formatarHora(mov.createdAt) }}
              </p>
            </div>
          </div>

          <div v-if="!ultimasMovimentacoes.length" class="p-8 text-center text-gray-400 text-sm">
            Nenhuma atividade hoje.
          </div>
        </div>
      </div>

      <!-- 4. ALERTA RÁPIDO -->
      <div class="space-y-6">
        <!-- Status da Meta (Mini) -->
        <div class="bg-gray-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden">
          <div class="relative z-10">
            <p class="text-xs text-gray-400 font-bold uppercase mb-2">Meta do Mês</p>
            <div class="flex items-end gap-2 mb-3">
              <span class="text-3xl font-black">{{ progressoMeta.toFixed(0) }}%</span>
              <span class="text-sm text-gray-400 mb-1">concluída</span>
            </div>
            <div class="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div class="bg-green-500 h-full rounded-full transition-all duration-1000" :style="{ width: `${Math.min(progressoMeta, 100)}%` }"></div>
            </div>
            <div class="mt-4">
               <UButton to="/financeiro" size="xs" color="white" variant="solid" block class="text-gray-900 font-bold">Ver Detalhes</UButton>
            </div>
          </div>
        </div>

        <!-- Estoque Baixo / Avisos -->
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
          <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <UIcon name="i-heroicons-bell" class="text-orange-500" />
            Lembretes
          </h3>
          <ul class="space-y-3">
            <li class="flex items-center gap-3 text-sm text-gray-600 bg-orange-50 p-2 rounded-lg border border-orange-100">
              <span class="w-2 h-2 rounded-full bg-orange-500"></span>
              Você tem {{ itensParados }} itens parados há +90 dias.
            </li>
            <li class="flex items-center gap-3 text-sm text-gray-600 bg-blue-50 p-2 rounded-lg border border-blue-100">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              {{ totalEstoque }} itens cadastrados no total.
            </li>
          </ul>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

// Data atual formatada
const dataHoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })

// Buscar dados resumidos (Reutilizando a API de stats para consistência)
const hoje = new Date()
const params = { mes: hoje.getMonth() + 1, ano: hoje.getFullYear() }

const { data: stats } = await useFetch('/api/financeiro/stats', { query: params, lazy: true })

// Computados para a View
const resumoDia = computed(() => {
  if (!stats.value) return { totalVendas: 0, qtdVendas: 0 }
  
  // Filtra as movimentações para pegar apenas as de HOJE
  const hojeString = new Date().toDateString()
  const vendasHoje = stats.value.extrato.movimentacoes.filter((m: any) => 
    m.tipo === 'SAIDA' && new Date(m.createdAt).toDateString() === hojeString
  )

  const total = vendasHoje.reduce((acc: number, m: any) => acc + (Number(m.peca?.preco || 0) * m.quantidade), 0)
  const qtd = vendasHoje.length

  return { totalVendas: total, qtdVendas: qtd }
})

const ultimasMovimentacoes = computed(() => {
  if (!stats.value) return []
  // Pega as últimas 5 do mês
  return stats.value.extrato.movimentacoes.slice(0, 5)
})

const progressoMeta = computed(() => stats.value?.meta.progresso || 0)
const itensParados = computed(() => stats.value?.parados.qtd || 0)
// Estimativa do total de estoque (soma parados + oportunidades + margem de erro)
const totalEstoque = computed(() => (stats.value?.oportunidades.length || 0) + (stats.value?.parados.qtd || 0) + 100) 

// Helpers
function formatarDinheiro(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
}

function formatarHora(dataIso: string) {
  return new Date(dataIso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
</script>