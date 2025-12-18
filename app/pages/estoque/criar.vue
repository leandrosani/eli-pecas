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
          
          <!-- UPLOAD DE FOTOS COM DRAG & DROP -->
          <div class="space-y-3 border-b-2 pb-5 border-gray-100">
            <label class="text-xs md:text-sm font-bold text-gray-700 flex items-center gap-1.5">
              <UIcon name="i-heroicons-photo" class="w-4 h-4 text-blue-600" />
              Fotos da Peça (até 6)
            </label>
            
            <div 
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
              :class="[
                'relative border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden min-h-[180px] md:min-h-[200px] flex items-center justify-center',
                isDragging ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-gray-400 bg-gray-50',
                'bg-gray-50'
              ]"
            >
              <input 
                ref="fileInput"
                type="file" 
                multiple
                @change="handleFileUpload"
                accept="image/*"
                class="hidden"
              />

              <!-- ESTADO: SEM FOTOS -->
              <div v-if="!previews.length" class="text-center p-6">
                <div :class="['w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-all', isDragging ? 'bg-blue-100 scale-110' : 'bg-gray-200']">
                  <UIcon :name="isDragging ? 'i-heroicons-arrow-down-tray' : 'i-heroicons-photo'" :class="['transition-all', isDragging ? 'w-10 text-blue-600 animate-bounce' : 'w-8 text-gray-500']" />
                </div>
                <p :class="['font-bold mb-1 transition-colors', isDragging ? 'text-blue-600 text-lg' : 'text-gray-700 text-sm']">
                  {{ isDragging ? '📂 Solte as fotos aqui!' : '📸 Arraste fotos ou clique para selecionar' }}
                </p>
                <p class="text-xs text-gray-500 mt-2">Formatos aceitos: JPG, PNG, WEBP (máx. 10MB) — até 6 fotos</p>
              </div>

              <!-- ESTADO: FOTOS CARREGADAS (PREVIEW LOCAL) -->
              <div v-else class="w-full p-4">
                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div
                    v-for="(foto, index) in previews"
                    :key="index"
                    class="relative group rounded-xl overflow-hidden border border-gray-200"
                  >
                    <img :src="foto" alt="Preview" class="w-full h-32 md:h-40 object-cover" />
                    <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        @click.stop="removerFoto(index)"
                        class="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-lg active:scale-95"
                      >
                        <UIcon name="i-heroicons-trash" class="w-4 h-4" /> Remover
                      </button>
                    </div>
                    <div
                      v-if="index === 0"
                      class="absolute top-2 left-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 shadow"
                    >
                      <UIcon name="i-heroicons-star" class="w-3 h-3" /> Capa
                    </div>
                  </div>

                  <!-- CARD PARA ADICIONAR MAIS FOTOS -->
                  <div
                    v-if="previews.length < 6"
                    @click.stop="triggerFileInput"
                    class="border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors h-32 md:h-40"
                  >
                    <div class="text-center p-4">
                      <UIcon name="i-heroicons-plus-circle" class="w-8 h-8 text-gray-500 mx-auto mb-1" />
                      <p class="text-xs font-semibold text-gray-600">Adicionar</p>
                      <p class="text-[10px] text-gray-400">{{ 6 - previews.length }} restantes</p>
                    </div>
                  </div>
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
          {{ loading ? 'Salvando (c/ Upload)...' : uploading ? 'Enviando Fotos...' : 'Salvar Peça no Estoque' }}
        </UButton>

        <UButton to="/estoque" variant="ghost" color="gray" size="lg" class="w-full md:w-auto flex justify-center font-bold rounded-xl border-2 border-transparent hover:bg-red-50 hover:text-red-600 transition-all">
          Cancelar
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, watch, onMounted } from 'vue';

definePageMeta({ layout: 'default' })

const router = useRouter()
const toast = useToast()

