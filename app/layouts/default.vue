<template>
  <div class="flex flex-col min-h-[100dvh] bg-gray-50 text-gray-900 font-sans">

    <!-- MAIN CONTENT -->
    <main 
      class="flex-1 pt-2 md:pt-0 transition-all bg-gray-200"
      :class="sidebarAberta ? 'md:pl-64' : 'md:pl-20'"
      style="padding-bottom: calc(4rem + env(safe-area-inset-bottom))"
    >
      <div class="md:p-8 max-w-7xl mx-auto min-h-full">
        <slot />
      </div>
    </main>

    <!-- BOTTOM NAV MOBILE -->
    <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 z-50 shadow-2xl pb-[env(safe-area-inset-bottom)]">
      <div class="flex items-center justify-around h-full px-2">

        <!-- Início (Dashboard Operacional) -->
        <NuxtLink
          to="/"
          class="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl transition-all active:scale-95"
          :class="rota === '/' ? 'text-white' : 'text-gray-600'"
        >
          <div
            class="relative flex items-center justify-center w-12 h-8 rounded-2xl transition-all"
            :class="rota === '/' ? 'bg-orange-400/80 shadow-lg scale-110' : 'bg-transparent'"
          >
            <!-- Alterado para Home para combinar com o Desktop -->
            <UIcon name="i-heroicons-home" class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wide"
            :class="rota === '/' ? 'text-orange-400' : 'text-gray-400'"
          >Início</span>
        </NuxtLink>

        <!-- Estoque -->
        <NuxtLink
          to="/estoque"
          class="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl transition-all active:scale-95"
          :class="rota === '/estoque' ? 'text-white' : 'text-gray-600'"
        >
          <div
            class="relative flex items-center justify-center w-12 h-8 rounded-2xl transition-all"
            :class="rota === '/estoque' ? 'bg-orange-400/80 shadow-lg scale-110' : 'bg-transparent'"
          >
            <UIcon name="i-heroicons-archive-box" class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wide"
            :class="rota === '/estoque' ? 'text-orange-400' : 'text-gray-400'"
          >Estoque</span>
        </NuxtLink>

        <!-- Despesas -->
        <NuxtLink
          to="/despesas"
          class="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl transition-all active:scale-95"
          :class="rota === '/despesas' ? 'text-white' : 'text-gray-600'"
        >
          <div
            class="relative flex items-center justify-center w-12 h-8 rounded-2xl transition-all"
            :class="rota === '/despesas' ? 'bg-orange-400/80 shadow-lg scale-110' : 'bg-transparent'"
          >
            <UIcon name="i-heroicons-banknotes" class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wide"
            :class="rota === '/despesas' ? 'text-orange-400' : 'text-gray-400'"
          >Despesa</span>
        </NuxtLink>

        <!-- Financeiro -->
        <NuxtLink
          to="/financeiro"
          class="flex flex-col items-center justify-center gap-1 py-2 px-2 rounded-xl transition-all active:scale-95"
          :class="rota === '/financeiro' ? 'text-white' : 'text-gray-600'"
        >
          <div
            class="relative flex items-center justify-center w-12 h-8 rounded-2xl transition-all"
            :class="rota === '/financeiro' ? 'bg-orange-400/80 shadow-lg scale-110' : 'bg-transparent'"
          >
            <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5" />
          </div>
          <span class="text-[10px] font-bold uppercase tracking-wide"
            :class="rota === '/financeiro' ? 'text-orange-400' : 'text-gray-400'"
          >Finanças</span>
        </NuxtLink>

      </div>
    </nav>

    <!-- SIDEBAR DESKTOP -->
    <button
      @click="toggleSidebar"
      class="hidden md:flex fixed top-4 left-[60px] z-[999] w-8 h-8 bg-gray-800 text-white rounded-full shadow-lg items-center justify-center hover:bg-gray-700 transition-all"
      :class="sidebarAberta ? 'left-[250px]' : 'left-[60px]'"
    >
      <UIcon :name="sidebarAberta ? 'i-heroicons-chevron-left' : 'i-heroicons-chevron-right'" class="w-4 h-4" />
    </button>

    <aside
      class="hidden md:flex flex-col fixed inset-y-0 left-0 bg-gray-900 text-white border-r border-gray-800 shadow-lg transition-all duration-300"
      :class="sidebarAberta ? 'w-64' : 'w-20'"
    >
      <!-- LOGO -->
      <div class="h-20 flex items-center px-4 border-b border-gray-800 transition-all">
        <img
          src="/logo.jpg"
          class="rounded-lg object-cover shadow-md transition-all"
          :class="sidebarAberta ? 'w-14 h-14' : 'w-10 h-10 mx-auto'"
        />
        <div v-if="sidebarAberta" class="ml-3">
          <h1 class="text-lg font-bold leading-none">Eli Peças</h1>
          <p class="text-[10px] uppercase text-orange-300 font-bold tracking-wider">Gestão</p>
        </div>
      </div>

      <!-- MENU -->
      <nav class="p-4 flex-1 overflow-y-auto">
        <NuxtLink
          v-for="link in menuStructure[0].links"
          :key="link.to"
          :to="link.to"
          class="flex items-center rounded-lg px-3 py-2 mb-2 text-sm font-medium transition-all hover:bg-gray-700"
          :class="{ '!bg-orange-500 text-white shadow-lg ring-1 scale-[1.03]': $route.path === link.to || ($route.path === '/' && link.to === '/') }"
        >
          <UIcon :name="link.icon" class="w-6 h-6" />
          <span
            v-if="sidebarAberta"
            class="ml-3 transition-opacity"
          >
            {{ link.label }}
          </span>
        </NuxtLink>
      </nav>
    </aside>

  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

/* Sidebar retrátil */
const sidebarAberta = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('sidebarAberta')
  if (saved !== null) {
    sidebarAberta.value = saved === 'true'
  }
})

function toggleSidebar() {
  sidebarAberta.value = !sidebarAberta.value
  // Salvar preferência
  localStorage.setItem('sidebarAberta', sidebarAberta.value.toString())
}

const rota = computed(() => {
  // Ordem de especificidade: sub-rotas primeiro
  if (route.path.startsWith('/financeiro')) return '/financeiro'
  if (route.path.startsWith('/estoque/criar')) return '/estoque/criar'
  if (route.path.startsWith('/estoque')) return '/estoque'
  if (route.path.startsWith('/despesas')) return '/despesas'
  if (route.path === '/') return '/' 
  return route.path
})

const menuStructure = computed(() => [
  {
    label: 'Estoque e Vendas',
    links: [
      { label: 'Início', icon: 'i-heroicons-home', to: '/' },
      { label: 'Estoque Geral', icon: 'i-heroicons-archive-box', to: '/estoque' },
      { label: 'Despesas', icon: 'i-heroicons-banknotes', to: '/despesas' },
      { label: 'Central Financeira', icon: 'i-heroicons-currency-dollar', to: '/financeiro' },
    ]
  },
])
</script>