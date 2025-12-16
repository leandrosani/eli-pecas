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

        <h1 class="mr-2 hidden md:block text-2xl font-bold text-gray-900 tracking-tight"><span class="text-3xl">✏️ </span>Editar Peça</h1>

        <h1 class="font-semibold md:hidden text-xl text-black"><span class="text-2xl">✏️ </span>Editar Peça</h1>
      </div>

      <div class="mb-6 mt-3 border border-gray-200 shadow-sm w-full"></div>
      
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
          
          <!-- ✨ ÁREA DE DRAG & DROP PROFISSIONAL -->
          <div class="space-y-3 border-b-2 pb-5 border-gray-100">
            <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <UIcon name="i-heroicons-photo" class="w-4 h-4 text-blue-600" />
              Foto da Peça (Capa)
            </label>
            
            <!-- ÁREA DE DRAG & DROP -->
            <div 
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
              :class="[
                'relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden',
                isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-gray-400 bg-gray-50',
                uploading || saving ? 'pointer-events-none opacity-60' : ''
              ]"
              class="min-h-[180px] md:min-h-[200px] flex items-center justify-center"
            >
              <!-- INPUT OCULTO -->
              <input 
                ref="fileInput"
                type="file" 
                @change="handleFileUpload"
                :disabled="saving || uploading"
                accept="image/*"
                class="hidden"
              />

              <!-- ESTADO: SEM FOTO -->
              <div v-if="!form.fotoUrl && !uploading" class="text-center p-6">
                <div 
                  :class="[
                    'w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all',
                    isDragging ? 'bg-blue-100 scale-110' : 'bg-gray-200'
                  ]"
                >
                  <UIcon 
                    :name="isDragging ? 'i-heroicons-arrow-down-tray' : 'i-heroicons-photo'" 
                    :class="[
                      'transition-all',
                      isDragging ? 'w-10 h-10 text-blue-600 animate-bounce' : 'w-8 h-8 md:w-10 md:h-10 text-gray-500'
                    ]" 
                  />
                </div>
                
                <p 
                  :class="[
                    'font-bold mb-1 transition-colors',
                    isDragging ? 'text-blue-600 text-lg' : 'text-gray-700 text-sm md:text-base'
                  ]"
                >
                  {{ isDragging ? '📂 Solte a foto aqui!' : '📸 Arraste uma foto ou clique para selecionar' }}
                </p>
                
                <p class="text-xs md:text-sm text-gray-500 mt-2">
                  Formatos aceitos: JPG, PNG, WEBP (máx. 10MB)
                </p>
              </div>

              <!-- ESTADO: ENVIANDO -->
              <div v-else-if="uploading" class="text-center p-6">
                <div class="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                  <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <p class="font-bold text-blue-600 text-sm md:text-base mb-1">
                  Enviando para a nuvem...
                </p>
                <p class="text-xs text-gray-500">Aguarde alguns instantes</p>
              </div>

              <!-- ESTADO: FOTO CARREGADA -->
              <div v-else-if="form.fotoUrl" class="relative w-full h-full min-h-[180px] md:min-h-[200px] group">
                <img 
                  :src="form.fotoUrl" 
                  alt="Preview da foto" 
                  class="w-full h-full object-cover"
                />
                
                <!-- OVERLAY COM BOTÕES -->
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    type="button"
                    @click.stop="triggerFileInput"
                    class="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-gray-100 transition-all shadow-lg active:scale-95"
                  >
                    <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" />
                    Trocar
                  </button>
                  
                  <button
                    type="button"
                    @click.stop="removerFoto"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg active:scale-95"
                  >
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                    Remover
                  </button>
                </div>

                <!-- BADGE DE SUCESSO -->
                <div class="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
                  Foto carregada
                </div>
              </div>
            </div>

            <!-- FEEDBACK VISUAL ADICIONAL -->
            <div v-if="uploadError" class="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
              <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 flex-shrink-0" />
              <span class="font-medium">{{ uploadError }}</span>
            </div>
          </div>

          
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
                v-model="form.lado" 
                class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase"
              >
                <option v-for="opt in listaLados" :key="opt" :value="opt">
                  {{ opt }}
                </option>
              </select>
            </div>
          </div>

          <!-- Linha 2 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            
            <!-- Montadora -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-truck" class="w-4 h-4 text-gray-600" />
                Montadora
              </label>
              <select 
                v-model="form.montadora" 
                class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase"
              >
                <option value="">SELECIONE</option>
                <option v-for="montadora in listaMontadorasNomes" :key="montadora" :value="montadora">
                  {{ montadora }}
                </option>
              </select>
            </div>

            <!-- Modelo -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-wrench-screwdriver" class="w-4 h-4 text-gray-600" />
                Modelo
              </label>
              <select 
                v-model="form.modelo" 
                :disabled="!form.montadora || modelosFiltrados.length === 0"
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

          <!-- Linha 3 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4 text-green-600" />
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
          </div>

          <!-- Linha 4 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            
            <!-- Localização -->
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-orange-600" />
                Localização
              </label>
              <div class="relative">
                <UInput
                  v-model="form.localizacao"
                  @input="formatarCodigoEnderecamento"
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
                <UIcon name="i-heroicons-chat-bubble-left" class="w-4 h-4 text-gray-600" />
                Endereçamento das fotos:
              </label>
              <div class="relative">
                <UInput 
                  v-model="form.detalhes" 
                  class="w-full" 
                  placeholder="G:\Meu Drive\FARÓIS\etc."
                  :ui="{ 
                    base: 'h-12 focus:ring-2 border-2 focus:ring-orange-500 border-gray-300 rounded-xl font-bold text-gray-900 placeholder:text-gray-400 uppercase tracking-widest'
                  }" 
                />
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <!-- BOTÕES MOBILE/DESKTOP -->
      <div class="flex flex-col md:flex-row-reverse gap-3 pt-2 md:pt-4">
        
        <!-- BOTÃO SALVAR -->
        <UButton 
          type="submit" 
          size="lg" 
          :loading="saving || uploading" 
          :disabled="saving || uploading"
          class="w-full md:w-auto flex items-center cursor-pointer bg-gray-600 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transition-all font-bold rounded-xl px-8 active:scale-[0.98] disabled:opacity-50 justify-center"
        >
          <UIcon v-if="!saving && !uploading" name="i-heroicons-check-circle" class="w-5 h-5" />
          {{ saving ? 'Salvando...' : uploading ? 'Enviando Foto...' : 'Salvar Alterações' }}
        </UButton>

        <!-- BOTÃO CANCELAR -->
        <UButton 
          to="/estoque" 
          variant="ghost" 
          color="gray" 
          size="lg" 
          class="w-full md:w-auto flex justify-center items-center hover:bg-red-50 hover:text-red-600 transition-all font-bold rounded-xl border-2 border-transparent hover:border-red-200"
        >
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          Cancelar
        </UButton>
      </div>

    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, nextTick, watchEffect } from 'vue';
