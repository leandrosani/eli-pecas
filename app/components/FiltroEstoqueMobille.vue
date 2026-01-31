<template>
  <div>
    <!-- Botão de Filtro Compacto (Mobile Trigger) -->
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
          class="rounded-t-3xl fixed bottom-0 w-full sm:max-w-md bg-white shadow-2xl z-[101] flex flex-col max-h-[85vh]"
          @click.stop
        >
          <!-- Header -->
          <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-2xl shrink-0">
            <div>
              <h3 class="font-bold text-black text-base">Filtros Inteligentes</h3>
              <p class="text-xs text-gray-600 mt-0.5">
                {{ totalFiltros > 0 ? `${totalFiltros} ativos` : 'Nenhum ativo' }}
              </p>
            </div>
            <button @click="isOpen = false" class="ml-3 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Body com Scroll -->
          <div class="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-4">
            
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

            <!-- Switch Disponíveis -->
            <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 bg-white p-2 rounded-lg border border-gray-200">
              <input 
                type="checkbox" 
                v-model="somenteDisponiveis"
                class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
              />
              Somente disponíveis em estoque
            </label>

            <!-- 1. MONTADORA (Novo - Raiz do Funil) -->
            <div class="flex flex-col">
              <p class="text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">1. Montadora</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="m in marcasDisponiveis"
                  :key="m"
                  @click="setMarca(m)"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                    internalFilters.marca === m
                      ? 'bg-gray-900 text-white border-gray-900 shadow-md scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  ]"
                >
                  {{ m }}
                </button>
              </div>
            </div>

            <div v-if="internalFilters.marca" class="border-t border-gray-200 animate-fade-in"></div>

            <!-- 2. MODELO (Depende de Montadora) -->
            <div v-if="internalFilters.marca" class="flex flex-col animate-slide-in-right">
              <div class="flex justify-between items-center mb-2">
                 <p class="text-xs font-black text-gray-900 uppercase tracking-wide">2. Modelo</p>
                 <button @click="setMarca(internalFilters.marca)" class="text-[10px] text-red-500 font-bold">Alterar Montadora</button>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="m in modelosDisponiveis"
                  :key="m"
                  @click="setModelo(m)"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                    internalFilters.modelo === m
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  ]"
                >
                  {{ m }}
                </button>
              </div>
            </div>

            <div v-if="internalFilters.modelo" class="border-t border-gray-200 animate-fade-in"></div>

            <!-- 3. PEÇA (Depende de Modelo) -->
            <div v-if="internalFilters.modelo" class="flex flex-col animate-slide-in-right">
              <div class="flex justify-between items-center mb-2">
                 <p class="text-xs font-black text-gray-900 uppercase tracking-wide">3. Peça</p>
                 <button @click="setModelo(internalFilters.modelo)" class="text-[10px] text-red-500 font-bold">Alterar Modelo</button>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="p in pecasDisponiveis"
                  :key="p"
                  @click="setPeca(p)"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                    internalFilters.peca === p
                      ? 'bg-orange-500 text-white border-orange-500 shadow-md scale-105'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  ]"
                >
                  {{ p }}
                </button>
              </div>
            </div>

            <div v-if="internalFilters.peca" class="border-t border-gray-200 animate-fade-in"></div>

            <!-- 4. LADO (Depende de Peça) -->
            <div v-if="internalFilters.peca && ladosDisponiveis.length" class="flex flex-col animate-slide-in-right">
              <div class="flex justify-between items-center mb-2">
                 <p class="text-xs font-black text-gray-900 uppercase tracking-wide">4. Lado</p>
                 <button @click="setPeca(internalFilters.peca)" class="text-[10px] text-red-500 font-bold">Alterar Peça</button>
              </div>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="lado in ladosDisponiveis"
                  :key="lado"
                  @click="setLado(lado)"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                    internalFilters.lado === lado
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  ]"
                >
                  {{ lado }}
                </button>
              </div>
            </div>
            
            <!-- 5. ESTADO (Sempre visível no fim se houver dados) -->
            <div v-if="estadosDisponiveis.length" class="mt-4 pt-4 border-t border-gray-200">
              <p class="text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">Condição</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="est in estadosDisponiveis"
                  :key="est"
                  @click="setEstado(est)"
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                    internalFilters.estado === est
                      ? 'bg-green-600 text-white border-green-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                  ]"
                >
                  {{ est }}
                </button>
              </div>
            </div>

          </div>

          <!-- Footer Fixo -->
          <div class="bg-white border-t border-gray-200 p-4 shrink-0 grid grid-cols-2 gap-3">
            <button 
              @click="limparFiltros" 
              class="h-10 rounded-xl border-2 border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
            >
              Limpar
            </button>
            <button 
              @click="aplicarFiltros" 
              class="h-10 rounded-xl bg-black text-white font-bold text-sm hover:bg-gray-800 transition-colors shadow-lg"
            >
              Ver Resultados
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue';

const props = defineProps({
  options: { type: Object, required: true }, // Mantido para compatibilidade, mas usamos 'estoque' para computar
  modelValue: { type: Object, required: true },
  estoque: { type: Array, required: true }
});

