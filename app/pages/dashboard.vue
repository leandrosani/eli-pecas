<template>
  <div class="pb-24 relative">

    <!-- =================================================== -->
    <!-- CABEÇALHO: BEM-VINDO(A) E FILTRO DE MÊS -->
    <!-- =================================================== -->

    <!-- MOBILE -->
    <div class="md:hidden flex justify-between items-center gap-3">

      <!-- Título + Seleção de Mês -->
      <div class="flex flex-col gap-2 flex-1">

        <!-- Título -->
        <h1 class="font-semibold text-xl text-black whitespace-nowrap flex items-center gap-1">
          <span class="text-2xl">📊</span> Visão Geral
        </h1>

        <!-- Card de Mês -->
        <div
          class="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all h-12 whitespace-nowrap"
        >
          <UButton
            icon="i-heroicons-chevron-left"
            color="gray"
            variant="ghost"
            size="3xs"
            @click="mudarMes(-1)"
          />

          <span
            class="font-bold text-gray-900 text-sm flex-1 text-center select-none capitalize whitespace-nowrap"
          >
            {{ nomeMesAtual }}
          </span>

          <UButton
            icon="i-heroicons-chevron-right"
            color="gray"
            variant="ghost"
            size="3xs"
            @click="mudarMes(1)"
            :disabled="ehMesFuturo"
          />
        </div>
      </div>

      <!-- Logo -->
      <div
        class="w-20 h-20 rounded-2xl flex items-center justify-center bg-black shadow-md overflow-hidden border-2 border-white shrink-0"
      >
        <img
          src="/logo.jpg"
          alt="Logo Eli Peças"
          class="w-full h-full object-cover"
        />
      </div>
    </div>



    <!-- DESKTOP -->
    <div class="hidden md:flex flex-col gap-4 mb-6">

      <div class="flex justify-between items-start">

        <!-- Título -->
        <div class="whitespace-nowrap">
          <h1 class="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2 whitespace-nowrap">
            <span class="text-4xl">📊</span> Análise Financeira
          </h1>
          <p class="text-sm text-gray-500 mt-1 whitespace-nowrap">
            Acompanhe o desempenho e extrato por período.
          </p>
        </div>

        <!-- Card de Mês -->
        <div
          class="flex items-center gap-3 bg-white px-4 py-2 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-all h-14 whitespace-nowrap"
        >
          <UButton
            icon="i-heroicons-chevron-left"
            color="gray"
            variant="ghost"
            size="xs"
            @click="mudarMes(-1)"
          />

          <span
            class="font-bold text-gray-900 text-sm w-32 text-center select-none capitalize whitespace-nowrap"
          >
            {{ nomeMesAtual }}
          </span>

          <UButton
            icon="i-heroicons-chevron-right"
            color="gray"
            variant="ghost"
            size="xs"
            @click="mudarMes(1)"
            :disabled="ehMesFuturo"
          />
        </div>

      </div>
    </div>

    <!-- Linha divisória -->
    <div class="border border-gray-200 shadow-sm my-3 w-full"></div>


    <!-- LOADING -->
    <div v-if="pending" class="text-center py-20">
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-10 h-10 animate-spin text-blue-500 mx-auto"
      />
      <p class="text-gray-500 mt-3 text-sm font-medium">
        Analisando dados...
      </p>
    </div>

    <!-- CONTEÚDO -->
    <div v-else class="space-y-2">

      <!-- =================================================== -->
      <!-- 1. INDICADORES PRINCIPAIS -->
      <!-- =================================================== -->

      <div class="grid grid-cols-1 gap-1.5 md:grid-cols-3 md:gap-4">

        <!-- Faturamento -->
        <div
          class="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-3 text-white relative overflow-hidden group transition-transform hover:scale-[1.01]"
        >
          <div class="absolute right-0 top-0 p-4 opacity-20">
            <UIcon
              name="i-heroicons-currency-dollar"
              class="w-20 h-20"
            />
          </div>

          <p class="text-emerald-100 text-xs font-bold uppercase tracking-wider mb-1">
            Vendas Brutas
          </p>

          <div class="text-xl font-bold mb-4">
            {{ formatarDinheiro(stats?.faturamentoMes) }}
          </div>

          <div
            class="flex items-center gap-2 text-xs bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm"
          >
            <UIcon name="i-heroicons-shopping-bag" class="w-4 h-4" />
            <span>{{ stats?.vendasCount }} vendas</span>
          </div>
        </div>

        <!-- Despesas -->
        <div
          class="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-3 text-white relative overflow-hidden group transition-transform hover:scale-[1.01]"
        >
          <div class="absolute right-0 top-0 p-4 opacity-20">
            <UIcon
              name="i-heroicons-arrow-trending-down"
              class="w-20 h-20"
            />
          </div>

          <p class="text-red-100 text-xs font-bold uppercase tracking-wider mb-1">
            Despesas Totais
          </p>

          <div class="text-xl font-bold mb-4">
            {{ formatarDinheiro(stats?.totalDespesas) }}
          </div>

          <div
            class="flex items-center gap-2 text-xs bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-sm"
          >
            <UIcon
              name="i-heroicons-document-minus"
              class="w-4 h-4"
            />
            <span>{{ stats?.despesasCount }} registros</span>
          </div>
        </div>

        <!-- Balanço -->
        <div
          class="rounded-xl p-3 text-white relative overflow-hidden group transition-transform hover:scale-[1.01]"
          :class="Number(stats?.balancoLiquido) >= 0
            ? 'bg-gradient-to-br from-yellow-500 to-amber-400'
            : 'bg-amber-50 border-red-100'
          "
        >
          <div class="absolute right-0 top-0 p-4 opacity-10">
            <UIcon name="i-heroicons-scale" class="w-20 h-20" />
          </div>

          <p class="text-xs font-bold uppercase tracking-wider mb-1 text-amber-100">
            Lucro Líquido
          </p>

          <div
            class="text-xl font-bold mb-4"
            :class="Number(stats?.balancoLiquido) >= 0
              ? 'text-white'
              : 'text-red-600'
            "
          >
            {{ formatarDinheiro(stats?.balancoLiquido) }}
          </div>

          <div
            v-if="Number(stats?.balancoLiquido) >= 0"
            class="flex items-center gap-2 text-xs bg-white/20 backdrop-blur-sm w-fit px-3 py-1 rounded-full"
          >
            <UIcon name="i-heroicons-hand-thumb-up" class="w-4 h-4" />
            <span>Lucro Operacional</span>
          </div>

          <div
            v-else
            class="flex items-center gap-2 text-xs bg-red-50 text-red-700 w-fit px-3 py-1 rounded-full"
          >
            <UIcon
              name="i-heroicons-exclamation-circle"
              class="w-4 h-4"
            />
            <span>Prejuízo no Período</span>
          </div>
        </div>
      </div>

      <div class="mb-3 mt-3 border border-gray-200 shadow-sm w-[100%]"></div>

      <!-- =================================================== -->
      <!-- 2. INDICADORES SECUNDÁRIOS -->
      <!-- =================================================== -->

      <div class="grid grid-cols-3 gap-1 md:grid-cols-3 md:gap-4">

        <!-- Quantidade -->
        <div
          class="bg-white p-3 rounded-2xl border-2 border-blue-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
        >
          <div>
            <div class="flex items-center gap-2 text-gray-600 mb-2">
              <UIcon name="i-heroicons-cube" class="w-5 h-5" />
              <span class="text-xs font-bold uppercase">Estoque</span>
            </div>

            <div class="text-xl text-center font-bold text-gray-800">
              {{ stats?.itensEstoque }}
            </div>

            <p class="text-xs text-center text-gray-500 mt-1">
              Quantidade
            </p>
          </div>
        </div>

        <!-- Patrimônio -->
        <div
          class="bg-white p-3 col-span-2 rounded-2xl border-2 border-blue-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
        >
          <div>
            <div class="flex items-center gap-2 text-gray-600 mb-2">
              <UIcon name="i-heroicons-banknotes" class="w-5 h-5" />
              <span class="text-xs font-bold uppercase">Patrimônio Ativo</span>
            </div>

            <div class="text-xl font-bold text-gray-800">
              {{ formatarDinheiro(stats?.valorEstoque) }}
            </div>

            <p class="text-xs text-gray-500 mt-1">
              Valor de custo em peças
            </p>
          </div>
        </div>
      </div>

      <div class="mb-3 mt-3 border border-gray-200 shadow-sm w-[100%]"></div>

      <!-- =================================================== -->
      <!-- 3. MAIS VENDIDOS -->
      <!-- =================================================== -->

      <div class="grid grid-cols-1 gap-6">

        <div class="border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div
            class="p-4 border-b border-gray-100 cursor-pointer select-none flex justify-between items-center bg-gray-800"
            @click="openMaisVendidos = !openMaisVendidos"
          >
            <h3 class="font-bold text-white flex items-center gap-2">
              <UIcon
                name="i-heroicons-trophy"
                class="w-5 h-5 text-yellow-500"
              />
              Mais Vendidos do Mês
            </h3>

            <UIcon
              name="i-heroicons-chevron-down"
              class="w-5 h-5 text-white transition-transform duration-300"
              :class="{ 'rotate-180': openMaisVendidos }"
            />
          </div>

          <Transition name="collapse">
            <div v-show="openMaisVendidos">
              <div class="p-2 bg-gray-100">

                <div
                  v-if="!stats?.topProdutos?.length"
                  class="p-6 text-center text-gray-400 text-sm"
                >
                  Nenhuma venda registrada neste mês.
                </div>

                <div v-else class="space-y-1">
                  <div
                    v-for="(prod, index) in stats.topProdutos"
                    :key="index"
                    class="flex items-center justify-between p-3 hover:bg-yellow-50 rounded-lg transition-colors bg-white"
                  >
                    <div class="flex items-center gap-3">
                      <!-- Ranking -->
                      <div class="text-lg font-bold text-gray-400 w-6">
                        #{{ index + 1 }}
                      </div>

                      <!-- Infos -->
                      <div>
                        <div class="flex gap-1">
                          <p class="text-sm font-bold text-gray-900 leading-tight">
                            {{ prod.nome }}
                          </p>
                          <p class="text-sm font-bold text-gray-900 leading-tight">
                            {{ prod.modelo }}
                          </p>
                        </div>

                        <div class="flex flex-wrap gap-1 mt-0.5">
                          <span
                            v-if="prod.ano"
                            class="text-[12px] font-bold text-gray-500 bg-gray-100 px-1.5 rounded border border-gray-200"
                          >
                            {{ prod.ano }}
                          </span>

                          <span
                            v-if="prod.lado"
                            class="text-[12px] font-bold text-gray-500 bg-gray-100 px-1.5 rounded border border-gray-200 uppercase"
                          >
                            {{ prod.lado }}
                          </span>
                        </div>

                        <p class="text-[12px] text-gray-500 mt-0.5 ml-1 font-medium">
                          {{ prod.qtd }} un. vendidas
                        </p>
                      </div>
                    </div>

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

      <div class="mb-3 mt-3 border border-gray-200 shadow-sm w-[100%]"></div>

      <!-- =================================================== -->
      <!-- 4. EXTRATO UNIFICADO -->
      <!-- =================================================== -->

      <div class="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

        <div
          class="p-3 border-b border-gray-100 bg-gray-800 flex flex-col md:flex-row justify-between items-center gap-3"
        >
          <div class="flex items-center justify-between w-full md:w-auto">
            <h2 class="font-bold text-white">Extrato Financeiro</h2>
            <UButton
              icon="i-heroicons-arrow-path"
              size="xs"
              color="gray"
              variant="ghost"
              @click="refresh"
              class="md:hidden text-white"
            />
          </div>

          <div class="flex flex-wrap gap-1 w-full md:w-auto">
            <UButton
              v-for="aba in abas"
              :key="aba.value"
              :label="aba.label"
              :color="abaAtiva === aba.value ? aba.color : 'gray'"
              :variant="abaAtiva === aba.value ? 'solid' : 'ghost'"
              size="xs"
              @click="abaAtiva = aba.value"
              :class="[
                'flex-1 md:flex-none justify-center font-semibold cursor-pointer text-white',
                abaAtiva === aba.value && aba.value === 'todos' ? 'bg-gray-600' : '',
                abaAtiva === aba.value && aba.value === 'saida' ? 'bg-emerald-600' : '',
                abaAtiva === aba.value && aba.value === 'entrada' ? 'bg-blue-600' : '',
                abaAtiva === aba.value && aba.value === 'despesa' ? 'bg-red-600' : ''
              ]"
            />

            <UButton
              icon="i-heroicons-arrow-path"
              size="xs"
              color="gray"
              variant="ghost"
              @click="refresh"
              class="hidden md:flex text-white"
            />
          </div>
        </div>

        <!-- DESKTOP TABLE -->
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
              <tr
                v-for="mov in historicoFiltrado"
                :key="mov.id"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 pl-3 px-1 font-medium text-gray-900">
                  {{ mov.peca?.nome || mov.descricao }}
                </td>

                <td class="py-3 font-medium text-gray-900">
                  {{ mov.peca?.modelo || mov.descricao }}
                </td>

                <td class="py-3 px-4">
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded border font-bold"
                    :class="getBadgeClass(mov.tipo)"
                  >
                    {{ getLabelTipo(mov.tipo) }}
                  </span>
                </td>

                <td class="py-3 px-4 text-gray-800">
                  {{ mov.ano || mov.peca?.ano || '—' }}
                </td>

                <td class="py-3 px-4 text-gray-800">
                  {{ mov.lado || mov.peca?.lado || '—' }}
                </td>

                <td
                  class="py-3 px-4 text-right font-mono font-bold"
                  :class="getValorClass(mov.tipo)"
                >
                  {{ getSinal(mov.tipo) }}
                  {{ formatarDinheiro(getValor(mov)) }}
                </td>
              </tr>


              <tr v-if="!historicoFiltrado.length">
                <td colspan="5" class="py-16 text-center text-gray-400">
                  Nenhum registro encontrado.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- MOBILE LIST -->
        <div class="md:hidden">
          <div
            v-for="mov in historicoFiltrado"
            :key="mov.id"
            class="p-3 border-b border-gray-100 flex justify-between items-center"
          >
            <div class="flex-1 min-w-0 pr-2">

              <p class="font-bold text-gray-900 text-sm">
                {{ mov.peca?.nome || mov.descricao }}
              </p>

              <p class="font-bold text-gray-900 text-sm">
                {{ mov.peca?.modelo || mov.descricao }}
              </p>

              <div class="mt-2">
                <p class="text-xs text-gray-500">
                  {{ mov.ano || mov.peca?.ano || '—' }} 
                </p>

                <p class="text-xs text-gray-500">
                  {{ mov.lado || mov.peca?.lado || '—' }}
                </p>
              </div>

            </div>

            <div class="flex flex-col justify-between items-end self-stretch">
              <p class="font-bold text-gray-600 text-xs">
                {{ mov.peca?.marca || mov.descricao }}
              </p>
              
              <div class= "flex flex-col items-end">
                <div class="flex items-center gap-2 mb-1">
                  <span
                    class="text-[10px] px-1.5 py-0.5 rounded border font-bold"
                    :class="getBadgeClass(mov.tipo)"
                  >
                    {{ getLabelTipo(mov.tipo) }}
                  </span>
                </div>

                <span
                  class="font-mono font-bold text-sm whitespace-nowrap"
                  :class="getValorClass(mov.tipo)"
                >
                  {{ getSinal(mov.tipo) }}
                  {{ formatarDinheiro(getValor(mov)) }}
                </span>
              </div>
            </div>

          </div>

          <div
            v-if="!historicoFiltrado.length"
            class="py-12 text-center text-gray-400 text-sm"
          >
            Nenhum registro.
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

