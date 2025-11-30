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
        <h1 class="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Editar Peça</h1>
        <p class="text-xs md:text-sm text-gray-500 mt-0.5">Atualize as informações do produto no estoque.</p>
      </div>
    </div>

    <!-- LOADING STATE -->
    <div v-if="status === 'pending'" class="text-center py-16">
      <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-blue-600" />
      </div>
      <p class="text-sm text-gray-600 font-medium">Carregando dados da peça...</p>
      <p class="text-xs text-gray-400 mt-1">Aguarde um momento</p>
    </div>

    <form v-else @submit.prevent="salvar" class="space-y-5 md:space-y-6">
      
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
                size="lg" 
                placeholder="Ex: FAROL GOL" 
                class="w-full"
                :ui="{ 
                  base: 'h-12 focus:ring-2 focus:ring-blue-500 border-2 border-gray-300 rounded-xl font-medium text-gray-900 placeholder:text-gray-400'
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
                class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 transition-all hover:border-gray-400 cursor-pointer"
              >
                <option value="LADO DIREITO">LADO DIREITO</option>
                <option value="LADO ESQUERDO">LADO ESQUERDO</option>
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
                size="lg" 
                placeholder="Ex: GOL"
                class="w-full"
                :ui="{ 
                  base: 'h-12 focus:ring-2 focus:ring-blue-500 border-2 border-gray-300 rounded-xl font-medium text-gray-900 placeholder:text-gray-400'
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
                type="number" 
                placeholder="2020"
                class="w-full"
                :ui="{ 
                  base: 'h-12 focus:ring-2 focus:ring-blue-500 border-2 border-gray-300 rounded-xl font-medium text-gray-900 placeholder:text-gray-400'
                }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-blue-600" />
                Condição
              </label>
              <select 
                v-model="form.estado" 
                class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-4 transition-all hover:border-gray-400 cursor-pointer"
              >
                <option value="SEM-DETALHE">SEM-DETALHE</option>
                <option value="1 GARRA RECUPERADA">1 GARRA RECUPERADA</option>
                <option value="DETALHE NA LENTE">DETALHE NA LENTE</option>
                <option value="2 GARRAS RECUPERADAS">2 GARRAS RECUPERADAS</option>
                <option value="3 GARRAS RECUPERADAS">3 GARRAS RECUPERADAS</option>
                <option value="TODAS GARRAS RECUPERADAS">TODAS GARRAS RECUPERADAS</option>
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
                class="block p-4 w-full text-sm text-gray-900 bg-white rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all hover:border-gray-400 font-medium" 
                rows="4" 
                placeholder="Ex: Pequeno risco na lente direita, prateleira B3, caixa azul..."
              ></textarea>
              <div class="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                {{ form.detalhes?.length || 0 }}/500
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- CARD DE DICA (adaptado para edição) -->
      <div class="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl md:rounded-2xl p-4 md:p-5 border-2 border-blue-200">
        <div class="flex items-start gap-3">
          <div class="bg-blue-600 p-2 rounded-lg">
            <UIcon name="i-heroicons-pencil-square" class="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 class="font-bold text-sm text-blue-900 mb-1">Atualizando Informações</h3>
            <p class="text-xs text-blue-700 leading-relaxed">
              Verifique todos os campos antes de salvar. Alterações no preço ou quantidade afetarão os registros de estoque. 
              Use o campo de observações para manter o histórico atualizado da peça.
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
          :loading="saving" 
          :disabled="saving"
          class="w-full md:w-auto cursor-pointer bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all font-bold rounded-xl px-8 active:scale-[0.98] disabled:opacity-50"
        >
          <UIcon v-if="!saving" name="i-heroicons-check-circle" class="w-5 h-5" />
          {{ saving ? 'Salvando...' : 'Salvar Alterações' }}
        </UButton>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const route = useRoute()
const router = useRouter()
const id = route.params.id
const saving = ref(false)

const form = reactive({
  nome: '', 
  marca: '', 
  modelo: '', 
  ano: undefined, 
  preco: undefined, 
  quantidade: 1, 
  estado: '', 
  detalhes: ''
})

const { data, status } = await useFetch(`/api/pecas/${id}`, { key: `edit-${id}` })

watchEffect(() => {
  if (data.value) {
    const p: any = data.value
    form.nome = p.nome || ''
    form.marca = p.marca || 'LADO DIREITO'
    form.modelo = p.modelo || ''
    form.ano = p.ano
    form.preco = p.preco
    form.quantidade = p.quantidade || 1
    form.estado = p.estado || 'SEM-DETALHE'
    form.detalhes = p.detalhes || ''
  }
})

async function salvar() {
  if (!form.nome || !form.preco) {
    alert('⚠️ Por favor, preencha o Nome e o Preço da peça.')
    return
  }

  saving.value = true
  try {
    await $fetch(`/api/pecas/${id}`, { method: 'PATCH', body: form })
    alert('✅ Peça atualizada com sucesso!')
    router.push('/estoque')
  } catch (e) { 
    alert('❌ Erro ao atualizar peça. Tente novamente.')
    console.error(e)
  } finally { 
    saving.value = false 
  }
}
</script>
