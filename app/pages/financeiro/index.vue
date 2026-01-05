<template>
  <div class="p-4 pb-24 max-w-7xl mx-auto space-y-6">

    <!-- HEADER -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-black text-gray-900 tracking-tight">
          Painel Financeiro
        </h1>
        <p class="text-sm text-gray-500 font-medium">
          Sua bússola para tomada de decisão.
        </p>
      </div>

      <UButton
        icon="i-heroicons-arrow-path"
        color="gray"
        variant="soft"
        :loading="pending"
        @click="refresh"
      >
        Atualizar
      </UButton>
    </div>

    <!-- LOADING -->
    <div v-if="pending" class="py-20 text-center text-gray-400">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin mb-2" />
      <p>Calculando a rota do dinheiro...</p>
    </div>

    <!-- CONTEÚDO -->
    <template v-else-if="stats">

      <!-- 🎯 META -->
      <div class="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16"></div>

        <div class="relative z-10">
          <div class="flex justify-between items-end mb-4">
            <div>
              <h2 class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">
                Meta de Lucro ({{ stats.periodo.tipo === 'anual' ? 'Ano' : 'Mês' }})
              </h2>

              <div class="flex items-baseline gap-2">
                <span class="text-4xl font-black">
                  {{ formatarDinheiro(stats.meta.atual) }}
                </span>
                <span class="text-gray-400 font-medium">
                  / {{ formatarDinheiro(stats.meta.alvo) }}
                </span>
              </div>
            </div>

            <span
              class="text-3xl font-bold"
              :class="stats.meta.progresso >= 100 ? 'text-green-400' : 'text-blue-400'"
            >
              {{ stats.meta.progresso.toFixed(0) }}%
            </span>
          </div>

          <!-- PROGRESS BAR -->
          <div class="w-full bg-gray-700 h-4 rounded-full overflow-hidden">
            <div
              class="h-full rounded-full transition-all duration-1000 ease-out"
              :class="stats.meta.progresso >= 100 ? 'bg-green-500' : 'bg-blue-500'"
              :style="{ width: `${Math.min(stats.meta.progresso, 100)}%` }"
            />
          </div>

          <div class="mt-4 flex gap-4 text-sm font-medium flex-wrap">
            <div class="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
              <span class="text-gray-400">Falta:</span>
              <span class="text-white ml-1 font-bold">
                {{ formatarDinheiro(stats.meta.falta) }}
              </span>
            </div>

            <div class="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700">
              <span class="text-gray-400">Caixa Total:</span>
              <span class="text-emerald-400 ml-1 font-bold">
                {{ formatarDinheiro(stats.saldoCaixa) }}
              </span>
            </div>

            <div
              v-if="stats.meta.ehMesAtual && stats.meta.ritmo > 0"
              class="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700"
            >
              <span class="text-gray-400">Ritmo diário:</span>
              <span class="text-blue-400 ml-1 font-bold">
                {{ formatarDinheiro(stats.meta.ritmo) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- 🔥 OPORTUNIDADES -->
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div class="p-5 border-b border-gray-100 bg-orange-50/50">
            <h3 class="font-bold text-gray-900 flex items-center gap-2">
              <span class="bg-orange-100 text-orange-600 p-1.5 rounded-lg">
                <UIcon name="i-heroicons-fire" class="w-5 h-5" />
              </span>
              Produtos Prioritários
            </h3>
            <p class="text-xs text-gray-500 mt-1">
              Alta margem + estoque disponível.
            </p>
          </div>

          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500">
              <tr>
                <th class="p-4 text-left">Peça</th>
                <th class="p-4 text-right">Margem</th>
                <th class="p-4 text-right">Lucro Un.</th>
              </tr>
            </thead>

            <tbody class="divide-y">
              <tr
                v-for="p in stats.oportunidades"
                :key="p.id"
                class="hover:bg-orange-50/40"
              >
                <td class="p-4">
                  <div class="font-bold">{{ p.nome }}</div>
                  <div class="text-xs text-gray-500">
                    {{ p.modelo }} • {{ p.estoque }} un
                  </div>
                </td>

                <td class="p-4 text-right">
                  <span class="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">
                    {{ p.margem.toFixed(0) }}%
                  </span>
                </td>

                <td class="p-4 text-right font-bold">
                  {{ formatarDinheiro(p.lucroUnit) }}
                </td>
              </tr>

              <tr v-if="!stats.oportunidades.length">
                <td colspan="3" class="p-6 text-center text-xs text-gray-400">
                  Nenhuma oportunidade encontrada.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 🧊 ESTOQUE PARADO -->
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
          <div class="p-5 border-b bg-blue-50/50">
            <h3 class="font-bold flex items-center gap-2">
              <span class="bg-blue-100 text-blue-600 p-1.5 rounded-lg">
                <UIcon name="i-heroicons-archive-box" class="w-5 h-5" />
              </span>
              Dinheiro Congelado
            </h3>
            <p class="text-xs text-gray-500 mt-1">
              Itens sem giro há mais de 90 dias
            </p>
          </div>

          <div class="p-6 flex-1 flex flex-col gap-6 justify-center">
            <div class="flex justify-between">
              <div>
                <p class="text-sm text-gray-500">Custo Travado</p>
                <p class="text-2xl font-bold">
                  {{ formatarDinheiro(stats.parados.custoTotal) }}
                </p>
              </div>

              <div class="text-right">
                <p class="text-sm text-gray-500">Itens</p>
                <p class="text-2xl font-bold">
                  {{ stats.parados.qtd }}
                </p>
              </div>
            </div>

            <div class="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
              Liquidando com <strong>15% de desconto</strong>, você libera cerca de
              <strong>
                {{ formatarDinheiro(stats.parados.vendaTotal * 0.85) }}
              </strong>
              em caixa.
            </div>

            <UButton block color="gray" to="/estoque">
              Ir para Estoque
            </UButton>
          </div>
        </div>

      </div>
    </template>

    <!-- ERRO -->
    <div v-else-if="error" class="py-20 text-center">
      <p class="text-red-500 font-bold mb-2">Erro ao carregar dados.</p>
      <p class="text-xs text-gray-400 mb-4">{{ error.message }}</p>
      <UButton size="sm" color="red" variant="soft" @click="refresh">
        Tentar novamente
      </UButton>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const dataAtual = ref(new Date())
const periodoRelatorio = ref<'mensal' | 'anual'>('mensal')

const params = computed(() => ({
  mes: periodoRelatorio.value === 'anual' ? 0 : dataAtual.value.getMonth() + 1,
  ano: dataAtual.value.getFullYear()
}))

const { data: stats, pending, refresh, error } = await useFetch(
  '/api/financeiro/stats',
  { query: params, lazy: true }
)

function formatarDinheiro(v: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(v || 0)
}
</script>
