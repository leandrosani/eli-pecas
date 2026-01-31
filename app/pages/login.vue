<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <UCard class="w-full max-w-md shadow-2xl rounded-xl">
      <template #header>
        <div class="text-center">
          <h1 class="text-3xl font-bold text-gray-900 mb-2 tracking-tight">Eli Peças</h1>
          <p class="text-gray-500">Acesso por Chave Secreta</p>
        </div>
      </template>

      <div class="flex flex-col gap-5 py-4">
        
        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Seu E-mail</label>
          <UInput v-model="state.email" size="xl" placeholder="admin@elipecas.com" type="email" autocomplete="username" />
        </div>

        <div class="space-y-2">
          <label class="text-sm font-medium text-gray-700">Chave Secreta</label>
          <UInput v-model="state.password" size="xl" placeholder="Sua senha secreta..." type="password" autocomplete="current-password" />
        </div>

        <UButton
          color="black"
          size="xl"
          block
          :loading="loading"
          class="font-medium shadow-md mt-4"
          @click="login"
        >
          Entrar no Sistema
        </UButton>
      </div>

      <template #footer>
        <p class="text-center text-xs text-gray-400">
          Este sistema usa uma chave mestra para acesso.
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'empty' })
const router = useRouter()
const { fetch: refreshSession } = useUserSession()

const loading = ref(false)
const state = reactive({
  email: 'admin@elipecas.com',
  password: ''
})

async function login() {
  loading.value = true
  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: state
    })

    // Sucesso! O problema de redirecionamento é resolvido.
    await refreshSession() 
    router.push('/')

  } catch (error) {
    alert('Erro de login: Chave Secreta ou Email inválidos.')
  } finally {
    loading.value = false
  }
}
</script>