<template>
  <div class="pb-20 relative">
    
    <div class="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
      <h1 class="font-semibold md:hidden text-xl text-black"><span class="text-2xl">📦 </span>Estoque Total</h1>

      <h1 class="text-3xl font-bold text-gray-900 tracking-tight hidden"><span class="text-4xl">📦 </span>Estoque Total</h1>
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-[md] md:text-xl text-gray-800 mt-0.5 md:mt-1 font-bold">
            Total de itens: <strong class="text-gray-600">{{ linhasFiltradas.length }}</strong>
          </h2>
        </div>
        
        <!-- Botão Mobile -->
        <UButton 
          to="/estoque/criar" 
          icon="i-heroicons-plus" 
          size="md" 
          class="md:hidden shadow-lg rounded-full p-2 flex items-center justify-center bg-gray-600 font-bold text-white" 
        >
        Adicionar
        </UButton>
        
        <!-- Botão Desktop -->
        <UButton 
          to="/estoque/criar" 
          icon="i-heroicons-plus" 
          size="lg" 
          class="cursor-pointer border bg-gradient-to-br from-gray-600 to-gray-700 text-white border-gray-600 px-4 py-3 hidden md:flex shadow-lg hover:from-gray-700 hover:to-gray-800 hover:shadow-xl transition-all active:scale-[0.98] rounded-xl font-bold"
        >
          Adicionar Peça
        </UButton>
      </div>

      <!-- Input de Busca -->
      <div class="relative">
        <UInput 
          v-model="busca" 
          placeholder="Buscar por nome, marca ou modelo..." 
          size="lg"
          class="w-full shadow-sm rounded-xl border-2 border-gray-200 focus-within:border-orange-400 transition-all [&_input]:pl-11"
          :ui="{ 
            base: 'placeholder:text-gray-400 focus:ring-2 focus:ring-orange-400/20'
          }"
        >
          <template #trailing v-if="busca">
            <UButton 
              color="gray" 
              variant="ghost" 
              icon="i-heroicons-x-mark" 
              :padded="false" 
              @click="busca = ''" 
              class="hover:bg-gray-100 rounded-full transition-colors"
            />
          </template>
        </UInput>
      </div>
    </div>

    <!-- Desktop Table -->
    <div class="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-600">
          <tr>
            <th class="py-4 px-6 text-xs uppercase font-bold text-white w-4/12">Peça / Marca</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-white w-2/12">Aplicação</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-white w-2/12">Localização</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-white w-2/12 text-right">Preço</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-white w-1/12 text-center">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="row in linhasFiltradas" :key="row.id" class="hover:bg-gray-50 transition-all group">
            
            <!-- Peça / Marca -->
            <td class="py-4 px-6 align-middle">
              <div class="flex items-center gap-3">
                <!-- Badge de Quantidade no lugar do ícone -->
                <div class="w-12 h-12 rounded-xl bg-gray-200 flex flex-col items-center justify-center shrink-0 shadow-sm border border-gray-300">
                  <span class="text-2xl font-bold text-gray-800 leading-none">{{ row.quantidade }}</span>
                  <span class="text-[8px] font-bold text-gray-600 uppercase tracking-wide">un.</span>
                </div>
                
                <div>
                  <div class="font-bold text-gray-900 text-sm mb-1">{{ row.nome }}</div>
                  <div class="flex flex-col items-start gap-1.5">
                    <span class="text-[12px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-gray-100 text-orange-800 border border-0">
                      • {{ row.marca }}
                    </span>
                    <span v-if="row.estado" class="text-[12px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-orange-100 text-black border border-0">
                      • {{ row.estado }}
                    </span>
                  </div>
                </div>
              </div>
            </td>

            <!-- Aplicação -->
            <td class="py-4 px-6 align-middle">
              <div class="flex flex-col">
                <span class="text-xs font-bold uppercase tracking-wide text-gray-500">{{ row.modelo || 'Universal' }}</span>
                <span v-if="row.ano" class="text-sm font-bold text-gray-900 mt-0.5">{{ row.ano }}</span>
              </div>
            </td>

            <!-- Localização -->
            <td class="py-4 px-6 align-middle">
              <div class="flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-2.5 py-1.5 rounded-lg w-fit">
                <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-orange-800" />
                <span class="text-[12px] font-bold text-orange-800">{{ row.detalhes }}</span>
              </div>
            </td>

            <!-- Quantidade (agora vazia ou pode remover essa coluna) -->
            <td class="md:hidden py-4 px-6 align-middle text-center">
              <div class="flex items-center justify-center gap-1 bg-orange-50 px-2.5 py-1 rounded-md border border-orange-200 w-fit mx-auto">
                <UIcon name="i-heroicons-cube" class="w-3.5 h-3.5 text-orange-600" />
                <span v-if="row.quantidade > 0" class="text-xs font-bold text-orange-900">{{ row.quantidade }}</span>
                <span v-else class="text-xs font-bold text-red-600">0</span>
              </div>
            </td>

            <!-- Preço -->
            <td class="py-4 px-6 align-middle text-right">
              <div class="font-bold text-gray-800 text-base">{{ formatarPreco(row) }}</div>
            </td>

            <!-- Ações -->
            <td class="py-4 px-6 align-middle">
              <div class="flex flex-col items-center justify-center gap-2">
                <UButton 
                  v-if="row.quantidade > 0" 
                  size="xs"
                  icon="i-heroicons-currency-dollar" 
                  @click="abrirVenda(row)"
                  class="w-23 cursor-pointer transition-all active:scale-95 rounded-lg font-semibold text-[12px] bg-green-800 text-white shadow-sm hover:bg-green-600 hover:shadow-md px-2.5 py-1.5 text-center"
                  title="Vender"
                > 
                Vender
                </UButton>

                <span
                  v-else
                  class="w-23 cursor-pointer transition-all active:scale-95 rounded-lg font-semibold text-[12px] bg-red-50 text-red-600 shadow-sm px-2.5 py-1.5 text-center border-2 border-red-200"
                >
                  ESGOTADO
                </span>
  
                <UButton 
                  :to="`/estoque/editar/${row.id}`" 
                  icon="i-heroicons-pencil-square" 
                  size="xs"
                  class="w-24 text-center cursor-pointer px-2.5 py-1.5 bg-[#fe8330] text-white shadow-sm hover:bg-orange-700 hover:shadow-md transition-all active:scale-95 rounded-lg font-semibold text-[12px]"
                  title="Editar"
                >
                Editar
                </UButton>
                
                <UButton 
                  icon="i-heroicons-trash" 
                  size="xs" 
                  @click="excluir(row.id)"
                  class="w-24 text-center cursor-pointer px-2.5 py-1.5 bg-red-800 text-white shadow-sm hover:bg-red-600 hover:shadow-md transition-all active:scale-95 rounded-lg font-semibold text-[12px]"
                  title="Excluir"
                >
                Excluir
                </UButton>
              </div>
            </td>

          </tr>
        </tbody>
      </table>
      
      <div v-if="!linhasFiltradas.length && status !== 'pending'" class="text-center py-16">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UIcon name="i-heroicons-archive-box-x-mark" class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500 font-medium">Nenhuma peça encontrada</p>
        <p class="text-gray-400 text-sm mt-1">Tente ajustar sua busca</p>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-2.5">
      <div v-if="status === 'pending'" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto text-orange-500" />
        <p class="text-gray-500 text-sm mt-2">Carregando...</p>
      </div>

      <div
        v-for="item in linhasFiltradas"
        :key="item.id"
        class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all"
      >
        <!-- Header: Modelo + Quantidade -->
        <div class="flex justify-between items-start mb-1">
          <span class="text-[12px] font-bold uppercase tracking-wide text-gray-500">
            {{ item.modelo || 'Universal' }}
          </span>
          
          <!-- Quantidade movida para cá -->
          <div class="flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
            <UIcon name="i-heroicons-cube" class="w-3 h-3 text-gray-600" />
            <span class="text-xs font-bold text-gray-900">{{ item.quantidade }}</span>
          </div>
        </div>

        <!-- Nome da peça -->
        <h3 class="font-bold text-gray-900 text-base leading-tight mb-1.5">
          {{ item.nome }} 
          <span v-if="item.ano" class="text-sm text-gray-600 font-normal">• {{ item.ano }}</span>
        </h3>

        <!-- Tags: Marca + Estado -->
        <div class="flex flex-wrap items-center gap-1.5 mb-2">
          <span class="px-1.5 py-0.5 bg-gray-100 text-gray-900 text-[11px] font-semibold uppercase tracking-wide rounded-md border-0 text-gray-900">
            {{ item.marca }}
          </span>

          <span
            v-if="item.estado"
            class="px-1.5 py-0.5 bg-orange-100 text-black text-[11px] font-semibold uppercase tracking-wide rounded-md border-0"
          >
            {{ item.estado }}
          </span>
        </div>

        <!-- Endereço -->
        <div v-if="item.detalhes" class="mb-2 p-2 bg-gray-100 rounded-md border border-gray-200">
          <div class="flex justify-between items-center">
            
            <div>  
              <p class="text-[10px] font-bold text-orange-700 uppercase tracking-wide mb-0.5 flex items-center gap-1">
              <UIcon name="i-heroicons-map-pin" class="w-2.5 h-2.5" />
              Localização
              </p>
              <p class="ml-1 text-[14px] font-semibold text-orange-700 leading-tight font-medium">
                {{ item.detalhes }}
              </p>
            </div>

            <div class="flex flex-col">
              <span class="text-base font-bold text-gray-900">
                {{ formatarPreco(item) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Botões de Ação (compactos) -->
        <div class="flex gap-6">
          <!-- Botão Vender -->
          <UButton
            v-if="item.quantidade > 0"
            size="sm"
            icon="i-heroicons-currency-dollar"
            block
            class="text-center text-[13px] text-white bg-green-800 px-3 py-1 rounded-lg"
            @click="abrirVenda(item)"
          >
            Vender
          </UButton>

          <span
            v-else
            class="text-center text-[12px] font-bold text-red-600 bg-red-50 px-3 py-1 rounded-lg border-2 border-red-200"
          >
            ESGOTADO
          </span>

          <UButton 
            :to="`/estoque/editar/${item.id}`" 
            color="primary"
            variant="soft"
            icon="i-heroicons-pencil-square" 
            size="sm"
            class="text-center text-[13px] text-white bg-[#fe8330] px-3 py-1 rounded-lg"
          >
            Editar
          </UButton>

          <UButton 
            color="error" 
            variant="soft"
            icon="i-heroicons-trash" 
            size="sm" 
            @click="excluir(item.id)"
            class="text-center text-[13px] text-white bg-red-800 px-3 py-1 rounded-lg"
          >
            Excluir
          </UButton>
        </div>
      </div>

      <div v-if="!linhasFiltradas.length && status !== 'pending'" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <UIcon name="i-heroicons-archive-box-x-mark" class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500 font-medium text-sm">Nenhuma peça encontrada</p>
      </div>
    </div>

    <!-- Modal de Venda -->
    <div v-if="modalVendaAberto" class="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4" @click.self="modalVendaAberto = false">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        <!-- Header -->
        <div class="bg-gradient-to-r from-orange-600 to-orange-700 p-6 text-white">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-bold">Registrar Venda</h3>
            <button @click="modalVendaAberto = false" class="text-white/80 hover:text-white transition-colors">
              <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="p-6">
          <div class="text-center mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p class="text-gray-500 text-xs uppercase tracking-wider font-bold mb-2">Produto Selecionado</p>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">{{ itemParaVenda?.nome }}</h2>
            <p class="text-sm text-gray-600">
              Disponível: <strong class="text-orange-600">{{ itemParaVenda?.quantidade }} un.</strong>
            </p>
          </div>

          <!-- Contador -->
          <div class="flex items-center justify-center gap-6 mb-6">
            <button 
              @click="qtdVenda > 1 ? qtdVenda-- : null" 
              class="w-14 h-14 rounded-xl border-2 border-gray-300 hover:border-orange-600 hover:bg-orange-600 hover:text-white flex items-center justify-center transition-all text-gray-600 active:scale-95"
            >
              <UIcon name="i-heroicons-minus" class="w-6 h-6" />
            </button>
            
            <div class="flex flex-col items-center">
              <span class="text-xs text-gray-500 font-medium mb-1">Quantidade</span>
              <div class="text-5xl font-bold text-gray-900 tabular-nums">{{ qtdVenda }}</div>
            </div>
            
            <button 
              @click="qtdVenda < (itemParaVenda?.quantidade || 999) ? qtdVenda++ : null" 
              class="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95"
            >
              <UIcon name="i-heroicons-plus" class="w-6 h-6" />
            </button>
          </div>

          <!-- Total -->
          <div class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <div class="flex justify-between items-center">
              <span class="text-sm font-medium text-green-700">Valor Total:</span>
              <span class="text-2xl font-bold text-green-700">
                {{ formatarDinheiro((itemParaVenda?.preco || 0) * qtdVenda) }}
              </span>
            </div>
          </div>

          <!-- Botões -->
          <button 
            @click="confirmarVenda" 
            :disabled="vendendo" 
            class="w-full py-4 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UIcon v-if="vendendo" name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
            <span v-else>Confirmar Venda</span>
          </button>
          
          <button 
            @click="modalVendaAberto = false" 
            class="w-full mt-3 py-3 text-gray-600 hover:text-gray-900 font-semibold transition-colors rounded-xl hover:bg-gray-100"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const busca = ref('')
const { data, status, refresh } = await useFetch('/api/pecas')

const modalVendaAberto = ref(false)
const itemParaVenda = ref<any>(null)
const qtdVenda = ref(1)
const vendendo = ref(false)

const linhasFiltradas = computed(() => {
  const lista: any[] = data.value || []
  const listaLimpa = lista.map(p => ({
    ...p,
    modelo: p.modelo || '', 
    ano: p.ano || '', 
    marca: p.marca || 'ORIGINAL', 
    nome: p.nome || '', 
    quantidade: p.quantidade || 0, 
    preco: p.preco || 0,
    estado: p.estado || 'SEM-DETALHE', 
    detalhes: p.detalhes || ''
  }))

  if (!busca.value) return listaLimpa
  const t = busca.value.toLowerCase()
  return listaLimpa.filter((p: any) => 
    p.nome.toLowerCase().includes(t) ||
    p.marca.toLowerCase().includes(t) ||
    (p.modelo || '').toLowerCase().includes(t)
  )
})

function abrirVenda(item: any) {
  itemParaVenda.value = item
  qtdVenda.value = 1
  modalVendaAberto.value = true
}

async function confirmarVenda() {
  if (!itemParaVenda.value) return
  vendendo.value = true
  try {
    await $fetch(`/api/pecas/${itemParaVenda.value.id}/vender`, { 
      method: 'POST', 
      body: { quantidade: qtdVenda.value } 
    })
    modalVendaAberto.value = false
    alert('✅ Venda realizada com sucesso!')
    refresh()
  } catch (e: any) { 
    alert('❌ Erro: ' + (e.statusMessage || 'Estoque insuficiente')) 
  } finally { 
    vendendo.value = false 
  }
}

async function excluir(id: string) {
  if (!confirm('⚠️ Tem certeza que deseja excluir esta peça?')) return
  try { 
    await $fetch(`/api/pecas/${id}`, { method: 'DELETE' })
    refresh()
  } catch (e) { 
    alert('❌ Erro ao excluir peça.') 
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
