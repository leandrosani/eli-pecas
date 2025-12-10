<template>
  <div class="pb-20 relative">

    <!-- HEADER + AÇÕES -->
    <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-1 flex flex-col gap-4">

      <!-- Título -->
      <h1 class="text-2xl md:text-4xl font-bold text-gray-900 flex items-center gap-2">
        📦 <span class="text-xl">Estoque Total</span>
      </h1>

      <!-- Linha divisória -->
      <div class="border-t border-gray-200"></div>

      <!-- Total + Botão -->
      <div class="flex justify-between items-center">
        <h2 class="text-lg md:text-xl font-bold text-gray-700">
          Total de itens:
          <strong class="text-gray-900">{{ linhasFiltradas.length }}</strong>
        </h2>

        <!-- Botão Mobile -->
        <div class="md:hidden">
          <UButton
            to="/estoque/criar"
            icon="i-heroicons-plus"
            size="xl"
            class="w-12 h-12 rounded-full bg-gray-800 text-white shadow-2xl hover:bg-gray-800 active:scale-95 flex items-center justify-center"
          />
        </div>

        <!-- Botão Desktop -->
        <UButton
          to="/estoque/criar"
          icon="i-heroicons-plus"
          size="lg"
          class="hidden md:flex px-4 py-3 bg-gray-700 text-white rounded-xl shadow hover:bg-gray-800 active:scale-95 font-bold"
        >
          Adicionar Peça
        </UButton>
      </div>
    </div>
    
    <!-- PAINEL DE FILTROS AVANÇADOS -->
    <FiltroEstoque 
      v-model="filtrosAtivos"
      :options="opcoesUnicas"
      :estoque="estoqueCompleto || []"
      class="mb-6"
    />

    
    <!-- LOADING STATE -->
    <div v-if="status === 'pending'" class="py-12 text-center bg-white border border-gray-200 rounded-xl shadow-sm">
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-10 h-10 animate-spin text-blue-500 mx-auto"
      />
      <p class="text-gray-500 mt-3 text-sm font-medium">Carregando estoque...</p>
    </div>

    <template v-else>
      <!-- TABELA DESKTOP -->
      <div class="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table class="w-full text-left border-collapse">

          <thead class="bg-gray-600">
            <tr>
              <th class="py-4 px-6 text-xs uppercase font-bold text-white w-4/12">Peça</th>
              <th class="py-4 px-6 text-xs uppercase font-bold text-white w-2/12">Aplicação</th>
              <th class="py-4 px-6 text-xs uppercase font-bold text-white w-2/12">Localização</th>
              <th class="py-4 px-6 text-xs uppercase font-bold text-white w-2/12 text-right">Preço</th>
              <th class="py-4 px-6 text-xs uppercase font-bold text-white w-1/12 text-center">Ações</th>
            </tr>
          </thead>

          <tbody class="divide-y divide-gray-200">

            <tr v-for="row in linhasFiltradas" :key="row.id" class="hover:bg-gray-50 transition-all">
              <!-- NOME + MARCA + ESTADO -->
              <td class="py-4 px-6">
                <div class="flex items-center gap-3">

                  <!-- Quantidade -->
                  <div class="w-12 h-12 rounded-xl bg-gray-200 flex flex-col items-center justify-center shadow-sm border border-gray-300">
                    <span class="text-2xl font-bold text-gray-800 leading-none">{{ row.quantidade }}</span>
                    <span class="text-[8px] font-bold text-gray-600 uppercase tracking-wide">un.</span>
                  </div>

                  <!-- Texto -->
                  <div>
                    <div class="font-bold text-gray-900 text-sm mb-1">{{ row.nome }}</div>
                    <div class="font-bold text-gray-900 text-sm mb-1">{{ row.modelo }}</div>

                    <div class="flex gap-1.5 flex-wrap">
                      <span class="text-[12px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-gray-100 text-orange-800">
                        {{ row.lado }}
                      </span>

                      <span v-if="row.estado" class="text-[12px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-orange-100 text-gray-900">
                        {{ row.estado }}
                      </span>
                    </div>
                  </div>

                </div>
              </td>

              <!-- APLICAÇÃO -->
              <td class="py-4 px-6">
                <div class="flex flex-col">
                  <span class="text-xs font-bold uppercase text-gray-500">{{ row.marca || 'Universal' }}</span>
                  <span v-if="row.ano" class="text-sm font-bold mt-0.5 text-gray-900">{{ row.ano }}</span>
                </div>
              </td>

              <!-- LOCALIZAÇÃO -->
              <td class="py-4 px-6">
                <div v-if="row.localizacao" class="flex items-center flex-nowrap gap-1.5 bg-purple-200/20 px-3 py-1 rounded-md shadow-sm w-fit border border-purple-200 whitespace-nowrap">
                  <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-purple-800" />
                  <span class="text-sm font-bold text-purple-800 whitespace-nowrap">{{ row.localizacao }}</span>
                </div>
              </td>

              <!-- PREÇO -->
              <td class="py-4 px-6 text-right">
                <div class="font-bold text-gray-800 text-base">{{ formatarPreco(row) }}</div>
              </td>

              <!-- AÇÕES -->
              <td class="py-4 px-6">
                <div class="flex flex-col items-center justify-center gap-2">

                  <UButton v-if="row.quantidade > 0" icon="i-heroicons-currency-dollar" size="xs" @click="abrirVenda(row)" class="flex items-center justify-center w-24 bg-green-700 hover:bg-green-600 text-white rounded-lg px-2.5 py-1.5 text-[12px] font-semibold shadow-sm">Vender</UButton>

                  <span v-else class="w-24 text-center px-2.5 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[12px] font-semibold">ESGOTADO</span>

                  <UButton :to="`/estoque/editar/${row.id}`" icon="i-heroicons-pencil-square" size="xs" class="flex items-center justify-center w-24 bg-orange-500/80 hover:bg-orange-400/90 text-white rounded-lg px-2.5 py-1.5 text-[12px] font-semibold shadow-sm">Editar</UButton>

                  <UButton icon="i-heroicons-trash" size="xs" @click="excluir(row.id)" class="flex items-center justify-center w-24 bg-red-700 hover:bg-red-600 text-white rounded-lg px-2.5 py-1.5 text-[12px] font-semibold shadow-sm">Excluir</UButton>

                </div>
              </td>
            </tr>
          </tbody>
        </table>
        
        <!-- Estado de lista vazia após a filtragem -->
        <div v-if="!linhasFiltradas.length" class="text-center py-16">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-archive-box-x-mark" class="w-8 h-8 text-gray-400" />
          </div>
          <p class="text-gray-600 font-medium">Nenhuma peça encontrada</p>
          <p class="text-gray-400 text-sm mt-1">Verifique os filtros ou cadastre um novo item.</p>
        </div>
      </div>
      
      <!-- CARDS MOBILE -->
      <div class="block md:hidden space-y-4">
        
        <!-- Card Individual -->
        <div v-for="row in linhasFiltradas" :key="row.id" class="bg-white border-2 border-gray-200 rounded-xl shadow-sm overflow-hidden">
          
          <!-- Header do Card -->
          <div class="bg-gray-600 p-4 gap-2 flex items-center justify-between">
            <!-- Nome -->
            <div>  
              <h3 class="font-bold text-white text-base">{{ row.nome }}</h3>
              <h3 class="font-bold text-white text-base">{{ row.modelo }}</h3>
            </div>
            <!-- Quantidade -->
            <div class="min-w-[36px] h-6 flex flex-col gap-1 items-center justify-center">
              <span class="text-base font-bold text-white leading-none">{{ row.quantidade }}</span>
              <span class="text-[8px] font-bold text-white uppercase tracking-wide">un.</span>
            </div>
          </div>

          <!-- Conteúdo do Card -->
          <div class="p-4 space-y-3">
            
            <!-- Marca + Procedência + Estado -->
             <div class="flex justify-between">
              <div class="flex flex-col gap-2">
                <div class="flex gap-1.5 flex-col border-b pb-2 border-gray-200">
                  <span class="text-sm font-bold uppercase tracking-wide text-gray-900">
                    {{ row.lado }}
                  </span>

                  <span v-if="row.estado" class="text-sm font-bold uppercase tracking-wide text-orange-500">
                    {{ row.estado }}
                  </span>
                </div>

                <!-- Aplicação -->
                <div class="flex items-center gap-2">
                  <span class="text-sm font-bold text-gray-500 uppercase">{{ row.marca || 'Universal' }}</span>
                  <span v-if="row.ano" class="text-sm font-bold text-gray-900">{{ row.ano }}</span>
                </div>

                <!-- Localização -->
                <div v-if="row.localizacao" class="flex items-center gap-1 -ml-0.5">
                  <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-purple-600" />
                  <span class="text-sm font-bold text-purple-800">{{ row.localizacao }}</span>
                </div>
              </div>

              <!--btns Mobille-->
              <div class="flex flex-col gap-2">
                <UButton 
                  variant="soft" 
                  icon="i-heroicons-currency-dollar" 
                  size="xl" 
                  square
                  class="flex items-center justify-center w-8 h-8 !bg-green-100 !text-green-600 hover:!bg-green-200 shadow-sm rounded-lg transition-all hover:shadow-md" 
                  @click="abrirVenda(row)"
                />
                
                <UButton 
                  :to="`/estoque/editar/${row.id}`" 
                  variant="soft" 
                  icon="i-heroicons-pencil-square" 
                  size="xl" 
                  square
                  class="flex items-center justify-center w-8 h-8 !bg-orange-50 !text-orange-500 hover:!bg-orange-100 shadow-sm rounded-lg transition-all hover:shadow-md"
                />
                
                <UButton 
                  variant="soft" 
                  icon="i-heroicons-trash" 
                  size="xl" 
                  square
                  class="flex items-center justify-center w-8 h-8 !bg-red-50 !text-red-600 hover:!bg-red-100 shadow-sm rounded-lg transition-all hover:shadow-md" 
                  @click="excluir(row.id)" 
                />
              </div>

            </div>

            <!-- Preço -->
            <div class="flex items-center justify-between pt-2 border-t border-gray-200">
              <span class="text-base font-bold text-gray-900 uppercase">Preço</span>
              <span class="text-base font-bold text-gray-900">{{ formatarPreco(row) }}</span>
            </div>

          </div>
        </div>

        <!-- Estado vazio mobile -->
        <div v-if="!linhasFiltradas.length" class="text-center py-12 bg-white border border-gray-200 rounded-xl">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UIcon name="i-heroicons-archive-box-x-mark" class="w-8 h-8 text-gray-400" />
          </div>
          <p class="text-gray-500 font-medium">Nenhuma peça encontrada</p>
          <p class="text-gray-400 text-sm mt-1">Ajuste os filtros</p>
        </div>
      </div>
    </template>

    <!-- MODAL DE VENDA -->
    <div 
      v-if="modalVendaAberto"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center -mt-18"
    >
      <!-- MODAL CENTRALIZADO -->
      <div class="z-50">
        <ModalVenda 
          v-model="modalVendaAberto" 
          :peca="pecaSelecionada"
          @confirmado="handleVendaConfirmada"
        />
      </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import FiltroEstoque from '~/components/FiltroEstoque.vue'
