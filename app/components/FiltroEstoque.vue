<template>
  <div>
    <!-- Botão de Filtro Compacto -->
    <div 
      @click="isOpen = true"
      class="bg-white p-4 rounded-xl border border-gray-300 shadow-sm hover:shadow-md cursor-pointer select-none flex items-center justify-between transition-shadow duration-200"
    >
      <div class="flex items-center gap-3">
        <UIcon name="i-heroicons-funnel" class="w-5 h-5 text-blue-600" />
        <span class="font-bold text-gray-900 text-base">Filtros</span>
        <span v-if="totalFiltros > 0" class="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full min-w-[24px] text-center">
          {{ totalFiltros }}
        </span>
      </div>
      <UIcon name="i-heroicons-adjustments-horizontal" class="w-5 h-5 text-gray-500" />
    </div>

    <!-- Overlay e Slideover -->
    <Teleport to="body">
      <!-- Overlay -->
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
          class="fixed inset-0 bg-black/85 z-[100]"
          style="will-change: opacity;"
        />
      </Transition>

      <!-- Painel Lateral -->
      <Transition
        enter-active-class="transition-transform duration-300 ease-out"
        enter-from-class="translate-x-full"
        enter-to-class="translate-x-0"
        leave-active-class="transition-transform duration-250 ease-in"
        leave-from-class="translate-x-0"
        leave-to-class="translate-x-full"
      >
        <div 
          v-if="isOpen"
          class="rounded-t-3xl fixed right-0 bottom-0 w-full h-145 sm:max-w-sm bg-white shadow-2xl z-[101] flex flex-col"
          style="will-change: transform;"
          @click.stop
        >
          <!-- Header Compacto -->
          <div class="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0 rounded-t-2xl">
            <div class="flex-1">
              <h3 class="font-bold text-black text-base">Filtros</h3>
              <p class="text-xs text-gray-600 mt-0.5">
                {{ totalFiltros > 0 ? `${totalFiltros} ativos` : 'Nenhum ativo' }}
              </p>
            </div>
            <button 
              @click="isOpen = false"
              class="ml-3 w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors duration-150"
            >
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Body com Scroll -->
          <div class="flex-1 overflow-y-auto bg-gray-50 p-3">
            <div class="space-y-3">
              
              <!-- Busca Geral -->
              <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <label for="busca-input" class="text-xs font-bold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <span>🔍</span>
                  <span>Buscar</span>
                </label>
                <input
                  id="busca-input"
                  v-model="internalFilters.busca"
                  type="text"
                  placeholder="Digite para buscar..."
                  class="w-full h-10 bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 placeholder:text-gray-400 transition-colors duration-150"
                />
              </div>

              <!-- Marca / Lado -->
              <div class="flex justify-between gap-1 w-full mb-1">
              <!-- Marca (Modelo no seu caso) -->
                <div class="bg-white flex-1 rounded-lg py-3 px-2 shadow-sm border border-gray-200">
                  <label for="modelo-select" class="text-xs font-bold text-gray-700 mb-1.5 block">
                    Marca
                    <span v-if="internalFilters.modelo" class="text-blue-600 font-normal text-xs ml-1">({{ internalFilters.modelo }})</span>
                  </label>
                  <select 
                    id="modelo-select"
                    v-model="internalFilters.modelo" 
                    :disabled="!opcoesFiltradasDinamicamente.modelos.length"
                    class="w-full h-8 bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 cursor-pointer uppercase font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <option value="">Todas</option>
                    <option v-for="m in opcoesFiltradasDinamicamente.modelos" :key="m" :value="m">
                      {{ m }}
                    </option>
                  </select>
                </div>

                <!-- Lado (Marca no seu caso) -->
                <div class="bg-white flex-1 rounded-lg py-3 px-2 shadow-sm border border-gray-200">
                  <label for="marca-select" class="text-xs font-bold text-gray-700 mb-1.5 block">
                    Lado
                    <span v-if="internalFilters.marca" class="text-blue-600 font-normal text-xs ml-1">({{ internalFilters.marca }})</span>
                  </label>
                  <select 
                    id="marca-select"
                    v-model="internalFilters.marca" 
                    :disabled="!opcoesFiltradasDinamicamente.marcas.length"
                    class="w-full h-8 bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 cursor-pointer uppercase font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
                  >
                    <option value="">Todos</option>
                    <option v-for="m in opcoesFiltradasDinamicamente.marcas" :key="m" :value="m">
                      {{ m }}
                    </option>
                  </select>
                </div>
              </div>

              <!-- Ano -->
              <div class="mb-1 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <label for="ano-select" class="text-xs font-bold text-gray-700 mb-1.5 block">
                  Ano
                  <span v-if="internalFilters.ano" class="text-blue-600 font-normal text-xs ml-1">({{ internalFilters.ano }})</span>
                </label>
                <select 
                  id="ano-select"
                  v-model="internalFilters.ano" 
                  :disabled="!opcoesFiltradasDinamicamente.anos.length"
                  class="w-full h-8 bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 cursor-pointer uppercase font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <option value="">Todos</option>
                  <option v-for="a in opcoesFiltradasDinamicamente.anos" :key="a" :value="a">
                    {{ a }}
                  </option>
                </select>
              </div>

              <!-- Localização -->
              <div class="mb-1 bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <label for="localizacao-select" class="text-xs font-bold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <span>📍</span>
                  <span>Localização</span>
                  <span v-if="internalFilters.localizacao" class="text-blue-600 font-normal text-xs ml-0.5">({{ internalFilters.localizacao }})</span>
                </label>
                <select 
                  id="localizacao-select"
                  v-model="internalFilters.localizacao" 
                  :disabled="!opcoesFiltradasDinamicamente.localizacoes.length"
                  class="w-full h-8 bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 cursor-pointer uppercase font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <option value="">Todas</option>
                  <option v-for="l in opcoesFiltradasDinamicamente.localizacoes" :key="l" :value="l">
                    {{ l }}
                  </option>
                </select>
              </div>

              <!-- Estado/Condição -->
              <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <label for="estado-select" class="text-xs font-bold text-gray-700 mb-1.5 block flex items-center gap-1.5">
                  <span>⭐</span>
                  <span>Condição</span>
                  <span v-if="internalFilters.estado" class="text-blue-600 font-normal text-xs ml-0.5">({{ internalFilters.estado }})</span>
                </label>
                <select 
                  id="estado-select"
                  v-model="internalFilters.estado"
                  :disabled="!opcoesFiltradasDinamicamente.estados.length"
                  class="w-full h-8 bg-white border border-gray-300 text-gray-900 text-xs rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 cursor-pointer uppercase font-semibold disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <option value="">Todos</option>
                  <option v-for="e in opcoesFiltradasDinamicamente.estados" :key="e" :value="e">
                    {{ e }}
                  </option>
                </select>
              </div>

            </div>
          </div>

          <!-- Footer Compacto -->
          <div class="bg-white border-t border-gray-200 p-3 shrink-0">
            <div class="grid grid-cols-2 gap-2">
              <UButton 
                @click="limparFiltros" 
                color="white"
                variant="solid"
                size="md"
                block
                class="font-semibold text-sm h-8 border border-gray-300 hover:bg-gray-50 text-gray-700"
              >
                Limpar
              </UButton>
              
              <UButton 
                @click="aplicarFiltros" 
                size="md"
                block
                class="font-semibold text-sm h-8 bg-blue-600 hover:bg-blue-700 text-white"
              >
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
  },
  estoque: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);

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

