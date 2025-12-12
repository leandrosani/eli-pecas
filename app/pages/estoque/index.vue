<template>
  <div class="flex h-screen overflow-hidden">
    
    <!-- CONTEÚDO PRINCIPAL -->
    <div class="flex-1 overflow-y-auto p-2 pb-20">
      <div class="max-w-full mx-auto p-2">

        <!-- HEADER + AÇÕES -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex flex-col mb-2">

          <div class="flex justify-between items-center">
            <!-- Título -->
            <h1 class="text-2xl md:text-4xl font-bold text-gray-900 flex items-center gap-2">
              📦 <span class="text-xl">Estoque Total</span>
            </h1>
          </div>
        </div>


        <!-- AÇÕES -->
        <div class="bg-white border border-gray-200 rounded-xl shadow-sm p-3 mb-2 flex flex-col gap-4">

          <div class="flex justify-between items-center">
            <h2 class="text-lg md:text-xl font-bold text-gray-700">
              Total de itens:
              <strong class="text-gray-900">{{ linhasFiltradas.length }}</strong>
            </h2>

            <!-- Botão Mobile -->
            <div class="flex items-center md:hidden">
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
        
        <!-- PAINEL DE FILTROS MOBILE -->
        <div class="block md:hidden mb-6">
          <FiltroEstoqueMobille 
            v-model="filtrosAtivos"
            :options="opcoesUnicas"
            :estoque="estoqueCompleto || []"
          />
        </div>

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
                  <th class="py-4 px-4 text-xs uppercase font-bold text-white">Peça</th>
                  <th class="py-4 px-3 text-xs text-center uppercase font-bold text-white">Aplicação</th>
                  <th class="py-4 px-3 text-xs text-center uppercase font-bold text-white">Localização</th>
                  <th class="py-4 px-3 text-xs uppercase font-bold text-white text-center">Preço</th>
                  <th class="py-4 px-3 text-xs uppercase font-bold text-white text-center">Ações</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-200">

                <tr v-for="row in linhasFiltradas" :key="row.id" class="hover:bg-gray-50 transition-all">
                  <!-- NOME + MARCA + ESTADO -->
                  <td class="py-3 px-4">
                    <div class="flex items-center gap-3">

                      <!-- Quantidade -->
                      <div class="w-11 h-11 rounded-xl bg-gray-200 flex flex-col items-center justify-center shadow-sm border border-gray-300 flex-shrink-0">
                        <span class="text-xl font-bold text-gray-800 leading-none">{{ row.quantidade }}</span>
                        <span class="text-[7px] font-bold text-gray-600 uppercase tracking-wide">un.</span>
                      </div>

                      <!-- Texto -->
                      <div class="min-w-0 flex-1">
                        <div class="font-bold text-gray-900 text-sm mb-0.5 truncate">{{ row.nome }}</div>
                        <div class="font-semibold text-gray-700 text-xs mb-1 truncate">{{ row.modelo }}</div>

                        <div class="flex gap-1.5 flex-wrap">
                          <span class="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-gray-100 text-orange-800">
                            {{ row.lado }}
                          </span>

                          <span v-if="row.estado" class="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-orange-100 text-gray-900 truncate max-w-[150px]">
                            {{ row.estado }}
                          </span>
                        </div>
                      </div>

                    </div>
                  </td>

                  <!-- APLICAÇÃO -->
                  <td class="py-3 px-3">
                    <div class="flex flex-col">
                      <span class="text-xs font-bold uppercase text-gray-500 truncate text-center">{{ row.marca || 'Universal' }}</span>
                      <span v-if="row.ano" class="text-sm font-bold mt-0.5 text-gray-900 text-center">{{ row.ano }}</span>
                    </div>
                  </td>

                  <!-- LOCALIZAÇÃO -->
                  <td class="py-3 px-3 text-center">
                    <div 
                      v-if="row.localizacao" 
                      class="inline-flex items-center gap-1.5 bg-purple-200/20 px-2.5 py-1 rounded-md shadow-sm border border-purple-200 max-w-full"
                    >
                      <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-purple-800 flex-shrink-0" />
                      <span class="text-xs font-bold text-purple-800 truncate">{{ row.localizacao }}</span>
                    </div>
                  </td>

                  <!-- PREÇO -->
                  <td class="py-3 px-3 text-center">
                    <div class="font-bold text-gray-800 text-sm">{{ formatarPreco(row) }}</div>
                  </td>

                  <!-- AÇÕES -->
                  <td class="py-3 px-3">
                    <div class="flex flex-col items-center justify-center gap-1.5">

                      <UButton 
                        v-if="row.quantidade > 0" 
                        icon="i-heroicons-currency-dollar" 
                        size="xs" 
                        @click="abrirVenda(row)" 
                        class="flex justify-center items-center w-20 bg-green-600 hover:bg-green-700 text-white rounded-lg px-2 py-1.5 text-[11px] font-semibold shadow-sm transition-all"
                      >
                        Vender
                      </UButton>

                      <span 
                        v-else 
                        class="flex justify-center items-center w-20 text-center px-2 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-[11px] font-semibold"
                      >
                        Esgotado
                      </span>

                      <UButton 
                        :to="`/estoque/editar/${row.id}`" 
                        icon="i-heroicons-pencil-square" 
                        size="xs" 
                        class="flex justify-center items-center w-20 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-2 py-1.5 text-[11px] font-semibold text-center shadow-sm transition-all"
                      >
                        Editar
                      </UButton>

                      <UButton 
                        icon="i-heroicons-trash" 
                        size="xs" 
                        @click="excluir(row.id)" 
                        class="flex justify-center items-center w-20 bg-red-600 hover:bg-red-700 text-white rounded-lg px-2 py-1.5 text-[11px] font-semibold shadow-sm transition-all"
                      >
                        Excluir
                      </UButton>

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
                <div class="min-w-0 flex-1">  
                  <h3 class="font-bold text-white text-base truncate">{{ row.nome }}</h3>
                  <h3 class="font-bold text-white text-base truncate">{{ row.modelo }}</h3>
                </div>
                <!-- Quantidade -->
                <div class="min-w-[36px] h-6 flex flex-col gap-1 items-center justify-center flex-shrink-0">
                  <span class="text-base font-bold text-white leading-none">{{ row.quantidade }}</span>
                  <span class="text-[8px] font-bold text-white uppercase tracking-wide">un.</span>
                </div>
              </div>

              <!-- Conteúdo do Card -->
              <div class="p-4 space-y-3">
                
                <!-- Marca + Procedência + Estado -->
                 <div class="flex justify-between gap-3">
                  <div class="flex flex-col gap-2 min-w-0 flex-1">
                    <div class="flex gap-1.5 flex-col border-b pb-2 border-gray-200">
                      <span class="text-sm font-bold uppercase tracking-wide text-gray-900">
                        {{ row.lado }}
                      </span>

                      <span v-if="row.estado" class="text-sm font-bold uppercase tracking-wide text-orange-500 truncate">
                        {{ row.estado }}
                      </span>
                    </div>

                    <!-- Aplicação -->
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold text-gray-500 uppercase truncate">{{ row.marca || 'Universal' }}</span>
                      <span v-if="row.ano" class="text-sm font-bold text-gray-900 flex-shrink-0">{{ row.ano }}</span>
                    </div>

                    <!-- Localização -->
                    <div v-if="row.localizacao" class="flex items-center gap-1 -ml-0.5 min-w-0">
                      <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span class="text-sm font-bold text-purple-800 truncate">{{ row.localizacao }}</span>
                    </div>
                  </div>

                  <!--btns Mobille-->
                  <div class="flex flex-col items-center justify-center gap-2 flex-shrink-0">
                    <UButton 
                      v-if="row.quantidade > 0"
                      variant="soft" 
                      icon="i-heroicons-currency-dollar" 
                      size="lg" 
                      square
                      class="w-9 h-9 flex items-center justify-center 
                            !bg-green-100 !text-green-600 hover:!bg-green-200 
                            shadow-sm rounded-lg transition-all hover:shadow-md" 
                      @click="abrirVenda(row)"
                    />

                    <UButton 
                      :to="`/estoque/editar/${row.id}`" 
                      variant="soft" 
                      icon="i-heroicons-pencil-square" 
                      size="lg" 
                      square
                      class="w-9 h-9 flex items-center justify-center
                            !bg-orange-50 !text-orange-500 hover:!bg-orange-100 
                            shadow-sm rounded-lg transition-all hover:shadow-md"
                    />

                    <UButton 
                      variant="soft" 
                      icon="i-heroicons-trash" 
                      size="lg" 
                      square
                      class="w-9 h-9 flex items-center justify-center
                            !bg-red-50 !text-red-600 hover:!bg-red-100 
                            shadow-sm rounded-lg transition-all hover:shadow-md" 
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

      </div>
    </div>

    <!-- SIDEBAR LATERAL DIREITA - DESKTOP APENAS -->
    <aside class="ml-3.5 hidden md:block mt-4 w-65 h-[87vh] border-l border-gray-200 rounded-2xl bg-white shadow-xl overflow-hidden">
      <FiltroEstoqueDesktop 
        v-model="filtrosAtivos"
        :options="opcoesUnicas"
        :estoque="estoqueCompleto || []"
      />
    </aside>

    <!-- MODAL DE VENDA -->
    <div 
      v-if="modalVendaAberto"
      class="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
    >
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
import FiltroEstoqueMobille from '~/components/FiltroEstoqueMobille.vue'
import FiltroEstoqueDesktop from '~/components/FiltroEstoqueDesktop.vue'
import ModalVenda from '~/components/ModalVenda.vue'
import { ref, computed } from 'vue'

