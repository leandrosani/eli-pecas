<template>
  <div class="max-w-4xl mx-auto pb-20">
    <div class="flex items-center gap-4 mb-8">
      <UButton to="/estoque" color="white" icon="i-heroicons-arrow-left" square size="lg" class="shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 w-10 h-10 hover:bg-gray-300 transition-all"/>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Nova Peça</h1>
        <p class="text-gray-500 text-sm">Preencha os detalhes do produto.</p>
      </div>
    </div>

    <form @submit.prevent="salvar" class="space-y-6">
      
      <!-- SEÇÃO ÚNICA -->
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700 flex items-center gap-3">
          <div class="bg-white/20 p-2 rounded-lg text-white">
            <UIcon name="i-heroicons-cube" class="w-5 h-5" />
          </div>
          <h2 class="font-semibold text-white">Identificação da Peça</h2>
        </div>
        
        <div class="p-6 space-y-5">
          
          <!-- Linha 1: Nome e Lado -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Nome da Peça <span class="text-red-500">*</span></label>
              <UInput 
                v-model="form.nome" 
                size="lg" 
                placeholder="Ex: FAROL GOL" 
                autofocus 
                class="w-full"
                :ui="{ 
                  base: 'h-11 focus:ring-2 focus:ring-blue-400 border border-gray-300 rounded-lg'
                }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Lado <span class="text-red-500">*</span></label>
              <select 
                v-model="form.marca" 
                class="w-full h-11 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-3"
              >
                <option v-for="opt in listaLados" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </div>
          </div>

          <!-- Linha 2: Modelo, Ano, Condição -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Modelo do Carro</label>
              <UInput 
                v-model="form.modelo" 
                size="lg" 
                placeholder="Ex: VOLKSWAGEN"
                class="w-full"
                :ui="{ 
                  base: 'h-11 focus:ring-2 focus:ring-blue-400 border border-gray-300 rounded-lg'
                }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Ano</label>
              <UInput 
                v-model="form.ano" 
                size="lg" 
                type="number" 
                placeholder="2020"
                class="w-full"
                :ui="{ 
                  base: 'h-11 focus:ring-2 focus:ring-blue-400 border border-gray-300 rounded-lg'
                }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Condição</label>
              <select 
                v-model="form.estado" 
                class="w-full h-11 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 px-3"
              >
                <option v-for="item in listaCondicao" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>
            </div>
          </div>

          <!-- Linha 3: Preço e Quantidade -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Preço de Venda (R$) <span class="text-red-500">*</span></label>
              <UInput 
                v-model="form.preco" 
                size="lg" 
                type="number" 
                step="0.01" 
                placeholder="0.00"
                class="w-full"
                :ui="{ 
                  base: 'h-11 focus:ring-2 focus:ring-blue-400 border border-gray-300 rounded-lg'
                }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-sm font-medium text-gray-700">Quantidade</label>
              <UInput 
                v-model="form.quantidade" 
                size="lg" 
                type="number"
                placeholder="1"
                class="w-full"
                :ui="{ 
                  base: 'h-11 focus:ring-2 focus:ring-blue-400 border border-gray-300 rounded-lg'
                }"
              />
            </div>
          </div>

          <!-- Linha 4: Observações (linha completa) -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Observações / Endereço</label>
            <textarea 
              v-model="form.detalhes" 
              class="block p-3 w-full text-sm text-gray-900 bg-white rounded-lg border-2 border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 resize-none" 
              rows="3" 
              placeholder="Descreva detalhes: Ex: Pequeno risco na lente, localização no estoque..."
            ></textarea>
          </div>

        </div>
      </div>

      <!-- BOTÕES -->
      <div class="flex items-center justify-end gap-4 pt-4">
        <UButton 
          to="/estoque" 
          variant="ghost" 
          color="gray" 
          size="lg" 
          class="hover:text-red-400 transition-colors"
        >
          Cancelar
        </UButton>

        <UButton 
          type="submit" 
          color="black" 
          size="lg" 
          :loading="loading" 
          icon="i-heroicons-check-circle"
          class="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all"
        >
          Salvar Produto
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const router = useRouter()
const loading = ref(false)

/* ✔ LISTAS DOS SELECTS */
const listaLados = [
  "LADO DIREITO",
  "LADO ESQUERDO",
]

const listaCondicao = [
  "SEM-DETALHE",
  "1 GARRA RECUPERADA",
  "DETALHE NA LENTE",
  "2 GARRAS RECUPERADAS",
  "3 GARRAS RECUPERADAS",
  "TODAS GARRAS RECUPERADAS"
]

/* FORMULARIO */
const form = reactive({
  nome: '',
  marca: 'SEM-DETALHE',
  modelo: '',
  ano: undefined,
  preco: undefined,
  quantidade: 1,
  estado: 'SEM-DETALHE',
  detalhes: ''
})

async function salvar() {
  if (!form.nome || !form.preco) {
    alert('Preencha Nome e Preço.')
    return
  }
  loading.value = true
  try {
    await $fetch('/api/pecas', { method: 'POST', body: form })
    router.push('/estoque')
  } catch (e) {
    alert('Erro ao salvar.')
  } finally {
    loading.value = false
  }
}
</script>