import { useRouter } from 'vue-router';

definePageMeta({ layout: 'default' })
const route = useRoute()
const router = useRouter()
const id = route.params.id
const saving = ref(false)
const uploading = ref(false)
const isDragging = ref(false)
const uploadError = ref('')
const fileInput = ref<HTMLInputElement | null>(null)
const toast = useToast()

// ✅ CONFIGURAÇÕES CLOUDINARY
const CLOUD_NAME = 'dhlllqld0'; 
const UPLOAD_PRESET = 'Eli pecas'; 

// LISTAS FIXAS (Mantidas)
const listaLados = ["LADO DIREITO", "LADO ESQUERDO", "DIANTEIRO", "TRASEIRO", "DIANTEIRO DIREITO", "TRASEIRO ESQUERDO"]
const listaCondicao = ["SEM DETALHE", "1 GARRA RECUPERADA", "DETALHE NA LENTE", "2 GARRAS RECUPERADAS", "3 GARRAS RECUPERADAS", "TODAS GARRAS RECUPERADAS"]

const listaMontadorasCompleta = [
  { nome: 'VOLKSWAGEN', modelos: ['GOL', 'PARATI', 'SAVEIRO', 'VOYAGE', 'FUSCA', 'BRASILIA', 'POLO', 'POLO SEDAN', 'GOLF', 'JETTA', 'PASSAT', 'SANTANA', 'VIRTUS', 'T-CROSS', 'TAOS', 'AMAROK', 'KOMBI'] },
  { nome: 'CHEVROLET', modelos: ['CHEVETTE', 'OPALA', 'OMEGA', 'KADETT', 'IPANEMA', 'CORSA', 'CELTA', 'PRISMA', 'ONIX', 'ONIX PLUS', 'CRUZE', 'VECTRA', 'MONTANA', 'S10', 'BLAZER', 'TRACKER', 'SPIN'] },
  { nome: 'FIAT', modelos: ['147', 'UNO', 'PREMIO', 'ELBA', 'PALIO', 'SIENA', 'STRADA', 'DOBLÒ', 'PUNTO', 'ARGO', 'CRONOS', 'MOBI', 'TORO', 'IDEA', 'TEMPRA', 'MAREA', 'FIORINO'] },
  { nome: 'FORD', modelos: ['ESCORT', 'VERONA', 'FIESTA', 'FOCUS', 'KA', 'ECOSPORT', 'RANGER', 'FUSION', 'MAVERICK (2022+)', 'EDGE'] },
  { nome: 'HYUNDAI', modelos: ['HB20', 'HB20S', 'CRETA', 'AZERA', 'SONATA', 'ELANTRA', 'IX35', 'TUCSON'] },
  { nome: 'TOYOTA', modelos: ['COROLLA', 'COROLLA CROSS', 'HILUX', 'SW4', 'ETIOS', 'YARIS', 'CAMRY'] },
  { nome: 'HONDA', modelos: ['CIVIC', 'CIVIC SI', 'FIT', 'HR-V', 'CR-V', 'CITY', 'WR-V'] },
  { nome: 'NISSAN', modelos: ['MARCH', 'VERSA', 'KICKS', 'SENTRA', 'FRONTIER', 'LIVINA'] },
  { nome: 'RENAULT', modelos: ['CLIO', 'SANDERO', 'LOGAN', 'STEPWAY', 'DUSTER', 'OROCH', 'KWID'] },
  { nome: 'PEUGEOT', modelos: ['205', '206', '207', '208', '2008', '306', '307', '308', '408', '3008'] },
  { nome: 'CITROËN', modelos: ['C3', 'C4', 'C4 LOUNGE', 'C4 CACTUS', 'XSARA', 'AIRCROSS'] },
  { nome: 'JEEP', modelos: ['RENEGADE', 'COMPASS', 'COMMANDER', 'CHEROKEE', 'WRANGLER'] },
  { nome: 'MITSUBISHI', modelos: ['L200', 'PAJERO', 'OUTLANDER', 'ASX', 'ECLIPSE CROSS'] },
  { nome: 'MERCEDES-BENZ', modelos: ['CLASSE A', 'CLASSE C', 'CLASSE E', 'GLA', 'GLC', 'GLE'] },
  { nome: 'BMW', modelos: ['SERIE 1', 'SERIE 3', 'SERIE 5', 'X1', 'X3', 'X5'] },
  { nome: 'AUDI', modelos: ['A3', 'A4', 'A6', 'Q3', 'Q5'] },
  { nome: 'KIA', modelos: ['SPORTAGE', 'CERATO', 'SOUL', 'BONGO'] },
  { nome: 'CHERY / CAOA CHERY', modelos: ['TIGGO 2', 'TIGGO 3X', 'TIGGO 5X', 'TIGGO 7', 'TIGGO 8', 'ARRIZO 5'] },
  { nome: 'JAC MOTORS', modelos: ['T40', 'T50', 'T60', 'J3', 'J5', 'E-JS1'] },
  { nome: 'SUZUKI', modelos: ['VITARA', 'GRAND VITARA', 'JIMNY', 'SWIFT'] }
];

