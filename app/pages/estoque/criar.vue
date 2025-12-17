<template>
  <div class="max-w-4xl mx-auto pb-6 px-4">
    <form @submit.prevent="salvar" class="space-y-5 md:space-y-6">
      
      <!-- HEADER + BOTÃO VOLTAR -->
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
      <div class="mb-6 mt-3 border border-gray-200 shadow-sm w-full"></div>

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
        
        <div class="p-4 md:p-6 space-y-5 md:space-y-6">
          
          <!-- UPLOAD DE FOTO COM DRAG & DROP -->
          <div class="space-y-3 border-b-2 pb-5 border-gray-100">
            <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <UIcon name="i-heroicons-photo" class="w-4 h-4 text-blue-600" />
              Foto da Peça (Capa)
            </label>
            
            <div 
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
              :class="[
                'relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden min-h-[180px] md:min-h-[200px] flex items-center justify-center',
                isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-gray-400 bg-gray-50',
                uploading ? 'pointer-events-none opacity-60' : ''
              ]"
            >
              <input 
                ref="fileInput"
                type="file" 
                @change="handleFileUpload"
                :disabled="uploading"
                accept="image/*"
                class="hidden"
              />

              <!-- ESTADO: SEM FOTO -->
              <div v-if="!form.fotoUrl && !uploading" class="text-center p-6">
                <div :class="['w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all', isDragging ? 'bg-blue-100 scale-110' : 'bg-gray-200']">
                  <UIcon :name="isDragging ? 'i-heroicons-arrow-down-tray' : 'i-heroicons-photo'" :class="['transition-all', isDragging ? 'w-10 text-blue-600 animate-bounce' : 'w-8 text-gray-500']" />
                </div>
                <p :class="['font-bold mb-1 transition-colors', isDragging ? 'text-blue-600 text-lg' : 'text-gray-700 text-sm']">
                  {{ isDragging ? '📂 Solte a foto aqui!' : '📸 Arraste uma foto ou clique para selecionar' }}
                </p>
                <p class="text-xs text-gray-500 mt-2">Formatos aceitos: JPG, PNG, WEBP (máx. 10MB)</p>
              </div>

              <!-- ESTADO: ENVIANDO -->
              <div v-else-if="uploading" class="text-center p-6">
                <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                  <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <p class="font-bold text-blue-600 text-sm">Enviando para a nuvem...</p>
              </div>

              <!-- ESTADO: FOTO CARREGADA -->
              <div v-else-if="form.fotoUrl" class="relative w-full h-full group">
                <img :src="form.fotoUrl" alt="Preview" class="w-full h-full object-cover max-h-[300px]" />
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button type="button" @click.stop="triggerFileInput" class="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg active:scale-95">
                    <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" /> Trocar
                  </button>
                  <button type="button" @click.stop="removerFoto" class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2 shadow-lg active:scale-95">
                    <UIcon name="i-heroicons-trash" class="w-4 h-4" /> Remover
                  </button>
                </div>
                <div class="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <UIcon name="i-heroicons-check-circle" class="w-4 h-4" /> Foto carregada
                </div>
              </div>
            </div>
          </div>
          
          <!-- Linha 1: Nome e Lado -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-tag" class="w-4 h-4 text-gray-600" /> Nome da Peça *
              </label>
              <UInput v-model="form.nome" @input="form.nome = form.nome.toUpperCase()" size="lg" placeholder="EX: FAROL" :ui="{ base: 'h-12 border-2 border-gray-300 rounded-xl uppercase font-medium' }" />
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-arrows-right-left" class="w-4 h-4 text-gray-600" /> Lado *
              </label>
              <select v-model="form.lado" class="w-full h-12 border-2 border-gray-300 rounded-xl px-4 focus:ring-2 focus:ring-gray-600 uppercase font-medium">
                <option v-for="opt in listaLados" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <!-- Linha 2: Montadora, Modelo, Condição -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-truck" class="w-4 h-4 text-gray-600" /> Montadora
              </label>
              <select v-model="form.marca" class="w-full h-12 border-2 border-gray-300 rounded-xl px-4 focus:ring-2 focus:ring-gray-600 uppercase font-medium">
                <option value="">SELECIONE</option>
                <option v-for="m in listaMontadorasNomes" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-wrench-screwdriver" class="w-4 h-4 text-gray-600" /> Modelo
              </label>
              <select v-model="form.modelo" :disabled="!form.marca" class="w-full h-12 border-2 border-gray-300 rounded-xl px-4 focus:ring-2 focus:ring-gray-600 disabled:bg-gray-100 uppercase font-medium">
                <option value="">SELECIONE O MODELO</option>
                <option v-for="m in modelosFiltrados" :key="m" :value="m">{{ m }}</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-gray-600" /> Condição *
              </label>
              <select v-model="form.estado" class="w-full h-12 border-2 border-gray-300 rounded-xl px-4 focus:ring-2 focus:ring-gray-600 uppercase font-medium">
                <option v-for="item in listaCondicao" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
          </div>

          <!-- Linha 3: Preço, Quantidade, Ano -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4 text-green-600" /> Preço (R$) *
              </label>
              <UInput v-model="form.preco" type="number" step="0.01" size="lg" placeholder="0,00" :ui="{ base: 'h-12 border-2 border-gray-300 rounded-xl font-bold' }" />
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-cube-transparent" class="w-4 h-4 text-gray-600" /> Quantidade
              </label>
              <UInput v-model="form.quantidade" type="number" size="lg" placeholder="1" :ui="{ base: 'h-12 border-2 border-gray-300 rounded-xl font-bold' }" />
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-600" /> Ano do Carro
              </label>
              <UInput :model-value="form.ano" @input="formatarAno" size="lg" placeholder="2015/2018" maxlength="9" :ui="{ base: 'h-12 border-2 border-gray-300 rounded-xl font-medium' }" />
            </div>
          </div>

          <!-- CAMPOS PARA O FEED LOCALIZAÇÃO E ENDEREÇAMENTO FOTOS (Link e Descrição) -->
          <div class="space-y-4 pt-4 border-t-2 border-gray-100">
            <div class="md:flex justify-between space-y-4 pb-4 border-b-2 border-gray-100">
              <div class="space-y-2">
                <label class="text-xs md:text-sm font-bold text-blue-700 flex items-center gap-1.5">
                  <UIcon name="i-heroicons-link" class="w-4 h-4" /> Link do Produto (Loja/Catálogo)
                </label>
                <UInput 
                  v-model="form.Link" 
                  placeholder="https://..." 
                  size="lg" 
                  :ui="{ base: 'h-12 focus:ring-2 focus:ring-blue-500 border-2 border-blue-200 rounded-xl font-medium' }" 
                />
              </div>

              <div class="space-y-2">
                <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-orange-600" /> Localização (A-01-04-06)
                </label>
                <UInput
                  :model-value="form.localizacao"
                  @update:model-value="formatarCodigo"
                  placeholder="A-01-04-06"
                  maxlength="10"
                  :ui="{ base: 'h-12 border-2 border-gray-300 rounded-xl font-bold uppercase tracking-widest' }"
                />
              </div>

              <div class="space-y-2">
                <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <UIcon name="i-heroicons-folder" class="w-4 h-4 text-gray-600" /> Endereçamento das fotos:
                </label>
                <UInput v-model="form.detalhes" placeholder="G:\Meu Drive\FARÓIS\etc." :ui="{ base: 'h-12 border-2 border-gray-300 rounded-xl font-bold uppercase' }" />
              </div>
            </div>

            <div class="space-y-2 flex flex-col">
              <label class="text-xs md:text-sm font-bold text-blue-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-document-text" class="w-4 h-4" /> Descrição Completa (Obrigatório para o Google/Facebook)
              </label>
              <textarea 
                v-model="form.descricao" 
                rows="4" 
                class="w-full p-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium placeholder:italic"
                placeholder="Ex: Peça original em excelente estado. Possui 2 garras superiores recuperadas..."
              ></textarea>
              <p class="text-[10px] text-gray-400 font-bold uppercase italic mt-1">* Descreva detalhadamente avarias ou garras recuperadas para o cliente.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- BOTÕES DE AÇÃO -->
      <div class="flex flex-col md:flex-row-reverse gap-3 pt-2 md:pt-4">
        <UButton 
          type="submit" 
          size="lg" 
          :loading="loading || uploading" 
          :disabled="loading || uploading"
          class="w-full md:w-auto flex items-center bg-gray-600 hover:bg-gray-800 text-white shadow-lg transition-all font-bold rounded-xl px-8 justify-center"
        >
          <UIcon v-if="!loading && !uploading" name="i-heroicons-check-circle" class="w-5 h-5" />
          {{ loading ? 'Salvando...' : uploading ? 'Enviando Foto...' : 'Salvar Peça no Estoque' }}
        </UButton>

        <UButton to="/estoque" variant="ghost" color="gray" size="lg" class="w-full md:w-auto flex justify-center font-bold rounded-xl border-2 border-transparent hover:bg-red-50 hover:text-red-600 transition-all">
          Cancelar
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue';

