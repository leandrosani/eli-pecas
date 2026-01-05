<template>
  <div class="h-full flex flex-col bg-white border-l border-gray-200 shadow-xl">

    <!-- HEADER FIXO -->
    <div class="bg-white border-b border-gray-200 px-4 py-3 shrink-0">
      <div class="mb-3">
        <h3 class="font-bold text-black text-base">Filtros Inteligentes</h3>
        <p class="text-xs text-gray-600 mt-0.5">
          {{ totalFiltros > 0 ? `${totalFiltros} filtros ativos` : 'Nenhum filtro ativo' }}
        </p>
      </div>

      <div class="w-full">
        <label class="text-xs font-bold text-gray-700 mb-1 block">🔍 Buscar por texto</label>
        <input
          v-model="internalFilters.busca"
          @input="emitChanges"
          type="text"
          placeholder="Nome, código ou detalhe..."
          class="w-full h-9 bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-blue-500 px-2"
        />
      </div>
    </div>

    <!-- BODY COM SCROLL -->
    <div class="flex-1 overflow-y-auto px-4 py-3 pb-20">

      <!-- SWITCH DISPONÍVEIS -->
      <label class="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer select-none my-3 bg-gray-50 p-2 rounded-lg border border-gray-200">
        <input 
          type="checkbox" 
          v-model="somenteDisponiveis"
          @change="emitChanges"
          class="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
        />
        Ocultar itens esgotados
      </label>

      <!-- 1. MARCA (O PRIMEIRO FILTRO) -->
      <div class="flex flex-col mb-4">
        <p class="text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">1. Montadora</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="m in marcasDisponiveis"
            :key="m"
            @click="setMarca(m)"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
              internalFilters.marca === m
                ? 'bg-gray-900 text-white border-gray-900 shadow-md transform scale-105'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ m }}
          </button>
        </div>
      </div>

      <div v-if="internalFilters.marca" class="border-t border-gray-100 my-4 animate-fade-in"></div>

      <!-- 2. MODELO (DEPENDENTE DA MARCA) -->
      <div 
        v-if="internalFilters.marca"
        class="flex flex-col mb-4 animate-slide-in-right"
      >
        <div class="flex justify-between items-center mb-2">
           <p class="text-xs font-black text-gray-900 uppercase tracking-wide">2. Modelo</p>
           <button @click="setMarca(internalFilters.marca)" class="text-[10px] text-red-500 font-bold hover:underline">Alterar Montadora</button>
        </div>
        
        <div class="flex flex-wrap gap-2">
          <button
            v-for="m in modelosDisponiveis"
            :key="m"
            @click="setModelo(m)"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
              internalFilters.modelo === m
                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ m }}
          </button>
        </div>
      </div>

      <div v-if="internalFilters.modelo" class="border-t border-gray-100 my-4 animate-fade-in"></div>

      <!-- 3. PEÇA (DEPENDENTE DO MODELO) -->
      <div 
        v-if="internalFilters.modelo"
        class="flex flex-col mb-4 animate-slide-in-right"
      >
        <div class="flex justify-between items-center mb-2">
           <p class="text-xs font-black text-gray-900 uppercase tracking-wide">3. Peça</p>
           <button @click="setModelo(internalFilters.modelo)" class="text-[10px] text-red-500 font-bold hover:underline">Alterar Modelo</button>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="p in pecasDisponiveis"
            :key="p"
            @click="setPeca(p)"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
              internalFilters.peca === p
                ? 'bg-orange-500 text-white border-orange-500 shadow-md transform scale-105'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ p }}
          </button>
        </div>
      </div>

      <div v-if="internalFilters.peca" class="border-t border-gray-100 my-4 animate-fade-in"></div>

      <!-- 4. LADO -->
      <div 
        v-if="internalFilters.peca"
        class="flex flex-col mb-4 animate-slide-in-right"
      >
        <div class="flex justify-between items-center mb-2">
           <p class="text-xs font-black text-gray-900 uppercase tracking-wide">4. Lado</p>
           <button @click="setPeca(internalFilters.peca)" class="text-[10px] text-red-500 font-bold hover:underline">Alterar Peça</button>
        </div>

        <div class="flex flex-wrap gap-2">
          <button
            v-for="lado in ladosDisponiveis"
            :key="lado"
            @click="setLado(lado)"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
              internalFilters.lado === lado
                ? 'bg-purple-600 text-white border-purple-600 shadow-md'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ lado }}
          </button>
        </div>
      </div>

      <div class="border-t border-gray-100 my-4"></div>

      <!-- 5. ESTADO (SEMPRE VISÍVEL) -->
      <div class="flex flex-col mb-4">
        <p class="text-xs font-black text-gray-900 mb-2 uppercase tracking-wide">Condição</p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="estado in estadosDisponiveis"
            :key="estado"
            @click="setEstado(estado)"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
              internalFilters.estado === estado
                ? 'bg-green-600 text-white border-green-600 shadow-md'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            ]"
          >
            {{ estado }}
          </button>
        </div>
      </div>

    </div>

    <!-- FOOTER FIXO -->
    <div class="bg-white border-t border-gray-200 p-4 shrink-0 grid grid-cols-1 gap-2">
      <button
        @click="limparFiltros"
        class="h-10 rounded-xl border-2 border-gray-300 text-gray-700 font-bold text-sm hover:bg-gray-50 transition-colors"
      >
        Limpar
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';

