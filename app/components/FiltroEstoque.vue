<template>
  <div>
    <!-- Botão Colapsável Estilo iOS -->
    <div 
      @click="toggle"
      class="bg-white p-3 md:p-4 rounded-xl border-2 border-gray-200 shadow-sm transition-all hover:shadow-md cursor-pointer select-none"
      :class="{ 'border-blue-400': isOpen }"
    >
      <div class="flex items-center justify-between">
        <h3 class="font-bold text-gray-800 flex items-center gap-3">
          <UIcon name="i-heroicons-funnel" class="w-5 h-5 text-blue-600 transition-transform" />
          Filtros Avançados
        </h3>
        
        <div class="flex items-center gap-2">
            <span class="text-xs text-gray-500 font-medium hidden sm:inline">
                {{ totalFiltros > 0 ? `${totalFiltros} Filtros Ativos` : 'Nenhum filtro aplicado' }}
            </span>
            <UIcon 
                :name="isOpen ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                class="w-5 h-5 text-gray-500 transition-transform duration-300"
            />
        </div>
      </div>
    </div>

    <!-- PAINEL COLAPSÁVEL (com animação iOS) -->
    <Transition name="ios-slide">
      <div v-show="isOpen" class="mt-3">
        <div class="bg-white p-4 md:p-6 rounded-xl border-2 border-gray-200 shadow-xl space-y-6">
          
          <div class="space-y-1">
              <label class="text-xs font-semibold text-gray-600">Busca Geral</label>
              <input
                v-model="internalFilters.busca"
                type="text"
                placeholder="Nome, marca, observação..."
                class="w-full h-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 px-3 shadow-sm placeholder:text-gray-400"
              />
            </div>
          <!-- Linha de Filtros Principais -->
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">

            <!-- BUSCA GERAL (Texto) -->
            
            
            <!-- MARCA (Select) -->
            <div class="space-y-1">
              <label class="text-xs font-semibold text-gray-600">Marca</label>
              <select v-model="internalFilters.marca" :disabled="!options.marcas || !options.marcas.length" class="w-full h-10 appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 px-3 cursor-pointer shadow-sm disabled:bg-gray-100 uppercase">
                <option value="">Todas</option>
                <option v-for="m in options.marcas" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>

            <!-- MODELO (Select) -->
            <div class="space-y-1">
              <label class="text-xs font-semibold text-gray-600">Modelo</label>
              <select v-model="internalFilters.modelo" :disabled="!options.modelos || !options.modelos.length" class="w-full h-10 appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 px-3 cursor-pointer shadow-sm disabled:bg-gray-100 uppercase">
                <option value="">Todos</option>
                <option v-for="m in options.modelos" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>
          </div>
          
          <!-- Linha de Filtros Secundários -->
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">

            <!-- ANO (Select) -->
            <div class="space-y-1">
              <label class="text-xs font-semibold text-gray-600">Ano</label>
              <select v-model="internalFilters.ano" :disabled="!options.anos || !options.anos.length" class="w-full h-10 appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 px-3 cursor-pointer shadow-sm disabled:bg-gray-100 uppercase">
                <option value="">Todos</option>
                <option v-for="a in options.anos" :key="a" :value="a">{{ a }}</option>
              </select>
            </div>

            <!-- LOCALIZAÇÃO (Select) -->
            <div class="space-y-1">
              <label class="text-xs font-semibold text-gray-600">Localização</label>
              <select v-model="internalFilters.localizacao" :disabled="!options.localizacoes || !options.localizacoes.length" class="w-full h-10 appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 px-3 cursor-pointer shadow-sm disabled:bg-gray-100 uppercase">
                <option value="">Todas</option>
                <option v-for="l in options.localizacoes" :key="l" :value="l">{{ l }}</option>
              </select>
            </div>      
          </div>
          <!-- ESTADO (Select) -->
            <div class="space-y-1">
              <label class="text-xs font-semibold text-gray-600">Condição</label>
              <select v-model="internalFilters.estado" class="w-full h-10 appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-1 focus:ring-blue-500 px-3 cursor-pointer shadow-sm disabled:bg-gray-100 uppercase">
                <option value="">Todos</option>
                <option v-for="e in options.estados" :key="e" :value="e">{{ e }}</option>
              </select>
            </div>

          <!-- Botões de Ação -->
          <div class="flex justify-end gap-3 pt-2">
            <UButton @click="limparFiltros" color="orange" variant="soft" icon="i-heroicons-trash" size="md" class="font-semibold active:scale-95">
              Limpar Filtros
            </UButton>
          </div>

        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';

const props = defineProps({
  options: {
    type: Object,
    required: true,
    default: () => ({ 
      marcas: [], 
      modelos: [], 
      anos: [], 
      localizacoes: [], 
      estados: [] 
    })
  },
  modelValue: {
    type: Object,
    required: true,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const toggle = () => isOpen.value = !isOpen.value;

// Filtros internos
const internalFilters = ref({
  busca: props.modelValue.busca || '',
  marca: props.modelValue.marca || '',
  modelo: props.modelValue.modelo || '',
  ano: props.modelValue.ano || '',
  estado: props.modelValue.estado || '',
  localizacao: props.modelValue.localizacao || '',
});

// Contador de filtros ativos
const totalFiltros = computed(() => {
    return Object.values(internalFilters.value).filter(val => val && val !== '').length;
});

// Reseta todos os filtros
const limparFiltros = () => {
  internalFilters.value = {
    busca: '',
    marca: '',
    modelo: '',
    ano: '',
    estado: '',
    localizacao: '',
  };
  isOpen.value = false;
};

// Sincroniza o estado interno com o componente pai
watch(internalFilters, (newFilters) => {
  emit('update:modelValue', newFilters);
}, { deep: true, immediate: true });
</script>

<style scoped>
.ios-slide-enter-active,
.ios-slide-leave-active {
  transition: opacity 0.3s cubic-bezier(0.25, 0.1, 0.25, 1), 
              transform 0.3s cubic-bezier(0.25, 0.1, 0.25, 1);
  transform-origin: top;
}

.ios-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.ios-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
