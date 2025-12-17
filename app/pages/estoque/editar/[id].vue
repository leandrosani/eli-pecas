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
                <div :class="['w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full flex items-center justify-center transition-all', isDragging ? 'bg-blue-100 scale-110' : 'bg-gray-200']">
                  <UIcon :name="isDragging ? 'i-heroicons-arrow-down-tray' : 'i-heroicons-photo'" :class="['transition-all', isDragging ? 'w-10 h-10 text-blue-600 animate-bounce' : 'w-8 h-8 md:w-10 md:h-10 text-gray-500']" />
                </div>
                <p :class="['font-bold mb-1 transition-colors', isDragging ? 'text-blue-600 text-lg' : 'text-gray-700 text-sm md:text-base']">
                  {{ isDragging ? '📂 Solte a foto aqui!' : '📸 Arraste uma foto ou clique para selecionar' }}
                </p>
                <p class="text-xs md:text-sm text-gray-500 mt-2">Formatos aceitos: JPG, PNG, WEBP (máx. 10MB)</p>
              </div>

              <!-- ESTADO: ENVIANDO -->
              <div v-else-if="uploading" class="text-center p-6">
                <div class="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center animate-pulse">
                  <UIcon name="i-heroicons-arrow-path" class="w-10 h-10 text-blue-600 animate-spin" />
                </div>
                <p class="font-bold text-blue-600 text-sm md:text-base mb-1">Enviando para a nuvem...</p>
                <p class="text-xs text-gray-500">Aguarde alguns instantes</p>
              </div>

              <!-- ESTADO: FOTO CARREGADA -->
              <div v-else-if="form.fotoUrl" class="relative w-full h-full min-h-[180px] md:min-h-[200px] group">
                <img :src="form.fotoUrl" alt="Preview da foto" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button type="button" @click.stop="triggerFileInput" class="px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-gray-100 transition-all shadow-lg active:scale-95">
                    <UIcon name="i-heroicons-arrow-path" class="w-4 h-4" /> Trocar
                  </button>
                  <button type="button" @click.stop="removerFoto" class="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-red-700 transition-all shadow-lg active:scale-95">
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
              <UInput v-model="form.nome" @input="form.nome = form.nome.toUpperCase()" size="lg" placeholder="Ex: FAROL GOL" class="w-full" :ui="{ base: 'h-12 border-2 border-gray-300 rounded-xl font-medium text-gray-900 uppercase' }" />
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-arrows-right-left" class="w-4 h-4 text-gray-600" /> Lado *
              </label>
              <select v-model="form.lado" class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 transition-all hover:border-gray-400 cursor-pointer uppercase">
                <option v-for="opt in listaLados" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <!-- Linha 2 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-truck" class="w-4 h-4 text-gray-600" /> Montadora
              </label>
              <select v-model="form.montadora" class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 uppercase">
                <option value="">SELECIONE</option>
                <option v-for="montadora in listaMontadorasNomes" :key="montadora" :value="montadora">{{ montadora }}</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-wrench-screwdriver" class="w-4 h-4 text-gray-600" /> Modelo
              </label>
              <select v-model="form.modelo" :disabled="!form.montadora || modelosFiltrados.length === 0" class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 disabled:bg-gray-100 uppercase">
                <option value="">SELECIONE O MODELO</option>
                <option v-for="modelo in modelosFiltrados" :key="modelo" :value="modelo">{{ modelo }}</option>
              </select>
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-gray-600" /> Condição *
              </label>
              <select v-model="form.estado" class="w-full h-12 appearance-none bg-white border-2 border-gray-300 text-gray-900 text-sm font-medium rounded-xl focus:ring-2 focus:ring-gray-600 px-4 uppercase">
                <option v-for="item in listaCondicao" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
          </div>

          <!-- Linha 3 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-currency-dollar" class="w-4 h-4 text-green-600" /> Preço (R$) *
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-sm">R$</span>
                <UInput v-model="form.preco" size="lg" type="number" step="0.01" class="w-full" :ui="{ base: 'h-12 border-2 border-gray-300 rounded-xl font-bold text-gray-900 pl-12' }" />
              </div>
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-cube-transparent" class="w-4 h-4 text-gray-600" /> Estoque
              </label>
              <UInput v-model="form.quantidade" size="lg" type="number" class="w-full" :ui="{ base: 'h-12 border-2 border-gray-300 rounded-xl font-bold text-gray-900' }" />
            </div>

            <div class="space-y-2">
              <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-calendar" class="w-4 h-4 text-gray-600" /> Ano
              </label>
              <UInput :model-value="form.ano" @input="formatarAno" size="lg" placeholder="2015/2018" maxlength="9" class="w-full" :ui="{ base: 'h-12 border-2 border-gray-300 rounded-xl font-medium' }" />
            </div>
          </div>

          <!-- CAMPOS PARA O FEED LOCALIZAÇÃO E ENDEREÇAMENTO FOTOS -->
          <div class="space-y-4 pt-4 border-t-2 border-gray-100">

            <!-- LINHA FLEX IGUAL AO TEMPLATE 1 -->
            <div class="md:flex justify-between gap-4 space-y-4 md:space-y-0 pb-4 border-b-2 border-gray-100">

              <!-- LINK -->
              <div class="space-y-2 flex-1">
                <label class="text-xs md:text-sm font-bold text-blue-700 flex items-center gap-1.5">
                  <UIcon name="i-heroicons-link" class="w-4 h-4" />
                  Link do Produto (Loja/Catálogo)
                </label>
                <UInput 
                  v-model="form.Link"
                  placeholder="https://..."
                  size="lg"
                  :ui="{ base: 'h-12 focus:ring-2 focus:ring-blue-500 border-2 border-blue-200 rounded-xl font-medium text-gray-900' }"
                />
              </div>

              <!-- LOCALIZAÇÃO -->
              <div class="space-y-2 flex-1">
                <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-orange-600" />
                  Localização (A-01-04-06)
                </label>
                <UInput
                  :model-value="form.localizacao"
                  @update:model-value="formatarCodigo"
                  placeholder="A-01-04-06"
                  maxlength="10"
                  :ui="{ base: 'h-12 border-2 border-gray-300 rounded-xl font-bold uppercase tracking-widest' }"
                />
              </div>

              <!-- ENDEREÇAMENTO -->
              <div class="space-y-2 flex-1">
                <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
                  <UIcon name="i-heroicons-folder" class="w-4 h-4 text-gray-600" />
                  Endereçamento das fotos
                </label>
                <UInput
                  v-model="form.detalhes"
                  placeholder="G:\Meu Drive\FARÓIS\etc."
                  :ui="{ base: 'h-12 border-2 border-gray-300 rounded-xl font-bold uppercase' }"
                />
              </div>

            </div>

            <!-- DESCRIÇÃO (SOZINHA, IGUAL AO TEMPLATE 1) -->
            <div class="space-y-2 flex flex-col">
              <label class="text-xs md:text-sm font-bold text-blue-700 flex items-center gap-1.5">
                <UIcon name="i-heroicons-document-text" class="w-4 h-4" />
                Descrição Completa (Obrigatório para o Google/Facebook)
              </label>
              <textarea 
                v-model="form.descricao" 
                rows="4" 
                class="w-full p-4 border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 text-sm font-medium placeholder:italic"
                placeholder="Ex: Peça original em excelente estado. Possui 2 garras superiores recuperadas..."
              ></textarea>
              <p class="text-[10px] text-gray-400 font-bold uppercase italic mt-1">
                * Descreva detalhadamente avarias ou garras recuperadas para o cliente.
              </p>
            </div>

          </div>
          
        </div>
      </div>

      <!-- BOTÕES DE AÇÃO -->
      <div class="flex flex-col md:flex-row-reverse gap-3 pt-2 md:pt-4">
        <UButton type="submit" size="lg" :loading="saving || uploading" :disabled="saving || uploading" class="w-full md:w-auto flex items-center bg-gray-600 hover:bg-gray-800 text-white shadow-lg transition-all font-bold rounded-xl px-8 justify-center">
          <UIcon v-if="!saving && !uploading" name="i-heroicons-check-circle" class="w-5 h-5" />
          {{ saving ? 'Salvando...' : uploading ? 'Enviando Foto...' : 'Salvar Alterações' }}
        </UButton>

        <UButton to="/estoque" variant="ghost" color="gray" size="lg" class="w-full md:w-auto flex justify-center font-bold rounded-xl border-2 border-transparent hover:bg-red-50 hover:text-red-600 transition-all">
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

