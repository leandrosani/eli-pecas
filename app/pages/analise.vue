<template>
  <div class="pb-24 relative">
    <!-- =================================================== -->
    <!-- CABEÇALHO: BEM-VINDO(A) E FILTRO DE MÊS -->
    <!-- =================================================== -->
    <div class="flex flex-col gap-3 md:gap-4 mb-3 md:mb-6 ">
      <h1 class="md:hidden font-semibold text-xl text-black">
        <span class="text-2xl">📊 </span> Visão Geral
      </h1>

      <div class="flex justify-between items-start">
        <div class="hidden md:block">
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight">
            <span class="text-4xl">📊 </span>
            Análise Financeira
          </h1>
          <p class="text-sm text-gray-500 mt-1">
            Acompanhe o desempenho e extrato por período. 
          </p>
        </div>
      

    <div class="flex items-center gap-2 bg-white p-1.5 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all h-12 md:h-14 w-full md:w-auto">
        <UButton icon="i-heroicons-chevron-left" color="gray" variant="ghost" size="3xs" @click="mudarMes(-1)" />
        <span class="font-bold text-gray-900 text-sm md:text-sm flex-1 md:w-32 text-center select-none capitalize">
          {{ nomeMesAtual }}
        </span>
        <UButton icon="i-heroicons-chevron-right" color="gray" variant="ghost" size="3xs" @click="mudarMes(1)" :disabled="ehMesFuturo" />
      </div>
      </div>
    </div>
    

    <!-- LOADING -->
    <div v-if="pending" class="text-center py-20">
      <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 animate-spin text-blue-500 mx-auto" />
      <p class="text-gray-500 mt-3 text-sm font-medium">Analisando dados...</p>
    </div>

    <div v-else class="space-y-2">
      
      <!-- =================================================== -->
      <!-- 1. INDICADORES FINANCEIROS (LINHA PRINCIPAL) -->
      <!-- =================================================== -->
      <div class="grid grid-cols-1 gap-1 md:grid-cols-3 md:gap-4">
        
        <!-- Faturamento (Vendas) -->
        <div class="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-3 text-white shadow-lg relative overflow-hidden group transition-transform hover:scale-[1.01]">
          <div class="absolute right-0 top-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
            <UIcon name="i-heroicons-currency-dollar" class="w-20 h-20" />
          </div>
          <p class="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">Vendas Brutas</p>
          <div class="text-xl font-bold mb-4">{{ formatarDinheiro(stats?.faturamentoMes) }}</div>
          <div class="flex items-center gap-2 text-xs bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
            <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4" />
            <span>{{ stats?.vendasCount }} vendas</span>
          </div>
        </div>

        <!-- Despesas (Saídas) -->
        <div class="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-3 text-white shadow-lg relative overflow-hidden group transition-transform hover:scale-[1.01]">
          <div class="absolute right-0 top-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
            <UIcon name="i-heroicons-arrow-trending-down" class="w-20 h-20" />
          </div>
          <p class="text-red-100 text-xs font-bold uppercase tracking-wider mb-1">Despesas Totais</p>
          <div class="text-xl font-bold mb-4">{{ formatarDinheiro(stats?.totalDespesas) }}</div>
          <div class="flex items-center gap-2 text-xs bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
            <UIcon name="i-heroicons-document-minus" class="w-4 h-4" />
            <span>{{ stats?.despesasCount }} registros</span>
          </div>
        </div>

        <!-- Balanço Líquido (Lucro/Prejuízo) -->
        <div 
          class="rounded-xl p-3 shadow-lg relative overflow-hidden group border-2 transition-transform hover:scale-[1.01]"
          :class="Number(stats?.balancoLiquido) >= 0 
            ? 'bg-white border-blue-100' 
            : 'bg-white border-red-100'"
        >
          <div class="absolute right-0 top-0 p-4 opacity-10">
            <UIcon name="i-heroicons-scale" class="w-20 h-20 text-gray-400" />
          </div>
          <p class="text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">Balanço Líquido</p>
          <div 
            class="text-xl font-bold mb-4"
            :class="Number(stats?.balancoLiquido) >= 0 ? 'text-blue-600' : 'text-red-600'"
          >
            {{ formatarDinheiro(stats?.balancoLiquido) }}
          </div>
          
          <div v-if="Number(stats?.balancoLiquido) >= 0" class="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 w-fit px-3 py-1 rounded-full">
            <UIcon name="i-heroicons-hand-thumb-up" class="w-4 h-4" />
            <span>Lucro Operacional</span>
          </div>
          <div v-else class="flex items-center gap-2 text-xs bg-red-50 text-red-700 w-fit px-3 py-1 rounded-full">
            <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4" />
            <span>Prejuízo no Período</span>
          </div>
        </div>
      </div>

      <!-- =================================================== -->
      <!-- 2. INSIGHTS E INDICADORES SECUNDÁRIOS -->
      <!-- =================================================== -->
      <div class="grid grid-cols-3 gap-1 md:grid-cols-3 md:gap-4">
        
        <!-- Ticket Médio 
        <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div class="flex items-center gap-2 text-purple-600 mb-2">
              <UIcon name="i-heroicons-ticket" class="w-5 h-5" />
              <span class="text-xs font-bold uppercase">Ticket Médio</span>
            </div>
            <div class="text-2xl font-bold text-gray-900">{{ formatarDinheiro(stats?.ticketMedio) }}</div>
            <p class="text-xs text-gray-500 mt-1">Média gasta por cliente</p>
          </div>
        </div>-->

        
        <!-- Volume -->
        <div class="bg-orange-100 p-3 rounded-2xl border border-orange-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div class="flex items-center gap-2 text-orange-600 mb-2">
              <UIcon name="i-heroicons-cube" class="w-5 h-5" />
              <span class="text-xs font-bold uppercase">Estoque Físico</span>
            </div>
            <div class="text-xl font-bold text-gray-900">{{ stats?.itensEstoque }}</div>
            <p class="text-xs text-gray-500 mt-1">Unidades nas prateleiras</p>
          </div>
        </div>
        <!-- Patrimônio -->
        <div class="bg-gradient-to-br from-blue-50 to-blue-100/80 p-3 col-span-2 rounded-2xl border-2 border-blue-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div class="flex items-center gap-2 text-blue-600 mb-2">
              <UIcon name="i-heroicons-banknotes" class="w-5 h-5" />
              <span class="text-xs font-bold uppercase">Patrimônio Ativo</span>
            </div>
            <div class="text-xl font-bold text-gray-900">{{ formatarDinheiro(stats?.valorEstoque) }}</div>
            <p class="text-xs text-gray-500 mt-1">Valor de custo em peças</p>
          </div>
        </div>
      </div>

      <!-- =================================================== -->
      <!-- 3. ALERTAS E TOP SELLERS -->
      <!-- =================================================== -->
      <div class="grid grid-cols-1 gap-6">
        
        <!-- Alerta de Estoque Baixo 
        <div class="bg-white border border-red-100 rounded-2xl shadow-sm overflow-hidden">
          <div class="p-4 border-b border-red-100 bg-red-50/50 flex items-center justify-between">
            <h3 class="font-bold text-red-800 flex items-center gap-2">
              <UIcon name="i-heroicons-bell-alert" class="w-5 h-5" /> Estoque Crítico
            </h3>
            <UButton to="/estoque" color="red" variant="link" size="xs">Ver todos</UButton>
          </div>
          <div class="p-2">
            <div v-if="!stats?.estoqueBaixo?.length" class="p-6 text-center text-gray-400 text-sm">
              <UIcon name="i-heroicons-check-circle" class="w-8 h-8 text-green-500 mx-auto mb-2" />
              Tudo certo! Nenhum item acabando.
            </div>
            <div v-else class="space-y-1">
              <div v-for="item in stats.estoqueBaixo" :key="item.id" class="flex items-center justify-between p-3 hover:bg-red-50 rounded-lg transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs">
                    {{ item.quantidade }}
                  </div>
                  <span class="text-sm font-medium text-gray-800 truncate max-w-[180px]">{{ item.nome }}</span>
                </div>
                <UButton :to="`/estoque/editar/${item.id}`" size="xs" color="red" variant="soft">Repor</UButton>
              </div>
            </div>
          </div>
        </div>-->

        <!-- Top Vendas -->
  <div class="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
    
    <!-- Cabeçalho -->
    <div 
      class="p-4 border-b border-gray-100 bg-amber-100/60 cursor-pointer select-none flex justify-between items-center hover:bg-gray-100 transition-colors"
      @click="openMaisVendidos = !openMaisVendidos"
    >
      <h3 class="font-bold text-gray-900 flex items-center gap-2">
        <UIcon name="i-heroicons-trophy" class="w-5 h-5 text-yellow-500" /> 
        Mais Vendidos do Mês
      </h3>

      <UIcon 
        name="i-heroicons-chevron-down"
        class="w-5 h-5 text-gray-500 transition-transform duration-300"
        :class="{ 'rotate-180': openMaisVendidos }"
      />
    </div>

    <!-- Conteúdo com animação -->
    <Transition name="collapse">
      <div v-show="openMaisVendidos">
        <div class="p-2">

          <!-- Sem produtos -->
          <div v-if="!stats?.topProdutos?.length" class="p-6 text-center text-gray-400 text-sm">
            Nenhuma venda registrada neste mês.
          </div>

          <!-- Lista de produtos -->
          <div v-else class="space-y-1">

            <div 
              v-for="(prod, index) in stats.topProdutos"
              :key="index"
              class="flex items-center justify-between p-3 hover:bg-yellow-50 rounded-lg transition-colors"
            >
              <div class="flex items-center gap-3">
                
                <!-- Ranking -->
                <div class="text-lg font-bold text-gray-400 w-6">
                  #{{ index + 1 }}
                </div>

                <!-- Infos -->
                <div>
                  <p class="text-sm font-bold text-gray-900 leading-tight">
                    {{ prod.nome }}
                  </p>

                  <!-- Ano + Marca -->
                  <div class="flex flex-wrap gap-1 mt-0.5">
                    <span 
                      v-if="prod.ano" 
                      class="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 rounded border border-gray-200"
                    >
                      {{ prod.ano }}
                    </span>

                    <span 
                      v-if="prod.marca"
                      class="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 rounded border border-gray-200 uppercase"
                    >
                      {{ prod.marca }}
                    </span>
                  </div>

                  <p class="text-[10px] text-gray-400 mt-0.5 font-medium">
                    {{ prod.qtd }} un. vendidas
                  </p>
                </div>
              </div>

              <!-- Total -->
              <div class="text-sm font-mono font-bold text-green-600">
                {{ formatarDinheiro(prod.total) }}
              </div>

            </div>

          </div>

        </div>
      </div>
    </Transition>