definePageMeta({ layout: 'default' })

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const uploading = ref(false)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// ✅ CONFIGURAÇÕES CLOUDINARY
const CLOUD_NAME = 'dhlllqld0'; 
const UPLOAD_PRESET = 'Eli pecas'; 

const listaLados = ["LADO DIREITO", "LADO ESQUERDO", "DIANTEIRO", "TRASEIRO", "DIANTEIRO DIREITO", "TRASEIRO ESQUERDO", "PAR"]

// ✅ LISTA ATUALIZADA DE CONDIÇÕES CONFORME SOLICITADO
const listaCondicao = [
  "Novo",
  "Recondicionado",
  "Usado (estado de novo)",
  "Usado (boas condições)",
  "Usado (condições razoáveis)"
]

// Mock de montadoras
const listaMontadorasCompleta = [
  { nome: 'VOLKSWAGEN', modelos: ['GOL', 'SAVEIRO', 'POLO', 'VIRTUS', 'JETTA', 'AMAROK', 'GOLF', 'FOX', 'T-CROSS', 'UP'] },
  { nome: 'TOYOTA', modelos: ['COROLLA', 'HILUX', 'ETIOS', 'YARIS', 'SW4', 'COROLLA CROSS', 'CAMRY'] },
  { nome: 'CHEVROLET', modelos: ['ONIX', 'PRISMA', 'S10', 'TRACKER', 'CRUZE', 'CELTA', 'CORSA', 'SPIN', 'MONTANA'] },
  { nome: 'FIAT', modelos: ['UNO', 'STRADA', 'ARGO', 'TORO', 'MOBI', 'CRONOS', 'PALIO', 'SIENA', 'PUNTO'] },
  { nome: 'FORD', modelos: ['KA', 'FIESTA', 'ECOSPORT', 'RANGER', 'FOCUS', 'FUSION'] },
  { nome: 'HONDA', modelos: ['CIVIC', 'FIT', 'HR-V', 'CITY', 'WR-V', 'CR-V'] },
  { nome: 'HYUNDAI', modelos: ['HB20', 'HB20S', 'CRETA', 'IX35', 'TUCSON', 'AZERA'] },
  { nome: 'JEEP', modelos: ['RENEGADE', 'COMPASS', 'COMMANDER'] }
];

