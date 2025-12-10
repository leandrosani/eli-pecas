<template>
  <UModal 
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :prevent-close="processando"
    :overlay="true"
    overlay-class="bg-black/60 backdrop-blur-sm"
  >
    <!-- CONTAINER DO MODAL -->
    <div 
      class="bg-white w-full mx-auto rounded-xl 
             max-w-[380px] p-4 space-y-4
             md:max-w-[480px] md:p-6 md:space-y-6"
    >
      <!-- HEADER -->
      <div class="flex items-center justify-between mb-4 md:mb-6">
        <div class="flex items-center gap-2 md:gap-3">
          <div class="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-full flex items-center justify-center">
            <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5 md:w-6 md:h-6 text-green-600"/>
          </div>
          <h3 class="text-lg md:text-2xl font-bold text-gray-900">Registrar Venda</h3>
        </div>
        <UButton 
          color="gray" 
          variant="ghost" 
          icon="i-heroicons-x-mark-20-solid" 
          @click="fechar"
          size="sm"
          square
          :disabled="processando"
        />
      </div>

      <!-- CONTEÚDO -->
      <div v-if="peca" class="space-y-3 md:space-y-5 max-h-[70vh] overflow-y-auto pr-1">

        <!-- CARD DA PEÇA -->
        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-3 md:p-5 border-2 border-gray-200">
          <div class="flex items-start gap-3 md:gap-4">
            <div class="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <UIcon name="i-heroicons-cube" class="w-6 h-6 md:w-7 md:h-7 text-white"/>
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-gray-900 text-sm md:text-lg mb-1 md:mb-2 leading-tight">{{ peca.nome }}</h4>
              <div class="space-y-1 text-xs md:text-sm">
                <div class="flex items-center gap-1 md:gap-2">
                  <span class="font-semibold text-gray-500">Marca:</span>
                  <span class="font-bold text-gray-900">{{ peca.marca }}</span>
                </div>
                <div class="flex items-center gap-1 md:gap-2">
                  <span class="font-semibold text-gray-500">Lado:</span>
                  <span class="font-bold text-gray-900">{{ peca.lado }}</span>
                </div>
                <div v-if="peca.modelo" class="flex items-center gap-1 md:gap-2">
                  <span class="font-semibold text-gray-500">Modelo:</span>
                  <span class="font-bold text-gray-900">{{ peca.modelo }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- QUANTIDADE DISPONÍVEL -->
        <div class="bg-green-50 border-2 border-green-200 rounded-xl p-3 md:p-4">
          <div class="flex items-center justify-between text-xs md:text-sm">
            <div class="flex items-center gap-1 md:gap-2">
              <UIcon name="i-heroicons-check-circle" class="w-4 h-4 md:w-5 md:h-5 text-green-600"/>
              <span class="font-semibold text-gray-700">Estoque Disponível</span>
            </div>
            <span class="text-lg md:text-2xl font-bold text-green-600">{{ peca.quantidade }} <span class="text-xs md:text-sm">un.</span></span>
          </div>
        </div>

        <!-- INPUT DE QUANTIDADE -->
        <div>
          <label class="block text-xs md:text-sm font-bold text-gray-700 mb-2">Quantidade a Vender</label>
          <div class="flex items-center gap-2 md:gap-3">
            <UButton 
              icon="i-heroicons-minus" 
              color="gray"
              variant="outline"
              size="xl"
              :disabled="quantidade <= 1 || processando"
              @click="quantidade = Math.max(1, quantidade - 1)"
              class="w-10 h-10 md:w-12 md:h-12"
              square
            />
            <UInput 
              v-model.number="quantidade" 
              type="number" 
              :min="1" 
              :max="peca.quantidade"
              size="xl"
              :disabled="processando"
              class="flex-1 text-center text-sm md:text-2xl [&_input]:text-center [&_input]:font-bold"
            />
            <UButton 
              icon="i-heroicons-plus" 
              color="gray"
              variant="outline"
              size="xl"
              :disabled="quantidade >= peca.quantidade || processando"
              @click="quantidade = Math.min(peca.quantidade, quantidade + 1)"
              class="w-10 h-10 md:w-12 md:h-12"
              square
            />
          </div>
        </div>

        <!-- RESUMO DE PREÇO -->
        <div class="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-3 md:p-5 shadow-lg text-xs md:text-sm">
          <div class="space-y-2 md:space-y-3">
            <div class="flex justify-between border-b border-white/20 pb-1 md:pb-3">
              <span class="text-blue-100">Preço Unitário</span>
              <span class="text-white font-bold">{{ formatarDinheiro(peca.preco) }}</span>
            </div>
            <div class="flex justify-between border-b border-white/20 pb-1 md:pb-3">
              <span class="text-blue-100">Quantidade</span>
              <span class="text-white font-bold">{{ quantidade }} un.</span>
            </div>
            <div class="flex justify-between pt-1 md:pt-2">
              <span class="text-white font-bold">Valor Total</span>
              <span class="text-white font-bold text-lg md:text-3xl">{{ formatarDinheiro((peca.preco || 0) * quantidade) }}</span>
            </div>
          </div>
        </div>

        <!-- ALERTA ESTOQUE BAIXO -->
        <div 
          v-if="quantidade === peca.quantidade" 
          class="bg-orange-50 border-l-4 border-orange-500 p-2 md:p-4 rounded-lg text-xs md:text-sm"
        >
          <div class="flex items-center gap-1 md:gap-2">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-4 h-4 md:w-5 md:h-5 text-orange-600"/>
            <p class="font-semibold text-orange-800">
              Atenção! Você está vendendo todo o estoque desta peça.
            </p>
          </div>
        </div>

      </div>

      <!-- BOTÕES DE AÇÃO -->
      <div class="flex flex-col gap-2 md:flex-row md:justify-end">
        <UButton 
          color="gray"
          variant="outline"
          size="lg"
          @click="fechar"
          :disabled="processando"
          class="flex-1 font-semibold py-2 text-sm md:text-base md:py-3"
        >
          Cancelar
        </UButton>
        <UButton 
          color="green" 
          size="lg"
          @click="confirmar" 
          :disabled="processando || quantidade < 1 || quantidade > (peca?.quantidade || 0)"
          :loading="processando"
          class="flex-1 font-bold py-2 text-sm md:text-base md:py-3"
          icon="i-heroicons-check-circle"
        >
          Confirmar Venda
        </UButton>
      </div>

    </div>
  </UModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  peca: any | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'confirmado': []
}>()

// Estado local
const quantidade = ref(1)
const processando = ref(false)

// Reset quantidade ao abrir modal
watch(() => props.modelValue, (isOpen) => {
  if (isOpen) quantidade.value = 1
})

// Funções
function fechar() {
  if (processando.value) return
  emit('update:modelValue', false)
  setTimeout(() => { quantidade.value = 1 }, 300)
}

function confirmar() {
  emit('confirmado', { quantidade: quantidade.value })
}

// Formata moeda
function formatarDinheiro(val: number) { 
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0)
}
</script>

<style scoped>
/* Remove setas do input number */
input[type="number"] {
  -moz-appearance: textfield;
}
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