const emit = defineEmits(['update:modelValue']);
const isOpen = ref(false);
const somenteDisponiveis = ref(true);

const internalFilters = ref({
  busca: props.modelValue.busca || '',
  marca: props.modelValue.marca || '', // Adicionado
  modelo: props.modelValue.modelo || '',
  peca: props.modelValue.peca || '', 
  lado: props.modelValue.lado || '',
  estado: props.modelValue.estado || ''
});

const totalFiltros = computed(() => {
  return Object.values(internalFilters.value).filter(val => val && val !== '').length;
});

// --- LÓGICA DE COMPUTED EM CASCATA (IGUAL AO DESKTOP) ---

const baseItens = computed(() => {
  let itens = props.estoque || [];
  if (somenteDisponiveis.value) itens = itens.filter((i: any) => i.quantidade > 0);
  return itens;
});

const marcasDisponiveis = computed(() => {
  const marcas = new Set<string>();
  baseItens.value.forEach((item: any) => { if (item.marca) marcas.add(item.marca); });
  return Array.from(marcas).sort();
});

const modelosDisponiveis = computed(() => {
  let itens = baseItens.value;
  if (internalFilters.value.marca) itens = itens.filter((i: any) => i.marca === internalFilters.value.marca);
  
  const modelos = new Set<string>();
  itens.forEach((item: any) => { if (item.modelo) modelos.add(item.modelo); });
  return Array.from(modelos).sort();
});

const pecasDisponiveis = computed(() => {
  let itens = baseItens.value;
  if (internalFilters.value.marca) itens = itens.filter((i: any) => i.marca === internalFilters.value.marca);
  if (internalFilters.value.modelo) itens = itens.filter((i: any) => i.modelo === internalFilters.value.modelo);
  
  const pecas = new Set<string>();
  itens.forEach((item: any) => { if (item.nome) pecas.add(item.nome); });
  return Array.from(pecas).sort();
});

const ladosDisponiveis = computed(() => {
  let itens = baseItens.value;
  if (internalFilters.value.marca) itens = itens.filter((i: any) => i.marca === internalFilters.value.marca);
  if (internalFilters.value.modelo) itens = itens.filter((i: any) => i.modelo === internalFilters.value.modelo);
  if (internalFilters.value.peca) itens = itens.filter((i: any) => i.nome === internalFilters.value.peca);

  const lados = new Set<string>();
  itens.forEach((item: any) => { if (item.lado) lados.add(item.lado); });
  return Array.from(lados).sort();
});

const estadosDisponiveis = computed(() => {
  const estados = new Set<string>();
  baseItens.value.forEach((item: any) => { if (item.estado) estados.add(item.estado); });
  return Array.from(estados).sort();
});

// --- SETTERS COM RESET EM CASCATA ---

const setMarca = (marca: string) => {
  internalFilters.value.marca = internalFilters.value.marca === marca ? '' : marca;
  internalFilters.value.modelo = '';
  internalFilters.value.peca = '';
  internalFilters.value.lado = '';
};

const setModelo = (modelo: string) => {
  internalFilters.value.modelo = internalFilters.value.modelo === modelo ? '' : modelo;
  internalFilters.value.peca = '';
  internalFilters.value.lado = '';
};

const setPeca = (peca: string) => {
  internalFilters.value.peca = internalFilters.value.peca === peca ? '' : peca;
  internalFilters.value.lado = '';
};

const setLado = (lado: string) => {
  internalFilters.value.lado = internalFilters.value.lado === lado ? '' : lado;
};

const setEstado = (estado: string) => {
  internalFilters.value.estado = internalFilters.value.estado === estado ? '' : estado;
};

// --- AÇÕES ---

const emitChanges = async () => {
  await nextTick();
  // Este método pode ser usado para updates em tempo real se quiser (ex: no input de busca)
  // Mas o botão "Ver Resultados" faz o commit final
};

const aplicarFiltros = () => {
  emit('update:modelValue', { ...internalFilters.value, somenteDisponiveis: somenteDisponiveis.value });
  isOpen.value = false;
};

const limparFiltros = () => {
  internalFilters.value = { busca: '', marca: '', modelo: '', peca: '', lado: '', estado: '' };
  somenteDisponiveis.value = true;
  emit('update:modelValue', { ...internalFilters.value, somenteDisponiveis: somenteDisponiveis.value });
  isOpen.value = false;
};

// Sync Inicial
onMounted(() => {
  internalFilters.value = { ...props.modelValue };
  if (props.modelValue.somenteDisponiveis !== undefined) {
    somenteDisponiveis.value = props.modelValue.somenteDisponiveis;
  }
});

watch(() => props.modelValue, (newVal) => {
  internalFilters.value = { ...newVal };
  if (newVal.somenteDisponiveis !== undefined) {
    somenteDisponiveis.value = newVal.somenteDisponiveis;
  }
}, { deep: true });

</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideInRight {
  from { opacity: 0; transform: translateX(10px); }
  to { opacity: 1; transform: translateX(0); }
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

.animate-slide-in-right {
  animation: slideInRight 0.3s ease-out forwards;
}
</style>