import ModalVenda from '~/components/ModalVenda.vue'
import { ref, computed } from 'vue'

definePageMeta({ layout: 'default' })

const toast = useToast()

// 1. ESTADO DOS FILTROS
const filtrosAtivos = ref({
  busca: '',
  marca: '',
  lado: '',
  procedencia: '',
  modelo: '',
  ano: '',
  estado: '',
  localizacao: '',
})

// 2. ESTADOS DO MODAL
const modalVendaAberto = ref(false)
const pecaSelecionada = ref<any>(null)

// 3. REQUISIÇÃO DE DADOS
const { data: estoqueCompleto, status, refresh } = await useFetch('/api/pecas', {
  lazy: true,
})

// 4. LISTAS FIXAS E EXTRAÇÃO DE OPÇÕES ÚNICAS
const estadosValidos = [
  'NOVO', 'SEM-DETALHE', '1 GARRA RECUPERADA', 'DETALHE NA LENTE', 
  '2 GARRAS RECUPERADAS', '3 GARRAS RECUPERADAS', 'TODAS GARRAS RECUPERADAS'
]

const opcoesUnicas = computed(() => {
  const lista = estoqueCompleto.value || []
  
  const marcas = new Set<string>()
  const procedencias = new Set<string>()
  const lados = new Set<string>()
  const anos = new Set<string>()
  const localizacoes = new Set<string>()
  const modelos = new Set<string>()

  lista.forEach((p: any) => {
    if (p.marca) marcas.add(p.marca) 
    if (p.procedencia) procedencias.add(p.procedencia)
    if (p.lado) lados.add(p.lado)
    if (p.ano) anos.add(p.ano)
    if (p.localizacao) localizacoes.add(p.localizacao)
    if (p.modelo) modelos.add(p.modelo)
  })

  return {
    marcas: Array.from(marcas).sort(),
    procedencias: Array.from(procedencias).sort(),
    lados: Array.from(lados).sort(),
    modelos: Array.from(modelos).sort(),
    anos: Array.from(anos).sort(),
    localizacoes: Array.from(localizacoes).sort(),
    estados: estadosValidos,
  }
})