const loading = ref(false)
const uploading = ref(false)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// ✅ ESTADOS PARA GERENCIAR UPLOAD AO SALVAR
const arquivosParaUpload = ref<File[]>([]) // Guarda os arquivos reais
const previews = ref<string[]>([]) // Guarda os URLs locais (blob:) para exibir na tela

// ✅ CONFIGURAÇÕES CLOUDINARY
const CLOUD_NAME = 'dhlllqld0'; 
const UPLOAD_PRESET = 'Eli pecas'; 

const listaLados = ["LADO DIREITO", "LADO ESQUERDO", "DIANTEIRO", "TRASEIRO", "DIANTEIRO DIREITO", "TRASEIRO ESQUERDO", "PAR"]

// ✅ LISTA ATUALIZADA DE CONDIÇÕES
const listaCondicao = [
  "Novo",
  "Recondicionado",
  "Usado (estado de novo)",
  "Usado (boas condições)",
  "Usado (condições razoáveis)"
]

// Mock de montadoras (Resumido para exemplo)
const listaMontadorasCompleta = [
  { nome: 'FIAT', modelos: ['UNO', 'PALIO', 'STRADA', 'SIENA', 'ARGO', 'CRONOS', 'MOBI', 'TORO', 'FIORINO', 'DOBLÒ', 'IDEA', 'PUNTO', 'TEMPRA', 'MAREA', 'PREMIO', 'ELBA', '147'] },
  { nome: 'VOLKSWAGEN', modelos: ['GOL', 'SAVEIRO', 'VOYAGE', 'POLO', 'VIRTUS', 'FOX', 'PARATI', 'GOLF', 'JETTA', 'T-CROSS', 'NIVUS', 'TAOS', 'AMAROK', 'KOMBI', 'SANTANA', 'PASSAT', 'FUSCA', 'BRASILIA', 'POLO SEDAN'] },
  { nome: 'CHEVROLET', modelos: ['ONIX', 'PRISMA', 'CELTA', 'CORSA', 'CRUZE', 'TRACKER', 'SPIN', 'S10', 'MONTANA', 'BLAZER', 'VECTRA', 'OMEGA', 'KADETT', 'IPANEMA', 'CHEVETTE', 'OPALA'] },
  { nome: 'FORD', modelos: ['KA', 'KA SEDAN', 'ECOSPORT', 'FIESTA', 'FOCUS', 'RANGER', 'F-1000', 'CORCEL', 'DEL REY', 'PAMPA'] },
  { nome: 'TOYOTA', modelos: ['COROLLA', 'HILUX', 'ETIOS', 'YARIS', 'COROLLA CROSS', 'SW4', 'CAMRY', 'BANDEIRANTE'] },
  { nome: 'HYUNDAI', modelos: ['HB20', 'HB20S', 'CRETA', 'TUCSON', 'IX35', 'SANTA FE', 'AZERA'] },
  { nome: 'JEEP', modelos: ['RENEGADE', 'COMPASS', 'COMMANDER', 'CHEROKEE', 'WRANGLER'] },
  { nome: 'RENAULT', modelos: ['SANDERO', 'LOGAN', 'KWID', 'DUSTER', 'CAPTUR', 'MEGANE', 'CLIO', 'SCENIC'] },
  { nome: 'HONDA', modelos: ['CIVIC', 'CITY', 'FIT', 'HR-V', 'WR-V', 'CR-V', 'ACCORD'] },
  { nome: 'NISSAN', modelos: ['KICKS', 'VERSA', 'SENTRA', 'MARCH', 'FRONTIER', 'ALTIMA'] },
  { nome: 'PEUGEOT', modelos: ['208', '207', '206', '2008', '3008', '307', '308', '407'] },
  { nome: 'CITROËN', modelos: ['C3', 'C4 CACTUS', 'C4', 'AIRCROSS', 'XSARA', 'PICASSO'] },
  { nome: 'KIA', modelos: ['SPORTAGE', 'CERATO', 'SORENTO', 'PICANTO'] }
];

const listaMontadorasNomes = listaMontadorasCompleta.map(m => m.nome);