</div>



      </div>

      <!-- =================================================== -->
      <!-- 4. EXTRATO FINANCEIRO UNIFICADO -->
      <!-- =================================================== -->
      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div class="p-3 border-b border-gray-100 bg-gray-800 flex flex-col md:flex-row justify-between items-center gap-3">
            
            <div class="flex items-center justify-between w-full md:w-auto">
              <h2 class="font-bold text-white">Extrato Financeiro</h2>
              <UButton icon="i-heroicons-arrow-path" size="xs" color="gray" variant="ghost" @click="refresh" class="md:hidden" />
            </div>

            <div class="flex flex-wrap gap-1 w-full md:w-auto">
                <UButton 
                  v-for="aba in abas" :key="aba.value" :label="aba.label"
                  :color="abaAtiva === aba.value ? aba.color : 'gray'"
                  :variant="abaAtiva === aba.value ? 'solid' : 'ghost'"
                  size="xs" @click="abaAtiva = aba.value"
                  :class="[
                    'flex-1 md:flex-none justify-center font-semibold cursor-pointer text-white',
                    abaAtiva === aba.value && aba.value === 'todos' ? 'bg-gray-600' : '',
                    abaAtiva === aba.value && aba.value === 'saida' ? 'bg-emerald-600' : '',
                    abaAtiva === aba.value && aba.value === 'entrada' ? 'bg-blue-600' : '',
                    abaAtiva === aba.value && aba.value === 'despesa' ? 'bg-red-600' : ''
                  ]"
                />
                <UButton icon="i-heroicons-arrow-path" size="xs" color="gray" variant="ghost" @click="refresh" class="hidden md:flex text-white" />
            </div>
        </div>
        
        <!-- Tabela Desktop -->
        <div class="hidden md:block overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
  <tr>
    <th class="py-3 px-4">Descrição</th>
    <th class="py-3 px-4">Tipo</th>
    <th class="py-3 px-4">Ano</th>
    <th class="py-3 px-4">Lado</th>
    <th class="py-3 px-4 text-right">Valor</th>
  </tr>