const listaMontadorasNomes = listaMontadorasCompleta.map(m => m.nome);

const form = reactive({
  nome: '', marca: '', modelo: '', lado: 'LADO DIREITO', ano: '',
  preco: undefined, quantidade: 1, estado: 'Usado (boas condições)', 
  localizacao: '', detalhes: '', fotoUrl: null as string | null,
  descricao: '', // NOVO CAMPO
  Link: ''      // NOVO CAMPO (Mapeado exatamente como no Schema Prisma)
})

const modelosFiltrados = computed(() => {
  if (!form.marca) return []
  const m = listaMontadorasCompleta.find(item => item.nome === form.marca)
  return m ? m.modelos : []
})

watch(() => form.marca, () => { form.modelo = '' })

// FUNÇÕES DE UPLOAD E DRAG & DROP
function handleDragOver(e: DragEvent) { e.preventDefault(); isDragging.value = true }
function handleDragLeave(e: DragEvent) { e.preventDefault(); isDragging.value = false }
function handleDrop(e: DragEvent) {
  e.preventDefault(); isDragging.value = false
  if (e.dataTransfer?.files?.length) processFile(e.dataTransfer.files[0])
}
function triggerFileInput() { if (!uploading.value) fileInput.value?.click() }
function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}
function removerFoto() { form.fotoUrl = null; if (fileInput.value) fileInput.value.value = '' }

async function processFile(file: File) {
  if (uploading.value) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    toast.add({ title: 'Erro', description: 'Formato inválido. Use JPG, PNG ou WEBP.', color: 'red' }); return
  }
  uploading.value = true;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    form.fotoUrl = data.secure_url;
    toast.add({ title: 'Sucesso', description: 'Foto carregada com sucesso!', color: 'green' })
  } catch (e) {
    toast.add({ title: 'Erro', description: 'Falha ao enviar foto.', color: 'red' })
  } finally { uploading.value = false }
}

// FORMATADORES
function formatarCodigo(value: string) {
  if (!value) {
    form.localizacao = ''
    return
  }

  // remove tudo que não for letra ou número
  let v = value.toUpperCase().replace(/[^A-Z0-9]/g, '')

  // máximo: A010406 → 7 caracteres úteis
  v = v.slice(0, 7)

  let f = ''

  if (v.length >= 1) f += v.substring(0, 1)
  if (v.length >= 2) f += '-' + v.substring(1, 3)
  if (v.length >= 4) f += '-' + v.substring(3, 5)
  if (v.length >= 6) f += '-' + v.substring(5, 7)

  form.localizacao = f
}

function formatarAno(e: any) {
  let v = e.target.value.replace(/\D/g, '');
  if (v.length > 4) v = v.slice(0, 4) + '/' + v.slice(4, 8);
  form.ano = v;
}

async function salvar() {
  if (!form.nome || !form.preco || !form.marca || !form.modelo) {
    toast.add({ title: 'Atenção', description: 'Preencha os campos obrigatórios.', color: 'red' }); return
  }
  
  loading.value = true
  try {
    // MAPEAMENTO EXPLÍCITO PARA O BACKEND
    const payload = {
      ...form,
      nome: form.nome.toUpperCase(),
      marca: form.marca.toUpperCase(),
      lado: form.lado.toUpperCase(),
      modelo: form.modelo.toUpperCase(),
      descricao: form.descricao || null,
      localizacao: form.localizacao || null,
      detalhes: form.detalhes?.toUpperCase() || null,
      // O campo Link já está no objeto form com L maiúsculo
    }
    
    await $fetch('/api/pecas', { method: 'POST', body: payload })
    toast.add({ title: 'Sucesso', description: 'Peça cadastrada!', color: 'green' })
    router.push('/estoque')
  } catch (e) {
    toast.add({ title: 'Erro', description: 'Erro ao salvar peça.', color: 'red' })
  } finally { loading.value = false }
}
</script>