<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 pb-24">
    <div class="max-w-7xl mx-auto p-3 md:p-6 space-y-4 md:space-y-6">
      
      <!-- Header -->
      <div class="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-gray-100/50 p-4 md:p-5 sticky top-0 z-40">
        <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 md:gap-4">
          <div class="flex items-center gap-3">
            <div class="bg-gradient-to-br from-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/20">
              <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 class="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Painel Financeiro
              </h1>
              <p class="text-xs text-gray-500 font-medium">Visão completa do negócio</p>
            </div>
          </div>

          <div class="flex items-center gap-2 w-full lg:w-auto">
            <UButton 
              icon="i-heroicons-arrow-path" 
              color="gray" 
              variant="soft" 
              size="md"
              class="flex-1 lg:flex-none"
              :loading="pendingPrincipal" 
              @click="refresh"
            >
              <span class="hidden sm:inline">Atualizar</span>
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
      <div v-if="pendingPrincipal && !statsPrincipal" class="bg-white rounded-2xl shadow-sm border border-gray-100 py-24 text-center">
        <UIcon name="i-heroicons-arrow-path" class="w-12 h-12 animate-spin text-blue-500 mb-4 mx-auto" />
        <p class="text-gray-500 font-semibold">Calculando a rota do dinheiro...</p>
      </div>

      <template v-else-if="statsPrincipal">
        
        <!-- 🎯 CARD PRINCIPAL: SALDO + META + RITMO UNIFICADO -->
        <div class="bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-600 rounded-2xl shadow-xl shadow-emerald-500/20 p-5 md:p-6 text-white relative overflow-hidden">
          <!-- Decoração -->
          <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl"></div>
          
          <div class="relative space-y-5">
            <!-- Saldo Principal -->
            <div>
              <div class="flex items-center gap-2 mb-2">
                <div class="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
                  <UIcon name="i-heroicons-banknotes" class="w-5 h-5" />
                </div>
                <span class="text-emerald-50 text-xs font-bold uppercase tracking-wider">Saldo Disponível</span>
              </div>
              <p class="text-4xl md:text-5xl font-black mb-1">{{ formatarDinheiro(statsPrincipal.saldoCaixa) }}</p>
              <p class="text-emerald-100 text-sm font-medium">Disponível em caixa agora</p>
            </div>

            <!-- Mini Cards: Meta + Ritmo (lado a lado) -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              <!-- Meta de Lucro (compacto) -->
              <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 relative group hover:bg-white/15 transition-all">
                <button 
                  @click="abrirModalMeta"
                  class="absolute top-2 right-2 bg-white/20 hover:bg-white/30 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Alterar Meta"
                >
                  <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5 text-white" />
                </button>
                
                <div class="flex items-center gap-2 mb-3">
                  <UIcon name="i-heroicons-flag" class="w-4 h-4 text-emerald-100" />
                  <span class="text-emerald-100 text-[10px] font-bold uppercase tracking-wider">Meta do Mês</span>
                </div>

                <div class="flex items-baseline gap-2 mb-2">
                  <p class="text-2xl font-black">{{ formatarDinheiro(statsPrincipal.meta.atual) }}</p>
                  <span class="text-xs text-emerald-100 font-medium">de {{ formatarDinheiro(statsPrincipal.meta.alvo) }}</span>
                </div>

                <div class="w-full bg-black/20 h-2 rounded-full overflow-hidden mb-1">
                  <div 
                    class="h-full rounded-full transition-all duration-1000 bg-gradient-to-r from-white to-emerald-200"
                    :style="{ width: `${Math.min(statsPrincipal.meta.progresso, 100)}%` }"
                  ></div>
                </div>
                <p class="text-[10px] text-emerald-100 font-bold text-right">{{ statsPrincipal.meta.progresso.toFixed(0) }}% completo</p>
              </div>

              <!-- Ritmo Necessário (compacto) -->
              <div class="bg-gradient-to-br from-orange-500/90 to-orange-600/90 backdrop-blur-md rounded-xl p-4 border border-orange-400/30 shadow-lg">
                <div class="flex items-center gap-2 mb-3">
                  <UIcon name="i-heroicons-bolt" class="w-4 h-4 text-orange-100" />
                  <span class="text-orange-100 text-[10px] font-bold uppercase tracking-wider">
                    {{ statsPrincipal.meta.falta <= 0 ? '✓ Meta Batida!' : 'Ritmo Necessário' }}
                  </span>
                </div>
                
                <template v-if="statsPrincipal.meta.ehMesAtual && statsPrincipal.meta.falta > 0">
                  <p class="text-2xl font-black mb-1">{{ formatarDinheiro(statsPrincipal.meta.ritmo) }}</p>
                  <p class="text-orange-100 text-xs font-medium">por dia para bater a meta</p>
                </template>
                
                <template v-else-if="statsPrincipal.meta.falta <= 0">
                  <div class="flex items-center gap-2">
                    <UIcon name="i-heroicons-check-badge" class="w-8 h-8 text-white/90" />
                    <div>
                      <p class="text-lg font-black">Objetivo alcançado!</p>
                      <p class="text-orange-100 text-xs">Continue assim 🎉</p>
                    </div>
                  </div>
                </template>
                
                <template v-else>
                  <p class="text-sm text-orange-100 font-medium">Meta do período encerrado</p>
                </template>
              </div>

            </div>
          </div>
        </div>

        <!-- Estoque (Card Único Compacto) -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-5 hover:shadow-md transition-all">
          <div class="flex items-center gap-3 mb-4">
            <div class="bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
              <UIcon name="i-heroicons-cube" class="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 class="font-black text-gray-900 text-lg">Patrimônio em Estoque</h3>
              <p class="text-xs text-gray-500 font-medium">Investimento ativo</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
              <p class="text-xs text-blue-600 font-bold uppercase tracking-wider mb-2">Valor Total</p>
              <p class="text-2xl md:text-3xl font-black text-blue-900">{{ formatarDinheiro(statsPrincipal.valorEstoque) }}</p>
              <p class="text-xs text-blue-600 font-medium mt-1">em mercadoria</p>
            </div>
            
            <div class="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-4 border border-gray-200">
              <p class="text-xs text-gray-600 font-bold uppercase tracking-wider mb-2">Itens Ativos</p>
              <p class="text-2xl md:text-3xl font-black text-gray-900">{{ statsPrincipal.itensEstoque }}</p>
              <p class="text-xs text-gray-600 font-medium mt-1">peças cadastradas</p>
            </div>
          </div>
        </div>

        <!-- Extrato Detalhado (mantém destaque) -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden relative">
          
          <div v-if="pendingExtrato" class="absolute inset-0 z-50 bg-white/70 backdrop-blur-sm flex items-center justify-center">
            <div class="bg-white p-5 rounded-2xl shadow-2xl border border-gray-100 flex flex-col items-center gap-3">
              <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 text-blue-600 animate-spin" />
              <span class="text-xs font-bold text-gray-500 uppercase tracking-wider">Atualizando...</span>
            </div>
          </div>

          <div class="p-4 md:p-6 bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
            <div class="flex flex-col gap-4">
              <!-- Título -->
              <div class="flex items-center gap-3">
                <div class="bg-gradient-to-br from-gray-900 to-gray-700 p-2.5 rounded-xl shadow-lg">
                  <UIcon name="i-heroicons-list-bullet" class="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 class="font-black text-gray-900 text-lg md:text-xl">
                    Extrato Detalhado
                  </h2>
                  <p class="text-xs text-gray-500 font-medium">
                    Movimentações do período
                  </p>
                </div>
              </div>

              <!-- Controles -->
              <div class="flex flex-col gap-3">
                <!-- Seletor de mês -->
                <div class="flex justify-center">
                  <div class="flex items-center w-full max-w-sm bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl shadow-lg overflow-hidden">
                    <button 
                      @click="mudarMes(-1)" 
                      :disabled="pendingExtrato"
                      class="px-4 py-3 hover:bg-white/10 active:bg-white/20 text-white transition-all disabled:opacity-50"
                    >
                      <UIcon name="i-heroicons-chevron-left" class="w-5 h-5" />
                    </button>
                    <div class="flex-1 px-3 py-3 text-center">
                      <div class="text-white font-black text-sm capitalize">
                        {{ nomeMesExtrato }}
                      </div>
                    </div>
                    <button 
                      @click="mudarMes(1)" 
                      :disabled="ehMesFuturo || pendingExtrato" 
                      class="px-4 py-3 hover:bg-white/10 active:bg-white/20 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <UIcon name="i-heroicons-chevron-right" class="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <!-- Abas -->
                <div class="flex justify-center overflow-x-auto pb-1 scrollbar-hide">
                  <div class="flex gap-2 bg-white/60 backdrop-blur-sm p-1.5 rounded-xl shadow-inner border border-gray-200/50">
                    <button 
                      v-for="aba in abas" 
                      :key="aba.value" 
                      @click="abaAtiva = aba.value" 
                      class="px-4 py-2 text-xs md:text-sm font-bold rounded-lg transition-all whitespace-nowrap"
                      :class="abaAtiva === aba.value 
                        ? 'bg-gray-900 shadow-md text-white' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'"
                    >
                      {{ aba.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Stats (3 colunas) -->
          <div v-if="statsExtrato" class="bg-gradient-to-r from-gray-50 to-slate-50">
            
            <!-- Período (desktop) -->
            <div class="hidden md:flex items-center justify-center gap-2 p-3 border-b border-gray-200">
              <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-400" />
              <span class="text-sm font-bold text-gray-700">{{ textoPeriodo }}</span>
            </div>

            <!-- Grid 3 colunas -->
            <div class="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200">
              <div class="p-4 text-center">
                <p class="text-[9px] md:text-[10px] uppercase font-black text-emerald-600/70 tracking-wider mb-1">Vendas</p>
                <p class="text-lg md:text-2xl font-black text-emerald-600">+{{ formatarDinheiro(resumoExtrato.vendas) }}</p>
              </div>

              <div class="p-4 text-center">
                <p class="text-[9px] md:text-[10px] uppercase font-black text-red-600/70 tracking-wider mb-1">Despesas</p>
                <p class="text-lg md:text-2xl font-black text-red-600">-{{ formatarDinheiro(resumoExtrato.despesas) }}</p>
              </div>

              <div class="p-4 text-center bg-gray-100/50">
                <p class="text-[9px] md:text-[10px] uppercase font-black text-gray-500 tracking-wider mb-1">Resultado</p>
                <p class="text-lg md:text-2xl font-black" :class="resumoExtrato.lucro >= 0 ? 'text-gray-900' : 'text-red-600'">
                  {{ formatarDinheiro(resumoExtrato.lucro) }}
                </p>
              </div>
            </div>

            <!-- Período (mobile) -->
            <div class="md:hidden flex items-center justify-center gap-2 p-3 border-b border-gray-200 bg-white/50">
              <UIcon name="i-heroicons-calendar" class="w-3.5 h-3.5 text-gray-400" />
              <span class="text-xs font-bold text-gray-700">{{ textoPeriodo }}</span>
            </div>
          </div>

          <!-- Tabela -->
          <div class="border-t border-gray-100">
            <div class="max-h-[400px] md:max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
              <table class="w-full relative border-collapse min-w-[600px]">
                <thead class="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th class="py-3 md:py-4 px-4 md:px-6 text-left text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-wider">Data</th>
                    <th class="py-3 md:py-4 px-4 md:px-6 text-left text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-wider">Descrição</th>
                    <th class="py-3 md:py-4 px-4 md:px-6 text-center text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-wider">Tipo</th>
                    <th class="py-3 md:py-4 px-4 md:px-6 text-right text-[10px] md:text-xs font-black text-gray-500 uppercase tracking-wider">Valor</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                  <tr
                    v-for="mov in historicoFiltradoTela"
                    :key="mov.id"
                    class="hover:bg-blue-50/30 active:bg-blue-50/50 transition-colors group cursor-pointer"
                  >
                    <td class="py-3 md:py-4 px-4 md:px-6">
                      <span class="text-xs md:text-sm text-gray-500 font-semibold whitespace-nowrap group-hover:text-gray-900">
                        {{ new Date(mov.data).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) }}
                      </span>
                    </td>
                    <td class="py-3 md:py-4 px-4 md:px-6">
                      <div v-if="mov.peca" @click="verDetalhesPeca(mov.peca.id)" class="font-bold text-gray-900 text-sm md:text-base leading-tight cursor-pointer hover:text-blue-600 flex items-center gap-2 transition-colors">
                        {{ mov.peca.nome }}
                        <UIcon name="i-heroicons-information-circle" class="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
                      </div>
                      <div v-else class="font-bold text-gray-900 text-sm md:text-base">{{ mov.descricao }}</div>
                      <div v-if="mov.peca?.modelo" class="text-xs text-gray-500 font-medium mt-0.5">{{ mov.peca.modelo }}</div>
                    </td>
                    <td class="py-3 md:py-4 px-4 md:px-6 text-center">
                      <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide" :class="getBadgeClass(mov.tipo)">
                        {{ getLabelTipo(mov.tipo) }}
                      </span>
                    </td>
                    <td class="py-3 md:py-4 px-4 md:px-6 text-right">
                      <span class="text-sm md:text-base font-black whitespace-nowrap" :class="getValorClass(mov.tipo)">
                        <span v-if="mov.tipo === 'ENTRADA'" class="text-gray-400 font-normal text-xs">Estoque</span>
                        <span v-else>{{ getSinal(mov.tipo) }} {{ formatarDinheiro(mov.valor) }}</span>
                      </span>
                    </td>
                  </tr>
                  <tr v-if="!historicoFiltradoTela.length">
                    <td colspan="4" class="py-16 text-center">
                      <UIcon name="i-heroicons-inbox" class="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p class="text-gray-400 font-semibold">Nenhum registro encontrado</p>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </template>

      <!-- Error State -->
      <div v-else-if="errorPrincipal" class="bg-white rounded-2xl border-2 border-red-200 p-12 text-center">
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

    <!-- Modal Meta -->
    <div v-if="modalMetaAberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="text-2xl font-black mb-1 flex items-center gap-3">
                <UIcon name="i-heroicons-flag" class="w-7 h-7" />
                Definir Meta de Lucro
              </h3>
              <p class="text-blue-100 text-sm font-medium">Configure seu objetivo mensal</p>
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
        
        <div class="px-8 py-6 bg-gray-50 flex justify-end gap-3 border-t border-gray-200">
          <UButton @click="modalMetaAberto = false" color="gray" variant="soft" size="md">Cancelar</UButton>
          <UButton @click="salvarMeta" :disabled="salvandoMeta || !novaMeta" color="black" size="md" :loading="salvandoMeta">
            {{ salvandoMeta ? 'Salvando...' : 'Salvar Meta' }}
          </UButton>
        </div>
      </div>
    </div>

    <!-- Modal Relatórios -->
    <div v-if="modalRelatorioAberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
            <UIcon name="i-heroicons-document-text" class="w-5 h-5 text-gray-500" />
            Relatórios PDF
          </h3>
          <button @click="modalRelatorioAberto = false" class="text-gray-400 hover:text-gray-600">
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>
        <div class="p-6 space-y-6">
          
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase mb-2 block">Período</label>
            <div class="flex gap-2">
              <button @click="periodoRelatorio = 1" class="flex-1 py-3 rounded-xl text-sm font-bold border transition-all" :class="periodoRelatorio === 1 ? 'bg-black text-white border-black shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'">
                Mês Atual
              </button>
              <button @click="periodoRelatorio = 12" class="flex-1 py-3 rounded-xl text-sm font-bold border transition-all" :class="periodoRelatorio === 12 ? 'bg-black text-white border-black shadow-md' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'">
                Último Ano
              </button>
            </div>
          </div>
          
          <div>
            <label class="text-xs font-bold text-gray-500 uppercase mb-2 block">O que incluir?</label>
            <div class="space-y-2">
              <label 
                v-for="tipo in opcoesTipo" 
                :key="tipo.value" 
                class="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-gray-50 transition-all" 
                :class="filtrosRelatorio.includes(tipo.value) ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-gray-200'"
              >
                <input type="checkbox" :value="tipo.value" v-model="filtrosRelatorio" class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <span class="text-sm font-bold" :class="filtrosRelatorio.includes(tipo.value) ? 'text-blue-900' : 'text-gray-600'">
                  {{ tipo.label }}
                </span>
              </label>
            </div>
          </div>

          <button @click="baixarPDF" :disabled="gerandoPDF || filtrosRelatorio.length === 0" class="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex justify-center items-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl">
                        <UIcon v-if="gerandoPDF" name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
            <UIcon v-else name="i-heroicons-printer" class="w-5 h-5" />
            {{ gerandoPDF ? 'Gerando...' : 'Gerar PDF' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Detalhes da Peça -->
    <div v-if="modalDetalhesAberto" class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        <div class="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4 flex justify-between items-center text-white">
          <h3 class="text-lg font-bold flex items-center gap-2">
            <UIcon name="i-heroicons-cube" class="w-5 h-5" />
            Detalhes da Peça
          </h3>
          <button @click="modalDetalhesAberto = false" class="hover:text-gray-300 transition-colors">
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>

        <div v-if="loadingDetalhes" class="p-12 text-center">
          <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-blue-500 mx-auto" />
          <p class="text-gray-500 mt-3 font-medium">Buscando informações...</p>
        </div>

        <div v-else-if="pecaDetalhes" class="p-6 md:p-8">
          <div class="flex flex-col md:flex-row gap-6">
            <!-- Foto -->
            <div class="w-full md:w-1/3">
              <div class="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl overflow-hidden border-2 border-gray-200 shadow-inner">
                <img v-if="pecaDetalhes.fotoUrl" :src="pecaDetalhes.fotoUrl" class="w-full h-full object-cover" alt="Foto da peça" />
                <div v-else class="w-full h-full flex items-center justify-center text-gray-400 flex-col">
                  <UIcon name="i-heroicons-photo" class="w-12 h-12 mb-2" />
                  <span class="text-xs font-semibold">Sem foto</span>
                </div>
              </div>
              <div v-if="pecaDetalhes.fotosExtras?.length" class="mt-2 text-center text-xs font-bold text-blue-600 bg-blue-50 py-1.5 rounded-lg">
                + {{ pecaDetalhes.fotosExtras.length }} fotos na galeria
              </div>
            </div>

            <!-- Informações -->
            <div class="flex-1 space-y-5">
              <div>
                <h2 class="text-2xl md:text-3xl font-black text-gray-900 uppercase leading-tight mb-3">
                  {{ pecaDetalhes.nome }}
                </h2>
                <div class="flex flex-wrap gap-2">
                  <span class="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wide">
                    {{ pecaDetalhes.modelo }}
                  </span>
                  <span class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold uppercase">
                    {{ pecaDetalhes.marca }}
                  </span>
                  <span v-if="pecaDetalhes.ano" class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold">
                    {{ pecaDetalhes.ano }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4 bg-gradient-to-br from-gray-50 to-slate-50 p-5 rounded-xl border border-gray-200 shadow-sm">
                <div>
                  <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Lado</p>
                  <p class="font-bold text-gray-900 uppercase text-sm">{{ pecaDetalhes.lado }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Localização</p>
                  <p class="font-bold text-purple-700 font-mono bg-purple-50 inline-block px-2 py-0.5 rounded text-sm">
                    {{ pecaDetalhes.localizacao || '—' }}
                  </p>
                </div>
                <div>
                  <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Preço Venda</p>
                  <p class="font-black text-emerald-600 text-xl">{{ formatarDinheiro(pecaDetalhes.preco) }}</p>
                </div>
                <div>
                  <p class="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Custo</p>
                  <p class="font-bold text-red-600 text-lg">{{ formatarDinheiro(pecaDetalhes.custo) }}</p>
                </div>
              </div>

              <div v-if="pecaDetalhes.detalhes" class="bg-gradient-to-br from-yellow-50 to-amber-50 p-4 rounded-xl border border-yellow-200">
                <p class="text-xs font-bold text-yellow-700 uppercase mb-2 flex items-center gap-1">
                  <UIcon name="i-heroicons-information-circle" class="w-4 h-4" />
                  Observações
                </p>
                <p class="text-sm text-yellow-900 break-words leading-relaxed">{{ pecaDetalhes.detalhes }}</p>
              </div>

              <div class="pt-4 border-t border-gray-200 flex justify-end">
                <UButton 
                  :to="`/estoque/editar/${pecaDetalhes.id}`" 
                  color="orange" 
                  variant="solid" 
                  size="md" 
                  icon="i-heroicons-pencil-square"
                  class="font-bold shadow-md hover:shadow-lg transition-all"
                >
                  Editar no Estoque
                </UButton>
              </div>
            </div>
          </div>
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

// Dados do topo (KPIs - sempre mês atual)
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

// Navegação e dados do extrato (dinâmico)
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

// Tabela do extrato
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

const historicoFiltradoTela = computed(() => {
  if (!statsExtrato.value || !statsExtrato.value.extrato) return []
  
  const movs = (statsExtrato.value.extrato.movimentacoes || []).map((m: any) => ({
    id: m.id, data: m.createdAt, tipo: m.tipo, 
    valor: m.tipo === 'ENTRADA' ? 0 : (Number(m.peca?.preco || 0) * m.quantidade), 
    peca: m.peca, descricao: m.peca ? `${m.peca.nome} ${m.peca.modelo || ''}` : 'Item'
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

// Modal Meta
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

// Relatório PDF
const modalRelatorioAberto = ref(false)
const gerandoPDF = ref(false)
const periodoRelatorio = ref(1)
const filtrosRelatorio = ref(['SAIDA', 'DESPESA']) 

const opcoesTipo = [
  { label: 'Vendas (Saídas)', value: 'SAIDA' },
  { label: 'Despesas', value: 'DESPESA' },
  { label: 'Entradas de Estoque', value: 'ENTRADA' }
]

function abrirModalRelatorios() {
  modalRelatorioAberto.value = true
  periodoRelatorio.value = 1
  filtrosRelatorio.value = ['SAIDA', 'DESPESA']
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
      body: { meses: periodoRelatorio.value, tipos: filtrosRelatorio.value }
    })

    const doc = new jsPDF()
    doc.setFontSize(18); doc.text('Relatório Financeiro - Eli Peças', 14, 15)
    doc.setFontSize(10); doc.setTextColor(100)
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 22)
    doc.text(`Período de Análise: Últimos ${periodoRelatorio.value} meses`, 14, 27)
    doc.line(14, 32, 196, 32)

    doc.setFontSize(12); doc.setTextColor(0); doc.text('Resumo:', 14, 42)
    doc.setFontSize(10)
    doc.setTextColor(0, 128, 0); doc.text(`Receitas: ${formatarDinheiro(dados.resumo.receita)}`, 14, 50)
    doc.setTextColor(180, 0, 0); doc.text(`Despesas: ${formatarDinheiro(dados.resumo.despesa)}`, 80, 50)
    
    const saldo = dados.resumo.saldo
    doc.setTextColor(saldo >= 0 ? 0 : 200, saldo >= 0 ? 0 : 0, 0)
    doc.setFont("helvetica", "bold"); doc.text(`Saldo Líquido: ${formatarDinheiro(dados.resumo.saldo)}`, 140, 50)

    const linhas = dados.itens.map((i: any) => [
      new Date(i.data).toLocaleDateString('pt-BR'),
      i.descricao,
      getLabelTipo(i.tipo),
      formatarDinheiro(i.valor)
    ])
    
    autoTable(doc, { 
      startY: 55, 
      head: [['Data', 'Descrição', 'Tipo', 'Valor']], 
      body: linhas,
      didParseCell: (data) => {
        if (data.column.index === 3) {
          const tipo = linhas[data.row.index][2]
          if(tipo === 'Despesa') data.cell.styles.textColor = [180, 0, 0]
          else if(tipo === 'Venda') data.cell.styles.textColor = [0, 128, 0]
          else data.cell.styles.textColor = [150, 150, 150]
        }
      }
    })
    
    doc.save(`relatorio_eli_pecas_${new Date().toISOString().slice(0,10)}.pdf`)
    modalRelatorioAberto.value = false
  } catch(e) { alert('Erro ao gerar PDF') } finally { gerandoPDF.value = false }
}

// Detalhes da Peça
const modalDetalhesAberto = ref(false)
const loadingDetalhes = ref(false)
const pecaDetalhes = ref<any>(null)

async function verDetalhesPeca(id: string) {
  if (!id) return
  loadingDetalhes.value = true
  modalDetalhesAberto.value = true
  try {
    pecaDetalhes.value = await $fetch(`/api/pecas/${id}`)
  } catch (e) {
    alert('Erro ao carregar detalhes.')
    modalDetalhesAberto.value = false
  } finally {
    loadingDetalhes.value = false
  }
}

// Helpers
function formatarDinheiro(val: number) { 
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0) 
}

function getBadgeClass(tipo: string) {
  if (tipo === 'SAIDA') return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
  if (tipo === 'ENTRADA') return 'bg-blue-50 text-blue-700 border border-blue-200'
  return 'bg-red-50 text-red-700 border border-red-200'
}

function getLabelTipo(tipo: string) {
  if (tipo === 'SAIDA') return 'Venda'
  if (tipo === 'ENTRADA') return 'Estoque'
  return 'Despesa'
}

function getValorClass(tipo: string) {
  if (tipo === 'SAIDA') return 'text-emerald-600'
  if (tipo === 'ENTRADA') return 'text-gray-400'
  return 'text-red-600'
}

function getSinal(tipo: string) {
  if (tipo === 'DESPESA') return '-'
  if (tipo === 'ENTRADA') return ''
  return '+'
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

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

.animate-in {
  animation: scale-in 0.2s ease-out;
}
</style>

