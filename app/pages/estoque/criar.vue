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
      <div class="mb-6 mt-3 border border-gray-200 shadow-sm w-[100%]"></div>

      <div class="bg-white rounded-xl md:rounded-2xl shadow-lg border-2 border-gray-200 overflow-hidden">
        
        <!-- HEADER DO CARD -->
        <div class="px-4 md:px-6 py-4 md:py-5 border-b-2 border-gray-200 bg-gray-600 flex items-center gap-3">
          <div class="bg-white/25 backdrop-blur-sm p-2 md:p-2.5 rounded-xl border border-white/30">
            <UIicon name="i-heroicons-cube" class="w-5 h-5 md:w-6 md:h-6 text-white" />
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
                <UIicon name="i-heroicons-tag" class="w-4 h-4 text-gray-600" />
                Nome da Peça 
                <span class="text-red-500">*</span>
              </label>
              <UInput 
                v-model="form.nome" 
                @input="form.nome = form.nome.toUpperCase()"
                size="lg" 
                placeholder="Ex: FAROL / PARACHOQUE / LANTERNA..." 
                autofocus 
                class="w-full"
                :ui="{ 
                  base: 'h-12 focus:ring-2 focus:ring-gray-600 border-2 border-gray-300 rounded-xl font-medium text-gray-900 placeholder:text-gray-400 uppercase'
                }"
              />
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIicon name="i-heroicons-arrows-right-left" class="w-4 h-4 text-gray-600" />
                Lado 
                <span class="text-red-500">*</span>
              </label>
              <select 
                v-model="form.lado" 
                class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase"
              >
                <option v-for="opt in listaLados" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </div>
          </div>

          <!-- Linha 2: Montadora, Modelo (FILTRADO), Condição -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            
            <!-- Montadora (Select) -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIicon name="i-heroicons-truck" class="w-4 h-4 text-gray-600" />
                Montadora
              </label>
              <select 
                v-model="form.marca" 
                class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase"
              >
                <option value="">SELECIONE</option>
                <option v-for="montadora in listaMontadorasNomes" :key="montadora" :value="montadora">
                  {{ montadora }}
                </option>
              </select>
            </div>

            <!-- Modelo (Select FILTRADO) -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIicon name="i-heroicons-wrench-screwdriver" class="w-4 h-4 text-gray-600" />
                Modelo
              </label>
              <select 
                v-model="form.modelo" 
                :disabled="!form.marca || modelosFiltrados.length === 0"
                class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">SELECIONE O MODELO</option>
                <option v-for="modelo in modelosFiltrados" :key="modelo" :value="modelo">
                  {{ modelo }}
                </option>
              </select>
            </div>

            <!-- Condição -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIicon name="i-heroicons-shield-check" class="w-4 h-4 text-gray-600" />
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

          <!-- Linha 3: Preço, Quantidade e Ano -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIicon name="i-heroicons-currency-dollar" class="w-4 h-4 text-green-600" />
                Preço (R$) 
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
                <UIicon name="i-heroicons-cube-transparent" class="w-4 h-4 text-gray-600" />
                Quantidade
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
            
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIicon name="i-heroicons-calendar" class="w-4 h-4 text-gray-600" />
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

          </div>

          <!-- Linha 4: Endereçamento e Observações -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            
            <!-- CAMPO DEDICADO À LOCALIZAÇÃO -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIicon name="i-heroicons-map-pin" class="w-4 h-4 text-orange-600" />
                Localização (A-01-04-06)
              </label>
              <div class="relative">
                <UInput
                  v-model="form.localizacao"
                  @input="formatarCodigo"
                  size="lg" 
                  placeholder="A-01-04-06"
                  maxlength="10"
                  class="w-full"
                  :ui="{ 
                    base: 'h-12 focus:ring-2 border-2 focus:ring-orange-500 border-gray-300 rounded-xl font-bold text-gray-900 placeholder:text-gray-400 uppercase tracking-widest'
                  }" 
                />
              </div>
            </div>

            <!-- Observações (Texto Livre) -->
            <div class="space-y-2 flex-col flex-1">
              <label class="mb-2 text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIicon name="i-heroicons-chat-bubble-left" class="w-4 h-4 text-gray-600" />
                Observações:
              </label>
              <div class="relative">
                <textarea 
                  v-model="form.detalhes" 
                  class="block p-4 w-full text-sm text-gray-900 bg-white rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-gray-500 resize-none transition-all hover:border-gray-400 font-medium uppercase" 
                  rows="3" 
                  placeholder="Detalhes sobre avarias, garantias, etc."
                  maxlength="500"
                ></textarea>
                <div class="absolute bottom-3 right-3 text-xs text-gray-400 font-medium">
                  {{ form.detalhes?.length || 0 }}/500
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <!-- BOTÕES MOBILE/DESKTOP -->
      <div class="flex flex-col md:flex-row-reverse gap-3 pt-2 md:pt-4">
        
        <!-- BOTÃO SALVAR (Principal) -->
        <UButton 
          type="submit" 
          size="lg" 
          :loading="loading" 
          :disabled="loading"
          class="w-full md:w-auto flex items-center cursor-pointer bg-gray-600 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all font-bold rounded-xl px-8 active:scale-[0.98] disabled:opacity-50 justify-center"
        >
          <UIicon v-if="!loading" name="i-heroicons-check-circle" class="w-5 h-5" />
          {{ loading ? 'Salvando...' : 'Salvar Peça no Estoque' }}
        </UButton>

        <!-- BOTÃO CANCELAR -->
        <UButton 
          to="/estoque" 
          variant="ghost" 
          color="gray" 
          size="lg" 
          class="w-full md:w-auto flex justify-center items-center hover:bg-red-50 hover:text-red-600 transition-all font-bold rounded-xl border-2 border-transparent hover:border-red-200"
        >
          <UIicon name="i-heroicons-x-mark" class="w-5 h-5" />
          Cancelar
        </UButton>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, nextTick } from 'vue';

