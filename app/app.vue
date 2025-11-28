<template>
  <div>
    <NuxtLoadingIndicator color="#3b82f6" />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <UNotifications />
  </div>
</template>

<script setup lang="ts">
// Configuração básica de SEO e Título da aba do navegador
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Eli Peças` : 'Eli Peças - Controle de Estoque'
  },
  htmlAttrs: {
    lang: 'pt-BR'
  }
})
</script>