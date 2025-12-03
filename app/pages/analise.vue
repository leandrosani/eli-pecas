<template>

  <div class="pb-20 relative">

    

    <!-- CABEÇALHO COM FILTRO DE MÊS -->

    <div class="flex flex-col gap-3 md:gap-4 mb-3 md:mb-6">

      <h1 class="md:hidden font-semibold text-xl text-black"><span class="text-2xl">📊 </span>Analise Financeira</h1>

      <div class="flex justify-between items-start">

        <!-- Desktop: Título completo -->

        <div class="hidden md:block">

          <h1 class="text-3xl font-bold text-gray-900 tracking-tight"><span class="text-4xl">📊 </span>Análise Financeira</h1>

          <p class="text-sm text-gray-500 mt-1">

            Acompanhe o desempenho e extrato por período.

          </p>

        </div>



        <!-- Mobile: Só o filtro de mês (ocupa toda a largura) -->

        <div class="flex items-center gap-2 bg-white p-1.5 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all h-12 md:h-14 w-full md:w-auto">

          <UButton 

            icon="i-heroicons-chevron-left" 

            color="gray" 

            variant="ghost" 

            size="xs"

            @click="mudarMes(-1)" 

            class="md:size-sm hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-lg"

          />

          <span class="font-bold text-gray-900 text-sm md:text-sm flex-1 md:w-32 text-center select-none capitalize">

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

    <!-- ÁREA 1: KPIS E CARDS DE DESTAQUE -->
    <div v-else class="space-y-4 md:space-y-6">
      
      <div class="flex flex-col md:flex-row gap-2">

        <!-- Card 1: Vendas -->

        <div class="w-full flex-2 bg-gradient-to-br from-gray-600 via-green-600 to-emerald-600 rounded-lg md:rounded-2xl p-3 text-white shadow-lg hover:shadow-xl relative overflow-hidden transition-all hover:scale-[1.02] h-42">

          <div class="absolute top-0 right-0 p-2 md:p-4 opacity-10">

            <UIcon name="i-heroicons-currency-dollar" class="w-16 h-16 md:w-28 md:h-28" />

          </div>

          <div class="relative z-10">

            <div class="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">

              <div class="w-7 h-7 md:w-10 md:h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">

                <UIcon name="i-heroicons-arrow-trending-up" class="w-3.5 h-3.5 md:w-5 md:h-5" />

              </div>

              <p class="text-green-100 text-[9px] md:text-xs font-bold uppercase tracking-wider">

                Vendas em {{ nomeMesAtual.split(' ')[0] }}

              </p>

            </div>

            <div class="text-xl md:text-2xl font-bold mb-2 md:mb-4">

              {{ formatarDinheiro(stats?.faturamentoMes) }}

            </div>

            <div class="flex items-center gap-1.5 md:gap-2 text-[10px] md:text-sm bg-white/25 backdrop-blur-sm w-fit px-2 md:px-3 py-1 md:py-1.5 rounded-full border border-white/30">

              <UIcon name="i-heroicons-shopping-bag" class="w-3 h-3 md:w-4 md:h-4" />

              <span class="font-semibold">{{ stats?.vendasCount }} vendas</span>

            </div>

          </div>

        </div>



        <!-- DESKTOP -->

        <!-- Card 2: Patrimônio -->

        <div class="hidden md:flex gap-2">

          <div class="flex-2 bg-gradient-to-br from-blue-50 to-blue-100/80 rounded-lg md:rounded-2xl p-3 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] h-42">

            <div class="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">

              <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-1.5 md:p-2.5 rounded-lg md:rounded-xl shadow-sm">

                <UIcon name="i-heroicons-banknotes" class="w-4 h-4 md:w-6 md:h-6" />

              </div>

              <span class="text-[9px] md:text-xs font-bold uppercase tracking-wider text-blue-600">

                Patrimônio Ativo

              </span>

            </div>

            <div class="text-xl md:text-2xl font-bold text-blue-900 mb-1 md:mb-2">

              {{ formatarDinheiro(stats?.valorEstoque) }}

            </div>

            <p class="text-[10px] md:text-sm text-blue-700 font-medium">

              Soma do preço de todas as peças ativas.

            </p>

          </div>



          <!-- Card 3: Volume -->

          <div class="flex-1 bg-gradient-to-br from-orange-50 to-orange-100/80 rounded-lg md:rounded-2xl p-3 border-2 border-orange-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] h-42">

            <div class="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">

              <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-1.5 md:p-2.5 rounded-lg md:rounded-xl shadow-sm">

                <UIcon name="i-heroicons-cube" class="w-4 h-4 md:w-6 md:h-6" />

              </div>

              <span class="text-[9px] md:text-xs font-bold uppercase tracking-wider text-orange-600">

                Volume de Peças

              </span>

            </div>

            <div class="text-xl md:text-2xl font-bold text-orange-900 mb-1 md:mb-2">

              {{ stats?.itensEstoque }}

            </div>

            <p class="text-[10px] md:text-sm text-orange-700 font-medium">

              Unidades físicas nas prateleiras.

            </p>

          </div>

        </div>

        <!-- MOBILLE -->

        <!-- Card 2: Patrimônio -->

         <div class="md:hidden flex flex-row-reverse gap-2 w-full">

          <div class="flex-2 bg-gradient-to-br from-blue-50 to-blue-100/80 rounded-lg md:rounded-2xl p-3 md:p-6 border-2 border-blue-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">

            <div class="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">

              <div class="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-1.5 md:p-2.5 rounded-lg md:rounded-xl shadow-sm">

                <UIcon name="i-heroicons-banknotes" class="w-4 h-4 md:w-6 md:h-6" />

              </div>

              <span class="text-[9px] md:text-xs font-bold uppercase tracking-wider text-blue-600">

                Patrimônio Ativo

              </span>

            </div>

            <div class="text-xl md:text-4xl font-bold text-blue-900 mb-1 md:mb-2">

              {{ formatarDinheiro(stats?.valorEstoque) }}

            </div>

            <p class="text-[10px] md:text-sm text-blue-700 font-medium">

              Soma do preço de todas as peças ativas.

            </p>

          </div>



          <!-- Card 3: Volume -->

          <div class="flex-1 bg-gradient-to-br from-orange-50 to-orange-100/80 rounded-lg md:rounded-2xl p-3 md:p-6 border-2 border-orange-200 shadow-sm hover:shadow-md transition-all hover:scale-[1.02]">

            <div class="flex items-center gap-1.5 md:gap-3 mb-2 md:mb-4">

              <div class="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-1.5 md:p-2.5 rounded-lg md:rounded-xl shadow-sm">

                <UIcon name="i-heroicons-cube" class="w-4 h-4 md:w-6 md:h-6" />

              </div>

              <span class="text-[9px] md:text-xs font-bold uppercase tracking-wider text-orange-600">

                Volume de Peças

              </span>

            </div>

            <div class="text-xl md:text-4xl font-bold text-orange-900 mb-1 md:mb-2">

              {{ stats?.itensEstoque }}

            </div>

            <p class="text-[10px] md:text-sm text-orange-700 font-medium">

              Unidades físicas nas prateleiras.

            </p>
          </div>
        </div>
      </div>