</thead>

<tbody class="divide-y divide-gray-100">
  <tr v-for="mov in historicoFiltrado" :key="mov.id" class="hover:bg-gray-50 transition-colors">

    <!-- Descrição -->
    <td class="py-3 px-4 font-medium text-gray-900">
      {{ mov.peca?.nome || mov.descricao }}
    </td>

    <!-- Tipo -->
    <td class="py-3 px-4">
      <span class="text-[10px] px-1.5 py-0.5 rounded border font-bold"
            :class="getBadgeClass(mov.tipo)">
        {{ getLabelTipo(mov.tipo) }}
      </span>
    </td>

    <!-- Ano do carro -->
    <td class="py-3 px-4 text-gray-800">
      {{ mov.ano || mov.peca?.ano || '—' }}
    </td>

    <!-- Lado -->
    <td class="py-3 px-4 text-gray-800">
      {{ mov.marca || mov.peca?.marca || '—' }}
    </td>

    <!-- Valor -->
    <td class="py-3 px-4 text-right font-mono font-bold" :class="getValorClass(mov.tipo)">
      {{ getSinal(mov.tipo) }} {{ formatarDinheiro(getValor(mov)) }}
    </td>

  </tr>

  <tr v-if="!historicoFiltrado.length">
    <td colspan="5" class="py-16 text-center text-gray-400">Nenhum registro encontrado.</td>
  </tr>