// Calcula quantas linhas serão exibidas com os filtros atuais
const linhasFiltradas = computed(() => {
  const lista = props.estoque || [];
  const filtros = internalFilters.value;
  
  const resultado = lista.filter((row: any) => {
    if (filtros.busca) {
      const buscaLower = filtros.busca.toLowerCase();
      const nome = (row.nome || '').toLowerCase();
      const marca = (row.marca || '').toLowerCase();
      const observacoes = (row.observacoes || '').toLowerCase();
      const detalhes = (row.detalhes || '').toLowerCase();
      
      const encontrou = nome.includes(buscaLower) || 
                       marca.includes(buscaLower) || 
                       observacoes.includes(buscaLower) ||
                       detalhes.includes(buscaLower);
      
      if (!encontrou) return false;
    }
    
    if (filtros.marca && row.marca !== filtros.marca) return false;
    if (filtros.modelo && row.modelo !== filtros.modelo) return false;
    if (filtros.ano && row.ano !== filtros.ano) return false;
    if (filtros.localizacao && row.localizacao !== filtros.localizacao) return false;
    if (filtros.estado && row.estado !== filtros.estado) return false;

    return true;
  });

  return resultado.length;
});

// ============================================
// FILTROS DINÂMICOS
// ============================================
const opcoesFiltradasDinamicamente = computed(() => {
  let itensFiltrados = [...(props.estoque || [])];
  
  if (internalFilters.value.busca) {
    const buscaLower = internalFilters.value.busca.toLowerCase();
    itensFiltrados = itensFiltrados.filter((item: any) => {
      const nome = (item.nome || '').toLowerCase();
      const marca = (item.marca || '').toLowerCase();
      const observacoes = (item.observacoes || '').toLowerCase();
      const detalhes = (item.detalhes || '').toLowerCase();
      
      return nome.includes(buscaLower) || 
             marca.includes(buscaLower) || 
             observacoes.includes(buscaLower) ||
             detalhes.includes(buscaLower);
    });
  }
  
  if (internalFilters.value.marca) {
    itensFiltrados = itensFiltrados.filter((item: any) => item.marca === internalFilters.value.marca);
  }
  
  if (internalFilters.value.modelo) {
    itensFiltrados = itensFiltrados.filter((item: any) => item.modelo === internalFilters.value.modelo);
  }
  
  if (internalFilters.value.ano) {
    itensFiltrados = itensFiltrados.filter((item: any) => item.ano === internalFilters.value.ano);
  }
  
  if (internalFilters.value.localizacao) {
    itensFiltrados = itensFiltrados.filter((item: any) => item.localizacao === internalFilters.value.localizacao);
  }
  
  if (internalFilters.value.estado) {
    itensFiltrados = itensFiltrados.filter((item: any) => item.estado === internalFilters.value.estado);
  }
  
  const marcas = new Set<string>();
  const modelos = new Set<string>();
  const anos = new Set<string>();
  const localizacoes = new Set<string>();
  const estados = new Set<string>();
  
  itensFiltrados.forEach((item: any) => {
    if (item.marca) marcas.add(item.marca);
    if (item.modelo) modelos.add(item.modelo);
    if (item.ano) anos.add(item.ano);
    if (item.localizacao) localizacoes.add(item.localizacao);
    if (item.estado) estados.add(item.estado);
  });
  
  return {
    marcas: Array.from(marcas).sort(),
    modelos: Array.from(modelos).sort(),
    anos: Array.from(anos).sort(),
    localizacoes: Array.from(localizacoes).sort(),
    estados: Array.from(estados).sort(),
  };
});

// Aplicar filtros e fechar modal
const aplicarFiltros = () => {
  emit('update:modelValue', { ...internalFilters.value });
  isOpen.value = false;
};

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
  emit('update:modelValue', { ...internalFilters.value });
};

// Sincroniza mudanças externas
watch(() => props.modelValue, (newVal) => {
  internalFilters.value = { ...newVal };
}, { deep: true });
</script>
