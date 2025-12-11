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

        <!-- Botão Mobile/Desktop -->
        <div class="flex items-center gap-3">
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
    </div>
    
    <!-- ========================================================== -->
    <!-- PAINEL DE FILTROS AVANÇADOS (MOBILE MODAL E DESKTOP PERSISTENTE) -->
    <!-- ========================================================== -->

    <!-- MOBILE: Botão que abre o Modal (o componente FiltroEstoque) -->
    <div class="block md:hidden mb-6">
      <FiltroEstoque 
        v-model="filtrosAtivos"
        :options="opcoesUnicas"
        :estoque="estoqueCompleto || []"
      />
    </div>

    <!-- DESKTOP: Painel Fixo, VISÍVEL COM BOTÕES/TAGS -->
    <div class="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
      <div class="grid grid-cols-1 gap-6">
        
        <!-- 1. BUSCA GERAL (LINHA ÚNICA) -->
        <div class="grid grid-cols-4 gap-4 items-end">
            <div class="col-span-4 lg:col-span-1">
                <label class="text-xs font-semibold text-gray-600 mb-1 block">🔍 Busca Geral</label>
                <UInput 
                    v-model="filtrosAtivos.busca"
                    placeholder="Nome, Modelo, Localização..."
                    class="w-full"
                    :ui="{base: 'h-10'}"
                />
            </div>
            
            <!-- Checkbox: Somente Disponíveis -->
            <label class="flex items-center gap-2 text-sm font-semibold text-gray-700 col-span-1">
                <input type="checkbox" v-model="filtrosAtivos.somenteDisponiveis" />
                Somente disponíveis
            </label>
            
            <!-- Botão Limpar Filtros -->
            <div class="col-span-4 lg:col-span-2 flex justify-end">
                <UButton 
                    @click="limparFiltrosDesktop" 
                    icon="i-heroicons-trash" 
                    color="orange" 
                    variant="soft" 
                    size="sm"
                    class="font-semibold"
                >
                    Limpar Filtros ({{ totalFiltrosAtivos }})
                </UButton>
            </div>
        </div>

        <!-- 2. MODELO (BOTÕES/TAGS) -->
        <div>
          <label class="text-xs font-semibold text-gray-600 mb-2 block">Modelo</label>
          <div class="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            <button
              v-for="m in opcoesUnicas.modelos"
              :key="m"
              @click="filtrosAtivos.modelo = filtrosAtivos.modelo === m ? '' : m"
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                filtrosAtivos.modelo === m
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              ]"
            >
              {{ m }}
            </button>
          </div>
        </div>
        
        <!-- 3. PEÇA (NOME) (BOTÕES/TAGS) -->
        <div v-if="filtrosAtivos.modelo">
          <label class="text-xs font-semibold text-gray-600 mb-2 block">Peça (Nome)</label>
          <div class="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            <button
              v-for="p in pecasDisponiveisDesktop"
              :key="p"
              @click="filtrosAtivos.peca = filtrosAtivos.peca === p ? '' : p"
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                filtrosAtivos.peca === p
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              ]"
            >
              {{ p }}
            </button>
          </div>
        </div>
        
        <!-- 4. LADO (BOTÕES/TAGS) -->
        <div v-if="filtrosAtivos.peca && ladosDisponiveisDesktop.length">
          <label class="text-xs font-semibold text-gray-600 mb-2 block">Lado</label>
          <div class="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            <button
              v-for="lado in ladosDisponiveisDesktop"
              :key="lado"
              @click="filtrosAtivos.lado = filtrosAtivos.lado === lado ? '' : lado"
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                filtrosAtivos.lado === lado
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              ]"
            >
              {{ lado }}
            </button>
          </div>
        </div>
        
        <!-- 5. ESTADO (CONDIÇÃO) (BOTÕES/TAGS) -->
        <div>
          <label class="text-xs font-semibold text-gray-600 mb-2 block">Condição (Estado)</label>
          <div class="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
            <button
              v-for="estado in opcoesUnicas.estados"
              :key="estado"
              @click="filtrosAtivos.estado = filtrosAtivos.estado === estado ? '' : estado"
              :class="[
                'px-3 py-1 rounded-full text-xs font-semibold border transition-colors',
                filtrosAtivos.estado === estado
                  ? 'bg-orange-600 text-white border-orange-600 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
              ]"
            >
              {{ estado }}
            </button>
          </div>
        </div>

      </div>
    </div>


    <!-- LOADING STATE -->
    <div v-if="status === 'pending'" class="py-12 text-center bg-white border border-gray-200 rounded-xl shadow-sm">
      <UIicon
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
                  <UIicon name="i-heroicons-map-pin" class="w-4 h-4 text-purple-800" />
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
            <UIicon name="i-heroicons-archive-box-x-mark" class="w-8 h-8 text-gray-400" />
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
                  <UIicon name="i-heroicons-map-pin" class="w-4 h-4 text-purple-600" />
                  <span class="text-sm font-bold text-purple-800">{{ row.localizacao }}</span>
                </div>
              </div>

              <!--btns Mobille-->
              <div class="flex flex-col gap-2">
                <UButton 
                  v-if="row.quantidade > 0"
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
            <UIicon name="i-heroicons-archive-box-x-mark" class="w-8 h-8 text-gray-400" />
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
import { ref, computed, watch } from 'vue'