const form = reactive({
  nome: '', marca: '', modelo: '', lado: 'LADO DIREITO', ano: '',
  preco: undefined, quantidade: 1, estado: 'Usado (boas condições)', 
  localizacao: '', detalhes: '', 
  fotosExtras: [] as string[], // Guardará os URLs finais do Cloudinary
  descricao: '', 
  Link: ''
})

// ✅ IMPORTAÇÃO AUTOMÁTICA DO SCRAPER
onMounted(() => {
  const importado = localStorage.getItem('peca_importada')
  if (importado) {
    try {
      const dados = JSON.parse(importado)
      form.nome = dados.nome?.toUpperCase() || ''
      if (typeof dados.preco === 'string') {
        form.preco = parseFloat(dados.preco.replace(/[^0-9,]/g, '').replace(',', '.'))
      } else {
        form.preco = dados.preco
      }
      
      // Se vieram fotos do scraper, elas já são URLs reais
      if (dados.fotosExtras) {
          let urls = []
          try { urls = JSON.parse(dados.fotosExtras) } catch { urls = [] }
          if (dados.fotoUrl) urls.unshift(dados.fotoUrl)
          
          // Adiciona aos previews para ver na tela
          urls.forEach((url: string) => {
             previews.value.push(url)
             // Como já são URLs, não adicionamos a 'arquivosParaUpload' (são tratados como "já enviados")
             form.fotosExtras.push(url) 
          })
      }

      form.descricao = dados.descricao || ''
      form.Link = dados.Link || '' 
      form.marca = dados.marca || ''
      form.modelo = dados.modelo || ''
      form.ano = dados.ano || ''
      form.localizacao = dados.localizacao || ''
      
      toast.add({ title: 'Importado', description: 'Dados da OLX carregados!', color: 'green' })
      localStorage.removeItem('peca_importada')
    } catch (e) {
      console.error('Erro ao processar importação', e)
    }
  }
})

const modelosFiltrados = computed(() => {
  if (!form.marca) return []
  const m = listaMontadorasCompleta.find(item => item.nome === form.marca)
  return m ? m.modelos : []
})

watch(() => form.marca, () => { form.modelo = '' })

// ✅ HANDLERS DRAG & DROP (MODIFICADO PARA PREVIEW LOCAL)
function handleDragOver(e: DragEvent) { e.preventDefault(); isDragging.value = true }
function handleDragLeave(e: DragEvent) { e.preventDefault(); isDragging.value = false }
function handleDrop(e: DragEvent) {
  e.preventDefault(); isDragging.value = false
  if (e.dataTransfer?.files?.length) processFiles(e.dataTransfer.files)
}
function triggerFileInput() { if (!uploading.value) fileInput.value?.click() }
function handleFileUpload(e: Event) {
  const files = (e.target as HTMLInputElement).files
  if (files?.length) processFiles(files)
}

// remove tanto do array de arquivos quanto do preview
function removerFoto(index: number) {
  // Se for uma URL blob local, revogar para liberar memória
  if (previews.value[index].startsWith('blob:')) {
      URL.revokeObjectURL(previews.value[index])
      // Remove do array de upload (precisamos achar o índice correspondente se houver mistura de URLs e Files, mas simplificando para criação:)
      // Na criação pura, os indices batem se não houve mistura.
      // Se veio do scraper, form.fotosExtras tem dados. Se é upload manual, arquivosParaUpload tem dados.
      // Lógica segura:
  }
  
  // Remove visualmente
  const urlRemovida = previews.value[index]
  previews.value.splice(index, 1)

  // Se estava na lista de URLs finais (scraper), remove
  const idxForm = form.fotosExtras.indexOf(urlRemovida)
  if (idxForm !== -1) form.fotosExtras.splice(idxForm, 1)

  // Se estava na lista de arquivos para upload (manual)
  // Nota: A correlação por índice pode falhar se misturar scraper + upload manual e apagar do meio.
  // Mas para simplificar neste fluxo de criação:
  // Vamos reconstruir arquivosParaUpload baseado no que sobrou visualmente? Não, Files não têm URLs blob persistentes.
  // Melhor abordagem: Manter um objeto wrapper { file?: File, url: string, isLocal: boolean }
  // Mas para não reescrever tudo complexo: Vamos assumir remoção pelo índice visual no array de arquivos se for local.
  // **Correção Rápida:**
  if (urlRemovida.startsWith('blob:')) {
      // É um arquivo local. Encontrar qual File gerou este blob é difícil sem mapeamento.
      // Vamos apenas remover o arquivo que está na posição relativa dos locais.
      // Quantas fotos remotas existem antes deste índice?
      const numRemotas = form.fotosExtras.length // As que já são URL
      // O índice no array de arquivos locais é: index - numRemotas
      // (Isso assume que fotos remotas aparecem primeiro, o que é verdade no onMounted)
      if (index >= numRemotas) {
          arquivosParaUpload.value.splice(index - numRemotas, 1)
      }
  }
}

