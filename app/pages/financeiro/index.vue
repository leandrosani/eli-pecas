<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-24">
    <div class="max-w-7xl mx-auto p-4 md:p-6 space-y-6 md:space-y-8">
      
      <!-- Header -->
      <div class="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 md:gap-6">
          <div class="flex-1">
            <h1 class="text-xl md:text-2xl font-black text-gray-900 tracking-tight mb-2 flex items-center gap-2 md:gap-3">
              <span class="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-lg">
                <UIcon name="i-heroicons-chart-bar" class="w-5 h-5 md:w-7 md:h-7" />
              </span>
              Painel Financeiro
            </h1>
          </div>

          <div class="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto">
            <UButton 
              icon="i-heroicons-arrow-path" 
              color="gray" 
              variant="soft" 
              size="md"
              class="flex-1 lg:flex-none"
              :loading="pendingPrincipal" 
              @click="refresh"
            >
              <span class="hidden sm:inline">Atualizar Tudo</span>
              <span class="sm:hidden">Atualizar</span>
            </UButton>
            
            <UButton 
              icon="i-heroicons-document-arrow-down" 
              color="black" 
              size="md"
              class="flex-1 lg:flex-none"
              @click="abrirModalRelatorios"
            >
              <span class="hidden sm:inline">Exportar PDF</span>
              <span class="sm:hidden">PDF</span>
            </UButton>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="pendingPrincipal && !statsPrincipal" class="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 py-20 md:py-32 text-center">
        <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 md:w-12 md:h-12 animate-spin text-blue-500 mb-3 md:mb-4 mx-auto" />
        <p class="text-gray-500 font-medium text-sm md:text-base px-4">Calculando a rota do dinheiro...</p>
      </div>

      <template v-else-if="statsPrincipal">
        
        <!-- Cards Principais -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
          
          <!-- Saldo Disponível -->
          <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-4 text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div class="relative flex flex-col h-full justify-between min-h-[100px]">
              <div class="flex items-center gap-2 mb-1">
                <div class="bg-white/20 p-1.5 rounded-md backdrop-blur-sm">
                  <UIcon name="i-heroicons-banknotes" class="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <span class="text-emerald-100 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Saldo Disponível</span>
              </div>
              <div>
                <p class="text-xl md:text-2xl font-black mb-0.5">{{ formatarDinheiro(statsPrincipal.saldoCaixa) }}</p>
                <p class="text-emerald-100 text-xs font-medium">Caixa atual</p>
              </div>
            </div>
          </div>

          <!-- Meta de Lucro -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 relative group hover:shadow-md transition-shadow">
            <button 
              @click="abrirModalMeta"
              class="absolute top-2 right-2 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
              title="Alterar Meta"
            >
              <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5 text-gray-600" />
            </button>
            
            <div class="flex items-center justify-between mb-2">
              <div class="flex items-center gap-2">
                <div class="bg-blue-100 p-1.5 rounded-md">
                  <UIcon name="i-heroicons-flag" class="w-3.5 h-3.5 md:w-4 md:h-4 text-blue-600" />
                </div>
                <span class="text-gray-500 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Meta de Lucro</span>
              </div>
              <p class="text-[10px] md:text-xs text-gray-400 font-medium">{{ formatarDinheiro(statsPrincipal.meta.alvo) }}</p>
            </div>

            <div class="mb-2">
              <p class="text-xl md:text-2xl font-black text-gray-900 leading-none">{{ formatarDinheiro(statsPrincipal.meta.atual) }}</p>
            </div>

            <div class="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden relative mb-1">
              <div 
                class="h-full rounded-full transition-all duration-1000"
                :class="statsPrincipal.meta.progresso >= 100 ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'"
                :style="{ width: `${Math.min(statsPrincipal.meta.progresso, 100)}%` }"
              ></div>
            </div>
            <p class="text-[10px] text-gray-500 font-bold text-right">{{ statsPrincipal.meta.progresso.toFixed(0) }}% alcançado</p>
          </div>

          <!-- Ritmo Necessário -->
          <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 text-white relative overflow-hidden">
            <div class="absolute bottom-0 left-0 w-20 h-20 md:w-24 md:h-24 bg-white/10 rounded-full blur-2xl -ml-6 -mb-6"></div>
            <div class="relative flex flex-col h-full justify-between min-h-[100px]">
              <div class="flex items-center gap-2 mb-1">
                <div class="bg-white/20 p-1.5 rounded-md backdrop-blur-sm">
                  <UIcon name="i-heroicons-bolt" class="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                <span class="text-orange-100 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                  {{ statsPrincipal.meta.falta <= 0 ? 'Meta Batida!' : 'Ritmo Necessário' }}
                </span>
              </div>
              
              <template v-if="statsPrincipal.meta.ehMesAtual && statsPrincipal.meta.falta > 0">
                <div>
                  <p class="text-xl md:text-2xl font-black mb-0.5">{{ formatarDinheiro(statsPrincipal.meta.ritmo) }}</p>
                  <p class="text-orange-100 text-xs font-medium">por dia para atingir a meta</p>
                </div>
              </template>
              
              <template v-else-if="statsPrincipal.meta.falta <= 0">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-check-badge" class="w-7 h-7 md:w-8 md:h-8 text-white/90" />
                  <div>
                    <p class="text-base md:text-lg font-black leading-tight">Parabéns!</p>
                    <p class="text-orange-100 text-[10px]">Objetivo alcançado</p>
                  </div>
                </div>
              </template>
              
              <template v-else>
                <p class="text-xs text-orange-100 font-medium">Meta do período encerrado</p>
              </template>
            </div>
          </div>
        </div>

        <!-- Estoque Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex flex-col justify-between hover:shadow-md transition-all">
            <div class="flex items-center gap-2 text-gray-500 mb-2">
              <div class="bg-blue-50 p-1.5 rounded-md">
                <UIcon name="i-heroicons-cube" class="w-4 h-4 text-blue-600" />
              </div>
              <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Estoque Total</span>
            </div>
            <div>
              <div class="text-xl md:text-2xl font-black text-gray-900 text-center">
                {{ statsPrincipal.itensEstoque }}
              </div>
              <p class="text-[10px] text-center text-gray-400 mt-1 font-medium">Peças cadastradas</p>
            </div>
          </div>

          <div class="bg-white p-4 sm:col-span-2 rounded-xl shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition-all">
            <div class="flex items-center gap-2 text-gray-500 mb-2">
              <div class="bg-emerald-50 p-1.5 rounded-md">
                <UIcon name="i-heroicons-banknotes" class="w-4 h-4 text-emerald-600" />
              </div>
              <span class="text-[9px] md:text-[10px] font-bold uppercase tracking-wider">Patrimônio Ativo</span>
            </div>
            <div>
              <div class="text-xl md:text-2xl font-black text-gray-900">
                {{ formatarDinheiro(statsPrincipal.valorEstoque) }}
              </div>
              <p class="text-[10px] text-gray-400 mt-1 font-medium">Valor de custo total em mercadoria</p>
            </div>
          </div>
        </div>

        <!-- Extrato Detalhado -->
        <div class="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          <!-- Overlay de loading -->
          <div
            v-if="pendingExtrato"
            class="absolute inset-0 z-50 bg-white/60 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300"
          >
            <div class="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center gap-3">
              <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-blue-600 animate-spin" />
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Atualizando dados...
              </span>
            </div>
          </div>

          <!-- Cabeçalho -->
          <div class="p-4 md:p-6 border-b border-gray-100">
            <div class="flex flex-col gap-4">
              <!-- Título -->
              <div class="flex items-center gap-2 md:gap-3">
                <div class="bg-gray-900 p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-lg">
                  <UIcon name="i-heroicons-list-bullet" class="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h2 class="font-black text-gray-900 text-base md:text-xl">
                    Extrato Detalhado
                  </h2>
                  <p class="text-[10px] md:text-xs text-gray-500 font-medium">
                    Todas as movimentações do período
                  </p>
                </div>
              </div>

              <!-- Controles -->
              <div class="flex flex-col gap-3">
                <!-- Seletor de mês -->
                <div class="flex justify-center">
                  <div class="flex items-center w-full max-w-xs bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg">
                    <button
                      @click="mudarMes(-1)"
                      :disabled="pendingExtrato"
                      class="px-3 py-2.5 md:py-3 hover:bg-white/10 active:bg-white/20 rounded-l-xl text-white transition-all disabled:opacity-50 disabled:cursor-wait"
                    >
                      <UIcon name="i-heroicons-chevron-left" class="w-5 h-5" />
                    </button>
                    <div class="flex-1 px-2 py-2.5 md:py-3 text-center">
                      <div class="text-white font-black text-sm capitalize truncate">
                        {{ nomeMesExtrato }}
                      </div>
                    </div>
                    <button
                      @click="mudarMes(1)"
                      :disabled="ehMesFuturo || pendingExtrato"
                      class="px-3 py-2.5 md:py-3 hover:bg-white/10 active:bg-white/20 rounded-r-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <UIcon name="i-heroicons-chevron-right" class="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <!-- Abas -->
                <div class="flex justify-center overflow-x-auto pb-1 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
                  <div class="flex gap-2 bg-gray-100 p-1.5 rounded-xl shadow-inner min-w-max">
                    <button
                      v-for="aba in abas"
                      :key="aba.value"
                      @click="abaAtiva = aba.value"
                      class="px-3 py-1.5 text-xs md:text-sm font-bold rounded-lg transition-all whitespace-nowrap"
                      :class="abaAtiva === aba.value
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-500 hover:text-gray-700 active:bg-white/50'"
                    >
                      {{ aba.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats - SEMPRE 3 COLUNAS LADO A LADO -->
          <div
            v-if="statsExtrato"
            class="bg-gray-50 border-b border-gray-200"
          >
            <!-- Período (apenas desktop - linha própria) -->
            <div class="hidden md:block p-4 border-b border-gray-200">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">
                Período Selecionado
              </span>
              <div class="flex items-center gap-2 text-gray-700 font-bold text-sm">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-400" />
                {{ textoPeriodo }}
              </div>
            </div>

            <!-- Grid 3 colunas - VENDAS / DESPESAS / RESULTADO -->
            <div class="grid grid-cols-3 divide-x divide-gray-200">
              <!-- Vendas -->
              <div class="p-3 md:p-4 flex flex-col justify-center">
                <span class="text-[8px] md:text-[10px] uppercase font-bold text-emerald-600/70 tracking-wider mb-1 block">
                  Vendas
                </span>
                <span class="text-sm md:text-lg font-black text-emerald-600">
                  +{{ formatarDinheiro(resumoExtrato.vendas) }}
                </span>
              </div>

              <!-- Despesas -->
              <div class="p-3 md:p-4 flex flex-col justify-center">
                <span class="text-[8px] md:text-[10px] uppercase font-bold text-red-600/70 tracking-wider mb-1 block">
                  Despesas
                </span>
                <span class="text-sm md:text-lg font-black text-red-600">
                  -{{ formatarDinheiro(resumoExtrato.despesas) }}
                </span>
              </div>

              <!-- Resultado -->
              <div class="p-3 md:p-4 flex flex-col justify-center bg-gray-100/50">
                <span class="text-[8px] md:text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-1 block">
                  Resultado
                </span>
                <span
                  class="text-sm md:text-lg font-black"
                  :class="resumoExtrato.lucro >= 0 ? 'text-gray-900' : 'text-red-600'"
                >
                  {{ formatarDinheiro(resumoExtrato.lucro) }}
                </span>
              </div>
            </div>

            <!-- Período (mobile - linha separada) -->
            <div class="md:hidden p-3 border-t border-gray-200 text-center">
              <span class="text-[8px] uppercase font-bold text-gray-400 tracking-wider mb-1 block">
                Período
              </span>
              <div class="flex items-center justify-center gap-2 text-gray-700 font-bold text-xs">
                <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5 text-gray-400" />
                {{ textoPeriodo }}
              </div>
            </div>
          </div>

          <!-- Tabela -->
          <div class="border-t border-gray-100">
            <div class="max-h-[400px] md:max-h-[500px] overflow-y-auto overflow-x-auto">
              <table class="w-full relative border-collapse min-w-[600px]">
                <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th class="py-3 md:py-4 px-3 md:px-6 text-left text-[9px] md:text-xs font-black text-gray-400 uppercase tracking-wider bg-gray-50">
                      Data
                    </th>
                    <th class="py-3 md:py-4 px-3 md:px-6 text-left text-[9px] md:text-xs font-black text-gray-400 uppercase tracking-wider bg-gray-50">
                      Descrição
                    </th>
                    <th class="py-3 md:py-4 px-3 md:px-6 text-center text-[9px] md:text-xs font-black text-gray-400 uppercase tracking-wider bg-gray-50">
                      Categoria
                    </th>
                    <th class="py-3 md:py-4 px-3 md:px-6 text-right text-[9px] md:text-xs font-black text-gray-400 uppercase tracking-wider bg-gray-50">
                      Valor
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 bg-white">
                  <tr
                    v-for="mov in historicoFiltrado"
                    :key="mov.id"
                    class="hover:bg-gray-50 active:bg-gray-100 transition-colors group"
                  >
                    <td class="py-3 md:py-4 px-3 md:px-6">
                      <span class="text-xs md:text-sm text-gray-500 font-medium whitespace-nowrap group-hover:text-gray-900 transition-colors">
                        {{ new Date(mov.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }}
                      </span>
                    </td>
                    <td class="py-3 md:py-4 px-3 md:px-6">
                      <div class="font-bold text-gray-900 text-xs md:text-base leading-tight">
                        {{ mov.descricao || mov.peca?.nome }}
                      </div>
                      <div v-if="mov.peca?.modelo" class="text-[10px] md:text-xs text-gray-500 font-medium mt-0.5">
                        {{ mov.peca.modelo }}
                      </div>
                    </td>
                    <td class="py-3 md:py-4 px-3 md:px-6 text-center">
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-black uppercase tracking-wide border"
                        :class="getBadgeClass(mov.tipo)"
                      >
                        {{ getLabelTipo(mov.tipo) }}
                      </span>
                    </td>
                    <td class="py-3 md:py-4 px-3 md:px-6 text-right">
                      <span
                        class="text-xs md:text-base font-black whitespace-nowrap"
                        :class="getValorClass(mov.tipo)"
                      >
                        {{ getSinal(mov.tipo) }} {{ formatarDinheiro(mov.valor) }}
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!historicoFiltrado.length">
                    <td colspan="4" class="py-12 md:py-16 text-center">
                      <UIcon name="i-heroicons-inbox" class="w-12 h-12 md:w-16 md:h-16 text-gray-200 mx-auto mb-4" />
                      <p class="text-gray-400 font-medium text-sm md:text-base">
                        Nenhum registro encontrado
                      </p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Produtos Prioritários & Dinheiro Congelado -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

          <!-- Produtos Prioritários -->
          <div class="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div class="bg-gradient-to-r from-orange-50 to-orange-100/50 p-4 md:p-5 border-b border-orange-200">
              <div class="flex items-center gap-2 md:gap-3 mb-2">
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-lg">
                  <UIcon name="i-heroicons-fire" class="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 class="font-black text-gray-900 text-base md:text-lg">Produtos Prioritários</h3>
                  <p class="text-[10px] md:text-xs text-gray-600 font-medium">Foque nestas oportunidades</p>
                </div>
              </div>
            </div>
            
            <div class="overflow-x-auto max-h-[350px] md:max-h-[400px] overflow-y-auto">
              <table class="w-full">
                <thead class="bg-gray-50 sticky top-0 z-10">
                  <tr class="text-left">
                    <th class="px-4 md:px-5 py-2.5 md:py-3 text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-wider">Produto</th>
                    <th class="px-4 md:px-5 py-2.5 md:py-3 text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Margem</th>
                    <th class="px-4 md:px-5 py-2.5 md:py-3 text-[9px] md:text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Potencial</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="item in statsPrincipal.oportunidades" :key="item.id" class="hover:bg-orange-50/30 active:bg-orange-50/50 transition-colors">
                    <td class="px-4 md:px-5 py-3 md:py-4">
                      <div class="font-bold text-gray-900 mb-0.5 text-xs md:text-base leading-tight">{{ item.nome }}</div>
                      <div class="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 flex-wrap">
                        <span class="font-medium truncate max-w-[120px]">{{ item.modelo }}</span>
                        <span class="text-gray-300">•</span>
                        <span class="bg-gray-100 px-2 py-0.5 rounded-md font-bold whitespace-nowrap">{{ item.estoque }} un</span>
                      </div>
                    </td>
                    <td class="px-4 md:px-5 py-3 md:py-4 text-right">
                      <span class="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-black">
                        {{ item.margem.toFixed(0) }}%
                      </span>
                    </td>
                    <td class="px-4 md:px-5 py-3 md:py-4 text-right">
                      <div class="font-black text-gray-900 text-sm md:text-base">{{ formatarDinheiro(item.lucroPotencial) }}</div>
                      <div class="text-[10px] md:text-xs text-gray-400 font-medium">{{ formatarDinheiro(item.lucroUnit) }}/un</div>
                    </td>
                  </tr>
                  <tr v-if="!statsPrincipal.oportunidades.length">
                    <td colspan="3" class="px-4 md:px-5 py-8 md:py-12 text-center">
                      <UIcon name="i-heroicons-inbox" class="w-10 h-10 md:w-12 md:h-12 text-gray-300 mx-auto mb-3" />
                      <p class="text-gray-400 text-xs md:text-sm font-medium">Sem dados suficientes no momento</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Dinheiro Congelado -->
          <div class="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div class="bg-gradient-to-r from-blue-50 to-blue-100/50 p-4 md:p-5 border-b border-blue-200">
              <div class="flex items-center gap-2 md:gap-3 mb-2">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-2 md:p-2.5 rounded-lg md:rounded-xl shadow-lg">
                  <UIcon name="i-heroicons-archive-box" class="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 class="font-black text-gray-900 text-base md:text-lg">Dinheiro Congelado</h3>
                  <p class="text-[10px] md:text-xs text-gray-600 font-medium">Estoque parado +90 dias</p>
                </div>
              </div>
            </div>

            <div class="p-4 md:p-6 space-y-4 md:space-y-6">
              <div class="grid grid-cols-2 gap-3 md:gap-4">
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-200">
                  <p class="text-[9px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 md:mb-2">Custo Travado</p>
                  <p class="text-lg md:text-2xl font-black text-gray-900">{{ formatarDinheiro(statsPrincipal.parados.custoTotal) }}</p>
                </div>
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg md:rounded-xl p-3 md:p-4 border border-gray-200">
                  <p class="text-[9px] md:text-xs text-gray-500 font-bold uppercase tracking-wider mb-1 md:mb-2">Itens Parados</p>
                  <p class="text-lg md:text-2xl font-black text-gray-900">{{ statsPrincipal.parados.qtd }}</p>
                </div>
              </div>

              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg md:rounded-xl p-4 md:p-5 border-2 border-blue-200">
                <div class="flex gap-2 md:gap-3 items-start">
                  <div class="bg-blue-500 p-1.5 md:p-2 rounded-lg flex-shrink-0">
                    <UIcon name="i-heroicons-light-bulb" class="w-5 h-5 md:w-6 md:h-6 text-white" />
                  </div>
                  <div class="flex-1">
                    <p class="text-xs md:text-sm font-black text-blue-900 mb-1 md:mb-2">💡 Sugestão Estratégica</p>
                    <p class="text-xs md:text-sm text-blue-800 leading-relaxed">
                      Liquidando com <span class="font-black bg-white px-1.5 md:px-2 py-0.5 rounded">15% de desconto</span>, 
                      você libera <span class="font-black text-blue-600">{{ formatarDinheiro(statsPrincipal.parados.vendaTotal * 0.85) }}</span> 
                      em caixa imediatamente.
                    </p>
                  </div>
                </div>
              </div>
              
              <UButton 
                block 
                color="gray" 
                variant="solid" 
                size="lg"
                to="/estoque"
                icon="i-heroicons-arrow-right"
                trailing
              >
                Gerenciar Estoque
              </UButton>
            </div>
          </div>
        </div>
      </template>

      <!-- Error State -->
      <div v-else-if="errorPrincipal" class="bg-white rounded-xl md:rounded-2xl border-2 border-red-100 p-8 md:p-12 text-center">
        <div class="bg-red-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-7 h-7 md:w-8 md:h-8 text-red-600" />
        </div>
        <p class="text-red-600 font-black text-base md:text-lg mb-2">Erro ao carregar dados</p>
        <p class="text-gray-500 text-sm mb-4 md:mb-6 px-4">{{ errorPrincipal.message }}</p>
        <UButton color="red" variant="solid" @click="refresh" icon="i-heroicons-arrow-path">
          Tentar novamente
        </UButton>
      </div>

    </div>

    <!-- Modal Meta -->
    <div v-if="modalMetaAberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-[scale-in_0.2s_ease-out]">
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-6 md:px-8 py-5 md:py-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-xl md:text-2xl font-black mb-1 flex items-center gap-2 md:gap-3">
                <UIcon name="i-heroicons-flag" class="w-6 h-6 md:w-7 md:h-7" />
                Definir Meta de Lucro
              </h3>
              <p class="text-blue-100 text-xs md:text-sm font-medium">Configure seu objetivo para o mês</p>
            </div>
            <button @click="modalMetaAberto = false" class="text-white/80 hover:text-white active:bg-white/20 hover:bg-white/10 p-2 rounded-lg transition-all">
              <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div class="p-6 md:p-8">
          <label class="block text-xs md:text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">Valor Alvo (Lucro Líquido)</label>
          <div class="relative">
            <span class="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-lg md:text-xl">R$</span>
            <input 
              v-model="novaMeta" 
              type="number" 
              placeholder="15000" 
              class="w-full pl-12 md:pl-14 pr-4 md:pr-6 py-3 md:py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-xl md:text-2xl font-black text-gray-900 focus:border-blue-500 focus:ring-0 focus:bg-white outline-none transition-all" 
            />
          </div>
          <p class="text-xs text-gray-500 mt-3 font-medium">💡 Defina uma meta realista baseada no seu histórico</p>
        </div>
        
        <div class="px-6 md:px-8 py-5 md:py-6 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100">
          <UButton 
            @click="modalMetaAberto = false" 
            color="gray" 
            variant="soft"
            size="md"
            class="w-full sm:w-auto"
          >
            Cancelar
          </UButton>
          <UButton 
            @click="salvarMeta" 
            :disabled="salvandoMeta || !novaMeta" 
            color="black"
            size="md"
            :loading="salvandoMeta"
            class="w-full sm:w-auto"
          >
            {{ salvandoMeta ? 'Salvando...' : 'Salvar Meta' }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Modal Relatório -->
    <div v-if="modalRelatorioAberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white rounded-2xl md:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-[scale-in_0.2s_ease-out] my-8">
        
        <div class="bg-gradient-to-r from-gray-900 to-gray-800 px-6 md:px-8 py-5 md:py-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-xl md:text-2xl font-black mb-1 flex items-center gap-2 md:gap-3">
                <UIcon name="i-heroicons-document-arrow-down" class="w-6 h-6 md:w-7 md:h-7" />
                Exportar Relatório PDF
              </h3>
              <p class="text-gray-300 text-xs md:text-sm font-medium">Configure os filtros do relatório</p>
            </div>
            <button @click="modalRelatorioAberto = false" class="text-white/80 hover:text-white active:bg-white/20 hover:bg-white/10 p-2 rounded-lg transition-all">
              <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div class="p-6 md:p-8 space-y-5 md:space-y-6 max-h-[60vh] overflow-y-auto">
          
          <!-- Período -->
          <div>
            <label class="flex items-center gap-2 text-xs md:text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
              Período de Análise
            </label>
            <select 
              v-model="periodoRelatorio" 
              class="w-full p-3 md:p-4 border-2 border-gray-200 rounded-xl bg-white font-bold text-sm md:text-base text-gray-900 focus:border-gray-900 focus:ring-0 cursor-pointer transition-all hover:border-gray-300"
            >
              <option v-for="op in opcoesPeriodo" :key="op.value" :value="op.value">
                {{ op.label }}
              </option>
            </select>
          </div>

          <!-- Categorias -->
          <div>
            <label class="flex items-center gap-2 text-xs md:text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">
              <UIcon name="i-heroicons-funnel" class="w-4 h-4" />
              Categorias (Marque as desejadas)
            </label>
            <div class="space-y-2.5 md:space-y-3">
              <label 
                v-for="tipo in opcoesTipo" 
                :key="tipo.value"
                class="flex items-center gap-3 md:gap-4 p-3 md:p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-gray-300 active:scale-[0.98] relative overflow-hidden"
                :class="filtrosRelatorio.includes(tipo.value) 
                  ? 'border-gray-900 bg-gray-50' 
                  : 'border-gray-200 bg-white'"
              >
                <input 
                  type="checkbox" 
                  v-model="filtrosRelatorio" 
                  :value="tipo.value" 
                  class="w-5 h-5 text-gray-900 rounded focus:ring-gray-900 cursor-pointer border-gray-300"
                >
                <span 
                  class="text-xs md:text-sm font-bold flex-1"
                  :class="filtrosRelatorio.includes(tipo.value) ? 'text-gray-900' : 'text-gray-600'"
                >
                  {{ tipo.label }}
                </span>
                
                <UIcon 
                  v-if="filtrosRelatorio.includes(tipo.value)" 
                  name="i-heroicons-check-circle" 
                  class="w-5 h-5 md:w-6 md:h-6 text-gray-900" 
                />
              </label>
            </div>
            <p v-if="filtrosRelatorio.length === 0" class="text-xs text-red-500 font-bold mt-2">
              * Selecione pelo menos uma categoria
            </p>
          </div>

        </div>

        <div class="px-6 md:px-8 py-5 md:py-6 bg-gray-50 flex flex-col-reverse sm:flex-row justify-end gap-3 border-t border-gray-100">
          <UButton 
            @click="modalRelatorioAberto = false" 
            color="gray" 
            variant="soft"
            size="md"
            class="w-full sm:w-auto"
          >
            Cancelar
          </UButton>
          
          <UButton 
            @click="baixarPDF" 
            :disabled="gerandoPDF || filtrosRelatorio.length === 0"
            color="black"
            size="md"
            :loading="gerandoPDF"
            icon="i-heroicons-arrow-down-tray"
            class="w-full sm:w-auto"
          >
            {{ gerandoPDF ? 'Gerando...' : 'Baixar PDF' }}
          </UButton>
        </div>

      </div>
    </div>

  </div>
</template>

<style scoped>
/* Hide scrollbar mas mantém funcionalidade */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Animação de entrada do modal */
@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Smooth scroll behavior */
* {
  -webkit-tap-highlight-color: transparent;
}

/* Prevent input zoom on iOS */
@media screen and (max-width: 768px) {
  input[type="number"],
  select {
    font-size: 16px !important;
  }
}
</style>




<script setup lang="ts">
import { ref, computed } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

definePageMeta({ layout: 'default' })

// ----------------------------------------------------
// 1. DADOS DO TOPO (KPIs - SEMPRE MÊS ATUAL)
// ----------------------------------------------------
const dataHoje = new Date()

const paramsPrincipal = {
  mes: dataHoje.getMonth() + 1,
  ano: dataHoje.getFullYear()
}

const { data: statsPrincipal, pending: pendingPrincipal, refresh: refreshPrincipal, error: errorPrincipal } = await useFetch('/api/financeiro/stats', { 
  query: paramsPrincipal,
  key: 'kpi-principal',
  lazy: true 
})

// ----------------------------------------------------
// 2. NAVEGAÇÃO E DADOS DO EXTRATO (DINÂMICO)
// ----------------------------------------------------
const dataExtrato = ref(new Date()) 

const nomeMesExtrato = computed(() => dataExtrato.value.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }))

const ehMesFuturo = computed(() => {
  const hoje = new Date()
  return dataExtrato.value > hoje
})

function mudarMes(delta: number) {
  const d = new Date(dataExtrato.value)
  d.setMonth(d.getMonth() + delta)
  dataExtrato.value = d
}

const paramsExtrato = computed(() => ({
  mes: dataExtrato.value.getMonth() + 1,
  ano: dataExtrato.value.getFullYear()
}))

const { data: statsExtrato, pending: pendingExtrato, refresh: refreshExtrato } = await useFetch('/api/financeiro/stats', { 
  query: paramsExtrato,
  key: 'extrato-dinamico',
  lazy: true,
  watch: [paramsExtrato]
})

function refresh() {
  refreshPrincipal()
  refreshExtrato()
}

// ----------------------------------------------------
// TABELA DO EXTRATO
// ----------------------------------------------------
const abas = [
  { label: 'Todos', value: 'todos' },
  { label: 'Vendas', value: 'saida' },
  { label: 'Entradas', value: 'entrada' },
  { label: 'Despesas', value: 'despesa' }
]
const abaAtiva = ref('todos')

const resumoExtrato = computed(() => {
  if (!statsExtrato.value || !statsExtrato.value.extrato) return { vendas: 0, despesas: 0, lucro: 0 }

  const vendas = (statsExtrato.value.extrato.movimentacoes || [])
    .filter((m: any) => m.tipo === 'SAIDA')
    .reduce((acc: number, m: any) => acc + (Number(m.peca?.preco || 0) * m.quantidade), 0)

  const despesas = (statsExtrato.value.extrato.despesas || [])
    .reduce((acc: number, d: any) => acc + Number(d.valor), 0)

  return {
    vendas,
    despesas,
    lucro: vendas - despesas
  }
})

const textoPeriodo = computed(() => {
  const dt = new Date(dataExtrato.value)
  const primeiroDia = new Date(dt.getFullYear(), dt.getMonth(), 1)
  const ultimoDia = new Date(dt.getFullYear(), dt.getMonth() + 1, 0)
  
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }
  return `${primeiroDia.toLocaleDateString('pt-BR', options)} - ${ultimoDia.toLocaleDateString('pt-BR', options)}`
})

const historicoFiltrado = computed(() => {
  if (!statsExtrato.value || !statsExtrato.value.extrato) return []
  
  const movs = (statsExtrato.value.extrato.movimentacoes || []).map((m: any) => ({
    id: m.id, data: m.createdAt, tipo: m.tipo, 
    valor: Number(m.peca?.preco || 0) * m.quantidade, peca: m.peca, descricao: ''
  }))

  const desps = (statsExtrato.value.extrato.despesas || []).map((d: any) => ({
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
  if (statsPrincipal.value) novaMeta.value = String(statsPrincipal.value.meta.alvo)
  modalMetaAberto.value = true
}

async function salvarMeta() {
  if (!novaMeta.value) return
  salvandoMeta.value = true
  try { 
      await $fetch('/api/financeiro/meta', { method: 'POST', body: { valor: novaMeta.value } }); 
      modalMetaAberto.value = false; 
      refreshPrincipal()
  } catch {} finally { salvandoMeta.value = false }
}

// ----------------------------------------------------
// RELATÓRIO PDF (LÓGICA CORRIGIDA)
// ----------------------------------------------------
const modalRelatorioAberto = ref(false)
const gerandoPDF = ref(false)
const periodoRelatorio = ref(1)

// Array para Múltipla Seleção (Checkbox)
const filtrosRelatorio = ref(['SAIDA', 'DESPESA']) 

const opcoesPeriodo = Array.from({ length: 12 }, (_, i) => ({
  label: i === 0 ? 'Mês Atual' : `Últimos ${i + 1} meses`,
  value: i + 1
}))

const opcoesTipo = [
  { label: 'Vendas (Saídas)', value: 'SAIDA' },
  { label: 'Despesas', value: 'DESPESA' },
  { label: 'Entradas de Estoque', value: 'ENTRADA' }
]

function abrirModalRelatorios() {
  modalRelatorioAberto.value = true
  periodoRelatorio.value = 1
  filtrosRelatorio.value = ['SAIDA', 'DESPESA'] // Reseta para o padrão seguro
}

async function baixarPDF() {
  if (filtrosRelatorio.value.length === 0) {
      alert('Selecione pelo menos uma categoria.')
      return
  }

  gerandoPDF.value = true
  try {
    const dados = await $fetch('/api/financeiro/relatorio', {
      method: 'POST',
      body: {
        meses: periodoRelatorio.value,
        tipos: filtrosRelatorio.value // Envia o array
      }
    })

    const doc = new jsPDF()
    
    // Cabeçalho
    doc.setFontSize(18)
    doc.text('Relatório Financeiro - Eli Peças', 14, 15)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 22)
    doc.text(`Período de Análise: Últimos ${periodoRelatorio.value} meses`, 14, 27)

    doc.setDrawColor(200);
    doc.line(14, 32, 196, 32);

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
      headStyles: { fillColor: [40, 40, 40] },
      styles: { fontSize: 8 },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold' }
      },
      didParseCell: function (data) {
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