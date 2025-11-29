<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    
    <!-- Header Mobile -->
    <header class="md:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 z-40 flex items-center justify-between px-4 shadow-lg">
      <button 
        @click="mobileMenuOpen = true" 
        class="p-2 text-white hover:bg-blue-500/30 rounded-lg active:scale-95 transition-transform"
      >
        <UIcon name="i-heroicons-bars-3" class="w-7 h-7" />
      </button>
      
      <div class="flex items-center gap-2">
        <div class="bg-white text-blue-700 p-1 rounded font-bold text-xs">EP</div>
        <span class="font-bold text-lg text-white">Eli Peças</span>
      </div>
    </header>

    <!-- Overlay Mobile Menu -->
    <div 
      v-if="mobileMenuOpen" 
      class="md:hidden fixed inset-0 bg-gray-900/50 z-50 backdrop-blur-sm transition-opacity"
      @click="mobileMenuOpen = false"
    ></div>

    <!-- Mobile Menu (Abre pela esquerda) -->
    <div 
      class="md:hidden fixed inset-y-0 left-0 w-64 bg-white z-[60] shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col"
      :class="mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-700">
        <span class="font-bold text-lg text-white">Navegação</span>
        <button @click="mobileMenuOpen = false" class="p-2 bg-white/20 rounded-full border border-white/30 shadow-sm text-white">
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex-1 p-4 space-y-3 overflow-y-auto">
        <NuxtLink 
          to="/dashboard" 
          class="flex items-center gap-3 p-3 rounded-xl text-base font-medium text-gray-600 hover:bg-gray-100"
          active-class="bg-blue-600 text-white shadow-lg"
          @click="mobileMenuOpen = false"
        >
          <UIcon name="i-heroicons-squares-2x2" class="w-6 h-6" />
          Visão Geral
        </NuxtLink>

        <NuxtLink 
          to="/estoque" 
          class="flex items-center gap-3 p-3 rounded-xl text-base font-medium text-gray-600 hover:bg-gray-100"
          active-class="bg-blue-600 text-white shadow-lg"
          @click="mobileMenuOpen = false"
        >
          <UIcon name="i-heroicons-archive-box" class="w-6 h-6" />
          Estoque
        </NuxtLink>
      </nav>

      <div class="p-4 border-t border-gray-100 bg-gray-50">
        <button @click="logout" class="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-red-100 text-red-600 font-bold shadow-sm hover:bg-red-50 transition-colors">
          <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-5 h-5" />
          Sair
        </button>
      </div>
    </div>

    <!-- Sidebar Desktop -->
    <aside class="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-30 shadow-sm">
      <div class="h-20 flex items-center px-6 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-700 shadow-md">
            <UIcon name="i-heroicons-wrench-screwdriver" class="w-4 h-4" />
          </div>
          <div>
            <h1 class="font-bold text-lg leading-tight text-white">Eli Peças</h1>
            <p class="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Gestão</p>
          </div>
        </div>
      </div>

      <nav class="flex-1 p-4 space-y-2">
        <div class="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Menu</div>
        
        <NuxtLink 
          to="/dashboard" 
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          active-class="!bg-blue-50 !text-blue-700 !font-bold shadow-sm ring-1 ring-blue-100"
        >
          <UIcon name="i-heroicons-squares-2x2" class="w-5 h-5" />
          Visão Geral
        </NuxtLink>

        <NuxtLink 
          to="/estoque" 
          class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          active-class="!bg-blue-50 !text-blue-700 !font-bold shadow-sm ring-1 ring-blue-100"
        >
          <UIcon name="i-heroicons-archive-box" class="w-5 h-5" />
          Estoque
        </NuxtLink>
      </nav>

      <div class="p-4 m-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-full bg-white border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-gray-900 truncate">{{ user?.name || 'Admin' }}</p>
            <p class="text-[10px] text-green-600 font-bold uppercase">Online</p>
          </div>
        </div>
        <button @click="logout" class="w-full text-xs font-bold text-red-600 hover:text-red-800 py-1 uppercase text-left pl-1 transition-colors">
          Sair do Sistema
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="pt-20 md:pt-0 md:pl-64 min-h-screen transition-all">
      <div class="p-4 md:p-8 max-w-7xl mx-auto">
        <slot />
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()
const mobileMenuOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  mobileMenuOpen.value = false
})

async function logout() {
  mobileMenuOpen.value = false
  await clear()
}
</script>
