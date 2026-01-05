<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 pb-24">
    <div class="max-w-7xl mx-auto p-6 space-y-8">
      
      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div class="flex-1">
            <h1 class="text-3xl font-black text-gray-900 tracking-tight mb-2 flex items-center gap-3">
              <span class="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-2.5 rounded-xl shadow-lg">
                <UIcon name="i-heroicons-chart-bar" class="w-7 h-7" />
              </span>
              Painel Financeiro
            </h1>
          </div>

          <div class="flex flex-wrap items-center gap-3">
            <UButton 
              icon="i-heroicons-arrow-path" 
              color="gray" 
              variant="soft" 
              size="lg"
              :loading="pendingPrincipal" 
              @click="refresh"
            >
              Atualizar Tudo
            </UButton>
            
            <UButton 
              icon="i-heroicons-document-arrow-down" 
              color="black" 
              size="lg"
              @click="abrirModalRelatorios"
            >
              Exportar PDF
            </UButton>
          </div>
        </div>
      </div>

      <div v-if="pendingPrincipal && !statsPrincipal" class="bg-white rounded-2xl shadow-sm border border-gray-100 py-32 text-center">
        <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin text-blue-500 mb-4 mx-auto" />
        <p class="text-gray-500 font-medium">Calculando a rota do dinheiro...</p>
      </div>

      <template v-else-if="statsPrincipal">
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
          
          <div class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-4 text-white relative overflow-hidden">
            <div class="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
            <div class="relative flex flex-col h-full justify-between">
              <div class="flex items-center gap-2 mb-1">
                <div class="bg-white/20 p-1.5 rounded-md backdrop-blur-sm">
                  <UIcon name="i-heroicons-banknotes" class="w-4 h-4" />
                </div>
                <span class="text-emerald-100 text-[10px] font-bold uppercase tracking-wider">Saldo Disponível</span>
              </div>
              <div>
                <p class="text-2xl font-black mb-0.5">{{ formatarDinheiro(statsPrincipal.saldoCaixa) }}</p>
                <p class="text-emerald-100 text-xs font-medium">Caixa atual</p>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 relative group hover:shadow-md transition-shadow">
            <button 
              @click="abrirModalMeta"
              class="absolute top-2 right-2 bg-gray-50 hover:bg-gray-100 p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100"
              title="Alterar Meta"
            >
              <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5 text-gray-600" />
            </button>
            
            <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2">
                    <div class="bg-blue-100 p-1.5 rounded-md">
                        <UIcon name="i-heroicons-flag" class="w-4 h-4 text-blue-600" />
                    </div>
                    <span class="text-gray-500 text-[10px] font-bold uppercase tracking-wider">Meta de Lucro</span>
                </div>
                <p class="text-xs text-gray-400 font-medium">Alvo: {{ formatarDinheiro(statsPrincipal.meta.alvo) }}</p>
            </div>

            <div class="mb-2">
              <p class="text-2xl font-black text-gray-900 leading-none">{{ formatarDinheiro(statsPrincipal.meta.atual) }}</p>
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

          <div class="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-4 text-white relative overflow-hidden">
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -ml-6 -mb-6"></div>
            <div class="relative flex flex-col h-full justify-between">
              <div class="flex items-center gap-2 mb-1">
                <div class="bg-white/20 p-1.5 rounded-md backdrop-blur-sm">
                  <UIcon name="i-heroicons-bolt" class="w-4 h-4" />
                </div>
                <span class="text-orange-100 text-[10px] font-bold uppercase tracking-wider">
                  {{ statsPrincipal.meta.falta <= 0 ? 'Meta Batida!' : 'Ritmo Necessário' }}
                </span>
              </div>
              
              <template v-if="statsPrincipal.meta.ehMesAtual && statsPrincipal.meta.falta > 0">
                <div>
                    <p class="text-2xl font-black mb-0.5">{{ formatarDinheiro(statsPrincipal.meta.ritmo) }}</p>
                    <p class="text-orange-100 text-xs font-medium">por dia para atingir a meta</p>
                </div>
              </template>
              
              <template v-else-if="statsPrincipal.meta.falta <= 0">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-check-badge" class="w-8 h-8 text-white/90" />
                  <div>
                    <p class="text-lg font-black leading-tight">Parabéns!</p>
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

        <!--PATRIMONIO ATIVO-->
        <div class="grid grid-cols-3 gap-4">
            <div class="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex flex-col justify-between hover:shadow-md transition-all">
                <div class="flex items-center gap-2 text-gray-500 mb-2">
                    <div class="bg-blue-50 p-1.5 rounded-md">
                        <UIcon name="i-heroicons-cube" class="w-4 h-4 text-blue-600" />
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider">Estoque Total</span>
                </div>
                <div>
                    <div class="text-2xl font-black text-gray-900 text-center">
                        {{ statsPrincipal.itensEstoque }}
                    </div>
                    <p class="text-[10px] text-center text-gray-400 mt-1 font-medium">Peças cadastradas</p>
                </div>
            </div>

            <div class="bg-white p-4 col-span-2 rounded-xl shadow-sm border border-emerald-100 flex flex-col justify-between hover:shadow-md transition-all">
                <div class="flex items-center gap-2 text-gray-500 mb-2">
                    <div class="bg-emerald-50 p-1.5 rounded-md">
                        <UIcon name="i-heroicons-banknotes" class="w-4 h-4 text-emerald-600" />
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider">Patrimônio Ativo</span>
                </div>
                <div>
                    <div class="text-2xl font-black text-gray-900">
                        {{ formatarDinheiro(statsPrincipal.valorEstoque) }}
                    </div>
                    <p class="text-[10px] text-gray-400 mt-1 font-medium">Valor de custo total em mercadoria</p>
                </div>
            </div>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          
          <div v-if="pendingExtrato" class="absolute inset-0 z-50 bg-white/60 backdrop-blur-[1px] flex items-center justify-center transition-all duration-300">
            <div class="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center gap-3">
              <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-blue-600 animate-spin" />
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Atualizando dados...</span>
            </div>
          </div>

          <div class="p-6 border-b border-gray-100">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div class="flex items-center gap-3">
                <div class="bg-gray-900 p-2.5 rounded-xl shadow-lg">
                  <UIcon name="i-heroicons-list-bullet" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 class="font-black text-gray-900 text-xl">Extrato Detalhado</h2>
                  <p class="text-xs text-gray-500 font-medium">Todas as movimentações do período</p>
                </div>
              </div>

              <div class="flex flex-col gap-2 items-end justify-end">
                <div class="flex items-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl shadow-lg justify-center max-w-68 h-12">
                  <button 
                    @click="mudarMes(-1)" 
                    :disabled="pendingExtrato"
                    class="px-4 py-3 hover:bg-white/10 rounded-l-xl text-white transition-all disabled:opacity-50 disabled:cursor-wait"
                  >
                    <UIcon name="i-heroicons-chevron-left" class="w-5 h-5" />
                  </button>
                  <div class="px-6 py-3 min-w-[140px] text-center">
                    <div class="text-white font-black text-sm capitalize">{{ nomeMesExtrato }}</div>
                  </div>
                  <button 
                    @click="mudarMes(1)" 
                    :disabled="ehMesFuturo || pendingExtrato" 
                    class="px-4 py-3 hover:bg-white/10 rounded-r-xl text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <UIcon name="i-heroicons-chevron-right" class="w-5 h-5" />
                  </button>
                </div>
                
                <div class="flex gap-2 bg-gray-100 p-1.5 rounded-xl shadow-inner">
                  <button 
                    v-for="aba in abas" 
                    :key="aba.value" 
                    @click="abaAtiva = aba.value" 
                    class="px-4 py-2 text-sm font-bold rounded-lg transition-all"
                    :class="abaAtiva === aba.value 
                      ? 'bg-white shadow-sm text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'"
                  >
                    {{ aba.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-if="statsExtrato" class="bg-gray-50 border-b border-gray-200 grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-200">
            <div class="p-4 flex flex-col justify-center">
              <span class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">Período Selecionado</span>
              <div class="flex items-center gap-2 text-gray-700 font-bold text-sm">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-400" />
                {{ textoPeriodo }}
              </div>
            </div>
            <div class="p-4 flex flex-col justify-center">
              <span class="text-[10px] uppercase font-bold text-emerald-600/70 tracking-wider mb-0.5">Vendas Brutas</span>
              <span class="text-lg font-black text-emerald-600">+ {{ formatarDinheiro(resumoExtrato.vendas) }}</span>
            </div>
            <div class="p-4 flex flex-col justify-center">
              <span class="text-[10px] uppercase font-bold text-red-600/70 tracking-wider mb-0.5">Despesas Totais</span>
              <span class="text-lg font-black text-red-600">- {{ formatarDinheiro(resumoExtrato.despesas) }}</span>
            </div>
            <div class="p-4 flex flex-col justify-center bg-gray-100/50">
              <span class="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-0.5">Resultado Líquido</span>
              <span class="text-lg font-black" :class="resumoExtrato.lucro >= 0 ? 'text-gray-900' : 'text-red-600'">{{ formatarDinheiro(resumoExtrato.lucro) }}</span>
            </div>
          </div>

          <div class="border-t border-gray-100">
            <div class="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
              <table class="w-full relative border-collapse">
                <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th class="py-4 px-6 text-left text-xs font-black text-gray-400 uppercase tracking-wider bg-gray-50">Data</th>
                    <th class="py-4 px-6 text-left text-xs font-black text-gray-400 uppercase tracking-wider bg-gray-50">Descrição</th>
                    <th class="py-4 px-6 text-center text-xs font-black text-gray-400 uppercase tracking-wider bg-gray-50">Categoria</th>
                    <th class="py-4 px-6 text-right text-xs font-black text-gray-400 uppercase tracking-wider bg-gray-50">Valor</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50 bg-white">
                  <tr v-for="mov in historicoFiltrado" :key="mov.id" class="hover:bg-gray-50 transition-colors group">
                    <td class="py-4 px-6">
                      <span class="text-sm text-gray-500 font-medium whitespace-nowrap group-hover:text-gray-900 transition-colors">{{ new Date(mov.data).toLocaleDateString('pt-BR') }}</span>
                    </td>
                    <td class="py-4 px-6">
                      <div class="font-bold text-gray-900">{{ mov.descricao || mov.peca?.nome }}</div>
                      <div v-if="mov.peca?.modelo" class="text-xs text-gray-500 font-medium mt-0.5">{{ mov.peca.modelo }}</div>
                    </td>
                    <td class="py-4 px-6 text-center">
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide border" :class="getBadgeClass(mov.tipo)">{{ getLabelTipo(mov.tipo) }}</span>
                    </td>
                    <td class="py-4 px-6 text-right">
                      <span class="text-sm font-black whitespace-nowrap" :class="getValorClass(mov.tipo)">{{ getSinal(mov.tipo) }} {{ formatarDinheiro(mov.valor) }}</span>
                    </td>
                  </tr>
                  <tr v-if="!historicoFiltrado.length">
                    <td colspan="4" class="py-16 text-center">
                      <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p class="text-gray-400 font-medium">Nenhum registro encontrado</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div class="bg-gradient-to-r from-orange-50 to-orange-100/50 p-5 border-b border-orange-200">
              <div class="flex items-center gap-3 mb-2">
                <div class="bg-gradient-to-br from-orange-500 to-orange-600 p-2.5 rounded-xl shadow-lg">
                  <UIcon name="i-heroicons-fire" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="font-black text-gray-900 text-lg">Produtos Prioritários</h3>
                  <p class="text-xs text-gray-600 font-medium">Foque nestas oportunidades</p>
                </div>
              </div>
            </div>
            
            <div class="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table class="w-full">
                <thead class="bg-gray-50 sticky top-0 z-10">
                  <tr class="text-left">
                    <th class="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Produto</th>
                    <th class="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Margem</th>
                    <th class="px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Potencial</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <tr v-for="item in statsPrincipal.oportunidades" :key="item.id" class="hover:bg-orange-50/30 transition-colors">
                    <td class="px-5 py-4">
                      <div class="font-bold text-gray-900 mb-0.5">{{ item.nome }}</div>
                      <div class="flex items-center gap-2 text-xs text-gray-500">
                        <span class="font-medium">{{ item.modelo }}</span>
                        <span class="text-gray-300">•</span>
                        <span class="bg-gray-100 px-2 py-0.5 rounded-md font-bold">{{ item.estoque }} un</span>
                      </div>
                    </td>
                    <td class="px-5 py-4 text-right">
                      <span class="inline-flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-lg text-sm font-black">
                        {{ item.margem.toFixed(0) }}%
                      </span>
                    </td>
                    <td class="px-5 py-4 text-right">
                      <div class="font-black text-gray-900 text-base">{{ formatarDinheiro(item.lucroPotencial) }}</div>
                      <div class="text-xs text-gray-400 font-medium">{{ formatarDinheiro(item.lucroUnit) }}/un</div>
                    </td>
                  </tr>
                  <tr v-if="!statsPrincipal.oportunidades.length">
                    <td colspan="3" class="px-5 py-12 text-center">
                      <UIcon name="i-heroicons-inbox" class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p class="text-gray-400 text-sm font-medium">Sem dados suficientes no momento</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div class="bg-gradient-to-r from-blue-50 to-blue-100/50 p-5 border-b border-blue-200">
              <div class="flex items-center gap-3 mb-2">
                <div class="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-lg">
                  <UIcon name="i-heroicons-archive-box" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 class="font-black text-gray-900 text-lg">Dinheiro Congelado</h3>
                  <p class="text-xs text-gray-600 font-medium">Estoque parado +90 dias</p>
                </div>
              </div>
            </div>

            <div class="p-6 space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Custo Travado</p>
                  <p class="text-2xl font-black text-gray-900">{{ formatarDinheiro(statsPrincipal.parados.custoTotal) }}</p>
                </div>
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <p class="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Itens Parados</p>
                  <p class="text-2xl font-black text-gray-900">{{ statsPrincipal.parados.qtd }}</p>
                </div>
              </div>

              <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                <div class="flex gap-3 items-start">
                  <div class="bg-blue-500 p-2 rounded-lg flex-shrink-0">
                    <UIcon name="i-heroicons-light-bulb" class="w-6 h-6 text-white" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-black text-blue-900 mb-2">💡 Sugestão Estratégica</p>
                    <p class="text-sm text-blue-800 leading-relaxed">
                      Liquidando com <span class="font-black bg-white px-2 py-0.5 rounded">15% de desconto</span>, 
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

      <div v-else-if="errorPrincipal" class="bg-white rounded-2xl border-2 border-red-100 p-12 text-center">
        <div class="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-8 h-8 text-red-600" />
        </div>
        <p class="text-red-600 font-black text-lg mb-2">Erro ao carregar dados</p>
        <p class="text-gray-500 text-sm mb-6">{{ errorPrincipal.message }}</p>
        <UButton color="red" variant="solid" @click="refresh" icon="i-heroicons-arrow-path">
          Tentar novamente
        </UButton>
      </div>

    </div>

    <div v-if="modalMetaAberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-2xl font-black mb-1 flex items-center gap-3">
                <UIcon name="i-heroicons-flag" class="w-7 h-7" />
                Definir Meta de Lucro
              </h3>
              <p class="text-blue-100 text-sm font-medium">Configure seu objetivo para o mês</p>
            </div>
            <button @click="modalMetaAberto = false" class="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all">
              <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div class="p-8">
          <label class="block text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">Valor Alvo (Lucro Líquido)</label>
          <div class="relative">
            <span class="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-black text-xl">R$</span>
            <input 
              v-model="novaMeta" 
              type="number" 
              placeholder="15000" 
              class="w-full pl-14 pr-6 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl text-2xl font-black text-gray-900 focus:border-blue-500 focus:ring-0 focus:bg-white outline-none transition-all" 
            />
          </div>
          <p class="text-xs text-gray-500 mt-3 font-medium">💡 Defina uma meta realista baseada no seu histórico</p>
        </div>
        
        <div class="px-8 py-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <UButton 
            @click="modalMetaAberto = false" 
            color="gray" 
            variant="soft"
            size="lg"
          >
            Cancelar
          </UButton>
          <UButton 
            @click="salvarMeta" 
            :disabled="salvandoMeta || !novaMeta" 
            color="black"
            size="lg"
            :loading="salvandoMeta"
          >
            {{ salvandoMeta ? 'Salvando...' : 'Salvar Meta' }}
          </UButton>
        </div>
      </div>
    </div>

    <div v-if="modalRelatorioAberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        <div class="bg-gradient-to-r from-gray-900 to-gray-800 px-8 py-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-2xl font-black mb-1 flex items-center gap-3">
                <UIcon name="i-heroicons-document-arrow-down" class="w-7 h-7" />
                Exportar Relatório PDF
              </h3>
              <p class="text-gray-300 text-sm font-medium">Configure os filtros do relatório</p>
            </div>
            <button @click="modalRelatorioAberto = false" class="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-all">
              <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
            </button>
          </div>
        </div>

        <div class="p-8 space-y-6">
          
          <div>
            <label class="flex items-center gap-2 text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4" />
              Período de Análise
            </label>
            <select 
              v-model="periodoRelatorio" 
              class="w-full p-4 border-2 border-gray-200 rounded-xl bg-white font-bold text-gray-900 focus:border-gray-900 focus:ring-0 cursor-pointer transition-all hover:border-gray-300"
            >
              <option v-for="op in opcoesPeriodo" :key="op.value" :value="op.value">
                {{ op.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="flex items-center gap-2 text-sm font-black text-gray-700 mb-3 uppercase tracking-wide">
              <UIcon name="i-heroicons-funnel" class="w-4 h-4" />
              Filtro por Categoria
            </label>
            <div class="space-y-3">
              <label 
                v-for="tipo in opcoesTipo" 
                :key="tipo.value"
                class="flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all hover:border-gray-300"
                :class="tipoRelatorio === tipo.value 
                  ? 'border-gray-900 bg-gray-50' 
                  : 'border-gray-200 bg-white'"
              >
                <input 
                  type="radio" 
                  v-model="tipoRelatorio" 
                  :value="tipo.value" 
                  class="w-5 h-5 text-gray-900 focus:ring-gray-900 cursor-pointer"
                >
                <span 
                  class="text-sm font-bold flex-1"
                  :class="tipoRelatorio === tipo.value ? 'text-gray-900' : 'text-gray-600'"
                >
                  {{ tipo.label }}
                </span>
              </label>
            </div>
          </div>

        </div>

        <div class="px-8 py-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <UButton 
            @click="modalRelatorioAberto = false" 
            color="gray" 
            variant="soft"
            size="lg"
          >
            Cancelar
          </UButton>
          
          <UButton 
            @click="baixarPDF" 
            :disabled="gerandoPDF"
            color="black"
            size="lg"
            :loading="gerandoPDF"
            icon="i-heroicons-arrow-down-tray"
          >
            {{ gerandoPDF ? 'Gerando...' : 'Baixar PDF' }}
          </UButton>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

definePageMeta({ layout: 'default' })

// ----------------------------------------------------
// 1. DADOS DO TOPO (KPIs - SEMPRE MÊS ATUAL)
// ----------------------------------------------------
// Data fixa de "hoje" para os cards de cima. Não muda com a navegação.
const dataHoje = new Date()

const paramsPrincipal = {
  mes: dataHoje.getMonth() + 1,
  ano: dataHoje.getFullYear()
}

// Fetch 1: Carrega apenas os dados do topo (Meta, Saldo, Ritmo)
// key: 'kpi-principal' garante que não misture com o outro fetch
const { data: statsPrincipal, pending: pendingPrincipal, refresh: refreshPrincipal, error: errorPrincipal } = await useFetch('/api/financeiro/stats', { 
  query: paramsPrincipal,
  key: 'kpi-principal',
  lazy: true 
})

// ----------------------------------------------------
// 2. NAVEGAÇÃO E DADOS DO EXTRATO (DINÂMICO)
// ----------------------------------------------------
// Data exclusiva para controlar a tabela de baixo
const dataExtrato = ref(new Date()) 

const nomeMesExtrato = computed(() => dataExtrato.value.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }))

const ehMesFuturo = computed(() => {
  const hoje = new Date()
  // Compara se o mês do extrato é maior que o mês atual real
  return dataExtrato.value > hoje
})

function mudarMes(delta: number) {
  const d = new Date(dataExtrato.value)
  d.setMonth(d.getMonth() + delta)
  dataExtrato.value = d
  // O watch do useFetch abaixo detecta a mudança e recarrega sozinho
}

const paramsExtrato = computed(() => ({
  mes: dataExtrato.value.getMonth() + 1,
  ano: dataExtrato.value.getFullYear()
}))

// Fetch 2: Carrega a tabela e o resumo da barra cinza
// watch: [paramsExtrato] faz ele recarregar assim que mudar o mês
const { data: statsExtrato, pending: pendingExtrato, refresh: refreshExtrato } = await useFetch('/api/financeiro/stats', { 
  query: paramsExtrato,
  key: 'extrato-dinamico',
  lazy: true,
  watch: [paramsExtrato]
})

// Função global para atualizar tudo manualmente se precisar
function refresh() {
  refreshPrincipal()
  refreshExtrato()
}

// ----------------------------------------------------
// TABELA DO EXTRATO (Lógica baseada em statsExtrato)
// ----------------------------------------------------
const abas = [
  { label: 'Todos', value: 'todos' },
  { label: 'Vendas', value: 'saida' },
  { label: 'Entradas', value: 'entrada' },
  { label: 'Despesas', value: 'despesa' }
]
const abaAtiva = ref('todos')

// CÁLCULOS DO RESUMO (Barra Cinza) - Olha para statsExtrato
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

// Texto da data (ex: 01 Jan - 31 Jan) baseado na data do extrato
const textoPeriodo = computed(() => {
  const dt = new Date(dataExtrato.value)
  const primeiroDia = new Date(dt.getFullYear(), dt.getMonth(), 1)
  const ultimoDia = new Date(dt.getFullYear(), dt.getMonth() + 1, 0)
  
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' }
  return `${primeiroDia.toLocaleDateString('pt-BR', options)} - ${ultimoDia.toLocaleDateString('pt-BR', options)}`
})

// Lista da Tabela - Olha para statsExtrato
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
// MODAL META (Olha para statsPrincipal - Mês Atual)
// ----------------------------------------------------
const modalMetaAberto = ref(false)
const novaMeta = ref('')
const salvandoMeta = ref(false)

function abrirModalMeta() {
  // Pega a meta do mês ATUAL, não do histórico
  if (statsPrincipal.value) novaMeta.value = String(statsPrincipal.value.meta.alvo)
  modalMetaAberto.value = true
}

async function salvarMeta() {
  if (!novaMeta.value) return
  salvandoMeta.value = true
  try { 
      await $fetch('/api/financeiro/meta', { method: 'POST', body: { valor: novaMeta.value } }); 
      modalMetaAberto.value = false; 
      refreshPrincipal() // Atualiza só o topo
  } catch {} finally { salvandoMeta.value = false }
}

// ----------------------------------------------------
// RELATÓRIO PDF (Mantido Intacto)
// ----------------------------------------------------
const modalRelatorioAberto = ref(false)
const gerandoPDF = ref(false)
const periodoRelatorio = ref(1) // Meses
const tipoRelatorio = ref('todos')

const opcoesPeriodo = Array.from({ length: 12 }, (_, i) => ({
  label: i === 0 ? 'Mês Atual' : `Últimos ${i + 1} meses`,
  value: i + 1
}))

const opcoesTipo = [
  { label: 'Tudo (Extrato Completo)', value: 'todos' },
  { label: 'Apenas Vendas', value: 'saida' },
  { label: 'Apenas Entradas de Estoque', value: 'entrada' },
  { label: 'Apenas Despesas', value: 'despesa' }
]

function abrirModalRelatorios() {
  modalRelatorioAberto.value = true
}

async function baixarPDF() {
  gerandoPDF.value = true
  try {
    const dados = await $fetch('/api/financeiro/relatorio', {
      method: 'POST',
      body: {
        meses: periodoRelatorio.value,
        tipo: tipoRelatorio.value
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
    doc.line(14, 32, 196, 32); // Linha separadora

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
      headStyles: { fillColor: [40, 40, 40] }, // Cabeçalho preto
      styles: { fontSize: 8 },
      columnStyles: {
        3: { halign: 'right', fontStyle: 'bold' } // Coluna Valor alinhada a direita
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
// HELPERS (Mantidos Iguais)
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