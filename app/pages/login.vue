<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <UCard class="w-full max-w-md shadow-xl">
      <template #header>
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Eli Peças</h1>
          <p class="text-gray-500">Sistema de Controle de Estoque</p>
        </div>
      </template>

      <div class="flex flex-col gap-4 py-4">
        <p class="text-center text-sm text-gray-600 mb-4">
          Para acessar, entre com sua conta do Google.
        </p>

        <UButton
          icon="i-logos-google-icon"
          color="primary"
          variant="solid"
          size="xl"
          block
          class="font-medium shadow-sm hover:bg-gray-50 border border-gray-200 text-gray-700"
          @click="loginComGoogle"
        >
          Entrar com Google
        </UButton>
      </div>

      <template #footer>
        <p class="text-center text-xs text-gray-400">
          Acesso restrito para funcionários autorizados.
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// Define que esta página não usa o layout padrão (ela é tela cheia)
definePageMeta({
  layout: 'empty'
})

// Função que leva o usuário para a rota que criamos no Backend
function loginComGoogle() {
  window.location.href = '/api/auth/google'
}
</script>