definePageMeta({ layout: 'default' })

const toast = useToast()

// 1. ESTADO DOS FILTROS
// Adicionamos 'somenteDisponiveis' para controle via checkbox no desktop
const filtrosAtivos = ref({
  busca: '',
  marca: '', // Antiga "Montadora"
  lado: '',
  modelo: '', // Modelo
  estado: '',
  localizacao: '',
  somenteDisponiveis: true // Novo filtro de disponibilidade
})

// 2. ESTADOS DO MODAL
const modalVendaAberto = ref(false)
const pecaSelecionada = ref<any>(null)

// 3. REQUISIÇÃO DE DADOS
const { data: estoqueCompleto, status, refresh } = await useFetch('/api/pecas', {
  lazy: true,
})

// Computed para contar filtros ativos para o botão "Limpar"
const totalFiltrosAtivos = computed(() => {
    // Conta todos os filtros que não são vazios e ignora o 'somenteDisponiveis'
    return Object.entries(filtrosAtivos.value)
        .filter(([key, value]) => key !== 'somenteDisponiveis' && value && value !== '')
        .length;
});

// 4. EXTRAÇÃO DE OPÇÕES ÚNICAS (Para popular SELECTs no Desktop e Mobile)
const estadosValidos = [
  'NOVO', 'SEM-DETALHE', '1 GARRA RECUPERADA', 'DETALHE NA LENTE', 
  '2 GARRAS RECUPERADAS', '3 GARRAS RECUPERADAS', 'TODAS GARRAS RECUPERADAS'
]

const opcoesUnicas = computed(() => {
  const lista = estoqueCompleto.value || []
  
  const marcas = new Set<string>() // Montadora
  const lados = new Set<string>()
  const anos = new Set<string>()
  const localizacoes = new Set<string>()
  const modelos = new Set<string>() // Modelo

  lista.forEach((p: any) => {
    if (p.marca) marcas.add(p.marca) 
    if (p.lado) lados.add(p.lado)
    if (p.ano) anos.add(p.ano)
    if (p.localizacao) localizacoes.add(p.localizacao)
    if (p.modelo) modelos.add(p.modelo)
  })

  return {
    marcas: Array.from(marcas).sort(),
    lados: Array.from(lados).sort(),
    modelos: Array.from(modelos).sort(),
    anos: Array.from(anos).sort(),
    localizacoes: Array.from(localizacoes).sort(),
    estados: estadosValidos,
  }
})

// Lógica de filtragem dos SELECTs do DESKTOP (Modelo -> Peça -> Lado)
// ----------------------------------------------------------------------