const listaMontadorasNomes = listaMontadorasCompleta.map(m => m.nome);

const form = reactive({
  nome: '', 
  lado: '', 
  modelo: '', 
  montadora: '',
  ano: '', 
  preco: undefined, 
  quantidade: 1, 
  estado: '', 
  localizacao: '' as string,
  detalhes: '',
  fotoUrl: null as string | null,
})

// 1. BUSCAR DADOS
const { data, status } = await useFetch(`/api/pecas/${id}`, { key: `edit-${id}` })

const modelosFiltrados = computed(() => {
  if (!form.montadora) return []
  const montadoraSelecionada = listaMontadorasCompleta.find(m => m.nome === form.montadora)
  return montadoraSelecionada ? montadoraSelecionada.modelos : []
})

watchEffect(() => {
  if (data.value) {
    const p: any = data.value
    const preco = Number(p.preco) || undefined
    
    // Mapeamento da montadora
    let montadoraEncontrada = ''
    if (p.modelo) {
      montadoraEncontrada = listaMontadorasCompleta.find(m => m.modelos.includes(p.modelo))?.nome || ''
    }

    form.nome = p.nome || ''
    form.lado = p.lado || 'LADO DIREITO' 
    form.modelo = p.modelo || ''
    form.montadora = montadoraEncontrada
    form.ano = p.ano || ''
    form.preco = preco
    form.quantidade = p.quantidade || 1
    form.estado = p.estado || 'SEM DETALHE' 
    form.localizacao = p.localizacao || ''
    form.detalhes = p.detalhes || ''
    form.fotoUrl = p.fotoUrl || null
  }
})

watch(() => form.montadora, (newVal, oldVal) => {
  if (newVal !== oldVal) {
    form.modelo = ''
  }
})

