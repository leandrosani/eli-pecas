<template>
  <div class="h-full flex flex-col bg-white border-l border-gray-200 shadow-xl">

    <!-- HEADER FIXO -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
      <div class="mb-3">
        <h3 class="font-bold text-black text-base">Filtros</h3>
        <p class="text-xs text-gray-600 mt-0.5">
          {{ totalFiltros > 0 ? `${totalFiltros} ativos` : 'Nenhum ativo' }}
        </p>
      </div>

      <div class="w-full">
        <label class="text-xs font-bold text-gray-700 mb-1 block">🔍 Buscar</label>
        <input
          v-model="internalFilters.busca"
          type="text"
          placeholder="Buscar..."
          class="w-full h-9 bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-blue-500 px-2"
        />
      </div>
    </div>

    <!-- BODY COM SCROLL VERTICAL -->
    <div class="flex-1 overflow-y-auto px-4 py-3">

      <!-- DISPONÍVEIS -->
      <label class="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer select-none my-3">
        Somente disponíveis
        <input 
          type="checkbox" 
          v-model="somenteDisponiveis" 
          class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
        />
      </label>

      <!-- BLOCO DE FILTROS EM COLUNA -->
      <div class="space-y-4 pb-4">

        <!-- MODELO -->
        <div class="flex flex-col">
          <p class="text-xs font-bold text-gray-700 mb-2">Modelo</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="m in opcoesFiltradasDinamicamente.modelos"
              :key="m"
              @click="internalFilters.modelo = internalFilters.modelo === m ? '' : m"
              :class="[
                'px-2.5 py-1 rounded-md text-xs font-medium border transition-all',
                internalFilters.modelo === m
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              ]"
            >
              {{ m }}
            </button>
          </div>
        </div>

        <!-- DIVISOR -->
        <div class="border-t border-gray-200"></div>

        <!-- PEÇA -->
        <div 
          class="flex flex-col transition-opacity duration-200" 
          :class="{ 'opacity-50 pointer-events-none': !internalFilters.modelo }"
        >
          <p class="text-xs font-bold text-gray-700 mb-2">Peça</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="p in pecasDisponiveis"
              :key="p"
              @click="internalFilters.peca = internalFilters.peca === p ? '' : p"
              :disabled="!internalFilters.modelo"
              :class="[
                'px-2.5 py-1 rounded-md text-xs font-medium border transition-all',
                internalFilters.peca === p
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              ]"
            >
              {{ p }}
            </button>
          </div>
        </div>

        <!-- DIVISOR -->
        <div class="border-t border-gray-200"></div>

        <!-- LADO -->
        <div 
          class="flex flex-col transition-opacity duration-200" 
          :class="{ 'opacity-50 pointer-events-none': !internalFilters.peca || !ladosDisponiveis.length }"
        >
          <p class="text-xs font-bold text-gray-700 mb-2">Lado</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="lado in ladosDisponiveis"
              :key="lado"
              @click="internalFilters.lado = internalFilters.lado === lado ? '' : lado"
              :disabled="!internalFilters.peca || !ladosDisponiveis.length"
              :class="[
                'px-2.5 py-1 rounded-md text-xs font-medium border transition-all',
                internalFilters.lado === lado
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              ]"
            >
              {{ lado }}
            </button>
          </div>
        </div>

        <!-- DIVISOR -->
        <div class="border-t border-gray-200"></div>

        <!-- ESTADO -->
        <div 
          class="flex flex-col transition-opacity duration-200" 
          :class="{ 'opacity-50 pointer-events-none': !estadosDisponiveis.length }"
        >
          <p class="text-xs font-bold text-gray-700 mb-2">Estado</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="estado in estadosDisponiveis"
              :key="estado"
              @click="internalFilters.estado = internalFilters.estado === estado ? '' : estado"
              :disabled="!estadosDisponiveis.length"
              :class="[
                'px-2.5 py-1 rounded-md text-xs font-medium border transition-all',
                internalFilters.estado === estado
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
              ]"
            >
              {{ estado }}
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- FOOTER FIXO -->
    <div class="bg-white border-t border-gray-200 p-3 shrink-0">
      <div class="grid grid-cols-1 gap-2">
        <UButton
          @click="aplicarFiltros"
          size="md"
          block
          class="font-semibold text-sm h-9 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Ver {{ linhasFiltradas }}
        </UButton>
        <UButton
          @click="limparFiltros"
          color="white"
          size="md"
          block
          class="font-semibold text-sm h-9 border border-gray-300 hover:bg-gray-50 text-gray-700"
        >
          Limpar
        </UButton>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const props = defineProps({
  options: { type: Object, required: true },
  modelValue: { type: Object, required: true },
  estoque: { type: Array, required: true }
});