async function processFiles(fileList: FileList) {
  const files = Array.from(fileList)
  const disponiveis = 6 - previews.value.length // Usa previews como contagem total
  
  if (disponiveis <= 0) {
    toast.add({ title: 'Limite atingido', description: 'Máximo de 6 fotos.', color: 'red' })
    return
  }

  const selecionados = files.slice(0, disponiveis)
  
  for (const file of selecionados) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.add({ title: 'Erro', description: 'Formato inválido.', color: 'red' }); continue
      }
      
      // ✅ GERA PREVIEW LOCAL IMEDIATO (SEM UPLOAD)
      const blobUrl = URL.createObjectURL(file)
      previews.value.push(blobUrl)
      arquivosParaUpload.value.push(file)
  }
}

// ✅ FUNÇÃO AUXILIAR DE UPLOAD REAL (CHAMADA NO SALVAR)
async function uploadFotoParaCloudinary(file: File): Promise<string | null> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);
    
    try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        return data.secure_url || null;
    } catch (e) {
        console.error('Erro upload', e)
        return null;
    }
}

function formatarCodigo(value: string) {
  if (!value) { form.localizacao = ''; return }
  let v = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7)
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
    // 1. FAZ O UPLOAD DAS FOTOS AGORA
    if (arquivosParaUpload.value.length > 0) {
        uploading.value = true // Mostra estado de "Enviando Fotos"
        
        // Upload em paralelo para ser mais rápido
        const promises = arquivosParaUpload.value.map(file => uploadFotoParaCloudinary(file))
        const urlsGeradas = await Promise.all(promises)
        
        // Adiciona as novas URLs ao array final do formulário
        urlsGeradas.forEach(url => {
            if (url) form.fotosExtras.push(url)
        })
        
        uploading.value = false
    }

    const payload = {
      ...form,
      nome: form.nome.toUpperCase(),
      marca: form.marca.toUpperCase(),
      lado: form.lado.toUpperCase(),
      modelo: form.modelo.toUpperCase(),
      descricao: form.descricao || null,
      localizacao: form.localizacao || null,
      detalhes: form.detalhes?.toUpperCase() || null,
      
      // Garante o formato correto para o backend
      fotoUrl: form.fotosExtras.length > 0 ? form.fotosExtras[0] : null,
      fotosExtras: form.fotosExtras
    }
    
    await $fetch('/api/pecas', { method: 'POST', body: payload })
    
    // Limpa blobs da memória
    previews.value.forEach(url => {
        if (url.startsWith('blob:')) URL.revokeObjectURL(url)
    })
    
    toast.add({ title: 'Sucesso', description: 'Peça cadastrada!', color: 'green' })
    router.push('/estoque')
    
  } catch (e) {
    toast.add({ title: 'Erro', description: 'Erro ao salvar peça.', color: 'red' })
  } finally { 
    loading.value = false 
    uploading.value = false
  }
}
</script>