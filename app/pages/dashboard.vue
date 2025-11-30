<template>
  <div class="pb-20 relative">
    <div class="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Visão Geral</h1>
          <p class="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">
            Acompanhe o desempenho financeiro.
          </p>
        </div>

        <div class="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <UButton 
            icon="i-heroicons-chevron-left" 
            color="gray" 
            variant="ghost" 
            size="xs"
            @click="mudarMes(-1)" 
            class="md:size-sm"
          />
          <span class="font-bold text-gray-900 text-xs md:text-sm w-24 md:w-32 text-center select-none capitalize">
            {{ nomeMesAtual }}
          </span>
          <UButton 
            icon="i-heroicons-chevron-right" 
            color="gray" 
            variant="ghost" 
            size="xs"
            @click="mudarMes(1)" 
            :disabled="ehMesFuturo"
            class="md:size-sm"
          />
        </div>
      </div>
    </div>

    <div v-if="pending" class="text-center py-12">
      <UIcon name="i-heroicons-arrow-path" class="w-7 h-7 md:w-8 md:h-8 animate-spin text-gray-400 mx-auto" />
      <p class="text-xs md:text-sm text-gray-500 mt-2">Calculando estatísticas...</p>
    </div>

    <div v-else class="space-y-4 md:space-y-6">
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2.5 md:gap-4">
        
        <div class="bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg md:rounded-xl p-3 md:p-6 text-white shadow-sm md:shadow-lg relative overflow-hidden">
          <div class="absolute top-0 right-0 p-2 md:p-4 opacity-10">
            <UIcon name="i-heroicons-currency-dollar" class="w-16 h-16 md:w-24 md:h-24" />
          </div>
          <div class="relative z-10">
            <p class="text-green-100 text-[9px] md:text-xs font-bold uppercase tracking-wider mb-0.5 md:mb-1">Vendas em {{ nomeMesAtual }}</p>
            <div class="text-xl md:text-3xl font-bold">{{ formatarDinheiro(stats?.faturamentoMes) }}</div>
            <div class="mt-2 md:mt-4 flex items-center gap-1.5 md:gap-2 text-xs md:text-sm bg-white/20 w-fit px-2 md:px-3 py-0.5 md:py-1 rounded-full">
              <UIcon name="i-heroicons-shopping-bag" class="w-3 h-3 md:w-4 md:h-4" />
              <span>{{ stats?.vendasCount }} vendas realizadas</span>
            </div>
          </div>
        </div>

        <div class="bg-gray-100 rounded-lg md:rounded-xl p-3 md:p-6 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
            <div class="bg-blue-100 text-blue-600 p-1.5 md:p-2 rounded-lg"><UIcon name="i-heroicons-banknotes" class="w-4 h-4 md:w-6 md:h-6" /></div>
            <span class="text-[9px] md:text-xs font-bold uppercase tracking-wider text-gray-400">Patrimônio Ativo</span>
          </div>
          <div class="text-xl md:text-3xl font-bold text-gray-900">{{ formatarDinheiro(stats?.valorEstoque) }}</div>
          <p class="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Soma do preço de todas as peças ativas.</p>
        </div>

        <div class="bg-white rounded-lg md:rounded-xl p-3 md:p-6 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-2 md:gap-3 mb-2 md:mb-4">
            <div class="bg-orange-100 text-orange-600 p-1.5 md:p-2 rounded-lg"><UIcon name="i-heroicons-cube" class="w-4 h-4 md:w-6 md:h-6" /></div>
            <span class="text-[9px] md:text-xs font-bold uppercase tracking-wider text-gray-400">Volume de Peças</span>
          </div>
          <div class="text-xl md:text-3xl font-bold text-gray-900">{{ stats?.itensEstoque }}</div>
          <p class="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">Unidades físicas nas prateleiras.</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="p-3 md:p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 class="font-bold text-sm md:text-lg text-gray-900">Extrato de {{ nomeMesAtual }}</h2>
          <UButton icon="i-heroicons-arrow-path" size="xs" color="gray" variant="ghost" @click="refresh" />
        </div>
        
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-blue-800">
              <tr>
                <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50">Data</th>
                <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50">Tipo</th>
                <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50">Peça</th>
                <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="mov in stats?.historicoMes" :key="mov.id" class="hover:bg-gray-50/50 transition-colors">
                <td class="py-4 px-6 align-middle whitespace-nowrap text-gray-500 text-sm">
                  {{ new Date(mov.createdAt).toLocaleDateString('pt-BR') }} 
                  <span class="text-xs text-gray-400 ml-1">{{ new Date(mov.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}</span>
                </td>
                <td class="py-4 px-6 align-middle">
                  <span 
                    class="px-2 py-1 rounded-md text-[10px] font-bold border"
                    :class="mov.tipo === 'SAIDA' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'"
                  >
                    {{ mov.tipo === 'SAIDA' ? 'VENDA' : 'ENTRADA' }}
                  </span>
                </td>
                <td class="py-4 px-6 align-middle">
                  <div class="font-bold text-gray-900 text-sm">{{ mov.peca.nome }}</div>
                  <div class="text-xs text-gray-500" v-if="!mov.peca.ativo">(Peça Excluída/Arquivada)</div>
                </td>
                <td class="py-4 px-6 align-middle text-right font-mono font-bold text-sm" :class="mov.tipo === 'SAIDA' ? 'text-green-600' : 'text-gray-900'">
                  {{ mov.tipo === 'SAIDA' ? '+' : '' }} {{ formatarDinheiro(Number(mov.peca.preco) * mov.quantidade) }}
                </td>
              </tr>
              <tr v-if="!stats?.historicoMes.length">
                <td colspan="4" class="py-12 text-center text-gray-400">
                  <p>Nenhuma movimentação neste período.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden space-y-2.5">
          <div v-for="mov in stats?.historicoMes" :key="mov.id" class="bg-white p-3 border-b border-gray-100">
            
            <div class="flex justify-between items-start mb-1">
              <span class="text-[9px] text-gray-400 font-medium">
                {{ new Date(mov.createdAt).toLocaleDateString('pt-BR') }} • {{ new Date(mov.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}
              </span>
              <span 
                class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border"
                :class="mov.tipo === 'SAIDA' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-blue-50 text-blue-700 border-blue-100'"
              >
                {{ mov.tipo === 'SAIDA' ? 'Venda' : 'Entrada' }}
              </span>
            </div>

            <div class="mb-2">
              <p class="font-bold text-gray-900 text-base leading-tight">{{ mov.peca.nome }}</p>
              <p class="text-xs text-gray-500 mt-0.5" v-if="!mov.peca.ativo">(Peça Arquivada)</p>
            </div>

            <div class="flex justify-between items-end pt-2 border-t" 
                :class="mov.tipo === 'SAIDA' ? 'bg-green-50 border-green-100' : 'bg-gray-50 border-gray-100'">
              <span class="text-xs text-gray-600 font-medium">Qtd: {{ mov.quantidade }}</span>
              <span class="font-mono font-bold text-lg" :class="mov.tipo === 'SAIDA' ? 'text-green-600' : 'text-gray-900'">
                {{ mov.tipo === 'SAIDA' ? '+' : '' }} {{ formatarDinheiro(Number(mov.peca.preco) * mov.quantidade) }}
              </span>
            </div>


          </div>

          <div v-if="!stats?.historicoMes.length" class="p-8 text-center text-gray-400 text-xs">
            Nenhuma movimentação neste período.
          </div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

// Controle de Data
const dataAtual = ref(new Date())

const nomeMesAtual = computed(() => {
  return dataAtual.value.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })
})

const ehMesFuturo = computed(() => {
  const hoje = new Date()
  return dataAtual.value.getMonth() === hoje.getMonth() && dataAtual.value.getFullYear() === hoje.getFullYear()
})

const params = computed(() => ({
  mes: dataAtual.value.getMonth() + 1, 
  ano: dataAtual.value.getFullYear() 
}))

const { data: stats, pending, refresh } = await useFetch('/api/dashboard/stats', {
  query: params
})

function mudarMes(delta: number) {
  const novaData = new Date(dataAtual.value)
  novaData.setMonth(novaData.getMonth() + delta)
  dataAtual.value = novaData
}

function formatarDinheiro(val: number) { 
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0) 
}
</script>
