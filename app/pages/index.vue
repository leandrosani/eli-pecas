<template>
  <div class="flex items-center justify-center min-h-screen">
    <!-- Feedback visual enquanto redireciona -->
    <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-400" />
  </div>
</template>

<script setup lang="ts">
// O Nuxt cria a rota '/' para este arquivo.
// O middleware global (auth.global.ts) já verifica se o usuário está logado.
// Se estiver logado, ele permite o acesso a esta página.
// Se não estiver logado, o middleware o chuta para o /login.

// Redirecionamos para o /dashboard, que é o destino final.
await navigateTo('/analise'); 
</script>