// Define o layout padrão
definePageMeta({ layout: 'default' })

const loading = ref(false)
const toast = useToast()

// ===================================================
// DADOS FIXOS E FILTRAGEM (Montadora, Modelo, Lado, Condição)
// ===================================================

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

const listaMontadorasCompleta = [
  { nome: 'VOLKSWAGEN', modelos: [
    'GOL', 'PARATI', 'SAVEIRO', 'VOYAGE', 'FUSCA', 'BRASILIA', 'POLO',
    'POLO SEDAN', 'GOLF', 'JETTA', 'PASSAT', 'SANTANA', 'VIRTUS', 'T-CROSS',
    'TAOS', 'AMAROK', 'KOMBI'
  ]},

  { nome: 'CHEVROLET', modelos: [
    'CHEVETTE', 'OPALA', 'OMEGA', 'KADETT', 'IPANEMA', 'CORSA',
    'CELTA', 'PRISMA', 'ONIX', 'ONIX PLUS', 'CRUZE', 'VECTRA',
    'MONTANA', 'S10', 'BLAZER', 'TRACKER', 'SPIN'
  ]},

  { nome: 'FIAT', modelos: [
    '147', 'UNO', 'PREMIO', 'ELBA', 'PALIO', 'SIENA', 'STRADA',
    'DOBLÒ', 'PUNTO', 'ARGO', 'CRONOS', 'MOBI', 'TORO', 'IDEA',
    'TEMPRA', 'MAREA', 'FIORINO'
  ]},

  { nome: 'FORD', modelos: [
    'ESCORT', 'VERONA', 'FIESTA', 'FOCUS', 'KA', 'ECOSPORT',
    'RANGER', 'FUSION', 'MAVERICK (2022+)', 'EDGE'
  ]},

  { nome: 'HYUNDAI', modelos: [
    'HB20', 'HB20S', 'CRETA', 'AZERA', 'SONATA', 'ELANTRA', 'IX35', 'TUCSON'
  ]},

  { nome: 'TOYOTA', modelos: [
    'COROLLA', 'COROLLA CROSS', 'HILUX', 'SW4', 'ETIOS', 'YARIS', 'CAMRY'
  ]},

  { nome: 'HONDA', modelos: [
    'CIVIC', 'CIVIC SI', 'FIT', 'HR-V', 'CR-V', 'CITY', 'WR-V'
  ]},

  { nome: 'NISSAN', modelos: [
    'MARCH', 'VERSA', 'KICKS', 'SENTRA', 'FRONTIER', 'LIVINA'
  ]},

  { nome: 'RENAULT', modelos: [
    'CLIO', 'SANDERO', 'LOGAN', 'STEPWAY', 'DUSTER', 'OROCH', 'KWID'
  ]},

  { nome: 'PEUGEOT', modelos: [
    '205', '206', '207', '208', '2008', '306', '307', '308', '408', '3008'
  ]},

  { nome: 'CITROËN', modelos: [
    'C3', 'C4', 'C4 LOUNGE', 'C4 CACTUS', 'XSARA', 'AIRCROSS'
  ]},

  { nome: 'JEEP', modelos: [
    'RENEGADE', 'COMPASS', 'COMMANDER', 'CHEROKEE', 'WRANGLER'
  ]},

  { nome: 'MITSUBISHI', modelos: [
    'L200', 'PAJERO', 'OUTLANDER', 'ASX', 'ECLIPSE CROSS'
  ]},

  { nome: 'MERCEDES-BENZ', modelos: [
    'CLASSE A', 'CLASSE C', 'CLASSE E', 'GLA', 'GLC', 'GLE'
  ]},

  { nome: 'BMW', modelos: [
    'SERIE 1', 'SERIE 3', 'SERIE 5', 'X1', 'X3', 'X5'
  ]},

  { nome: 'AUDI', modelos: [
    'A3', 'A4', 'A6', 'Q3', 'Q5'
  ]},

  { nome: 'KIA', modelos: [
    'SPORTAGE', 'CERATO', 'SOUL', 'BONGO'
  ]},

  { nome: 'CHERY / CAOA CHERY', modelos: [
    'TIGGO 2', 'TIGGO 3X', 'TIGGO 5X', 'TIGGO 7', 'TIGGO 8', 'ARRIZO 5'
  ]},

  { nome: 'JAC MOTORS', modelos: [
    'T40', 'T50', 'T60', 'J3', 'J5', 'E-JS1'
  ]},

  { nome: 'SUZUKI', modelos: [
    'VITARA', 'GRAND VITARA', 'JIMNY', 'SWIFT'
  ]}
];