definePageMeta({ layout: 'default' })

const toast = useToast()

const filtrosAtivos = ref({
  busca: '',
  marca: '',
  lado: '',
  procedencia: '',
  modelo: '',
  peca: '',  // ← ADICIONEI AQUI
  ano: '',
  estado: '',
  localizacao: '',
  somenteDisponiveis: false  // ← ADICIONEI AQUI TAMBÉM
})

const modalVendaAberto = ref(false)
const pecaSelecionada = ref<any>(null)

const { data: estoqueCompleto, status, refresh } = await useFetch('/api/pecas', {
  lazy: true,
})

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

const linhasFiltradas = computed(() => {
  let lista = estoqueCompleto.value || []
  const filtros = filtrosAtivos.value
  
  // Filtro de somente disponíveis
  if (filtros.somenteDisponiveis) {
    lista = lista.filter((row: any) => row.quantidade > 0)
  }
  
  // Filtro de busca
  if (filtros.busca) {
    const buscaLower = filtros.busca.toLowerCase()
    lista = lista.filter((row: any) => {
      const nome = (row.nome || '').toLowerCase()
      const marca = (row.marca || '').toLowerCase()
      const lado = (row.lado || '').toLowerCase()
      const observacoes = (row.observacoes || '').toLowerCase()
      const detalhes = (row.detalhes || '').toLowerCase()
      
      return nome.includes(buscaLower) || 
             marca.includes(buscaLower) || 
             observacoes.includes(buscaLower) ||
             lado.includes(buscaLower) ||
             detalhes.includes(buscaLower)
    })
  }

  // Filtros específicos
  if (filtros.modelo) lista = lista.filter((row: any) => row.modelo === filtros.modelo)
  if (filtros.peca) lista = lista.filter((row: any) => row.nome === filtros.peca)  // ← ADICIONEI AQUI
  if (filtros.lado) lista = lista.filter((row: any) => row.lado === filtros.lado)
  if (filtros.marca) lista = lista.filter((row: any) => row.marca === filtros.marca)
  if (filtros.ano) lista = lista.filter((row: any) => row.ano === filtros.ano)
  if (filtros.estado) lista = lista.filter((row: any) => row.estado === filtros.estado)
  if (filtros.localizacao) lista = lista.filter((row: any) => row.localizacao === filtros.localizacao)
  
  return lista
})

function abrirVenda(row: any) {
  pecaSelecionada.value = { ...row }
  modalVendaAberto.value = true
}

async function handleVendaConfirmada() {
  modalVendaAberto.value = false
  setTimeout(() => {
    pecaSelecionada.value = null
  }, 300)
  await refresh()
}

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
