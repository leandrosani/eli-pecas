<template>
  <div class="pb-20 relative">
    
    <div class="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Estoque</h1>
          <p class="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">
            Total de itens: <strong class="text-blue-600">{{ linhasFiltradas.length }}</strong>
          </p>
        </div>
        
        <!-- Botão Mobile -->
        <UButton 
          to="/estoque/criar" 
          icon="i-heroicons-plus" 
          size="md" 
          class="md:hidden shadow-lg rounded-full w-10 h-10 flex items-center justify-center p-0 bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all active:scale-95" 
        />
        
        <!-- Botão Desktop -->
        <UButton 
          to="/estoque/criar" 
          icon="i-heroicons-plus" 
          size="lg" 
          class="cursor-pointer border bg-gradient-to-br from-blue-600 to-blue-700 text-white border-blue-600 px-4 py-3 hidden md:flex shadow-lg hover:from-blue-700 hover:to-blue-800 hover:shadow-xl transition-all active:scale-[0.98] rounded-xl font-bold"
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
          class="w-full shadow-sm rounded-xl border-2 border-gray-200 focus-within:border-blue-400 transition-all [&_input]:pl-11"
          :ui="{ 
            base: 'placeholder:text-gray-400 focus:ring-2 focus:ring-blue-400/20'
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
        <thead class="bg-gradient-to-r from-blue-800 to-blue-900">
          <tr>
            <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 w-4/12">Peça / Estado</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 w-3/12">Aplicação</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 w-2/12">Endereço</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 w-1/12 text-center">Qtd.</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 w-2/12 text-right">Preço</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 w-2/12 text-center">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-400">
          <tr v-for="row in linhasFiltradas" :key="row.id" class="hover:bg-blue-50/30 transition-all group">
            
            <td class="py-4 px-6 align-middle">
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-600 shrink-0 shadow-sm group-hover:shadow-md transition-all">
                  <UIcon name="i-heroicons-cube" class="w-6 h-6" />
                </div>
                <div>
                  <div class="font-bold text-gray-900 text-sm mb-1">{{ row.nome }}</div>
                  <div class="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 w-fit border border-gray-200">
                    {{ row.marca }}
                  </div>
                  <div v-if="row.estado && row.estado !== 'SEM DETALHE'" class="mt-1 text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-red-50 text-red-700 border border-red-100 w-fit">
                    {{ row.estado }}
                  </div>
                </div>
              </div>
            </td>

            <td class="py-4 px-6 align-middle">
              <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-900">{{ row.modelo || 'Universal' }}</span>
                <span class="text-xs text-gray-500 font-medium">{{ row.ano ? `Ano ${row.ano}` : '' }}</span>
              </div>
            </td>

            <td class="py-4 px-6 align-middle">
              <span class="bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-lg text-[10px] font-bold inline-block shadow-sm">
                {{ row.detalhes }}
              </span>
            </td>

            <td class="py-4 px-6 align-middle text-center">
              <span v-if="row.quantidade > 0" class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                {{ row.quantidade }}
              </span>
              <span v-else class="text-[10px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
                ESGOTADO
              </span>
            </td>

            <td class="py-4 px-6 align-middle text-right">
              <div class="font-mono font-bold text-gray-900 text-sm">{{ formatarPreco(row) }}</div>
            </td>

            <td class="py-4 px-6 align-middle text-center">
              <div class="flex items-center justify-center gap-1.5">
                <UButton 
                  v-if="row.quantidade > 0" 
                  color="green" 
                  size="sm"
                  icon="i-heroicons-currency-dollar" 
                  @click="abrirVenda(row)"
                  class="cursor-pointer px-3 py-2 bg-gradient-to-br from-green-600 to-green-700 text-white shadow-sm hover:shadow-md hover:from-green-800 transition-all active:scale-95 rounded-lg font-bold"
                >
                  Vender
                </UButton>
                <UButton 
                  :to="`/estoque/editar/${row.id}`" 
                  color="gray" 
                  variant="ghost" 
                  icon="i-heroicons-pencil-square" 
                  size="xs"
                  class="hover:bg-blue-50 hover:text-blue-600 transition-colors"
                />
                <UButton 
                  color="red" 
                  variant="ghost" 
                  icon="i-heroicons-trash" 
                  size="xs" 
                  @click="excluir(row.id)"
                  class="hover:bg-red-50 hover:text-red-600 transition-colors"
                />
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
    <div class="md:hidden space-y-3">
      <div v-if="status === 'pending'" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto text-blue-500" />
        <p class="text-gray-500 text-sm mt-2">Carregando...</p>
      </div>

      <div
        v-for="item in linhasFiltradas"
        :key="item.id"
        class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative hover:shadow-md transition-all"
      >
        <!-- Botões de ação -->
        <div class="absolute top-3 right-3 flex gap-1.5">
          <UButton 
            :to="`/estoque/editar/${item.id}`" 
            color="gray" 
            variant="soft" 
            icon="i-heroicons-pencil-square" 
            size="xs" 
            class="w-8 h-8 p-0 rounded-lg"
          />
          <UButton 
            color="red" 
            variant="soft" 
            icon="i-heroicons-trash" 
            size="xs" 
            class="w-8 h-8 p-0 rounded-lg" 
            @click="excluir(item.id)" 
          />
        </div>

        <!-- Modelo -->
        <div class="mb-1.5 pr-20">
          <span class="text-[11px] font-bold uppercase tracking-wide text-gray-500">
            {{ item.modelo || 'Universal' }}
          </span>
        </div>

        <!-- Nome da peça -->
        <h3 class="font-bold text-gray-900 text-base leading-tight mb-2">
          {{ item.nome }} 
          <span v-if="item.ano" class="text-sm text-gray-600 font-normal">• {{ item.ano }}</span>
        </h3>

        <!-- Tags: Marca + Estado -->
        <div class="flex flex-wrap items-center gap-2 mb-3">
          <span class="px-2 py-1 bg-gray-100 text-gray-700 text-[11px] font-bold uppercase tracking-wide rounded-lg border border-gray-200">
            {{ item.marca }}
          </span>

          <span
            v-if="item.estado && item.estado !== 'SEM DETALHE'"
            class="px-2 py-1 bg-red-50 text-red-700 border-red-200 text-[10px] font-bold uppercase tracking-wide rounded-lg border"
          >
            {{ item.estado }}
          </span>
        </div>

        <!-- Endereço -->
        <div v-if="item.detalhes" class="mb-3 p-2.5 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200">
          <p class="text-[9px] font-bold text-blue-600 uppercase tracking-wide mb-1 flex items-center gap-1">
            <UIcon name="i-heroicons-map-pin" class="w-3 h-3" />
            Localização
          </p>
          <p class="text-xs text-blue-900 leading-tight font-medium">{{ item.detalhes }}</p>
        </div>

        <!-- Footer: Preço + Quantidade + Botão -->
        <div class="flex justify-between items-center pt-3 border-t border-gray-100">
          <div class="flex flex-col">
            <span class="text-[10px] text-gray-500 font-medium uppercase tracking-wide">Valor</span>
            <span class="text-base font-bold text-gray-900">{{ formatarPreco(item) }}</span>
          </div>

          <div class="flex items-center gap-3">
            <div class="text-right">
              <span class="text-[10px] text-gray-500 font-medium uppercase tracking-wide block">Qtd</span>
              <span class="text-lg font-bold text-gray-900">{{ item.quantidade }}</span>
            </div>

            <UButton
              v-if="item.quantidade > 0"
              size="sm"
              icon="i-heroicons-currency-dollar"
              class="px-3 py-2 bg-gradient-to-br from-green-600 to-green-700 text-white shadow-sm hover:shadow-md transition-all active:scale-95 rounded-lg font-bold"
              @click="abrirVenda(item)"
            >
              Vender
            </UButton>

            <span
              v-else
              class="text-[10px] font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200"
            >
              ESGOTADO
            </span>
          </div>
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
        <div class="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
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
              Disponível: <strong class="text-blue-600">{{ itemParaVenda?.quantidade }} un.</strong>
            </p>
          </div>

          <!-- Contador -->
          <div class="flex items-center justify-center gap-6 mb-6">
            <button 
              @click="qtdVenda > 1 ? qtdVenda-- : null" 
              class="w-14 h-14 rounded-xl border-2 border-gray-300 hover:border-blue-600 hover:bg-blue-600 hover:text-white flex items-center justify-center transition-all text-gray-600 active:scale-95"
            >
              <UIcon name="i-heroicons-minus" class="w-6 h-6" />
            </button>
            
            <div class="flex flex-col items-center">
              <span class="text-xs text-gray-500 font-medium mb-1">Quantidade</span>
              <div class="text-5xl font-bold text-gray-900 tabular-nums">{{ qtdVenda }}</div>
            </div>
            
            <button 
              @click="qtdVenda < (itemParaVenda?.quantidade || 999) ? qtdVenda++ : null" 
              class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl flex items-center justify-center transition-all active:scale-95"
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
    estado: p.estado || 'SEM DETALHE', 
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
