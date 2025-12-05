<template>
  <div class="max-w-4xl mx-auto pb-6 px-4">

    <!-- LOADING STATE -->
    <div v-if="status === 'pending'" class="text-center py-16">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin text-gray-600" />
      </div>
      <p class="text-sm text-gray-600 font-medium">Carregando dados da peça...</p>
      <p class="text-xs text-gray-400 mt-1">Aguarde um momento</p>
    </div>

    <form v-else @submit.prevent="salvar" class="space-y-5 md:space-y-6">

      <div class="flex items-center justify-between">
        <UButton 
          to="/estoque" 
          variant="ghost" 
          color="gray" 
          size="md"
          class="flex bg-gray-600 text-white hover:bg-gray-500 transition-all font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400"
        >
          <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
          <span class="hidden sm:inline">Voltar</span>
        </UButton>

        <h1 class="mr-2 hidden md:block text-2xl font-bold text-gray-900 tracking-tight"><span class="text-3xl">✏️ </span>Editar</h1>

        <h1 class="font-semibold md:hidden text-xl text-black"><span class="text-2xl">✏️ </span>Editar</h1>
        
      </div>
      
      <!-- CARD PRINCIPAL -->
      <div class="bg-white rounded-xl md:rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        
        <!-- HEADER DO CARD -->
        <div class="px-4 md:px-6 py-4 md:py-5 border-b-2 border-gray-200 bg-gray-600 flex items-center gap-3">
          <div class="bg-white/25 backdrop-blur-sm p-2 md:p-2.5 rounded-xl border border-white/30">
            <UIcon name="i-heroicons-cube" class="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <div>
            <h2 class="font-bold text-base md:text-lg text-white">Identificação da Peça</h2>
            <p class="text-xs text-gray-100 mt-0.5">Informações essenciais do produto</p>
          </div>
        </div>
        
        <!-- CORPO DO FORMULÁRIO -->
        <div class="p-4 md:p-6 space-y-5 md:space-y-6">
          
          <!-- Linha 1: Nome e Lado -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-tag" class="w-4 h-4 text-gray-600" />
                Nome da Peça 
                <span class="text-red-500">*</span>
              </label>
              <UInput 
                v-model="form.nome" 
                @input="form.nome = form.nome.toUpperCase()"
                size="lg" 
                placeholder="Ex: FAROL GOL" 
                class="w-full"
                :ui="{ 
                  base: 'h-12 focus:ring-2 focus:ring-gray-600 border-2 border-gray-300 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 uppercase'
                }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-arrows-right-left" class="w-4 h-4 text-gray-600" />
                Lado 
                <span class="text-red-500">*</span>
              </label>
              <select 
                v-model="form.marca" 
                class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase"
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
                <UIcon name="i-heroicons-truck" class="w-4 h-4 text-gray-600" />
                Montadora
              </label>
              <select 
                v-model="form.modelo" 
                class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase"
              >
                <option value="">SELECIONE</option>
                <option v-for="montadora in listaMontadoras" :key="montadora" :value="montadora">
                  {{ montadora }}
                </option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-600" />
                Ano
              </label>
              <UInput 
                :model-value="form.ano"
                @input="formatarAno"
                size="lg" 
                type="text"
                placeholder="2020 ou 2015/2018"
                maxlength="9"
                class="w-full"
                :ui="{ 
                  base: 'h-12 focus:ring-2 focus:ring-gray-500 border-2 border-gray-300 rounded-xl font-medium text-gray-900 placeholder:text-gray-400'
                }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-gray-600" />
                Condição
              </label>
              <select 
                v-model="form.estado" 
                class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase"
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
                <UIcon name="i-heroicons-cube-transparent" class="w-4 h-4 text-gray-600" />
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

          <!-- Linha 4: Observações e Botões (Desktop) -->
          <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-5">
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-orange-600" />
                Observações / Localização no Estoque
              </label>
              <div class="relative">
                <textarea 
                  v-model="form.detalhes" 
                  @input="formatarCodigo"
                  class="block p-4 w-full text-sm text-gray-900 bg-white rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all hover:border-gray-400 font-medium uppercase" 
                  rows="3" 
                  placeholder="Ex: A-1-001"
                  maxlength="500"
                ></textarea>
                <div class="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                  {{ form.detalhes?.length || 0 }}/500
                </div>
              </div>
            </div>

            <!-- BOTÕES DESKTOP (um em baixo do outro) -->
            <div class="hidden md:flex flex-col gap-3 justify-end">
              <UButton 
                type="submit" 
                size="lg" 
                :loading="saving" 
                :disabled="saving"
                class="flex items-center cursor-pointer bg-gray-600 hover:bg-gray-500 text-white shadow-lg hover:shadow-xl transition-all font-bold rounded-xl px-8 active:scale-[0.98] disabled:opacity-50 justify-center"
              >
                <UIcon v-if="!saving" name="i-heroicons-check-circle" class="w-5 h-5" />
                {{ saving ? 'Salvando...' : 'Salvar' }}
              </UButton>

              <UButton 
                to="/estoque" 
                variant="ghost" 
                color="gray" 
                size="lg" 
                class="flex items-center hover:bg-red-50 hover:text-red-600 transition-all font-bold rounded-xl border-2 border-transparent hover:border-red-200 justify-center"
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
          to="/estoque" 
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
          :loading="saving" 
          :disabled="saving"
          class="w-full flex justify-center items-center cursor-pointer bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all font-bold rounded-xl px-8 active:scale-[0.98] disabled:opacity-50"
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