<!-- EXTRATO COM ABAS INTERATIVAS -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        
        <!-- BARRA DE ABAS (Filtro) -->
        <div class="p-3 border-b border-gray-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            <!-- Título e Botão Refresh -->
            <div class="flex items-center justify-between w-full md:w-auto mb-1 md:mb-0">
                <h2 class="font-bold text-sm md:text-lg text-gray-900">Extrato</h2>
                <UButton icon="i-heroicons-arrow-path" size="xs" color="gray" variant="ghost" @click="refresh" class="md:hidden" />
            </div>
            
            <!-- Grupo de Botões de Abas (Segmented Control Style) -->
            <div class="flex p-1 bg-gray-100 rounded-xl w-full md:w-auto gap-1">
                <button 
                    v-for="aba in abas" 
                    :key="aba.value"
                    @click="abaAtiva = aba.value"
                    class="flex-1 md:flex-none px-3 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 ease-out text-center relative"
                    :class="[
                        abaAtiva === aba.value ? 'bg-white shadow-sm scale-[1.02] ring-1 ring-black/5' : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700',
                        // Cores específicas quando ativo
                        abaAtiva === aba.value && aba.value === 'saida' ? '!text-emerald-700 !ring-emerald-500/20' : '',
                        abaAtiva === aba.value && aba.value === 'entrada' ? '!text-blue-700 !ring-blue-500/20' : '',
                        abaAtiva === aba.value && aba.value === 'todos' ? '!text-gray-900' : ''
                    ]"
                >
                    <span class="relative z-10">{{ aba.label }}</span>
                </button>
            </div>
            
            <!-- Refresh Desktop -->
            <div class="hidden md:block">
               <UButton icon="i-heroicons-arrow-path" size="sm" color="gray" variant="ghost" @click="refresh" />
            </div>
        </div>
        
        <!-- Desktop Table -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th class="py-4 px-6 text-xs uppercase font-bold text-gray-400">Data</th>
                <th class="py-4 px-6 text-xs uppercase font-bold text-gray-400">Tipo</th>
                <th class="py-4 px-6 text-xs uppercase font-bold text-gray-400">Peça</th>
                <th class="py-4 px-6 text-xs uppercase font-bold text-gray-400 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="mov in historicoFiltrado" :key="mov.id" 
                  class="transition-colors duration-150"
                  :class="mov.tipo === 'SAIDA' ? 'hover:bg-emerald-50/30' : 'hover:bg-blue-50/30'">
                <td class="py-4 px-6 align-middle whitespace-nowrap text-gray-500 text-sm">
                  {{ new Date(mov.createdAt).toLocaleDateString('pt-BR') }} 
                  <span class="text-xs text-gray-400 ml-1">{{ new Date(mov.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}</span>
                </td>
                <td class="py-4 px-6 align-middle">
                  <span 
                    class="px-2 py-1 rounded-md text-[10px] font-bold border shadow-sm"
                    :class="mov.tipo === 'SAIDA' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'"
                  >
                    {{ mov.tipo === 'SAIDA' ? 'VENDA' : 'ENTRADA' }}
                  </span>
                </td>
                <td class="py-4 px-6 align-middle">
                  <div class="font-bold text-gray-900 text-sm">{{ mov.peca.nome }}</div>
                  <div class="text-xs text-gray-500" v-if="!mov.peca.ativo">(Peça Arquivada)</div>
                </td>
                <td class="py-4 px-6 align-middle text-right font-mono font-bold text-sm" :class="mov.tipo === 'SAIDA' ? 'text-emerald-600' : 'text-gray-900'">
                  {{ mov.tipo === 'SAIDA' ? '+' : '' }} {{ formatarDinheiro(Number(mov.peca.preco) * mov.quantidade) }}
                </td>
              </tr>
              <tr v-if="!historicoFiltrado.length">
                <td colspan="4" class="py-16 text-center text-gray-400">
                  <UIcon name="i-heroicons-clipboard" class="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Nenhuma movimentação neste filtro.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Mobile Cards (Lista) -->
        <div class="md:hidden">
          <div v-for="mov in historicoFiltrado" :key="mov.id" 
               class="p-4 border-b border-gray-100 transition-colors duration-200"
               :class="mov.tipo === 'SAIDA' ? 'bg-emerald-50/10' : 'bg-blue-50/10'"> <!-- Sutil fundo colorido -->
            
            <div class="flex justify-between items-center mb-2">
              <span class="text-[10px] text-gray-400 font-medium flex items-center gap-1">
                 <UIcon name="i-heroicons-clock" class="w-3 h-3" />
                 {{ new Date(mov.createdAt).toLocaleDateString('pt-BR') }}
              </span>
              <span 
                class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border shadow-sm"
                :class="mov.tipo === 'SAIDA' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-blue-50 text-blue-700 border-blue-100'"
              >
                {{ mov.tipo === 'SAIDA' ? 'Venda' : 'Entrada' }}
              </span>
            </div>

            <div class="flex justify-between items-center">
                <div class="flex-1 min-w-0 pr-4">
                    <p class="font-bold text-gray-900 text-sm leading-tight truncate">{{ mov.peca.nome }}</p>
                    <p class="text-xs text-gray-500 mt-0.5" v-if="!mov.peca.ativo">(Arquivada)</p>
                </div>
                <div class="text-right shrink-0">
                    <div class="font-mono font-bold text-base" :class="mov.tipo === 'SAIDA' ? 'text-emerald-700' : 'text-gray-900'">
                        {{ mov.tipo === 'SAIDA' ? '+' : '' }} {{ formatarDinheiro(Number(mov.peca.preco) * mov.quantidade) }}
                    </div>
                    <p class="text-[10px] text-gray-500">Qtd: {{ mov.quantidade }}</p>
                </div>
            </div>
          </div>

          <div v-if="!historicoFiltrado.length" class="py-16 text-center text-gray-400 text-xs">
            Nenhuma movimentação neste período.
          </div>
        </div>

      </div>
    </div>
    
    <!-- ÁREA 2: ACESSO RÁPIDO (Menu) -->
    <div class="mt-8 md:mt-10">
      <h2 class="text-sm md:text-base font-bold text-gray-800 tracking-wide mb-4 md:mb-5">
        Menu de Navegação
      </h2>
      
      <div class="grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-4">
        <NuxtLink to="/dashboard" class="group block bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm p-4 md:p-5 text-center transition-all hover:shadow-md hover:bg-gray-50 active:scale-[0.98]">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-blue-100/50 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 transition-transform group-hover:scale-110">
            <UIcon name="i-heroicons-squares-2x2" class="w-6 h-6 md:w-7 md:h-7 text-blue-600" />
          </div>
          <p class="text-[10px] md:text-xs font-bold text-gray-800 uppercase">Visão Geral</p>
        </NuxtLink>

        <NuxtLink to="/estoque" class="group block bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm p-4 md:p-5 text-center transition-all hover:shadow-md hover:bg-gray-50 active:scale-[0.98]">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-green-100/50 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 transition-transform group-hover:scale-110">
            <UIcon name="i-heroicons-archive-box" class="w-6 h-6 md:w-7 md:h-7 text-green-600" />
          </div>
          <p class="text-[10px] md:text-xs font-bold text-gray-800 uppercase">Estoque</p>
        </NuxtLink>

        <NuxtLink to="/estoque/criar" class="group block bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm p-4 md:p-5 text-center transition-all hover:shadow-md hover:bg-gray-50 active:scale-[0.98]">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-black/50 rounded-lg flex items-center justify-center mx-auto mb-2 md:mb-3 transition-transform group-hover:scale-110">
            <UIcon name="i-heroicons-plus-circle" class="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <p class="text-[10px] md:text-xs font-bold text-gray-800 uppercase">Novo Item</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';

definePageMeta({ layout: 'default' });

const { user } = useUserSession();

// --- ESTADOS DAS ABAS ---
const abas = [
  { label: 'Todos', value: 'todos' },
  { label: 'Vendas', value: 'saida' },
  { label: 'Entradas', value: 'entrada' }
];
const abaAtiva = ref('todos');

// Dados da Dashboard
const dataAtual = ref(new Date());

const nomeMesAtual = computed(() => {
    return dataAtual.value.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
});

const ehMesFuturo = computed(() => {
    const hoje = new Date();
    return dataAtual.value.getMonth() === hoje.getMonth() && dataAtual.value.getFullYear() === hoje.getFullYear();
});

const params = computed(() => ({
    mes: dataAtual.value.getMonth() + 1, 
    ano: dataAtual.value.getFullYear() 
}));

const { data: stats, pending, refresh } = await useFetch('/api/dashboard/stats', {
    query: params
});

// --- LÓGICA DE FILTRAGEM (FRONTEND) ---
const historicoFiltrado = computed(() => {
    const historicoCompleto = stats.value?.historicoMes || [];
    
    if (abaAtiva.value === 'saida') {
        return historicoCompleto.filter((mov: any) => mov.tipo === 'SAIDA');
    }
    if (abaAtiva.value === 'entrada') {
        return historicoCompleto.filter((mov: any) => mov.tipo === 'ENTRADA');
    }
    return historicoCompleto;
});


function mudarMes(delta: number) {
    const novaData = new Date(dataAtual.value);
    novaData.setMonth(novaData.getMonth() + delta);
    dataAtual.value = novaData;
}

function formatarDinheiro(val: number | null) { 
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0); 
}
</script>