</tbody>
          </table>
        </div>

        <!-- Lista Mobile -->
        <div class="md:hidden">
  <div v-for="mov in historicoFiltrado" :key="mov.id" 
       class="p-3 border-b border-gray-100 flex justify-between items-center">

    <div class="flex-1 min-w-0 pr-2">

      <div class="flex items-center gap-2 mb-1">
        <span class="text-[10px] px-1.5 py-0.5 rounded border font-bold" :class="getBadgeClass(mov.tipo)">
          {{ getLabelTipo(mov.tipo) }}
        </span>
      </div>

      <p class="font-bold text-gray-900 text-sm truncate">
        {{ mov.peca?.nome || mov.descricao }}
      </p>

      <p class="text-xs text-gray-500">
        Ano: {{ mov.ano || mov.peca?.ano || '—' }} • {{ mov.marca || mov.peca?.marca || '—' }}
      </p>

    </div>

    <span class="font-mono font-bold text-sm whitespace-nowrap" :class="getValorClass(mov.tipo)">
      {{ getSinal(mov.tipo) }} {{ formatarDinheiro(getValor(mov)) }}
    </span>

  </div>

  <div v-if="!historicoFiltrado.length" class="py-12 text-center text-gray-400 text-sm">
    Nenhum registro.
  </div>
