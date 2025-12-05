<template>
  <div class="max-w-4xl mx-auto pb-6 px-4">
    <form @submit.prevent="salvar" class="space-y-5 md:space-y-6">
      
      <!-- CABEÇALHO E BOTÃO VOLTAR -->
      <div class="flex items-center justify-between">
        <UButton 
          to="/despesas" 
          variant="ghost" 
          color="gray" 
          size="md"
          class="flex bg-gray-600 text-white hover:bg-gray-500 transition-all font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          <span class="hidden sm:inline">Voltar</span>
        </UButton>

        <h1 class="font-semibold md:hidden text-xl text-black"><span class="text-2xl">💸 </span>Nova Despesa</h1>

        <h1 class="mr-2 hidden md:block text-2xl font-bold text-gray-900 tracking-tight"><span class="text-3xl">💸 </span>Registrar Despesa</h1>
      </div>

      <!-- CARD PRINCIPAL -->
      <div class="bg-white rounded-xl md:rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        
        <!-- HEADER DO CARD (Cinza Escuro igual ao de Peças) -->
        <div class="px-4 md:px-6 py-4 md:py-5 border-b-2 border-gray-200 bg-gray-600 flex items-center gap-3">
          <div class="bg-white/25 backdrop-blur-sm p-2 md:p-2.5 rounded-xl border border-white/30">
            <UIcon name="i-heroicons-document-minus" class="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h2 class="font-bold text-base md:text-lg text-white">Dados da Despesa</h2>
            <p class="text-xs text-gray-100 mt-0.5">Detalhes do custo ou pagamento</p>
          </div>
        </div>
        
        <!-- CORPO DO FORMULÁRIO -->
        <div class="p-4 md:p-6 space-y-5 md:space-y-6">
          
          <!-- Linha 1: Descrição e Valor -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            
            <!-- Descrição -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-pencil-square" class="w-4 h-4 text-gray-600" />
                Descrição 
                <span class="text-red-500">*</span>
              </label>
              <UInput 
                v-model="form.descricao" 
                size="lg" 
                placeholder="Ex: Compra de Parafusos" 
                autofocus 
                class="w-full"
                :ui="{ 
                  base: 'h-12 focus:ring-2 focus:ring-gray-600 border-2 border-gray-300 rounded-xl font-medium text-gray-900 placeholder:text-gray-400'
                }"
              />
            </div>

            <!-- Valor (R$) -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4 text-red-600" />
                Valor (R$) 
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">R$</span>
                <UInput 
                  v-model="form.valor" 
                  size="lg" 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00"
                  class="w-full"
                  :ui="{ 
                    base: 'h-12 focus:ring-2 focus:ring-red-500 border-2 border-gray-300 rounded-xl font-bold text-gray-900 placeholder:text-gray-400 pl-12'
                  }"
                />
              </div>
            </div>
          </div>

          <!-- Linha 2: Categoria, Pagamento e Data -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            
            <!-- Categoria (Select Manual) -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-tag" class="w-4 h-4 text-gray-600" />
                Categoria
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select 
                  v-model="form.categoria" 
                  class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase pr-10"
                >
                  <option value="" disabled selected>SELECIONE</option>
                  <option v-for="cat in listaCategorias" :key="cat" :value="cat">
                    {{ cat }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
                </div>
              </div>
            </div>

            <!-- Forma de Pagamento (Select Manual) -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-credit-card" class="w-4 h-4 text-gray-600" />
                Pagamento
                <span class="text-red-500">*</span>
              </label>
              <div class="relative">
                <select 
                  v-model="form.formaPagamento" 
                  class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase pr-10"
                >
                  <option value="" disabled selected>SELECIONE</option>
                  <option v-for="pag in listaPagamentos" :key="pag" :value="pag">
                    {{ pag }}
                  </option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                    <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
                </div>
              </div>
            </div>

            <!-- Data (Opcional, padrão Hoje) -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-600" />
                Data
              </label>
              <UInput 
                type="date"
                v-model="form.data" 
                size="lg" 
                class="w-full"
                :ui="{ 
                  base: 'h-12 focus:ring-2 focus:ring-gray-600 border-2 border-gray-300 rounded-xl font-medium text-gray-900'
                }"
              />
            </div>
          </div>

          <!-- Linha 3: Observações e Botões (Desktop) -->
          <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-5">
            
            <!-- Observação -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-chat-bubble-bottom-center-text" class="w-4 h-4 text-orange-600" />
                Observações (Opcional)
              </label>
              <div class="relative">
                <textarea 
                  v-model="form.observacao" 
                  class="block p-4 w-full text-sm text-gray-900 bg-white rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all hover:border-gray-400 font-medium uppercase" 
                  rows="3" 
                  placeholder="Detalhes adicionais..."
                  maxlength="500"
                ></textarea>
                <div class="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                  {{ form.observacao.length }}/500
                </div>
              </div>
            </div>

            <!-- BOTÕES DESKTOP (um em baixo do outro) -->
            <div class="hidden md:flex flex-col gap-3 justify-end">
              <UButton 
                type="submit" 
                size="lg" 
                :loading="loading" 
                :disabled="loading"
                class="flex justify-center items-center cursor-pointer bg-gray-600 hover:bg-gray-500 text-white shadow-lg hover:shadow-xl transition-all font-bold rounded-xl px-8 active:scale-[0.98] disabled:opacity-50"
              >
                <UIcon v-if="!loading" name="i-heroicons-check-circle" class="w-5 h-5" />
                {{ loading ? 'Salvando...' : 'Salvar' }}
              </UButton>

              <UButton 
                to="/despesas" 
                variant="ghost" 
                color="gray" 
                size="lg" 
                class="flex justify-center items-center hover:bg-red-50 hover:text-red-600 transition-all font-bold rounded-xl border-2 border-transparent hover:border-red-200"
              >
                <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
                Cancelar
              </UButton>
            </div>
          </div>

        </div>
      </div>

      <!-- BOTÕES MOBILE (lado a lado, embaixo) -->
      <div class="flex md:hidden flex-col-reverse items-stretch gap-3 pt-2">
        <UButton 
          to="/despesas" 
          variant="ghost" 
          color="gray" 
          size="lg" 
          class="w-full flex justify-center items-center hover:bg-red-50 hover:text-red-600 transition-all font-bold rounded-xl border-2 border-red-400 hover:border-red-800"
        >
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          Cancelar
        </UButton>

        <UButton 
          type="submit" 
          size="lg" 
          :loading="loading" 
          :disabled="loading"
          class="w-full flex justify-center items-center cursor-pointer bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all font-bold rounded-xl px-8 active:scale-[0.98] disabled:opacity-50"
        >
          <UIcon v-if="!loading" name="i-heroicons-check-circle" class="w-5 h-5" />
          {{ loading ? 'Salvando...' : 'Salvar Despesa' }}
        </UButton>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const router = useRouter()