// Extrai apenas os nomes das montadoras para o SELECT principal
const listaMontadorasNomes = listaMontadorasCompleta.map(m => m.nome);
const router = useRouter()


// Estado inicial do formulário
const form = reactive({
  nome: '',
  marca: '',
  modelo: '', // O Modelo do Carro
  lado: 'LADO DIREITO',
  ano: '',
  preco: undefined,
  quantidade: 1,
  estado: 'SEM DETALHE',
  localizacao: '', // Campo de Endereçamento A-01-04-06
  detalhes: '', // Campo de Observações Livres
})

// Computed para filtrar modelos com base na montadora selecionada (form.montadora)
const modelosFiltrados = computed(() => {
  if (!form.marca) return []
  const montadoraSelecionada = listaMontadorasCompleta.find(m => m.nome === form.marca)
  return montadoraSelecionada ? montadoraSelecionada.modelos : []
})

// Observa a mudança da Montadora. Se a montadora mudar, reseta o modelo.
watch(() => form.marca, (newMontadora, oldMontadora) => {
  if (newMontadora !== oldMontadora) {
    form.modelo = ''
  }
})


// Lógica de formatação do código de endereçamento (A010406 -> A-01-04-06)
function formatarCodigo(event: Event) {
    const target = event.target as HTMLInputElement;
    let valor = target.value.toUpperCase();
    
    // 1. Permitir apenas A-Z e 0-9
    valor = valor.replace(/[^A-Z0-9]/g, '');

    // 2. Aplicar o padrão A-01-01-01 (1-2-2-2)
    let formatado = '';
    if (valor.length >= 1) formatado += valor.substring(0, 1);           // A
    if (valor.length >= 2) formatado += '-' + valor.substring(1, 3);    // 01
    if (valor.length >= 4) formatado += '-' + valor.substring(3, 5);    // 01
    if (valor.length >= 6) formatado += '-' + valor.substring(5, 7);    // 01  <-- CORRETO: usa valor[5..7]

    // 3. Atualizar o v-model e manter cursor no final
    form.localizacao = formatado;

    nextTick(() => {
        target.value = formatado;
        target.setSelectionRange(formatado.length, formatado.length);
    });
}


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


async function salvar() {
  if (!form.nome || !form.preco || !form.marca || !form.modelo) {
    alert('⚠️ Por favor, preencha o Nome, Lado, Montadora e o Preço da peça.')
    return
  }
  
  loading.value = true
  try {
    // Garante que tudo salva em maiúscula
    const payload = {
      // Campos do DB (modelos, marca(lado), nome, etc)
      nome: form.nome.toUpperCase(),
      marca: form.marca.toUpperCase(),
      lado: form.lado.toUpperCase(),
      modelo: form.modelo.toUpperCase(), // Modelo Filtrado
      ano: form.ano || null,
      preco: Number(form.preco),
      quantidade: Number(form.quantidade),
      estado: form.estado,
      
      // Novos campos
      localizacao: form.localizacao.toUpperCase() || null, 
      detalhes: form.detalhes.toUpperCase() || null,
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