const CLOUD_NAME = 'dhlllqld0'; 
const UPLOAD_PRESET = 'Eli pecas'; 

const listaLados = ["LADO DIREITO", "LADO ESQUERDO", "DIANTEIRO", "TRASEIRO", "DIANTEIRO DIREITO", "TRASEIRO ESQUERDO"]

// ✅ NOVA LISTA DE CONDIÇÕES
const listaCondicao = [
  "Novo",
  "Recondicionado",
  "Usado (estado de novo)",
  "Usado (boas condições)",
  "Usado (condições razoáveis)"
]

const listaMontadorasCompleta = [
  { nome: 'VOLKSWAGEN', modelos: ['GOL', 'PARATI', 'SAVEIRO', 'VOYAGE', 'FUSCA', 'BRASILIA', 'POLO', 'POLO SEDAN', 'GOLF', 'JETTA', 'PASSAT', 'SANTANA', 'VIRTUS', 'T-CROSS', 'TAOS', 'AMAROK', 'KOMBI'] },
  { nome: 'CHEVROLET', modelos: ['CHEVETTE', 'OPALA', 'OMEGA', 'KADETT', 'IPANEMA', 'CORSA', 'CELTA', 'PRISMA', 'ONIX', 'ONIX PLUS', 'CRUZE', 'VECTRA', 'MONTANA', 'S10', 'BLAZER', 'TRACKER', 'SPIN'] },
  { nome: 'FIAT', modelos: ['147', 'UNO', 'PREMIO', 'ELBA', 'PALIO', 'SIENA', 'STRADA', 'DOBLÒ', 'PUNTO', 'ARGO', 'CRONOS', 'MOBI', 'TORO', 'IDEA', 'TEMPRA', 'MAREA', 'FIORINO', 'MAREA'] },
  { nome: 'TOYOTA', modelos: ['COROLLA', 'HILUX', 'ETIOS', 'YARIS', 'SW4', 'COROLLA CROSS', 'CAMRY'] },
  { nome: 'HONDA', modelos: ['CIVIC', 'FIT', 'HR-V', 'CITY', 'WR-V', 'CR-V'] },
  { nome: 'HYUNDAI', modelos: ['HB20', 'HB20S', 'CRETA', 'IX35', 'TUCSON'] }
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
  descricao: '', // ✅ NOVO
  Link: ''      // ✅ NOVO (L Maiúsculo)
})