const loading = ref(false)

// LISTAS FIXAS
const listaCategorias = [
  "COMPRA DE LOTE",
  "PEÇAS AVULSAS",
  "MATERIAL DE TRABALHO",
  "GASOLINA / UBER",
  "FERRAMENTAS",
  "REFEIÇÃO EM SERVIÇO",
  "CAIXA / CUSTOS GERAIS"
]

const listaPagamentos = [
  "PIX",
  "CARTÃO (CRÉDITO)",
  "CARTÃO (DÉBITO)",
  "DINHEIRO"
]

// Estado do formulário
const form = reactive({
  descricao: '',
  valor: undefined,
  categoria: '',
  formaPagamento: '',
  data: new Date().toISOString().split('T')[0], // Data de hoje (YYYY-MM-DD)
  observacao: ''
})

async function salvar() {
  // Validação simples
  if (!form.descricao || !form.valor || !form.categoria || !form.formaPagamento) {
    alert('⚠️ Por favor, preencha todos os campos obrigatórios (*).')
    return
  }

  loading.value = true
  try {
    const payload = {
      descricao: form.descricao.toUpperCase(),
      valor: Number(form.valor),
      categoria: form.categoria,
      formaPagamento: form.formaPagamento,
      data: new Date(form.data), // Converte string para Date
      observacao: form.observacao ? form.observacao.toUpperCase() : null
    }
    
    // Envia para a API (Você precisará criar a rota /api/despesas/index.post.ts depois)
    await $fetch('/api/despesas', { method: 'POST', body: payload })
    
    alert('✅ Despesa registrada com sucesso!')
    router.push('/despesas')
  } catch (e: any) {
    alert('❌ Erro ao salvar despesa. Tente novamente.')
    console.error(e)
  } finally {
    loading.value = false
  }
}
</script>