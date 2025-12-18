<template>
  <UModal 
    v-model:open="isOpen" 
    :ui="{ 
      content: 'max-w-5xl md:max-w-5xl w-full md:w-auto bg-transparent shadow-none ring-0 mx-0 md:mx-auto',
      overlay: 'backdrop-blur-sm'
    }"
    :fullscreen="isMobile"
  >
    <template #content>
      <div class="relative h-full flex items-center justify-center w-full">
        
        <!-- Botão de fechar -->
        <button 
          @click="fechar"
          class="absolute top-2 md:-top-12 right-2 md:right-0 z-50 w-10 h-10 md:w-10 md:h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-lg transition-all active:scale-95"
          title="Fechar (ESC)"
        >
          <UIcon name="i-heroicons-x-mark" class="w-6 h-6 text-gray-900" />
        </button>

        <!-- Botão Anterior (Só aparece se tiver +1 foto) -->
        <button 
          v-if="temMaisDeUmaFoto"
          @click.stop="anterior"
          class="absolute left-2 md:-left-16 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-95 border border-white/30"
        >
          <UIcon name="i-heroicons-chevron-left" class="w-8 h-8" />
        </button>
        
        <!-- Container da imagem -->
        <div class="relative bg-black/90 md:rounded-xl overflow-hidden w-full h-full md:h-auto flex items-center justify-center">
          <transition 
            enter-active-class="transition-opacity duration-200"
            enter-from-class="opacity-0"
            enter-to-class="opacity-100"
            leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100"
            leave-to-class="opacity-0"
            mode="out-in"
          >
            <img 
              v-if="fotoAtual" 
              :key="fotoAtual"
              :src="fotoAtual" 
              alt="Foto ampliada"
              class="w-full h-auto max-h-screen md:max-h-[85vh] object-contain select-none"
              @click.stop
            />
          </transition>
          
          <!-- Contador -->
          <div v-if="temMaisDeUmaFoto" class="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 px-3 py-1 rounded-full text-white text-xs font-bold backdrop-blur-sm border border-white/20">
            {{ indiceAtual + 1 }} / {{ listaFotos.length }}
          </div>

          <!-- ✨ MINIATURAS (THUMBNAILS) -->
          <div 
            v-if="temMaisDeUmaFoto && listaFotos.length > 1" 
            class="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 p-2 bg-black/60 rounded-lg backdrop-blur-md border border-white/20 max-w-[90vw] overflow-x-auto scrollbar-hide"
          >
            <button
              v-for="(foto, idx) in listaFotos"
              :key="foto"
              @click.stop="indiceAtual = idx"
              :class="[
                'shrink-0 w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all',
                indiceAtual === idx 
                  ? 'border-white scale-110 shadow-lg' 
                  : 'border-white/30 hover:border-white/60 opacity-70 hover:opacity-100'
              ]"
            >
              <img 
                :src="foto" 
                :alt="`Foto ${idx + 1}`" 
                class="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>

        <!-- Botão Próximo -->
        <button 
          v-if="temMaisDeUmaFoto"
          @click.stop="proximo"
          class="absolute right-2 md:-right-16 z-40 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-md flex items-center justify-center text-white transition-all active:scale-95 border border-white/30"
        >
          <UIcon name="i-heroicons-chevron-right" class="w-8 h-8" />
        </button>
        
        <!-- Dica de fechar (desktop) -->
        <div class="hidden md:block absolute -bottom-10 left-1/2 -translate-x-1/2 text-white text-sm font-medium opacity-75">
          Pressione ESC para fechar | Setas para navegar | Clique na miniatura para visualizar
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  modelValue: boolean
  fotoUrl?: string | null   // Foto clicada ou inicial
  fotos?: string[]          // ✅ LISTA COMPLETA DE FOTOS (fotosExtras)
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const indiceAtual = ref(0)

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// ✅ Computa a lista final de fotos
const listaFotos = computed(() => {
  if (props.fotos && props.fotos.length > 0) return props.fotos
  return props.fotoUrl ? [props.fotoUrl] : []
})

const fotoAtual = computed(() => listaFotos.value[indiceAtual.value])
const temMaisDeUmaFoto = computed(() => listaFotos.value.length > 1)

// ✅ Quando abre o modal, sincroniza com a foto clicada
watch(() => props.modelValue, (aberto) => {
  if (aberto && props.fotoUrl && props.fotos) {
    const idx = props.fotos.findIndex(f => f === props.fotoUrl)
    indiceAtual.value = idx !== -1 ? idx : 0
  } else if (aberto) {
    indiceAtual.value = 0
  }
})

function proximo() {
  if (!temMaisDeUmaFoto.value) return
  indiceAtual.value = (indiceAtual.value + 1) % listaFotos.value.length
}

function anterior() {
  if (!temMaisDeUmaFoto.value) return
  indiceAtual.value = (indiceAtual.value - 1 + listaFotos.value.length) % listaFotos.value.length
}

function fechar() {
  isOpen.value = false
}

// Controles de Teclado e Mobile
const isMobile = ref(false)

onMounted(() => {
  isMobile.value = window.innerWidth < 768
  const handleResize = () => { isMobile.value = window.innerWidth < 768 }
  window.addEventListener('resize', handleResize)
  
  const handleKeydown = (e: KeyboardEvent) => {
    if (!isOpen.value) return
    if (e.key === 'Escape') fechar()
    if (e.key === 'ArrowRight') proximo()
    if (e.key === 'ArrowLeft') anterior()
  }
  window.addEventListener('keydown', handleKeydown)
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleKeydown)
  })
})
</script>

<style scoped>
/* Esconde a scrollbar das miniaturas mantendo funcionalidade */
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