definePageMeta({
  layout: 'default',
  loading: true // ativa carregamento automático
});

const { user } = useUserSession();

const openMaisVendidos = ref(false);

/* ABAS */
const abas = [
  { label: 'Todos', value: 'todos', color: 'gray' },
  { label: 'Vendas', value: 'saida', color: 'emerald' },
  { label: 'Entradas', value: 'entrada', color: 'blue' },
  { label: 'Despesas', value: 'despesa', color: 'red' }
];

const abaAtiva = ref('todos');

/* DATA ATUAL */
const dataAtual = ref(new Date());

const nomeMesAtual = computed(() => {
  return dataAtual.value.toLocaleString('pt-BR', {
    month: 'long',
    year: 'numeric'
  });
});

const ehMesFuturo = computed(() => {
  const hoje = new Date();
  return (
    dataAtual.value.getMonth() === hoje.getMonth() &&
    dataAtual.value.getFullYear() === hoje.getFullYear()
  );
});

const params = computed(() => ({
  mes: dataAtual.value.getMonth() + 1,
  ano: dataAtual.value.getFullYear()
}));

/* API */
const { data: stats, pending, refresh } = await useFetch('/api/dashboard/stats', {
  query: params,
  lazy: true,
  immediate: true // mantém a chamada automática, mas depois da montagem
});


