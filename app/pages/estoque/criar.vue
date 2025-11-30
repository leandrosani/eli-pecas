<template>
  <div class="max-w-4xl mx-auto pb-20 px-4">
    
    <!-- CABEÇALHO -->
    <div class="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
      <UButton 
        to="/estoque" 
        color="white" 
        icon="i-heroicons-arrow-left" 
        square 
        size="lg" 
        class="shadow-md ring-2 ring-gray-200 hover:ring-blue-400 hover:bg-blue-50 w-10 h-10 md:w-12 md:h-12 transition-all active:scale-95 rounded-xl"
      />
      <div>
        <h1 class="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Nova Peça</h1>
        <p class="text-xs md:text-sm text-gray-500 mt-0.5">Preencha os detalhes do produto para adicionar ao estoque.</p>
      </div>
    </div>

    <form @submit.prevent="salvar" class="space-y-5 md:space-y-6">
      
      <!-- CARD PRINCIPAL -->
      <div class="bg-white rounded-xl md:rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        
        <!-- HEADER DO CARD -->
        <div class="px-4 md:px-6 py-4 md:py-5 border-b-2 border-blue-200 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-700 flex items-center gap-3">
          <div class="bg-white/25 backdrop-blur-sm p-2 md:p-2.5 rounded-xl border border-white/30">
            <UIcon name="i-heroicons-cube" class="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h2 class="font-bold text-base md:text-lg text-white">Identificação da Peça</h2>
            <p class="text-xs text-blue-100 mt-0.5">Informações essenciais do produto</p>
          </div>
        </div>
        
        <!-- CORPO DO FORMULÁRIO -->
        <div class="p-4 md:p-6 space-y-5 md:space-y-6">
          
          <!-- Linha 1: Nome e Lado -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-tag" class="w-4 h-4 text-blue-600" />
                Nome da Peça 
                <span class="text-red-500">*</span>
              </label>
              <UInput 
                v-model="form.nome" 
                @input="form.nome = form.nome.toUpperCase()"
                size="lg" 
                placeholder="Ex: FAROL GOL" 
                autofocus 
                class="w-full"
                :ui="{ 
                  base: 'h-12 focus:ring-2 focus:ring-blue-500 border-2 border-gray-300 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 uppercase'
                }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-arrows-right-left" class="w-4 h-4 text-blue-600" />
                Lado 
                <span class="text-red-500">*</span>
              </label>
              <select 
                v-model="form.marca" 
                class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase"
              >
                <option v-for="opt in listaLados" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </div>
          </div>

          <!-- Linha 2: Modelo, Ano, Condição -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-truck" class="w-4 h-4 text-blue-600" />
                Modelo do Carro
              </label>
              <UInput 
                v-model="form.modelo" 
                @input="form.modelo = form.modelo.toUpperCase()"
                size="lg" 
                placeholder="Ex: VOLKSWAGEN"
                class="w-full"
                :ui="{ 
                  base: 'h-12 focus:ring-2 focus:ring-blue-500 border-2 border-gray-300 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 uppercase'
                }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-blue-600" />
                Ano
              </label>
              <UInput 
                v-model="form.ano" 
                size="lg" 
                type="text"
                placeholder="2020 ou 2015/2018"
                maxlength="9"
                class="w-full"
                :ui="{ 
                  base: 'h-12 focus:ring-2 focus:ring-blue-500 border-2 border-gray-300 rounded-xl font-medium text-gray-900 placeholder:text-gray-400'
                }"
              />
              <p class="text-[10px] text-gray-500 mt-1 flex items-center gap-1">
                <UIcon name="i-heroicons-information-circle" class="w-3 h-3" />
                Use "/" para range: 2015/2018
              </p>
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-blue-600" />
                Condição
              </label>
              <select 
                v-model="form.estado" 
                class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase"
              >
                <option v-for="item in listaCondicao" :key="item" :value="item">
                  {{ item }}
                </option>
              </select>
            </div>
          </div>

          <!-- Linha 3: Preço e Quantidade -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4 text-green-600" />
                Preço de Venda (R$) 
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">R$</span>
                <UInput 
                  v-model="form.preco" 
                  size="lg" 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  class="w-full"
                  :ui="{ 
                    base: 'h-12 focus:ring-2 focus:ring-green-500 border-2 border-gray-300 rounded-xl font-bold text-gray-900 placeholder:text-gray-400 pl-12'
                  }"
                />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-cube-transparent" class="w-4 h-4 text-orange-600" />
                Quantidade em Estoque
              </label>
              <UInput 
                v-model="form.quantidade" 
                size="lg" 
                type="number"
                placeholder="1"
                class="w-full"
                :ui="{ 
                  base: 'h-12 focus:ring-2 focus:ring-orange-500 border-2 border-gray-300 rounded-xl font-bold text-gray-900 placeholder:text-gray-400'
                }"
              />
            </div>
          </div>

          <!-- Linha 4: Observações -->
          <div class="space-y-2">
            <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-purple-600" />
              Observações / Localização no Estoque
            </label>
            <div class="relative">
              <textarea 
                v-model="form.detalhes" 
                @input="form.detalhes = form.detalhes.toUpperCase()"
                class="block p-4 w-full text-sm text-gray-900 bg-white rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all hover:border-gray-400 font-medium uppercase" 
                rows="4" 
                placeholder="Ex: A-1-001"
              ></textarea>
              <div class="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                {{ form.detalhes.length }}/500
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- CARD DE RESUMO -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl md:rounded-2xl p-4 md:p-5 border-2 border-blue-200">
        <div class="flex items-start gap-3">
          <div class="bg-blue-600 p-2 rounded-lg">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="font-bold text-sm text-blue-900 mb-1">Dica de Cadastro</h3>
            <p class="text-xs text-blue-700 leading-relaxed">
              Preencha o máximo de informações possível para facilitar a busca e identificação da peça no estoque. 
              O campo de observações é ideal para anotar a localização física.
            </p>
          </div>
        </div>
      </div>

      <!-- BOTÕES DE AÇÃO -->
      <div class="flex flex-col-reverse md:flex-row items-stretch md:items-center justify-end gap-3 md:gap-4 pt-2">
        <UButton 
          to="/estoque" 
          variant="ghost" 
          color="gray" 
          size="lg" 
          class="w-full md:w-auto hover:bg-red-50 hover:text-red-600 transition-all font-bold rounded-xl border-2 border-transparent hover:border-red-200"
        >
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          Cancelar
        </UButton>

        <UButton 
          type="submit" 
          size="lg" 
          :loading="loading" 
          :disabled="loading"
          class="w-full md:w-auto cursor-pointer bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all font-bold rounded-xl px-8 active:scale-[0.98] disabled:opacity-50"
        >
          <UIcon v-if="!loading" name="i-heroicons-check-circle" class="w-5 h-5" />
          {{ loading ? 'Salvando...' : 'Salvar Produto' }}
        </UButton>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const router = useRouter()
const loading = ref(false)

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

const form = reactive({
  nome: '',
  marca: 'LADO DIREITO',
  modelo: '',
  ano: '',
  preco: undefined,
  quantidade: 1,
  estado: 'SEM-DETALHE',
  detalhes: ''
})

async function salvar() {
  if (!form.nome || !form.preco) {
    alert('⚠️ Por favor, preencha o Nome e o Preço da peça.')
    return
  }

  // Validação do formato de ano (aceita: 2020 OU 2015/2018)
  if (form.ano && !/^\d{4}(\/\d{4})?$/.test(form.ano)) {
    alert('⚠️ Formato de ano inválido. Use: 2020 ou 2015/2018')
    return
  }
  
  loading.value = true
  try {
    // Garante que tudo salva em maiúscula
    const payload = {
      ...form,
      nome: form.nome.toUpperCase(),
      modelo: form.modelo.toUpperCase(),
      detalhes: form.detalhes.toUpperCase()
    }
    
    await $fetch('/api/pecas', { method: 'POST', body: payload })
    alert('✅ Peça cadastrada com sucesso!')
    router.push('/estoque')
  } catch (e) {
    alert('❌ Erro ao salvar peça. Tente novamente.')
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>
