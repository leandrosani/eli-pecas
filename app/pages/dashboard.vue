<template>
  <div class="pb-10">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 tracking-tight">Visão Geral</h1>
        <p class="text-gray-500 text-sm">Acompanhe o desempenho financeiro.</p>
      </div>

      <div class="flex items-center gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm w-full md:w-36 justify-between md:justify-start">
        <UButton 
          icon="i-heroicons-chevron-left" 
          color="gray" 
          variant="ghost" 
          @click="mudarMes(-1)" 
        />
        <span class="font-bold text-gray-900 w-32 text-center select-none capitalize">
          {{ nomeMesAtual }}
        </span>
        <UButton 
          icon="i-heroicons-chevron-right" 
          color="gray" 
          variant="ghost" 
          @click="mudarMes(1)" 
          :disabled="ehMesFuturo"
        />
      </div>
    </div>

    <div v-if="pending" class="text-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400 mx-auto" />
      <p class="text-gray-500 mt-2">Calculando estatísticas...</p>
    </div>

    <div v-else class="space-y-8">
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div class="bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4 opacity-10">
            <UIcon name="i-heroicons-currency-dollar" class="w-24 h-24" />
          </div>
          <div class="relative z-10">
            <p class="text-green-100 text-xs font-bold uppercase tracking-wider mb-1">Vendas em {{ nomeMesAtual }}</p>
            <div class="text-3xl font-bold">{{ formatarDinheiro(stats?.faturamentoMes) }}</div>
            <div class="mt-4 flex items-center gap-2 text-sm bg-white/20 w-fit px-3 py-1 rounded-full">
              <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4" />
              <span>{{ stats?.vendasCount }} vendas realizadas</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-blue-100 text-blue-600 p-2 rounded-lg"><UIcon name="i-heroicons-banknotes" class="w-6 h-6" /></div>
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Patrimônio Ativo</span>
          </div>
          <div class="text-3xl font-bold text-gray-900">{{ formatarDinheiro(stats?.valorEstoque) }}</div>
          <p class="text-sm text-gray-500 mt-1">Soma do preço de todas as peças ativas.</p>
        </div>

        <div class="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-orange-100 text-orange-600 p-2 rounded-lg"><UIcon name="i-heroicons-cube" class="w-6 h-6" /></div>
            <span class="text-xs font-bold uppercase tracking-wider text-gray-400">Volume de Peças</span>
          </div>
          <div class="text-3xl font-bold text-gray-900">{{ stats?.itensEstoque }}</div>
          <p class="text-sm text-gray-500 mt-1">Unidades físicas nas prateleiras.</p>
        </div>
      </div>

      <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div class="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <h2 class="font-bold text-lg text-gray-900">Extrato de {{ nomeMesAtual }}</h2>
          <UButton icon="i-heroicons-arrow-path" size="xs" color="gray" variant="ghost" @click="refresh" />
        </div>
        
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-500 uppercase font-bold text-xs">
              <tr>
                <th class="px-6 py-4">Data</th>
                <th class="px-6 py-4">Tipo</th>
                <th class="px-6 py-4">Peça</th>
                <th class="px-6 py-4 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="mov in stats?.historicoMes" :key="mov.id" class="hover:bg-gray-50 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-gray-500">
                  {{ new Date(mov.createdAt).toLocaleDateString('pt-BR') }} 
                  <span class="text-xs text-gray-400 ml-1">{{ new Date(mov.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}</span>
                </td>
                <td class="px-6 py-4">
                  <span 
                    class="px-2 py-1 rounded-full text-xs font-bold"
                    :class="mov.tipo === 'SAIDA' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'"
                  >
                    {{ mov.tipo === 'SAIDA' ? 'VENDA' : 'ENTRADA' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="font-medium text-gray-900">{{ mov.peca.nome }}</div>
                  <div class="text-xs text-gray-500" v-if="!mov.peca.ativo">(Peça Excluída/Arquivada)</div>
                </td>
                <td class="px-6 py-4 text-right font-mono font-medium" :class="mov.tipo === 'SAIDA' ? 'text-green-600' : 'text-gray-900'">
                  {{ mov.tipo === 'SAIDA' ? '+' : '' }} {{ formatarDinheiro(Number(mov.peca.preco) * mov.quantidade) }}
                </td>
              </tr>
              <tr v-if="!stats?.historicoMes.length">
                <td colspan="4" class="px-6 py-10 text-center text-gray-400">Nenhuma movimentação neste período.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="md:hidden divide-y divide-gray-100">
          <div v-for="mov in stats?.historicoMes" :key="mov.id" class="p-4 bg-white flex flex-col gap-2">
            
            <div class="flex justify-between items-start">
              <span class="text-xs text-gray-400 font-medium">
                {{ new Date(mov.createdAt).toLocaleDateString('pt-BR') }} • {{ new Date(mov.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}
              </span>
              <span 
                class="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide"
                :class="mov.tipo === 'SAIDA' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700 border border-blue-100'"
              >
                {{ mov.tipo === 'SAIDA' ? 'Venda' : 'Entrada' }}
              </span>
            </div>

            <div>
              <p class="font-bold text-gray-900 text-sm leading-tight">{{ mov.peca.nome }}</p>
              <p class="text-xs text-gray-500 mt-0.5" v-if="!mov.peca.ativo">(Peça Arquivada)</p>
            </div>

            <div class="flex justify-between items-end mt-1">
              <span class="text-xs text-gray-500">Qtd: {{ mov.quantidade }}</span>
              <span class="font-mono font-bold text-base" :class="mov.tipo === 'SAIDA' ? 'text-green-600' : 'text-gray-900'">
                {{ mov.tipo === 'SAIDA' ? '+' : '' }} {{ formatarDinheiro(Number(mov.peca.preco) * mov.quantidade) }}
              </span>
            </div>

          </div>

          <div v-if="!stats?.historicoMes.length" class="p-8 text-center text-gray-400 text-sm">
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