</div>


      </div>
      
    </div>

    <!-- =================================================== -->
    <!-- MENU DE NAVEGAÇÃO RÁPIDA (RODAPÉ) -->
    <!-- =================================================== 
    <div class="mt-10 pt-6 border-t border-gray-200">
      <p class="text-xs font-bold text-gray-400 uppercase mb-4">Acesso Rápido</p>
      <div class="grid grid-cols-3 md:grid-cols-6 gap-3">
        <NuxtLink to="/estoque" class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md text-center group active:scale-95 transition-transform">
          <UIcon name="i-heroicons-archive-box" class="w-6 h-6 text-green-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span class="text-xs font-bold text-gray-700">Estoque</span>
        </NuxtLink>
        <NuxtLink to="/despesas" class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md text-center group active:scale-95 transition-transform">
          <UIcon name="i-heroicons-document-minus" class="w-6 h-6 text-red-600 mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span class="text-xs font-bold text-gray-700">Despesas</span>
        </NuxtLink>
        <NuxtLink to="/estoque/criar" class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md text-center group active:scale-95 transition-transform">
          <UIcon name="i-heroicons-plus-circle" class="w-6 h-6 text-black mx-auto mb-2 group-hover:scale-110 transition-transform" />
          <span class="text-xs font-bold text-gray-700">Novo Item</span>
        </NuxtLink>
      </div>
    </div>-->

  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';

definePageMeta({ layout: 'default' })

const { user } = useUserSession();
const openMaisVendidos = ref(false)

// --- ESTADOS DAS ABAS ---
const abas = [
  { label: 'Todos', value: 'todos', color: 'gray' },
  { label: 'Vendas', value: 'saida', color: 'emerald' },
  { label: 'Entradas', value: 'entrada', color: 'blue' },
  { label: 'Despesas', value: 'despesa', color: 'red' }
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
    const estoque = stats.value?.historicoMes || [];
    const despesas = (stats.value?.despesasMes || []).map((d: any) => ({ ...d, tipo: 'DESPESA' }));
    
    let lista = [];
    
    if (abaAtiva.value === 'saida') {
        return estoque.filter((m: any) => m.tipo === 'SAIDA');
    }
    if (abaAtiva.value === 'entrada') {
        return estoque.filter((m: any) => m.tipo === 'ENTRADA');
    }
    if (abaAtiva.value === 'despesa') {
        return despesas;
    }
    
    // Aba TODOS: Junta tudo e ordena por data
    lista = [...estoque, ...despesas].sort((a, b) => 
        new Date(b.createdAt || b.data).getTime() - new Date(a.createdAt || a.data).getTime()
    );

    return lista.slice(0, 50); // Limita a 50 itens para não travar a tela
});


function mudarMes(delta: number) {
    const novaData = new Date(dataAtual.value);
    novaData.setMonth(novaData.getMonth() + delta);
    dataAtual.value = novaData;
}

function formatarDinheiro(val: number | null) { 
    // Garante que 'val' seja tratado como número, mesmo se vier null
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(val) || 0); 
}

// --- FUNÇÕES DE ESTILO E VALOR ---

function getBadgeClass(tipo: string) {
    if (tipo === 'SAIDA') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (tipo === 'ENTRADA') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (tipo === 'DESPESA') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-gray-50 text-gray-700';
}

function getLabelTipo(tipo: string) {
    if (tipo === 'SAIDA') return 'Venda';
    if (tipo === 'ENTRADA') return 'Entrada';
    if (tipo === 'DESPESA') return 'Despesa';
    return tipo;
}

function getValorClass(tipo: string) {
    if (tipo === 'SAIDA') return 'text-emerald-600';
    if (tipo === 'DESPESA') return 'text-red-600';
    return 'text-gray-900';
}

function getSinal(tipo: string) {
    if (tipo === 'SAIDA') return '+';
    if (tipo === 'DESPESA') return '-';
    return '';
}

// CORREÇÃO AQUI:
function getValor(mov: any) {
    if (mov.tipo === 'DESPESA') {
        // Converte string "50.00" para número 50.00
        return Number(mov.valor); 
    }
    // Converte preço da peça e quantidade para números
    return Number(mov.peca?.preco || 0) * Number(mov.quantidade || 0);
}
</script>