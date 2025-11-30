<template>
  <div class="min-h-screen bg-gray-50 text-gray-900 font-sans">
    
    <!-- Header Mobile com Breadcrumb -->
    <header class="md:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 z-40 flex items-center px-4 shadow-lg">
      <!-- Botão Voltar (aparece quando NÃO está na home) -->
      <button 
        v-if="!isHome"
        @click="voltarParaHome" 
        class="p-2 text-white hover:bg-blue-500/30 rounded-lg active:scale-95 transition-all mr-2"
      >
        <UIcon name="i-heroicons-arrow-left" class="w-6 h-6" />
      </button>
      
      <!-- Logo + Título da Página -->
      <div class="flex items-center gap-2 flex-1">
        <div v-if="isHome" class="bg-white text-blue-700 p-1 rounded font-bold text-xs">EP</div>
        <span class="font-bold text-lg text-white truncate">{{ paginaAtual }}</span>
      </div>

      <!-- Badge de notificação (exemplo) -->
      <div class="relative">
        <UIcon name="i-heroicons-bell" class="w-6 h-6 text-white" />
        <span class="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
      </div>
    </header>

    <!-- Bottom Navigation Mobile -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 z-50 shadow-2xl">
      <div class="flex items-center justify-around h-full px-2">
        
        <!-- Análise e Vendas -->
        <NuxtLink 
          to="/analise" 
          class="flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all active:scale-95"
          :class="rota === '/analise' ? 'text-blue-600' : 'text-gray-500'"
        >
          <div 
            class="relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all"
            :class="rota === '/analise' ? 'bg-blue-100 shadow-lg scale-110' : 'bg-transparent'"
          >
            <UIcon name="i-heroicons-chart-bar" class="w-7 h-7" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wide" :class="rota === '/analise' ? 'text-blue-600' : 'text-gray-400'">
            Análise
          </span>
        </NuxtLink>

        <!-- HOME (destaque central) -->
        <NuxtLink 
          to="/dashboard" 
          class="flex flex-col items-center justify-center gap-1 -mt-6 transition-all active:scale-95"
        >
          <div 
            class="flex items-center justify-center w-16 h-16 rounded-2xl shadow-2xl transition-all"
            :class="rota === '/dashboard' ? 'bg-gradient-to-br from-blue-600 to-blue-700 scale-110' : 'bg-gradient-to-br from-gray-400 to-gray-500'"
          >
            <UIcon name="i-heroicons-home" class="w-8 h-8 text-white" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wide mt-1" :class="rota === '/dashboard' ? 'text-blue-600' : 'text-gray-400'">
            Home
          </span>
        </NuxtLink>

        <!-- Estoque Geral -->
        <NuxtLink 
          to="/estoque" 
          class="flex flex-col items-center justify-center gap-1 py-2 px-4 rounded-xl transition-all active:scale-95"
          :class="rota === '/estoque' ? 'text-blue-600' : 'text-gray-500'"
        >
          <div 
            class="relative flex items-center justify-center w-12 h-12 rounded-2xl transition-all"
            :class="rota === '/estoque' ? 'bg-blue-100 shadow-lg scale-110' : 'bg-transparent'"
          >
            <UIcon name="i-heroicons-archive-box" class="w-7 h-7" />
            <!-- Badge exemplo (estoque baixo) -->
            <span v-if="rota !== '/estoque'" class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">5</span>
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wide" :class="rota === '/estoque' ? 'text-blue-600' : 'text-gray-400'">
            Estoque
          </span>
        </NuxtLink>

      </div>
    </nav>

    <!-- Sidebar Desktop (mantém como estava, mas otimizada) -->
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

      <!-- Links Desktop -->
      <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
        <div v-for="(group, index) in menuStructure" :key="index">
          <p v-if="group.label" class="px-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 mt-4">
            {{ group.label }}
          </p>
          <NuxtLink 
            v-for="link in group.links"
            :key="link.to"
            :to="link.to" 
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-gray-600 hover:bg-gray-50 hover:text-gray-900 relative group"
            :class="{ '!bg-blue-50 !text-blue-700 !font-bold shadow-sm ring-1 ring-blue-100': $route.path === link.to }"
          >
            <UIcon :name="link.icon" class="w-5 h-5" />
            {{ link.label }}
            <!-- Badge desktop -->
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

      <!-- User Info Desktop -->
      <div class="p-4 m-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-100 shadow-sm">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-8 h-8 rounded-full bg-white border border-blue-200 flex items-center justify-center font-bold text-xs text-blue-700">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-bold text-gray-900 truncate">{{ user?.name || 'Admin' }}</p>
            <p class="text-[10px] text-green-600 font-bold uppercase flex items-center gap-1">
              <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
        <button @click="logout" class="w-full text-xs font-bold text-red-600 hover:text-red-800 py-1 uppercase text-left pl-1 transition-colors flex items-center gap-1">
          <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
          Sair do Sistema
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="pt-20 pb-24 md:pt-0 md:pb-0 md:pl-64 min-h-screen transition-all">
      <div class="p-4 md:p-8 max-w-7xl mx-auto">
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
  if (route.path.startsWith('/estoque')) return '/estoque'
  if (route.path.startsWith('/analise')) return '/analise'
  return route.path
})

// Nome da página atual
const paginaAtual = computed(() => {
  if (route.path === '/dashboard') return 'Eli Peças'
  if (route.path === '/analise') return 'Análise e Vendas'
  if (route.path === '/estoque') return 'Estoque Geral'
  if (route.path === '/estoque/criar') return 'Adicionar Peça'
  if (route.path.startsWith('/estoque/editar/')) return 'Editar Peça'
  return 'Eli Peças'
})

// Estrutura de Menu
const menuStructure = computed(() => [
  {
    label: 'Sistema',
    links: [
      { label: 'Home', icon: 'i-heroicons-home', to: '/dashboard' },
    ]
  },
  {
    label: 'Estoque e Cadastros',
    links: [
      { label: 'Análise e Vendas', icon: 'i-heroicons-chart-bar', to: '/analise' },
      { label: 'Estoque Geral', icon: 'i-heroicons-archive-box', to: '/estoque', badge: '5' }, // Badge exemplo
      { label: 'Adicionar Peça', icon: 'i-heroicons-plus-circle', to: '/estoque/criar' },
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
