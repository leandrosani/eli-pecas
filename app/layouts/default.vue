<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    
    <!-- Header Mobile com Breadcrumb 
    <header class="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-800 border-b border-black z-40 flex items-center px-4 shadow-lg">-->
      <!-- Botão Voltar (aparece quando NÃO está na home) 
      <button 
        v-if="!isHome"
        @click="voltarParaHome" 
        class="p-2 text-white hover:bg-blue-500/30 rounded-lg active:scale-95 transition-all mr-2"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-6 h-6" />
      </button>-->
      
      <!-- Logo + Título da Página 
      <div class="flex items-center gap-2 flex-1">
        <div v-if="isHome" class="bg-white text-blue-700 p-1 rounded font-bold text-xs">EP</div>
        <span class="font-bold text-lg text-white truncate">{{ paginaAtual }}</span>
      </div>-->

      <!-- Badge de notificação (exemplo) 
      <div class="relative">
        <UIcon name="i-heroicons-bell" class="w-6 h-6 text-white" />
        <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
      </div>
    </header>-->

    <!-- Bottom Navigation Mobile -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-gray-800 border-t border-gray-600 z-50 shadow-2xl pb-[env(safe-area-inset-bottom)]">
      <div class="flex items-center justify-around h-full px-2">
        <!-- Análise e Vendas -->
        <NuxtLink 
          to="/analise" 
          class="flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all active:scale-95"
          :class="rota === '/analise' ? 'text-white' : 'text-gray-600'"
        >
          <div 
            class="relative flex items-center justify-center w-12 h-10 rounded-2xl transition-all"
            :class="rota === '/analise' ? 'bg-orange-400/80 shadow-lg scale-110' : 'bg-transparent'"
          >
            <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wide" :class="rota === '/analise' ? 'text-orange-400' : 'text-gray-400'">
            Análise
          </span>
        </NuxtLink>

        <!-- ESTOQUE (destaque central) -->
        <NuxtLink 
          to="/estoque" 
          class="flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all active:scale-95"
          :class="rota === '/estoque' ? 'text-white' : 'text-gray-600'"
        >
          <div 
            class="relative flex items-center justify-center w-12 h-10 rounded-2xl transition-all"
            :class="rota === '/estoque' ? 'bg-orange-400/80 shadow-lg scale-110' : 'bg-transparent'"
          >
            <UIcon name="i-heroicons-archive-box" class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wide" :class="rota === '/estoque' ? 'text-orange-400' : 'text-gray-400'">
            Estoque
          </span>
        </NuxtLink>

        <!--Despesas-->
        <NuxtLink 
          to="/despesas" 
          class="flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all active:scale-95"
          :class="rota === '/despesas' ? 'text-white' : 'text-gray-600'"
        >
          <div 
            class="relative flex items-center justify-center w-12 h-10 rounded-2xl transition-all"
            :class="rota === '/despesas' ? 'bg-orange-400/80 shadow-lg scale-110' : 'bg-transparent'"
          >
            <UIcon name="i-heroicons-banknotes" class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wide" :class="rota === '/despesas' ? 'text-orange-400' : 'text-gray-400'">
            Despesa
          </span>
        </NuxtLink>

        <!-- Adicionar Peça 
        <NuxtLink 
          to="/estoque/criar" 
          class="flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all active:scale-95"
          :class="rota === '/estoque/criar' ? 'text-blue-600' : 'text-gray-500'"
        >
          <div 
            class="relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all"
            :class="rota === '/estoque/criar' ? 'bg-blue-100 shadow-lg scale-110' : 'bg-transparent'"
          >
            <UIcon name="i-heroicons-plus-circle" class="w-7 h-7" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wide" :class="rota === '/estoque/criar' ? 'text-blue-600' : 'text-gray-400'">
            Adicionar
          </span>
        </NuxtLink>-->

      </div>
    </nav>

    <!-- Sidebar Desktop -->
    <aside class="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white border-r border-gray-200 z-30 shadow-sm">
      <!-- Logo clicável = Home -->
      <NuxtLink 
        to="/analise"
        class="h-20 flex items-center px-6 border-b border-orange-100 bg-gradient-to-r from-gray-900 to-orange-400 cursor-pointer"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-orange-700 shadow-md group-hover:scale-110 transition-transform">
            <UIcon name="i-heroicons-wrench-screwdriver" class="w-4 h-4" />
          </div>
          <div>
            <h1 class="font-bold text-lg leading-tight text-white">Eli Peças</h1>
            <p class="text-[10px] uppercase font-bold text-orange-200 tracking-wider">Gestão</p>
          </div>
        </div>
      </NuxtLink>

      <!-- Links Desktop -->
      <nav class="bg-gray-800 flex-1 p-4 space-y-2 overflow-y-auto">
        <div v-for="(group, index) in menuStructure" :key="index">
          <p v-if="group.label" class="px-3 text-xs font-bold text-white uppercase tracking-widest mb-2 mt-4">
            {{ group.label }}
          </p>
          <NuxtLink 
            v-for="link in group.links"
            :key="link.to"
            :to="link.to" 
            class="mb-2 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-gray-50 hover:bg-gray-600 hover:text-white relative group"
            :class="{ '!bg-gray-600 !text-white !font-bold shadow-lg ring-1 scale-105': $route.path === link.to }"
          >
            <UIcon :name="link.icon" class="w-5 h-5" />
            {{ link.label }}
            <UBadge 
              v-if="link.badge" 
              :label="link.badge" 
              color="red" 
              size="xs" 
              class="ml-auto"
            />
          </NuxtLink>
        </div>
      </nav>

      <!-- User Info... (mantém igual) -->
    </aside>


    <!-- Main Content -->
    <main class="bg-gray-200 pt-2 pb-24 md:pt-0 md:pb-0 md:pl-64 min-h-[100dvh] transition-all" style="padding-bottom: calc(6rem + env(safe-area-inset-bottom))">
      <div class="p-4 md:p-8 max-w-7xl mx-auto bg-gray-200">
        <slot />
      </div>
    </main>


  </div>
