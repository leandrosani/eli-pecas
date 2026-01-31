<template>
  <UApp> <!-- AQUI! -->
    <VitePwaManifest />
    <NuxtLoadingIndicator color="#3b82f6" />

    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

  </UApp>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: (titleChunk) => {
    return titleChunk ? `${titleChunk} - Eli Peças` : 'Eli Peças - Controle de Estoque'
  },
  htmlAttrs: {
    lang: 'pt-BR'
  }
})
</script>
