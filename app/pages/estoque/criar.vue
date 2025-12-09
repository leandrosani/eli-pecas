<template>
  <div class="max-w-4xl mx-auto pb-6 px-4">
    <form @submit.prevent="salvar" class="space-y-5 md:space-y-6">
      
      <!-- CARD PRINCIPAL -->
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

        <h1 class="font-semibold md:hidden text-xl text-black"><span class="text-2xl">📦 </span>Adicionar Peça</h1>

        <h1 class="mr-2 hidden md:block text-2xl font-bold text-gray-900 tracking-tight"><span class="text-3xl">➕ </span>Adicionar Peça</h1>
      </div>
      <div class= "mb-6 mt-3 border border-gray-200 shadow-sm w-[100%]"></div>

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
                autofocus 
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
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
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
                  base: 'h-12 focus:ring-2 border-2 border-gray-300 rounded-xl font-bold text-gray-900 placeholder:text-gray-400'
                }"
              />
            </div>

            <!--ENDEREÇO-->
            <div class="flex flex-col">
              <label class="block text-xs md:text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-orange-600" />
                Localização
              </label>
              <div class="relative">
                <UInput
                  v-model="form.localizacao"
                  @input="formatarCodigo"
                  size="lg" 
                  placeholder="A-01-04-06"
                  class="w-full"
                  :ui="{ 
                    base: 'h-12 focus:ring-2 border-2 focus:ring-orange-500 border-gray-300 rounded-xl font-bold text-gray-900 placeholder:text-gray-400'
                  }" 
                />
              </div>
            </div>
          </div>

          <!-- Linha 4: Observações e Botões (Desktop) Localização no Estoque-->
          <div>
            <!-- BOTÕES DESKTOP (um em baixo do outro) -->
            <div class="hidden md:flex gap-3 justify-end">
              <UButton 
                type="submit" 
                size="lg" 
                :loading="loading" 
                :disabled="loading"
                class=" max-w-36 flex items-center cursor-pointer bg-gray-600 hover:bg-gray-500 text-white shadow-lg hover:shadow-xl transition-all font-bold rounded-xl px-5 active:scale-[0.98] disabled:opacity-50 justify-center"
              >
                <UIcon v-if="!loading" name="i-heroicons-check-circle" class="w-5 h-5" />
                {{ loading ? 'Salvando...' : 'Salvar' }}
              </UButton>

              <UButton 
                to="/estoque" 
                variant="ghost" 
                color="gray" 
                size="lg" 
                class="max-w-36 flex justify-center items-center hover:bg-red-50 hover:text-red-600 transition-all font-bold rounded-xl border-2 border-red-100 hover:border-red-200"
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
          :loading="loading" 
          :disabled="loading"
          class="flex justify-center items-center w-full cursor-pointer bg-gray-600 text-white shadow-lg hover:shadow-xl transition-all font-bold rounded-xl px-8 active:scale-[0.98] disabled:opacity-50"
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
  "DIANTEIRO",
  "TRASEIRO",
  "DIANTEIRO DIREITO",
  "TRASEIRO ESQUERDO",
]

const listaCondicao = [
  "NOVO",
  "SEM DETALHE",
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
  marca: 'LADO DIREITO',
  modelo: '',
  ano: '',
  preco: undefined,
  quantidade: 1,
  estado: 'SEM DETALHE',
  localizacao: '' as string,
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
  const target = event.target as HTMLInputElement
  
  let valor2 = target.value.toUpperCase()

  valor2 = valor2.replace(/[^A-Z0-9]/g, '')

  let formatado = '';
  // Posição 1: Letra do Setor
  if (valor2.length >= 1) {
        formatado += valor2.substring(0, 1);
    }

  // Posição 2: Estante (2 dígitos)
  if (valor2.length >= 2) {
      formatado += '-' + valor2.substring(1, 3);
  }

  // Posição 3: Andar (2 dígitos)
  if (valor2.length >= 4) {
      formatado += '-' + valor2.substring(3, 5);
  }

  // Posição 4: Posição da Peça (2 dígitos)
  if (valor2.length >= 6) {
      formatado += '-' + valor2.substring(5, 7);
  }

  // 3. Atualizar o modelo de dados
  form.localizacao = formatado;

  // 4. Manter o cursor no final (Importante para UX)
  nextTick(() => {
      target.value = formatado;
      target.setSelectionRange(formatado.length, formatado.length);
  });
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
  
  loading.value = true
  try {
    // Garante que tudo salva em maiúscula
    const payload = {
      ...form,
      nome: form.nome.toUpperCase(),
      modelo: form.modelo.toUpperCase(),
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
