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
      
      <!-- 🎯 BLOCO 1: META MENSAL (EDITÁVEL) -->
      <div class="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
        <!-- Botão de Editar Meta (Aparece no Hover ou fixo no mobile) -->
        <button 
          @click="abrirModalMeta"
          class="absolute top-4 right-4 bg-white/10 hover:bg-white/20 p-2 rounded-lg backdrop-blur-sm transition-all z-20 cursor-pointer"
          title="Alterar Meta"
        >
          <UIcon name="i-heroicons-pencil-square" class="w-5 h-5 text-white" />
        </button>

        <!-- Efeito de Fundo -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full blur-[80px] opacity-20 -mr-16 -mt-16 pointer-events-none"></div>

        <div class="relative z-10">
          <div class="flex justify-between items-end mb-4">
            <div>
              <h2 class="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                Meta de Lucro (Mês)
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

          <!-- Indicadores de Ação (Ritmo e Caixa) -->
          <div class="flex flex-wrap gap-3 text-sm font-medium">
            <!-- Ritmo Diário (O Pulo do Gato) -->
            <div v-if="stats.meta.falta > 0" class="bg-orange-500/20 px-3 py-1.5 rounded-lg border border-orange-500/30 flex items-center gap-2">
              <UIcon name="i-heroicons-bolt" class="w-4 h-4 text-orange-400" />
              <span class="text-orange-100">Ritmo Necessário:</span>
              <span class="text-white font-bold">{{ formatarDinheiro(stats.meta.ritmo) }} / dia</span>
            </div>
            <div v-else class="bg-green-500/20 px-3 py-1.5 rounded-lg border border-green-500/30 flex items-center gap-2">
              <UIcon name="i-heroicons-check-badge" class="w-4 h-4 text-green-400" />
              <span class="text-green-100 font-bold">Meta Batida! Parabéns!</span>
            </div>

            <!-- Caixa Total (Regra de Ouro) -->
            <div class="bg-gray-800 px-3 py-1.5 rounded-lg border border-gray-700 ml-auto">
              <span class="text-gray-400">Caixa Total:</span>
              <span class="text-emerald-400 ml-1 font-bold">{{ formatarDinheiro(stats.saldoCaixa) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- GRID DE AÇÃO (OPORTUNIDADES E PROBLEMAS) -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <!-- 🔥 BLOCO 2: OPORTUNIDADES (Com Lucro Potencial) -->
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
                    Sem dados suficientes de venda recente.
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
                    Se liquidar com <strong>15% de desconto</strong>, libera 
                    <span class="font-black bg-white px-1 rounded">{{ formatarDinheiro(stats.parados.vendaTotal * 0.85) }}</span> 
                    em caixa.
                  </p>
                </div>
              </div>
            </div>
            
            <UButton block color="gray" variant="solid" to="/estoque">
              Ver Estoque
            </UButton>
          </div>
        </div>

      </div>

    </template>

    <div v-else-if="error" class="py-20 text-center bg-white rounded-2xl border border-red-100">
      <p class="text-red-500 font-bold mb-2">Erro ao carregar dados.</p>
      <p class="text-xs text-gray-400 mb-4">{{ error.message }}</p>
      <UButton size="sm" color="red" variant="soft" class="mt-2" @click="refresh">Tentar novamente</UButton>
    </div>

    <!-- MODAL DE EDIÇÃO DA META -->
    <UModal v-model="modalMetaAberto">
      <div class="p-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <UIcon name="i-heroicons-adjustments-horizontal" />
          Definir Meta de Lucro Mensal
        </h3>
        <p class="text-sm text-gray-500 mb-4">Qual o valor de <strong>LUCRO</strong> (não faturamento) que deseja atingir este mês?</p>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Valor Alvo (R$)</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">R$</span>
              <UInput 
                v-model="novaMeta" 
                type="number" 
                size="lg" 
                placeholder="Ex: 15000" 
                autofocus 
                :ui="{ base: 'pl-10' }"
              />
            </div>
          </div>
          
          <div class="flex justify-end gap-3 pt-2">
            <UButton color="gray" variant="ghost" @click="modalMetaAberto = false">Cancelar</UButton>
            <UButton color="black" :loading="salvandoMeta" @click="salvarMeta">Salvar Meta</UButton>
          </div>
        </div>
      </div>
    </UModal>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { data: stats, pending, refresh, error } = await useFetch('/api/financeiro/stats', { lazy: true })

// Controle do Modal de Meta
const modalMetaAberto = ref(false)
const novaMeta = ref('')
const salvandoMeta = ref(false)

function abrirModalMeta() {
  if (stats.value) {
    novaMeta.value = String(stats.value.meta.alvo)
  }
  modalMetaAberto.value = true
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
    refresh() // Recarrega os dados com a nova meta
  } catch (e) {
    alert('Erro ao salvar meta')
  } finally {
    salvandoMeta.value = false
  }
}

function formatarDinheiro(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
}
</script>