const { data, status } = await useFetch(`/api/pecas/${id}`, { key: `edit-${id}` })

const modelosFiltrados = computed(() => {
  if (!form.montadora) return []
  const m = listaMontadorasCompleta.find(item => item.nome === form.montadora)
  return m ? m.modelos : []
})

watchEffect(() => {
  if (data.value) {
    const p: any = data.value
    let mFound = listaMontadorasCompleta.find(m => m.modelos.includes(p.modelo))?.nome || ''

    form.nome = p.nome || ''
    form.lado = p.lado || 'LADO DIREITO' 
    form.modelo = p.modelo || ''
    form.montadora = mFound
    form.ano = p.ano || ''
    form.preco = Number(p.preco) || undefined
    form.quantidade = p.quantidade || 1
    form.estado = p.estado || 'Usado (boas condições)' 
    form.localizacao = p.localizacao || ''
    form.detalhes = p.detalhes || ''
    form.fotoUrl = p.fotoUrl || null
    form.descricao = p.descricao || '' // ✅ CARREGA DO BD
    form.Link = p.Link || ''           // ✅ CARREGA DO BD
  }
})

watch(() => form.montadora, (newVal, oldVal) => { if (newVal !== oldVal) form.modelo = '' })

// HANDLERS DRAG & DROP
function handleDragOver(e: DragEvent) { e.preventDefault(); isDragging.value = true }
function handleDragLeave(e: DragEvent) { e.preventDefault(); isDragging.value = false }
function handleDrop(e: DragEvent) {
  e.preventDefault(); isDragging.value = false
  if (e.dataTransfer?.files?.length) processFile(e.dataTransfer.files[0])
}
function triggerFileInput() { if (!uploading.value && !saving.value) fileInput.value?.click() }
function handleFileUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) processFile(file)
}
function removerFoto() { form.fotoUrl = null; if (fileInput.value) fileInput.value.value = '' }

async function processFile(file: File) {
  if (uploading.value || saving.value) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    toast.add({ title: 'Erro', description: 'Formato inválido.', color: 'red' }); return
  }
  uploading.value = true;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
    const data = await res.json();
    form.fotoUrl = data.secure_url;
    toast.add({ title: 'Sucesso', description: 'Foto carregada!', color: 'green' })
  } catch (e) {
    toast.add({ title: 'Erro', description: 'Falha no upload.', color: 'red' })
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
  if (!form.nome || !form.preco || !form.montadora || !form.modelo) {
    toast.add({ title: 'Atenção', description: 'Preencha os campos obrigatórios.', color: 'red' }); return
  }
  saving.value = true
  try {
    const payload = {
      ...form,
      nome: form.nome.toUpperCase(),
      detalhes: form.detalhes.toUpperCase() || null,
      localizacao: form.localizacao.toUpperCase() || null,
      descricao: form.descricao || null, // ✅ ENVIA PRO BACKEND
      Link: form.Link || null                         // ✅ ENVIA PRO BACKEND (L Maiúsculo)
    }
    await $fetch(`/api/pecas/${id}`, { method: 'PATCH', body: payload })
    toast.add({ title: 'Sucesso', description: 'Peça atualizada!', color: 'green' })
    router.push('/estoque')
  } catch (e) {
    toast.add({ title: 'Erro', description: 'Falha ao salvar.', color: 'red' })
  } finally { saving.value = false }
}
</script>