const emit = defineEmits(['update:modelValue']);
const isOpen = ref(false);
const somenteDisponiveis = ref(true);

const internalFilters = ref({
  busca: props.modelValue.busca || '',
  modelo: props.modelValue.modelo || '',
  peca: props.modelValue.peca || '', 
  lado: props.modelValue.lado || '',
  estado: props.modelValue.estado || ''
});

const totalFiltros = computed(() => {
  return Object.values(internalFilters.value).filter(val => val && val !== '').length;
});

const linhasFiltradas = computed(() => {
  let lista = props.estoque || [];
  const filtros = internalFilters.value;

  if (somenteDisponiveis.value) {
    lista = lista.filter((row: any) => row.quantidade > 0);
  }
  if (filtros.busca) {
    const buscaLower = filtros.busca.toLowerCase();
    lista = lista.filter((row: any) =>
      (row.nome || '').toLowerCase().includes(buscaLower) ||
      (row.modelo || '').toLowerCase().includes(buscaLower)
    );
  }
  if (filtros.modelo) lista = lista.filter((row: any) => row.modelo === filtros.modelo);
  if (filtros.peca) lista = lista.filter((row: any) => row.nome === filtros.peca);
  if (filtros.lado) lista = lista.filter((row: any) => row.lado === filtros.lado);
  if (filtros.estado) lista = lista.filter((row: any) => row.estado === filtros.estado);

  return lista.length;
});

const opcoesFiltradasDinamicamente = computed(() => {
  let itens = props.estoque || [];
  if (somenteDisponiveis.value) itens = itens.filter((i: any) => i.quantidade > 0);

  const modelos = new Set<string>();
  itens.forEach((item: any) => {
    if (item.modelo) modelos.add(item.modelo);
  });

  return {
    modelos: Array.from(modelos).sort()
  };
});

const pecasDisponiveis = computed(() => {
  let itens = props.estoque || [];
  if (somenteDisponiveis.value) itens = itens.filter((i: any) => i.quantidade > 0);
  if (internalFilters.value.modelo) {
    itens = itens.filter((i: any) => i.modelo === internalFilters.value.modelo);
  }
  const pecas = new Set<string>();
  itens.forEach((item: any) => {
    if (item.nome) pecas.add(item.nome);
  });
  return Array.from(pecas).sort();
});

const ladosDisponiveis = computed(() => {
  let itens = props.estoque || [];
  if (somenteDisponiveis.value) itens = itens.filter((i: any) => i.quantidade > 0);
  if (internalFilters.value.modelo) {
    itens = itens.filter((i: any) => i.modelo === internalFilters.value.modelo);
  }
  if (internalFilters.value.peca) {
    itens = itens.filter((i: any) => i.nome === internalFilters.value.peca); 
  }
  const lados = new Set<string>();
  itens.forEach((item: any) => {
    if (item.lado) lados.add(item.lado);
  });
  return Array.from(lados).sort();
});

const estadosDisponiveis = computed(() => {
  let itens = props.estoque || [];
  if (somenteDisponiveis.value) itens = itens.filter((i: any) => i.quantidade > 0);
  const estados = new Set<string>();
  itens.forEach((item: any) => {
    if (item.estado) estados.add(item.estado);
  });
  return Array.from(estados).sort();
});

const aplicarFiltros = () => {
  emit('update:modelValue', { ...internalFilters.value, somenteDisponiveis: somenteDisponiveis.value });
  isOpen.value = false;
};

const limparFiltros = () => {
  internalFilters.value = { busca: '', modelo: '', peca: '', lado: '' , estado: '' };
  somenteDisponiveis.value = false;
  emit('update:modelValue', { ...internalFilters.value, somenteDisponiveis: somenteDisponiveis.value });
  isOpen.value = false;
};

watch(() => props.modelValue, (newVal) => {
  internalFilters.value = { ...newVal };
  if (newVal.somenteDisponiveis !== undefined) {
    somenteDisponiveis.value = newVal.somenteDisponiveis;
  }
}, { deep: true, immediate: true });
</script>