const listaMontadoras = [
  "CHEVROLET",
  "VOLKSWAGEN",
  "FIAT",
  "FORD",
  "RENAULT",
  "HYUNDAI",
  "TOYOTA",
  "HONDA",
  "NISSAN",
  "JEEP",
  "PEUGEOT",
  "CITROËN",
  "MITSUBISHI",
  "CAOA CHERY",
  "JAC MOTORS",
  "BYD",
  "VOLVO",
  "BMW",
  "MERCEDES-BENZ",
  "AUDI",
  "LAND ROVER",
  "PORSCHE",
  "KIA",
  "SUBARU",
  "SUZUKI",
  "RAM",
  "MINI",
  "LIFAN",
  "EFFA",
  "IVECO",
  "TROLLER",
  "DODGE",
  "CHRYSLER",
  "SSANGYONG"
]

const form = reactive({
  nome: '', 
  marca: '', 
  modelo: '', 
  ano: '', 
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
    form.ano = p.ano || ''
    form.preco = p.preco
    form.quantidade = p.quantidade || 1
    form.estado = p.estado || 'SEM-DETALHE'
    form.detalhes = p.detalhes || ''
  }
})

// Formatar ano automaticamente (20182020 -> 2018/2020)
function formatarAno(event: Event) {
  const input = event.target as HTMLInputElement
  let valor = input.value.replace(/\D/g, '') // Remove tudo que não é número
  
  if (valor.length > 4) {
    // Adiciona a barra após os 4 primeiros dígitos
    valor = valor.slice(0, 4) + '/' + valor.slice(4, 8)
  }
  
  form.ano = valor
}

// Formatar código (A1001 -> A-1-001)
function formatarCodigo(event: Event) {
  const textarea = event.target as HTMLTextAreaElement
  let valor = textarea.value.toUpperCase()
  
  // Aplicar formatação apenas aos primeiros 7 caracteres
  if (valor.length <= 7) {
    // Remove hífens existentes para reformatar
    valor = valor.replace(/-/g, '')
    
    // Se tem pelo menos 2 caracteres (letra + número)
    if (valor.length >= 2) {
      let formatado = valor[0] // Primeira letra
      
      if (valor.length >= 2) {
        formatado += '-' + valor[1] // Adiciona hífen e segundo caractere
      }
      
      if (valor.length >= 3) {
        formatado += '-' + valor.slice(2) // Adiciona hífen e resto
      }
      
      form.detalhes = formatado
    } else {
      form.detalhes = valor
    }
  } else {
    // Após 7 caracteres, permite escrever livremente
    form.detalhes = valor
  }
}

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

  saving.value = true
  try {
    // Garante que tudo salva em maiúscula
    const payload = {
      ...form,
      nome: form.nome.toUpperCase(),
      modelo: form.modelo.toUpperCase(),
      detalhes: form.detalhes.toUpperCase()
    }

    await $fetch(`/api/pecas/${id}`, { method: 'PATCH', body: payload })
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