// 5. LÓGICA DE FILTRAGEM NO FRONTEND
const linhasFiltradas = computed(() => {
  const lista = estoqueCompleto.value || []
  const filtros = filtrosAtivos.value
  
  return lista.filter((row: any) => {
    // 1. Filtro de Busca Geral
    if (filtros.busca) {
      const buscaLower = filtros.busca.toLowerCase()
      const nome = (row.nome || '').toLowerCase()
      const marca = (row.marca || '').toLowerCase()
      const lado = (row.lado || '').toLowerCase()
      const observacoes = (row.observacoes || '').toLowerCase()
      const detalhes = (row.detalhes || '').toLowerCase()
      
      const encontrou = nome.includes(buscaLower) || 
                       marca.includes(buscaLower) || 
                       observacoes.includes(buscaLower) ||
                       lado.includes(buscaLower) ||
                       detalhes.includes(buscaLower)
      
      if (!encontrou) return false
    }

    // Filtros específicos
    if (filtros.lado && row.lado !== filtros.lado) return false
    if (filtros.marca && row.marca !== filtros.marca) return false
    if (filtros.modelo && row.modelo !== filtros.modelo) return false
    if (filtros.ano && row.ano !== filtros.ano) return false
    if (filtros.estado && row.estado !== filtros.estado) return false
    if (filtros.localizacao && row.localizacao !== filtros.localizacao) return false

    return true
  })
})