/* FILTRAGEM */
const historicoFiltrado = computed(() => {
  const estoque = stats.value?.historicoMes || [];
  const despesas = (stats.value?.despesasMes || []).map((d: any) => ({
    ...d,
    tipo: 'DESPESA'
  }));

  if (abaAtiva.value === 'saida')
    return estoque.filter((m: any) => m.tipo === 'SAIDA');

  if (abaAtiva.value === 'entrada')
    return estoque.filter((m: any) => m.tipo === 'ENTRADA');

  if (abaAtiva.value === 'despesa') return despesas;

  return [...estoque, ...despesas]
    .sort(
      (a, b) =>
        new Date(b.createdAt || b.data).getTime() -
        new Date(a.createdAt || a.data).getTime()
    )
    .slice(0, 50);
});

/* FUNÇÕES */
function mudarMes(delta: number) {
  const novaData = new Date(dataAtual.value);
  novaData.setMonth(novaData.getMonth() + delta);
  dataAtual.value = novaData;
}

function formatarDinheiro(val: number | null) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(val) || 0);
}

function getBadgeClass(tipo: string) {
  if (tipo === 'SAIDA')
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';

  if (tipo === 'ENTRADA')
    return 'bg-blue-50 text-blue-700 border-blue-200';

  if (tipo === 'DESPESA')
    return 'bg-red-50 text-red-700 border-red-200';

  return 'bg-gray-100 text-gray-600 border-gray-300';
}

function getLabelTipo(tipo: string) {
  if (tipo === 'SAIDA') return 'Venda';
  if (tipo === 'ENTRADA') return 'Entrada';
  if (tipo === 'DESPESA') return 'Despesa';
  return tipo;
}

function getValorClass(tipo: string) {
  if (tipo === 'SAIDA') return 'text-emerald-600';
  if (tipo === 'ENTRADA') return 'text-blue-600';
  if (tipo === 'DESPESA') return 'text-red-600';
  return 'text-gray-700';
}

function getSinal(tipo: string) {
  if (tipo === 'SAIDA') return '+';
  if (tipo === 'ENTRADA') return '+';
  if (tipo === 'DESPESA') return '-';
  return '';
}

function getValor(mov: any) {
    if (mov.tipo === 'DESPESA') {
        return Number(mov.valor); 
    }
    return Number(mov.peca?.preco || 0) * Number(mov.quantidade || 0);
}

</script>
