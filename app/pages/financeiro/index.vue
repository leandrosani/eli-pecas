<template>
  <div class="p-4 pb-24 max-w-7xl mx-auto space-y-6">
    
    <!-- HEADER SIMPLIFICADO -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">Painel Financeiro</h1>
        <p class="text-sm text-gray-500 font-medium">Sua bússola para tomada de decisão.</p>
      </div>
      <UButton icon="i-heroicons-arrow-path" color="gray" variant="soft" :loading="pending" @click="refresh">Atualizar</UButton>
    </div>

    <div v-if="pending" class="py-20 text-center text-gray-400">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin mb-2" />
      <p>Calculando a rota do dinheiro...</p>
    </div>

    <template v-else-if="stats">
      
      <!-- 🎯 BLOCO 1: META MENSAL (O Norte) -->
      <div class="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <!-- Background Effect -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>

        <div class="relative z-10">
          <div class="flex justify-between items-end mb-4">
            <div>
              <h2 class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">Meta de Lucro (Mês)</h2>
              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-black">{{ formatarDinheiro(stats.meta.atual) }}</span>
                <span class="text-gray-400 font-medium">/ {{ formatarDinheiro(stats.meta.alvo) }}</span>
              </div>
            </div>
            <div class="text-right">
              <span class="text-3xl font-bold" :class="stats.meta.progresso >= 100 ? 'text-green-400' : 'text-blue-400'">
                {{ stats.meta.progresso.toFixed(0) }}%
              </span>
            </div>
          </div>

          <!-- Barra de Progresso -->
          <div class="w-full bg-gray-700 h-4 rounded-full overflow-hidden">
            <div 
              class="h-full rounded-full transition-all duration-1000 ease-out relative"
              :class="stats.meta.progresso >= 100 ? 'bg-green-500' : 'bg-blue-500'"
              :style="{ width: `${Math.min(stats.meta.progresso, 100)}%` }"
            >
              <div class="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>

          <div class="mt-4 flex gap-4 text-sm font-medium">
            <div class="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
              <span class="text-gray-400">Falta:</span>
              <span class="text-white ml-1 font-bold">{{ formatarDinheiro(Math.max(0, stats.meta.alvo - stats.meta.atual)) }}</span>
            </div>
            <div class="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
              <span class="text-gray-400">Caixa Total (Histórico):</span>
              <span class="text-emerald-400 ml-1 font-bold">{{ formatarDinheiro(stats.saldoCaixa) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- GRID DE AÇÃO -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- 🔥 BLOCO 2: OPORTUNIDADES (Vender Agora) -->
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div class="p-5 border-b border-gray-100 bg-orange-50/50">
            <h3 class="font-bold text-gray-900 flex items-center gap-2">
              <span class="bg-orange-100 text-orange-600 p-1.5 rounded-lg"><UIcon name="i-heroicons-fire" class="w-5 h-5" /></span>
              Produtos Prioritários
            </h3>
            <p class="text-xs text-gray-500 mt-1">Alta margem + Estoque disponível. Ofereça estes!</p>
          </div>
          
          <div class="flex-1 p-0">
            <table class="w-full text-left text-sm">
              <thead class="bg-gray-50 text-gray-500 font-medium">
                <tr>
                  <th class="p-4 py-3">Peça</th>
                  <th class="p-4 py-3 text-right">Margem</th>
                  <th class="p-4 py-3 text-right">Lucro Un.</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="item in stats.oportunidades" :key="item.id" class="group hover:bg-orange-50/30 transition-colors">
                  <td class="p-4 py-3">
                    <div class="font-bold text-gray-900">{{ item.nome }}</div>
                    <div class="text-xs text-gray-500">{{ item.modelo }} • {{ item.estoque }} un em estoque</div>
                  </td>
                  <td class="p-4 py-3 text-right">
                    <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{{ item.margem.toFixed(0) }}%</span>
                  </td>
                  <td class="p-4 py-3 text-right font-bold text-gray-900">
                    {{ formatarDinheiro(item.lucroUnit) }}
                  </td>
                </tr>
                <tr v-if="!stats.oportunidades.length">
                  <td colspan="3" class="p-8 text-center text-gray-400 text-xs">
                    <p>Nenhuma oportunidade óbvia encontrada.</p>
                    <p>Cadastre custos nas peças para ver as margens.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 🧊 BLOCO 3: PROBLEMAS (Estoque Parado) -->
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
                    Se você liquidar esses itens com <strong>15% de desconto</strong>, poderá liberar aproximadamente 
                    <span class="font-black bg-white px-1 rounded">{{ formatarDinheiro(stats.parados.vendaTotal * 0.85) }}</span> 
                    em caixa imediato.
                  </p>
                </div>
              </div>
            </div>
            
            <UButton block color="gray" variant="solid" to="/estoque">
              Ir para Estoque
            </UButton>
          </div>
        </div>

      </div>

    </template>

    <div v-else-if="error" class="py-20 text-center">
      <p class="text-red-500 font-bold mb-2">Erro ao carregar dados.</p>
      <p class="text-xs text-gray-400 mb-4">{{ error.message }}</p>
      <UButton size="sm" color="red" variant="soft" class="mt-2" @click="refresh">Tentar novamente</UButton>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: stats, pending, refresh, error } = await useFetch('/api/financeiro/stats', { lazy: true })

function formatarDinheiro(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
}
</script>