// ===============================
// FUNÇÕES
// ===============================

function abrirVenda(row: any) {
  pecaSelecionada.value = { ...row }
  modalVendaAberto.value = true
}

async function handleVendaConfirmada() {
  console.log('Venda confirmada, fechando modal e atualizando lista')
  
  // Fecha o modal
  modalVendaAberto.value = false
  
  // Aguarda um pouco antes de limpar
  setTimeout(() => {
    pecaSelecionada.value = null
  }, 300)
  
  // Atualiza a lista
  await refresh()
}

// Watch para garantir que quando o modal fecha, limpa a peça selecionada
watch(modalVendaAberto, (isOpen) => {
  if (!isOpen) {
    setTimeout(() => {
      pecaSelecionada.value = null
    }, 300)
  }
})

async function excluir(id: string) {
  const confirma = confirm('⚠️ Tem certeza que deseja excluir esta peça?\n\nEla será marcada como inativa e não aparecerá mais na listagem.')
  
  if (!confirma) return

  try {
    await $fetch(`/api/pecas/${id}`, {
      method: 'DELETE'
    })

    toast.add({ 
      title: 'Peça excluída', 
      description: 'A peça foi removida do estoque com sucesso',
      color: 'green',
      timeout: 3000
    })

    await refresh()
    
  } catch (error: any) {
    console.error('Erro ao excluir:', error)
    
    const mensagem = error?.data?.message || 'Não foi possível excluir a peça'
    
    toast.add({ 
      title: 'Erro ao excluir', 
      description: mensagem,
      color: 'red',
      timeout: 5000
    })
  }
}

function formatarPreco(row: any) { 
  return formatarDinheiro(Number(row.preco)) 
}

function formatarDinheiro(val: number) { 
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(val || 0) 
}
</script>
