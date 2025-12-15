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
      <div class="relative h-full flex items-center justify-center">
        <!-- Botão de fechar personalizado -->
        <button 
          @click="fechar"
          class="absolute top-2 md:-top-12 right-2 md:right-0 z-50 w-10 h-10 md:w-10 md:h-10 rounded-full bg-white hover:bg-gray-100 flex items-center justify-center shadow-lg transition-all active:scale-95"
          title="Fechar (ESC)"
        >
          <UIcon name="i-heroicons-x-mark" class="w-6 h-6 text-gray-900" />
        </button>
        
        <!-- Container da imagem com fundo -->
        <div class="bg-black/90 md:rounded-xl overflow-hidden w-full h-full md:h-auto flex items-center justify-center">
          <img 
            v-if="fotoUrl" 
            :src="fotoUrl" 
            alt="Foto ampliada"
            class="w-full h-auto max-h-screen md:max-h-[85vh] object-contain"
            @click.stop
          />
        </div>
        
        <!-- Dica de fechar (opcional - só desktop) -->
        <div class="hidden md:block absolute -bottom-10 left-1/2 -translate-x-1/2 text-white text-sm font-medium opacity-75">
          Pressione ESC ou clique fora para fechar
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
  fotoUrl: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => {
    emit('update:modelValue', value)
  }
})

// Detecta se é mobile
const isMobile = ref(false)

onMounted(() => {
  // Verifica se é mobile
  isMobile.value = window.innerWidth < 768
  
  // Atualiza ao redimensionar
  const handleResize = () => {
    isMobile.value = window.innerWidth < 768
  }
  window.addEventListener('resize', handleResize)
  
  const handleEsc = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen.value) {
      fechar()
    }
  }
  window.addEventListener('keydown', handleEsc)
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
    window.removeEventListener('keydown', handleEsc)
  })
})

function fechar() {
  isOpen.value = false
}
</script>