</template>

<script setup lang="ts">
const { user, clear } = useUserSession()
const route = useRoute()
const router = useRouter()

// Detecta se está na home
const isHome = computed(() => route.path === '/dashboard')

// Detecta a rota atual para o bottom nav
const rota = computed(() => {
  if (route.path.startsWith('/estoque/criar')) return '/estoque/criar'
  if (route.path.startsWith('/estoque')) return '/estoque'
  if (route.path.startsWith('/analise')) return '/analise'
  return route.path
})

// Nome da página atual
const paginaAtual = computed(() => {
  if (route.path === '/dashboard') return 'Eli Peças'
  if (route.path === '/analise') return 'Análise Financeira'
  if (route.path === '/estoque') return 'Estoque Geral'
  if (route.path === '/estoque/criar') return 'Adicionar Peça'
  if (route.path.startsWith('/estoque/editar/')) return 'Editar Peça'
  return 'Eli Peças'
})

// Estrutura de Menu
const menuStructure = computed(() => [
  {
    label: 'Estoque e Vendas', // ← Renomeado
    links: [
      { label: 'Análise Financeira', icon: 'i-heroicons-chart-bar', to: '/analise' },
      { label: 'Estoque Geral', icon: 'i-heroicons-archive-box', to: '/estoque', badge: '' },
      { label: 'Despesas', icon: 'i-heroicons-banknotes', to: '/despesas', badge: '' },/*
      { label: 'Adicionar Peça', icon: 'i-heroicons-plus-circle', to: '/estoque/criar' },*/
    ]
  },
])


// Voltar para home
function voltarParaHome() {
  router.push('/dashboard')
}

// Logout
async function logout() {
  await clear()
  router.push('/login')
}
</script>