const props = defineProps({
  options: { type: Object, required: true },
  modelValue: { type: Object, required: true },
  estoque: { type: Array, required: true }
});

const emit = defineEmits(['update:modelValue', 'close']);
const somenteDisponiveis = ref(true);

const internalFilters = ref({
  busca: '',
  marca: '',
  modelo: '',
  peca: '',
  lado: '',
  estado: ''
});

const emitChanges = async () => {
  await nextTick();
  const payload = {
    ...internalFilters.value,
    somenteDisponiveis: somenteDisponiveis.value
  };
  emit('update:modelValue', payload);
};

const totalFiltros = computed(() => {
  return Object.values(internalFilters.value).filter(val => val && val !== '').length;
});

// --- LÓGICA DE COMPUTED EM CASCATA ---

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
  // Filtra por marca se estiver selecionada
  if (internalFilters.value.marca) {
    itens = itens.filter((i: any) => i.marca === internalFilters.value.marca);
  }
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
  // Estado mostra tudo do estoque base, independente dos outros filtros (opcional)
  const estados = new Set<string>();
  baseItens.value.forEach((item: any) => { if (item.estado) estados.add(item.estado); });
  return Array.from(estados).sort();
});

// --- SETTERS COM RESET EM CASCATA ---

const setMarca = async (marca: string) => {
  const novoValor = internalFilters.value.marca === marca ? '' : marca;
  internalFilters.value.marca = novoValor;
  // Reseta filhos
  internalFilters.value.modelo = '';
  internalFilters.value.peca = '';
  internalFilters.value.lado = '';
  await emitChanges();
};

const setModelo = async (modelo: string) => {
  const novoValor = internalFilters.value.modelo === modelo ? '' : modelo;
  internalFilters.value.modelo = novoValor;
  internalFilters.value.peca = '';
  internalFilters.value.lado = '';
  await emitChanges();
};

const setPeca = async (peca: string) => {
  const novoValor = internalFilters.value.peca === peca ? '' : peca;
  internalFilters.value.peca = novoValor;
  internalFilters.value.lado = '';
  await emitChanges();
};

const setLado = async (lado: string) => {
  internalFilters.value.lado = internalFilters.value.lado === lado ? '' : lado;
  await emitChanges();
};

const setEstado = async (estado: string) => {
  internalFilters.value.estado = internalFilters.value.estado === estado ? '' : estado;
  await emitChanges();
};

const aplicarFiltros = () => {
  emit('close'); // Fecha o slideover no pai
};

const limparFiltros = async () => {
  internalFilters.value = { busca: '', marca: '', modelo: '', peca: '', lado: '', estado: '' };
  somenteDisponiveis.value = true; // Volta ao padrão seguro
  await emitChanges();
  emit('close');
};

onMounted(() => {
  internalFilters.value = {
    busca: props.modelValue.busca || '',
    marca: props.modelValue.marca || '',
    modelo: props.modelValue.modelo || '',
    peca: props.modelValue.peca || '',
    lado: props.modelValue.lado || '',
    estado: props.modelValue.estado || ''
  };
  if (props.modelValue.somenteDisponiveis !== undefined) {
    somenteDisponiveis.value = props.modelValue.somenteDisponiveis;
  }
});
</script>

<style scoped>
/* Animações simples para entrada suave */
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