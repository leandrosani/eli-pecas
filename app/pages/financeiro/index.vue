<template>
  <div class="p-4 pb-20 max-w-7xl mx-auto space-y-6">
    
    <!-- HEADER -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <span class="text-3xl">💰</span> Financeiro
        </h1>
        <p class="text-gray-500">Visão geral do caixa e saúde do negócio.</p>
      </div>
      <div class="flex gap-2">
        <UButton 
          icon="i-heroicons-arrow-path" 
          variant="soft" 
          color="gray" 
          @click="refresh" 
          :loading="pending"
        >
          Atualizar
        </UButton>
        <UButton 
          icon="i-heroicons-document-arrow-down" 
          color="black"
          @click="baixarRelatorio"
        >
          Relatório PDF
        </UButton>
      </div>
    </div>

    <!-- ESTADO DE CARREGAMENTO -->
    <div v-if="pending" class="py-20 text-center">
      <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin text-blue-500 mx-auto" />
      <p class="text-gray-400 mt-2">Calculando indicadores...</p>
    </div>

    <!-- ESTADO DE ERRO (NOVO) -->
    <div v-else-if="error" class="py-12 text-center bg-red-50 border border-red-200 rounded-2xl">
      <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-500 mx-auto mb-2" />
      <h3 class="text-lg font-bold text-red-700">Erro ao carregar dados financeiros</h3>
      <p class="text-sm text-red-600 mb-4">{{ error.message || 'Verifique se rodou as migrações do banco de dados.' }}</p>
      <UButton color="red" variant="soft" @click="refresh">Tentar Novamente</UButton>
    </div>

    <!-- CONTEÚDO (SÓ APARECE SE TIVER DADOS) -->
    <template v-else-if="stats">
      
      <!-- 1. CARD DESTAQUE: SALDO EM CAIXA (REGRA DE OURO) -->
      <div 
        class="rounded-3xl p-8 shadow-xl border-2 transition-all"
        :class="stats.saldoCaixa >= 0 ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-100' : 'bg-gradient-to-br from-red-50 to-white border-red-100'"
      >
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-sm font-bold uppercase tracking-widest text-gray-500 mb-1">Saldo Atual em Caixa</h2>
            <div 
              class="text-5xl md:text-6xl font-black tracking-tighter"
              :class="stats.saldoCaixa >= 0 ? 'text-emerald-600' : 'text-red-600'"
            >
              {{ formatarDinheiro(stats.saldoCaixa) }}
            </div>
            <p class="mt-2 text-sm text-gray-500 font-medium">
              Histórico: 
              <span class="text-emerald-600 font-bold">+{{ formatarDinheiro(stats.receitaTotal) }}</span> (Vendas) 
              vs 
              <span class="text-red-600 font-bold">-{{ formatarDinheiro(stats.despesaTotal) }}</span> (Despesas)
            </p>
          </div>
          <div 
            class="hidden md:flex w-16 h-16 rounded-full items-center justify-center text-3xl"
            :class="stats.saldoCaixa >= 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'"
          >
            {{ stats.saldoCaixa >= 0 ? '🤑' : '⚠️' }}
          </div>
        </div>
      </div>

      <!-- 2. CARDS DE INTELIGÊNCIA (MÊS ATUAL) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <!-- Faturamento -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-blue-50 text-blue-600 rounded-lg"><UIcon name="i-heroicons-banknotes" class="w-5 h-5" /></div>
            <h3 class="font-bold text-gray-700">Faturamento (Mês)</h3>
          </div>
          <p class="text-2xl font-bold text-gray-900">{{ formatarDinheiro(stats.mes.faturamento) }}</p>
          <p class="text-xs text-gray-400 mt-1">Total vendido bruto</p>
        </div>

        <!-- Lucro Operacional -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><UIcon name="i-heroicons-chart-bar" class="w-5 h-5" /></div>
            <h3 class="font-bold text-gray-700">Lucro Operacional</h3>
          </div>
          <p class="text-2xl font-bold text-indigo-600">{{ formatarDinheiro(stats.mes.lucroOperacional) }}</p>
          <p class="text-xs text-gray-400 mt-1">Vendas - Custo das Peças</p>
        </div>

        <!-- Margem -->
        <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div class="flex items-center gap-3 mb-2">
            <div class="p-2 bg-orange-50 text-orange-600 rounded-lg"><UIcon name="i-heroicons-receipt-percent" class="w-5 h-5" /></div>
            <h3 class="font-bold text-gray-700">Margem Média</h3>
          </div>
          <p class="text-2xl font-bold" :class="getCorMargem(stats.mes.margem)">
            {{ stats.mes.margem.toFixed(1) }}%
          </p>
          <p class="text-xs text-gray-400 mt-1">Saúde real da venda</p>
        </div>
      </div>

      <!-- 3. TABELAS ESTRATÉGICAS -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- Curva ABC (Top Produtos) -->
        <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 class="font-bold text-gray-800 flex items-center gap-2">
              <UIcon name="i-heroicons-trophy" class="text-yellow-500" />
              Campeões de Venda (Histórico)
            </h3>
          </div>
          <div class="p-4">
            <div v-for="(prod, idx) in stats.topProdutos" :key="idx" class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div class="flex items-center gap-3">
                <span class="w-6 h-6 flex items-center justify-center bg-gray-100 rounded text-xs font-bold text-gray-600">{{ idx + 1 }}</span>
                <div>
                  <p class="font-bold text-gray-800 text-sm">{{ prod.nome }}</p>
                  <p class="text-xs text-gray-500">{{ prod.qtd }} unidades vendidas</p>
                </div>
              </div>
              <span class="font-bold text-emerald-600 text-sm">{{ formatarDinheiro(prod.total) }}</span>
            </div>
            <div v-if="!stats.topProdutos.length" class="text-center text-gray-400 py-4 text-sm">Sem dados suficientes.</div>
          </div>
        </div>

        <!-- Alerta de Prejuízo -->
        <div class="bg-white border-2 border-red-100 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-red-100 bg-red-50 flex justify-between items-center">
            <h3 class="font-bold text-red-800 flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="text-red-600" />
              Alerta: Margem Baixa (Mês)
            </h3>
            <span class="text-[10px] bg-red-200 text-red-800 px-2 py-0.5 rounded-full font-bold">Abaixo de 20%</span>
          </div>
          <div class="p-4">
            <div v-for="(item, idx) in stats.alertasPrejuizo" :key="idx" class="flex items-center justify-between py-3 border-b border-red-50 last:border-0">
              <div>
                <p class="font-bold text-gray-800 text-sm">{{ item.peca }}</p>
                <p class="text-xs text-gray-500">
                  Venda: {{ formatarDinheiro(item.venda) }} | Custo: {{ formatarDinheiro(item.custo) }}
                </p>
              </div>
              <div class="text-right">
                <span class="font-bold text-red-600 text-sm">{{ item.margem.toFixed(1) }}%</span>
              </div>
            </div>
            <div v-if="!stats.alertasPrejuizo.length" class="flex flex-col items-center justify-center py-8 text-center">
              <UIcon name="i-heroicons-check-badge" class="w-10 h-10 text-emerald-400 mb-2" />
              <p class="text-emerald-600 font-bold text-sm">Tudo ótimo!</p>
              <p class="text-gray-400 text-xs">Nenhuma venda com margem baixa este mês.</p>
            </div>
          </div>
        </div>

      </div>

    </template>
    
    <!-- ESTADO VAZIO (SE NÃO TIVER DADOS NEM ERRO) -->
    <div v-else class="py-20 text-center bg-white border border-gray-200 rounded-2xl">
        <p class="text-gray-500 font-bold">Nenhum dado financeiro disponível.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

// Fetch dos dados COM tratamento de erro
const { data: stats, pending, refresh, error } = await useFetch('/api/financeiro/stats', {
  lazy: true
})

// Funções Auxiliares
function formatarDinheiro(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
}

function getCorMargem(margem: number) {
  if (margem >= 50) return 'text-emerald-500'
  if (margem >= 20) return 'text-blue-500'
  if (margem > 0) return 'text-orange-500'
  return 'text-red-600'
}

function baixarRelatorio() {
  alert('Funcionalidade de PDF será implementada na próxima etapa! Os dados já estão prontos aqui.')
}
</script>