// Peças disponíveis (row.nome) para o Modelo SELECIONADO
const pecasDisponiveisDesktop = computed(() => {
  let itens = estoqueCompleto.value || [];
  if (filtrosAtivos.value.somenteDisponiveis) itens = itens.filter((i: any) => i.quantidade > 0);
  if (filtrosAtivos.value.modelo) {
    itens = itens.filter((i: any) => i.modelo === filtrosAtivos.value.modelo);
  }
  const pecas = new Set<string>();
  itens.forEach((item: any) => {
    if (item.nome) pecas.add(item.nome); 
  });
  // Se o modelo mudar, limpa a peça selecionada se ela não estiver mais disponível
  if (filtrosAtivos.value.peca && !pecas.has(filtrosAtivos.value.peca)) {
    filtrosAtivos.value.peca = '';
  }
  return Array.from(pecas).sort();
});

// Lados disponíveis para a Peça SELECIONADA
const ladosDisponiveisDesktop = computed(() => {
  let itens = estoqueCompleto.value || [];
  if (filtrosAtivos.value.somenteDisponiveis) itens = itens.filter((i: any) => i.quantidade > 0);
  if (filtrosAtivos.value.modelo) {
    itens = itens.filter((i: any) => i.modelo === filtrosAtivos.value.modelo);
  }
  if (filtrosAtivos.value.peca) {
    itens = itens.filter((i: any) => i.nome === filtrosAtivos.value.peca); 
  }
  const lados = new Set<string>();
  itens.forEach((item: any) => {
    if (item.lado) lados.add(item.lado);
  });
  // Se a peça mudar, limpa o lado selecionado se ele não estiver mais disponível
  if (filtrosAtivos.value.lado && !lados.has(filtrosAtivos.value.lado)) {
    filtrosAtivos.value.lado = '';
  }
  return Array.from(lados).sort();
});


// 5. LÓGICA DE FILTRAGEM FINAL (Aplica todos os filtros)
const linhasFiltradas = computed(() => {
  const lista = estoqueCompleto.value || []
  const filtros = filtrosAtivos.value
  
  return lista.filter((row: any) => {
    // 1. Filtro de Busca Geral (Desktop/Mobile)
    if (filtros.busca) {
      const buscaLower = filtros.busca.toLowerCase()
      const nome = (row.nome || '').toLowerCase()
      const modelo = (row.modelo || '').toLowerCase()
      const lado = (row.lado || '').toLowerCase()
      const localizacao = (row.localizacao || '').toLowerCase()
      const detalhes = (row.detalhes || '').toLowerCase()
      
      const encontrou = nome.includes(buscaLower) || 
                       modelo.includes(buscaLower) || 
                       lado.includes(buscaLower) ||
                       localizacao.includes(buscaLower) ||
                       detalhes.includes(buscaLower)
      
      if (!encontrou) return false
    }

    // 2. Filtro de Disponibilidade
    if (filtros.somenteDisponiveis && row.quantidade <= 0) return false;

    // 3. Filtros de Select (Aplicação Sequencial)
    if (filtros.modelo && row.modelo !== filtros.modelo) return false
    if (filtros.peca && row.nome !== filtros.peca) return false
    if (filtros.lado && row.lado !== filtros.lado) return false
    
    // Filtros de Select simples
    if (filtros.ano && row.ano !== filtros.ano) return false
    if (filtros.estado && row.estado !== filtros.estado) return false
    if (filtros.localizacao && row.localizacao !== filtros.localizacao) return false
    if (filtros.marca && row.marca !== filtros.marca) return false // A montadora no DB é 'marca'

    return true
  })
})

// ===============================
// FUNÇÕES
// ===============================

// Limpa os filtros do painel DESKTOP
function limparFiltrosDesktop() {
    // Reseta todos os campos, exceto o de disponibilidade, que é controlado pelo checkbox
    filtrosAtivos.value = {
        busca: '',
        marca: '',
        lado: '',
        modelo: '',
        estado: '',
        localizacao: '',
        somenteDisponiveis: filtrosAtivos.value.somenteDisponiveis // Mantém o estado do checkbox
    };
}


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