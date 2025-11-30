<template>
  <div class="pb-20 relative">

    <!-- CABEÇALHO -->
    <div class="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Bem-vindo(a), {{ user?.name || 'Admin' }}
          </h1>
          <p class="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">
            Seu painel de acesso rápido para gerenciar a loja.
          </p>
        </div>
      </div>
    </div>

    <!-- MENU DE NAVEGAÇÃO -->
    <div class="mt-6 md:mt-8">
      <h2 class="text-sm md:text-base font-bold text-gray-800 mb-3 md:mb-4 uppercase tracking-wide">
        Menu de Navegação
      </h2>
      
      <!-- Grid de cards -->
      <div class="grid grid-cols-3 md:grid-cols-6 gap-2.5 md:gap-4">
        
        <!-- Card 1: Visão Geral -->
        <NuxtLink 
          to="/analise" 
          class="group block bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50 rounded-lg md:rounded-xl border border-blue-200 shadow-sm p-4 md:p-5 text-center transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <div class="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-sm group-hover:shadow-md transition-all">
            <UIcon name="i-heroicons-squares-2x2" class="w-6 h-6 md:w-7 md:h-7 text-blue-600 transition-transform group-hover:scale-110" />
          </div>
          <p class="text-[10px] md:text-xs font-bold text-blue-900 uppercase tracking-wide">Visão Geral</p>
        </NuxtLink>

        <!-- Card 2: Estoque -->
        <NuxtLink 
          to="/estoque" 
          class="group block bg-gradient-to-br from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50 rounded-lg md:rounded-xl border border-green-200 shadow-sm p-4 md:p-5 text-center transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <div class="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-sm group-hover:shadow-md transition-all">
            <UIcon name="i-heroicons-archive-box" class="w-6 h-6 md:w-7 md:h-7 text-green-600 transition-transform group-hover:scale-110" />
          </div>
          <p class="text-[10px] md:text-xs font-bold text-green-900 uppercase tracking-wide">Estoque</p>
        </NuxtLink>

        <!-- Card 3: Adicionar Peça -->
        <NuxtLink 
          to="/estoque/criar" 
          class="group block bg-gradient-to-br from-purple-50 to-purple-100/50 hover:from-purple-100 hover:to-purple-200/50 rounded-lg md:rounded-xl border border-purple-200 shadow-sm p-4 md:p-5 text-center transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <div class="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-sm group-hover:shadow-md transition-all">
            <UIcon name="i-heroicons-plus-circle" class="w-6 h-6 md:w-7 md:h-7 text-purple-600 transition-transform group-hover:scale-110" />
          </div>
          <p class="text-[10px] md:text-xs font-bold text-purple-900 uppercase tracking-wide">Novo Item</p>
        </NuxtLink>

        <!-- Card 4: Relatórios (Exemplo adicional) 
        <NuxtLink 
          to="/relatorios" 
          class="group block bg-gradient-to-br from-orange-50 to-orange-100/50 hover:from-orange-100 hover:to-orange-200/50 rounded-lg md:rounded-xl border border-orange-200 shadow-sm p-4 md:p-5 text-center transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <div class="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-sm group-hover:shadow-md transition-all">
            <UIcon name="i-heroicons-chart-bar" class="w-6 h-6 md:w-7 md:h-7 text-orange-600 transition-transform group-hover:scale-110" />
          </div>
          <p class="text-[10px] md:text-xs font-bold text-orange-900 uppercase tracking-wide">Relatórios</p>
        </NuxtLink>-->

        <!-- Card 5: Configurações 
        <NuxtLink 
          to="/configuracoes" 
          class="group block bg-gradient-to-br from-gray-50 to-gray-100/50 hover:from-gray-100 hover:to-gray-200/50 rounded-lg md:rounded-xl border border-gray-200 shadow-sm p-4 md:p-5 text-center transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <div class="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-sm group-hover:shadow-md transition-all">
            <UIcon name="i-heroicons-cog-6-tooth" class="w-6 h-6 md:w-7 md:h-7 text-gray-600 transition-transform group-hover:scale-110" />
          </div>
          <p class="text-[10px] md:text-xs font-bold text-gray-900 uppercase tracking-wide">Configurações</p>
        </NuxtLink>-->

        <!-- Card 6: Suporte 
        <NuxtLink 
          to="/suporte" 
          class="group block bg-gradient-to-br from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/50 rounded-lg md:rounded-xl border border-red-200 shadow-sm p-4 md:p-5 text-center transition-all hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        >
          <div class="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 md:mb-3 shadow-sm group-hover:shadow-md transition-all">
            <UIcon name="i-heroicons-lifebuoy" class="w-6 h-6 md:w-7 md:h-7 text-red-600 transition-transform group-hover:scale-110" />
          </div>
          <p class="text-[10px] md:text-xs font-bold text-red-900 uppercase tracking-wide">Suporte</p>
        </NuxtLink>-->
        
      </div>
    </div>

    <!-- SEÇÃO DE ATALHOS RÁPIDOS (Opcional) -->
    <div class="mt-6 md:mt-8">
      <h2 class="text-sm md:text-base font-bold text-gray-800 mb-3 md:mb-4 uppercase tracking-wide">
        Ações Rápidas
      </h2>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-4">
        
        <!-- Ação 1: Vender Peça -->
        <NuxtLink to="/estoque" class="bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm p-4 md:p-5 hover:shadow-md transition-all cursor-pointer hover:border-green-300">
          <div class="flex items-center gap-3 md:gap-4">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
              <UIcon name="i-heroicons-currency-dollar" class="w-5 h-5 md:w-6 md:h-6 text-green-600" />
            </div>
            <div>
              <p class="font-bold text-sm md:text-base text-gray-900">Registrar Venda</p>
              <p class="text-xs text-gray-500">Acesso rápido para vendas</p>
            </div>
          </div>
        </NuxtLink>

        <!-- Ação 2: Ver Extrato -->
        <NuxtLink to="/analise" class="bg-white rounded-lg md:rounded-xl border border-gray-200 shadow-sm p-4 md:p-5 hover:shadow-md transition-all hover:border-blue-300 block">
          <div class="flex items-center gap-3 md:gap-4">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
              <UIcon name="i-heroicons-document-text" class="w-5 h-5 md:w-6 md:h-6 text-blue-600" />
            </div>
            <div>
              <p class="font-bold text-sm md:text-base text-gray-900">Ver Extrato Mensal</p>
              <p class="text-xs text-gray-500">Acompanhe as movimentações</p>
            </div>
          </div>
        </NuxtLink>
        
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' });

const { user } = useUserSession();
</script>
