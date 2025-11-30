<template>
  <div class="pb-20 relative">
    
    <!-- CABEÇALHO COM FILTRO DE MÊS -->
    <div class="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Análise Financeira</h1>
          <p class="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">
            Acompanhe o desempenho e extrato por período.
          </p>
        </div>

        <!-- FILTRO DE MÊS -->
        <div class="flex items-center gap-2 bg-white p-1.5 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all h-14">
          <UButton 
            icon="i-heroicons-chevron-left" 
            color="gray" 
            variant="ghost" 
            size="xs"
            @click="mudarMes(-1)" 
            class="md:size-sm hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg"
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
            class="md:size-sm hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg disabled:opacity-30"
          />
        </div>
      </div>
    </div>

    <div v-if="pending" class="text-center py-16">
      <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-600" />
      </div>
      <p class="text-sm text-gray-600 font-medium">Calculando estatísticas...</p>
      <p class="text-xs text-gray-400 mt-1">Aguarde um momento</p>
    </div>

    <!-- CARDS DE KPI -->
    <div v-else class="space-y-4 md:space-y-6">
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        
        <!-- Card 1: Vendas -->
        <div class="bg-gradient-to-br from-green-600 via-green-600 to-emerald-600 rounded-xl md:rounded-2xl p-4 md:p-6 text-white shadow-lg hover:shadow-xl relative overflow-hidden transition-all hover:scale-[1.02]">
          <div class="absolute top-0 right-0 p-2 md:p-4 opacity-10">
            <UIcon name="i-heroicons-currency-dollar" class="w-20 h-20 md:w-28 md:h-28" />
          </div>
          <div class="relative z-10">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <UIcon name="i-heroicons-arrow-trending-up" class="w-4 h-4 md:w-5 md:h-5" />
              </div>
              <p class="text-green-100 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                Vendas em {{ nomeMesAtual }}
              </p>
            </div>
            <div class="text-2xl md:text-4xl font-bold mb-3 md:mb-4">
              {{ formatarDinheiro(stats?.faturamentoMes) }}
            </div>
            <div class="flex items-center gap-2 text-xs md:text-sm bg-white/25 backdrop-blur-sm w-fit px-3 py-1.5 rounded-full border border-white/30">
              <UIcon name="i-heroicons-shopping-bag" class="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span class="font-semibold">{{ stats?.vendasCount }} vendas realizadas</span>
            </div>
          </div>
        </div>

        <!-- Card 2: Patrimônio -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100/80 rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
          <div class="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 md:p-2.5 rounded-xl shadow-sm">
              <UIcon name="i-heroicons-banknotes" class="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span class="text-[10px] md:text-xs font-bold uppercase tracking-wider text-blue-600">
              Patrimônio Ativo
            </span>
          </div>
          <div class="text-2xl md:text-4xl font-bold text-blue-900 mb-2">
            {{ formatarDinheiro(stats?.valorEstoque) }}
          </div>
          <p class="text-xs md:text-sm text-blue-700 font-medium">
            Soma do preço de todas as peças ativas.
          </p>
        </div>

        <!-- Card 3: Volume -->
        <div class="bg-gradient-to-br from-orange-50 to-orange-100/80 rounded-xl md:rounded-2xl p-4 md:p-6 border-2 border-orange-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">
          <div class="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-2 md:p-2.5 rounded-xl shadow-sm">
              <UIcon name="i-heroicons-cube" class="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <span class="text-[10px] md:text-xs font-bold uppercase tracking-wider text-orange-600">
              Volume de Peças
            </span>
          </div>
          <div class="text-2xl md:text-4xl font-bold text-orange-900 mb-2">
            {{ stats?.itensEstoque }}
          </div>
          <p class="text-xs md:text-sm text-orange-700 font-medium">
            Unidades físicas nas prateleiras.
          </p>
        </div>
      </div>

      <!-- EXTRATO -->
      <div class="bg-white border-2 border-gray-200 rounded-xl md:rounded-2xl shadow-lg overflow-hidden">
        <div class="p-4 md:p-6 border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 flex justify-between items-center">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-white" />
            </div>
            <h2 class="font-bold text-base md:text-xl text-gray-900">
              Extrato de {{ nomeMesAtual }}
            </h2>
          </div>
          <UButton 
            icon="i-heroicons-arrow-path" 
            size="xs" 
            color="gray" 
            variant="soft" 
            @click="refresh"
            class="hover:scale-105 transition-transform"
          />
        </div>
        
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gradient-to-r from-blue-800 to-blue-900">
              <tr>
                <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
                    Data
                  </div>
                </th>
                <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-tag" class="w-4 h-4" />
                    Tipo
                  </div>
                </th>
                <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-cube" class="w-4 h-4" />
                    Peça
                  </div>
                </th>
                <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 text-right">
                  <div class="flex items-center gap-2 justify-end">
                    <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4" />
                    Valor Total
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="mov in stats?.historicoMes" :key="mov.id" class="hover:bg-blue-50/30 transition-all group">
                <td class="py-4 px-6 align-middle whitespace-nowrap">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                      <UIcon name="i-heroicons-clock" class="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
                    </div>
                    <div>
                      <div class="text-sm font-semibold text-gray-900">
                        {{ new Date(mov.createdAt).toLocaleDateString('pt-BR') }}
                      </div>
                      <div class="text-xs text-gray-500">
                        {{ new Date(mov.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 align-middle">
                  <span 
                    class="px-3 py-1.5 rounded-lg text-[10px] font-bold border-2 inline-flex items-center gap-1.5 shadow-sm"
                    :class="mov.tipo === 'SAIDA' 
                      ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-300' 
                      : 'bg-gradient-to-br from-blue-50 to-blue-100 text-blue-700 border-blue-300'"
                  >
                    <UIcon 
                      :name="mov.tipo === 'SAIDA' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" 
                      class="w-3 h-3" 
                    />
                    {{ mov.tipo === 'SAIDA' ? 'VENDA' : 'ENTRADA' }}
                  </span>
                </td>
                <td class="py-4 px-6 align-middle">
                  <div class="flex items-center gap-3">
                    <div class="w-9 h-9 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <UIcon name="i-heroicons-cube" class="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div class="font-bold text-gray-900 text-sm">{{ mov.peca.nome }}</div>
                      <div class="text-xs text-gray-500 flex items-center gap-1" v-if="!mov.peca.ativo">
                        <UIcon name="i-heroicons-archive-box-x-mark" class="w-3 h-3" />
                        Peça Arquivada
                      </div>
                    </div>
                  </div>
                </td>
                <td class="py-4 px-6 align-middle text-right">
                  <div class="flex items-center justify-end gap-2">
                    <span class="text-xs text-gray-500 font-medium">{{ mov.quantidade }}x</span>
                    <span 
                      class="font-mono font-bold text-base px-3 py-1 rounded-lg"
                      :class="mov.tipo === 'SAIDA' 
                        ? 'text-green-700 bg-green-50' 
                        : 'text-gray-900 bg-gray-50'"
                    >
                      {{ mov.tipo === 'SAIDA' ? '+' : '' }} {{ formatarDinheiro(Number(mov.peca.preco) * mov.quantidade) }}
                    </span>
                  </div>
                </td>
              </tr>
              <tr v-if="!stats?.historicoMes.length">
                <td colspan="4" class="py-16 text-center">
                  <div class="flex flex-col items-center gap-3">
                    <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                      <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-gray-400" />
                    </div>
                    <div>
                      <p class="text-gray-600 font-semibold">Nenhuma movimentação</p>
                      <p class="text-gray-400 text-sm mt-1">Não há registros neste período</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards -->
        <div class="md:hidden">
          <div v-for="mov in stats?.historicoMes" :key="mov.id" class="bg-white p-4 border-b-2 border-gray-100 hover:bg-gray-50 transition-colors">
            
            <div class="flex justify-between items-start mb-2">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-clock" class="w-3.5 h-3.5 text-gray-400" />
                <span class="text-[10px] text-gray-500 font-semibold">
                  {{ new Date(mov.createdAt).toLocaleDateString('pt-BR') }} • 
                  {{ new Date(mov.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}
                </span>
              </div>
              <span 
                class="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border-2 flex items-center gap-1"
                :class="mov.tipo === 'SAIDA' 
                  ? 'bg-green-50 text-green-700 border-green-200' 
                  : 'bg-blue-50 text-blue-700 border-blue-200'"
              >
                <UIcon 
                  :name="mov.tipo === 'SAIDA' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" 
                  class="w-3 h-3" 
                />
                {{ mov.tipo === 'SAIDA' ? 'Venda' : 'Entrada' }}
              </span>
            </div>

            <div class="mb-3 flex items-center gap-2">
              <div class="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center shrink-0">
                <UIcon name="i-heroicons-cube" class="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p class="font-bold text-gray-900 text-sm leading-tight">{{ mov.peca.nome }}</p>
                <p class="text-xs text-gray-500 mt-0.5 flex items-center gap-1" v-if="!mov.peca.ativo">
                  <UIcon name="i-heroicons-archive-box-x-mark" class="w-3 h-3" />
                  Peça Arquivada
                </p>
              </div>
            </div>

            <div 
              class="flex justify-between items-center pt-3 px-3 py-2 rounded-lg border-2" 
              :class="mov.tipo === 'SAIDA' 
                ? 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200' 
                : 'bg-gradient-to-br from-gray-50 to-gray-100/50 border-gray-200'"
            >
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-cube-transparent" class="w-4 h-4 text-gray-500" />
                <span class="text-xs text-gray-600 font-bold">Qtd: {{ mov.quantidade }}</span>
              </div>
              <span 
                class="font-mono font-bold text-lg" 
                :class="mov.tipo === 'SAIDA' ? 'text-green-700' : 'text-gray-900'"
              >
                {{ mov.tipo === 'SAIDA' ? '+' : '' }} {{ formatarDinheiro(Number(mov.peca.preco) * mov.quantidade) }}
              </span>
            </div>

          </div>

          <div v-if="!stats?.historicoMes.length" class="p-12 text-center">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-gray-400" />
            </div>
            <p class="text-gray-600 font-semibold text-sm">Nenhuma movimentação</p>
            <p class="text-gray-400 text-xs mt-1">Não há registros neste período</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

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