// =========================================================
// 🎯 FUNÇÕES DE DRAG & DROP
// =========================================================

function handleDragOver(event: DragEvent) {
  event.preventDefault()
  isDragging.value = true
}

function handleDragLeave(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
}

function handleDrop(event: DragEvent) {
  event.preventDefault()
  isDragging.value = false
  
  const files = event.dataTransfer?.files
  if (files && files.length > 0) {
    processFile(files[0])
  }
}

function triggerFileInput() {
  if (!uploading.value && !saving.value && fileInput.value) {
    fileInput.value.click()
  }
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (file) {
    processFile(file)
  }
}

function removerFoto() {
  form.fotoUrl = null
  uploadError.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// =========================================================
// 📤 PROCESSAMENTO E UPLOAD
// =========================================================

async function processFile(file: File) {
  if (uploading.value || saving.value) return

  // Validações
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

  if (!allowedTypes.includes(file.type)) {
    uploadError.value = 'Formato não suportado. Use JPG, PNG ou WEBP.'
    toast.add({ title: 'Formato inválido', description: uploadError.value, color: 'red', timeout: 4000 })
    return
  }

  if (file.size > maxSize) {
    uploadError.value = 'Arquivo muito grande. Máximo: 10MB.'
    toast.add({ title: 'Arquivo grande demais', description: uploadError.value, color: 'red', timeout: 4000 })
    return
  }

  uploadError.value = ''
  uploading.value = true

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    if (!response.ok) {
      throw new Error(`Cloudinary error: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.secure_url) {
      form.fotoUrl = data.secure_url
      toast.add({ 
        title: '✅ Upload concluído!', 
        description: 'Foto enviada com sucesso.', 
        color: 'green', 
        timeout: 3000 
      })
    } else {
      throw new Error('URL de imagem não recebida.')
    }

  } catch (error) {
    console.error('Erro de Upload:', error)
    uploadError.value = 'Falha ao enviar. Tente novamente.'
    toast.add({ 
      title: 'Erro no upload', 
      description: 'Não foi possível enviar a foto.', 
      color: 'red', 
      timeout: 5000 
    })
  } finally {
    uploading.value = false
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// =========================================================
// LÓGICA DE FORMATAÇÃO E SALVAMENTO
// =========================================================

function formatarCodigoEnderecamento(event: Event) {
    const target = event.target as HTMLInputElement;
    let valor = target.value.toUpperCase();
    
    valor = valor.replace(/[^A-Z0-9]/g, '');

    let formatado = '';
    if (valor.length >= 1) formatado += valor.substring(0, 1);
    if (valor.length >= 2) formatado += '-' + valor.substring(1, 3);
    if (valor.length >= 4) formatado += '-' + valor.substring(3, 5);
    if (valor.length >= 6) formatado += '-' + valor.substring(5, 7);
    
    form.localizacao = formatado;
    
    nextTick(() => {
        target.value = formatado;
        target.setSelectionRange(formatado.length, formatado.length);
    });
}

function formatarAno(event: Event) {
    const input = event.target as HTMLInputElement
    let valor = input.value.replace(/\D/g, '')
    if (valor.length > 4) {
        valor = valor.slice(0, 4) + '/' + valor.slice(4, 8)
    }
    form.ano = valor
}

async function salvar() {
    if (!form.nome || !form.preco) {
        toast.add({ title: 'Atenção', description: 'Preencha Nome e Preço.', color: 'red' })
        return
    }
    if (!form.montadora || !form.modelo) {
        toast.add({ title: 'Atenção', description: 'Selecione a Montadora e o Modelo.', color: 'red' })
        return
    }
    if (form.ano && !/^\d{4}(\/\d{4})?$/.test(form.ano)) {
        toast.add({ title: 'Atenção', description: 'Formato de ano inválido. Use: 2020 ou 2015/2018', color: 'red' })
        return
    }
    if (saving.value || uploading.value) return
    
    saving.value = true
    try {
        const payload = {
            ...form,
            nome: form.nome.toUpperCase(),
            detalhes: form.detalhes.toUpperCase() || null,
            localizacao: form.localizacao.toUpperCase() || null,
            fotoUrl: form.fotoUrl
        }

        await $fetch(`/api/pecas/${id}`, { method: 'PATCH', body: payload })
        
        toast.add({ title: 'Sucesso', description: 'Peça atualizada!', color: 'green' })
        router.push('/estoque')
    } catch (e) { 
        toast.add({ title: 'Erro', description: 'Falha ao atualizar peça.', color: 'red' })
        console.error(e)
    } finally { 
        saving.value = false 
    }
}
</script>
