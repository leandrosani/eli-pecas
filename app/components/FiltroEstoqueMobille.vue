<template>
  <div>
    <!-- Botão de Filtro Compacto (Irá ser usado apenas no Mobile) -->
    <div 
      @click="isOpen = true"
      class="-mb-5 bg-white items-center justify-end transition-shadow duration-200 rounded-xl"
    >
      <div class="flex items-center justify-end gap-3 rounded-xl border border-gray-300 shadow-sm py-2 px-3">
        <span class="font-bold text-blue-600 text-base">Filtros</span>
        <span v-if="totalFiltros > 0" class="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center">
          {{ totalFiltros }}
        </span>
        <UIcon name="i-heroicons-funnel" class="w-5 h-5 text-blue-600" />
      </div>
    </div>

    <!-- Overlay e Modal (Mobile Only) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-opacity duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-opacity duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="isOpen"
          @click="isOpen = false"
          class="fixed inset-0 bg-black/70 z-[100]"
        />
      </Transition>

      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-y-full"
        enter-to-class="translate-y-0"
        leave-active-class="transition-transform duration-250 ease-in"
        leave-from-class="translate-y-0"
        leave-to-class="translate-y-full"
      >
        <div 
          v-if="isOpen"
          class="rounded-t-3xl fixed bottom-0 w-full sm:max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          @click.stop
        >
          <!-- Header -->
          <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-2xl">
            <div>
              <h3 class="font-bold text-black text-base">Filtros</h3>
              <p class="text-xs text-gray-600 mt-0.5">
                {{ totalFiltros > 0 ? `${totalFiltros} ativos` : 'Nenhum ativo' }}
              </p>
            </div>
            <button @click="isOpen = false" class="ml-3 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Body -->
          <div class="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4 max-h-100">
            
            <!-- Busca -->
            <div>
              <label class="text-xs font-bold text-gray-700 mb-1.5 block">🔍 Buscar</label>
              <input
                v-model="internalFilters.busca"
                type="text"
                placeholder="Digite para buscar..."
                class="w-full h-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 px-3"
              />
            </div>

            <!-- Modelos -->
            <div>
              <label class="text-xs font-bold text-gray-700 mb-1.5 block">Modelo</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="m in opcoesFiltradasDinamicamente.modelos"
                  :key="m"
                  @click="internalFilters.modelo = internalFilters.modelo === m ? '' : m"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                    internalFilters.modelo === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  ]"
                >
                  {{ m }}
                </button>
              </div>
            </div>

            <!-- Peças -->
            <div v-if="internalFilters.modelo">
              <label class="text-xs font-bold text-gray-700 mb-1.5 block">Peça</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="p in pecasDisponiveis"
                  :key="p"
                  @click="internalFilters.peca = internalFilters.peca === p ? '' : p"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold border',
                    internalFilters.peca === p
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  ]"
                >
                  {{ p }}
                </button>
              </div>
            </div>

            <!-- Lado -->
            <div v-if="internalFilters.peca && ladosDisponiveis.length">
              <label class="text-xs font-bold text-gray-700 mb-1.5 block">Lado</label>
              <div class="flex gap-2">
                <button
                  v-for="lado in ladosDisponiveis"
                  :key="lado"
                  @click="internalFilters.lado = internalFilters.lado === lado ? '' : lado"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold border',
                    internalFilters.lado === lado
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  ]"
                >
                  {{ lado }}
                </button>
              </div>
            </div>

            <!-- Somente disponíveis -->
            <div>
              <label class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <input type="checkbox" v-model="somenteDisponiveis" />
                Somente disponíveis
              </label>
            </div>
          </div>

          <!-- Footer -->
          <div class="bg-white border-t border-gray-200 p-3">
            <div class="grid grid-cols-2 gap-2">
              <UButton @click="limparFiltros" color="white" variant="solid" size="md" block
                class="font-semibold text-sm h-8 border border-gray-300 hover:bg-gray-50 text-gray-700">
                Limpar
              </UButton>
              <UButton @click="aplicarFiltros" size="md" block
                class="font-semibold text-sm h-8 bg-blue-600 hover:bg-blue-700 text-white">
                Ver {{ linhasFiltradas }}
              </UButton>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
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
  lado: props.modelValue.lado || ''
});

const totalFiltros = computed(() => {
  return Object.values(internalFilters.value).filter(val => val && val !== '').length;
});

// A contagem real de itens filtrados (usada apenas no botão do modal)
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

// Lista de peças (row.nome) disponíveis para o modelo selecionado
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

// Lados disponíveis para a peça selecionada
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

const aplicarFiltros = () => {
  emit('update:modelValue', { ...internalFilters.value, somenteDisponiveis: somenteDisponiveis.value });
  isOpen.value = false;
};

const limparFiltros = () => {
  internalFilters.value = { busca: '', modelo: '', peca: '', lado: '' };
  somenteDisponiveis.value = false;
  emit('update:modelValue', { ...internalFilters.value, somenteDisponiveis: somenteDisponiveis.value });
  isOpen.value = false;
};

watch(() => props.modelValue, (newVal) => {
  // Sincroniza filtros do pai para o filho, se necessário
  internalFilters.value = { ...newVal };
  if (newVal.somenteDisponiveis !== undefined) {
    somenteDisponiveis.value = newVal.somenteDisponiveis;
  }
}, { deep: true, immediate: true });
</script>