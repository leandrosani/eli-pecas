<template>
  <div class="pb-20 relative">
    
    <div class="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-xl md:text-3xl font-bold text-gray-900 tracking-tight">Estoque</h1>
          <p class="text-xs md:text-sm text-gray-500 mt-0.5 md:mt-1">
            Total de itens: <strong>{{ linhasFiltradas.length }}</strong>
          </p>
        </div>
        
        <UButton to="/estoque/criar" icon="i-heroicons-plus" color="black" size="md" class="md:hidden shadow-lg rounded-full w-10 h-10 flex items-center justify-center p-0 bg-blue-600 text-white" />
        <UButton to="/estoque/criar" icon="i-heroicons-plus" color="black" size="lg" class="cursor-pointer border bg-blue-600 text-white border-gray-200 p-3 hidden md:flex shadow-lg hover:bg-blue-800 hover:border-blue-500 transition-all">
          Adicionar Peça
        </UButton>
      </div>

      <UInput 
        v-model="busca" 
        icon="i-heroicons-magnifying-glass" 
        placeholder="Buscar..." 
        size="lg"
        color="primary"
        variant="outline"
        class="pl-6 md:pl-8 w-full shadow-md py-2 md:py-3 rounded-lg md:rounded-xl border border-gray-300"
        :ui="{ 
          base: 'ml-4 md:ml-6 w-[95%] placeholder:text-gray-400 placeholder:font-normal focus:ring-border-transparent focus:ring-blue-400 focus:border-transparent md:focus:p-2 transition-all duration-200'
        }"
      >
        <template #trailing v-if="busca">
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" :padded="false" @click="busca = ''" />
        </template>
      </UInput>
    </div>

    <!-- Desktop Table -->
    <div class="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-blue-800">
          <tr>
            <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 w-4/12">Peça / Estado</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 w-3/12">Aplicação</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 w-2/12">Endereço</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 w-1/12 text-center">Qtd.</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 w-2/12 text-right">Preço</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-amber-50 w-2/12 text-center">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="row in linhasFiltradas" :key="row.id" class="hover:bg-gray-50/50 transition-colors">
            
            <td class="py-4 px-6 align-middle">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0"><UIcon name="i-heroicons-cube" class="w-5 h-5" /></div>
                <div>
                  <div class="font-bold text-gray-900 text-sm">{{ row.nome }}</div>
                  <div class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 w-fit mt-1">{{ row.marca }}</div>
                  <div v-if="row.estado" :class="getClasseEstado(row)">{{ row.estado }}</div>
                </div>
              </div>
            </td>

            <td class="py-4 px-6 align-middle">
              <div class="flex flex-col">
                <span class="text-sm font-semibold text-gray-900">{{ row.modelo || 'Universal' }}</span>
                <span class="text-xs text-gray-500">{{ row.ano ? `Ano ${row.ano}` : '' }}</span>
              </div>
            </td>

            <td class="py-4 px-6 align-middle">
              <span class="bg-green-50 text-green-700 border-green-100 px-2 py-1 rounded-md text-[10px] font-bold border inline-block">
                {{ row.detalhes }}
              </span>
            </td>

            <td class="py-4 px-6 align-middle text-center">
              <span v-if="row.quantidade > 0" class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {{ row.quantidade }}
              </span>
              <span v-else class="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                ESGOTADO
              </span>
            </td>

            <td class="py-4 px-6 align-middle text-right">
              <div class="font-mono font-bold text-gray-900 text-sm">{{ formatarPreco(row) }}</div>
            </td>

            <td class="py-4 px-6 align-middle text-center">
              <div class="flex items-center justify-center gap-2">
                <UButton v-if="row.quantidade > 0" color="green" variant="soft" icon="i-heroicons-currency-dollar" size="xs" @click="abrirVenda(row)" />
                <UButton :to="`/estoque/editar/${row.id}`" color="gray" variant="ghost" icon="i-heroicons-pencil-square" size="xs" />
                <UButton color="red" variant="ghost" icon="i-heroicons-trash" size="xs" @click="excluir(row.id)" />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      
      <div v-if="!linhasFiltradas.length && status !== 'pending'" class="text-center py-12 text-gray-400">
        <p>Nenhuma peça encontrada.</p>
      </div>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden space-y-2.5">
      <div v-if="status === 'pending'" class="text-center py-6">
        <UIcon name="i-heroicons-arrow-path" class="w-7 h-7 animate-spin mx-auto text-gray-400" />
      </div>

      <div
        v-for="item in linhasFiltradas"
        :key="item.id"
        class="bg-white p-3 rounded-lg border border-gray-200 shadow-sm relative"
      >
        <!-- Botões de ação compactos -->
        <div class="absolute top-2 right-2 flex gap-1">
          <UButton :to="`/estoque/editar/${item.id}`" color="gray" variant="ghost" icon="i-heroicons-pencil-square" size="xs" class="w-7 h-7 p-0"/>
          <UButton color="red" variant="ghost" icon="i-heroicons-trash" size="xs" class="w-7 h-7 p-0" @click="excluir(item.id)" />
        </div>

        <!-- Modelo -->
        <div class="mb-1 pr-16">
          <span class="text-[11px] font-bold uppercase tracking-wide text-gray-500">
            {{ item.modelo }}
          </span>
        </div>

        <!-- Nome da peça -->
        <h3 class="font-bold text-gray-900 text-base leading-tight mb-1">
          {{ item.nome }} <span class="text-sm text-gray-700">{{ item.ano }}</span>
        </h3>

        <!-- Tags: Marca + Estado -->
        <div class="flex flex-wrap items-center gap-1.5 mb-2">
          <span class="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-wide rounded border border-gray-200">
            {{ item.marca }}
          </span>

          <span
            v-if="item.estado"
            class="px-1.5 py-0.5 bg-red-50 text-red-700 border-red-100 text-[10px] font-bold uppercase tracking-wide rounded border"
          >
            {{ item.estado }}
          </span>
        </div>

        <!-- Observação (se houver) -->
        <div v-if="item.detalhes" class="mb-2 p-2 bg-blue-50 rounded border border-blue-100">
          <p class="text-[9px] font-bold text-blue-500 uppercase tracking-wide mb-0.5 flex items-center gap-1">
            <UIcon name="i-heroicons-information-circle" class="w-3 h-3" />
            Endereço
          </p>
          <p class="text-xs text-blue-900 leading-tight">{{ item.detalhes }}</p>
        </div>

        <!-- Footer: Quantidade + Botão Vender -->
        <div class="flex justify-between items-center pt-2 border-t border-gray-100">
          <div class="flex items-baseline gap-1">
            <span class="text-xs text-gray-600 font-medium">Qtd:</span>
            <span class="text-lg font-bold text-gray-900">{{ item.quantidade }}</span>
          </div>

          <UButton
            v-if="item.quantidade > 0"
            color="success"
            size="sm"
            icon="i-heroicons-currency-dollar"
            class="px-3 py-1.5 border border-green-600 bg-green-700 text-white shadow-sm"
            @click="abrirVenda(item)"
          >
            Vender
          </UButton>

          <span
            v-else
            class="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100"
          >
            ESGOTADO
          </span>
        </div>
      </div>
    </div>

    <!-- Modal de Venda -->
    <div v-if="modalVendaAberto" class="fixed inset-0 z-[100] bg-gray-900/80 backdrop-blur-sm flex items-center justify-center p-4" @click.self="modalVendaAberto = false">
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-6">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-bold text-gray-900">Registrar Venda</h3>
          <button @click="modalVendaAberto = false" class="text-gray-400 hover:text-gray-600">
            <UIcon name="i-heroicons-x-mark" class="w-6 h-6" />
          </button>
        </div>

        <div class="text-center mb-6">
          <p class="text-gray-500 text-sm uppercase tracking-wide font-bold mb-1">Produto</p>
          <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ itemParaVenda?.nome }}</h2>
          <p class="text-gray-500">Em estoque: {{ itemParaVenda?.quantidade }}</p>
        </div>

        <div class="flex items-center justify-center gap-6 mb-8">
          <button @click="qtdVenda > 1 ? qtdVenda-- : null" class="w-14 h-14 rounded-full border-2 border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white flex items-center justify-center transition-all text-gray-400"><UIcon name="i-heroicons-minus" class="w-6 h-6" /></button>
          <div class="text-5xl font-bold text-gray-900 tabular-nums w-24 text-center">{{ qtdVenda }}</div>
          <button @click="qtdVenda < (itemParaVenda?.quantidade || 999) ? qtdVenda++ : null" class="w-14 h-14 rounded-full bg-black text-white hover:scale-110 shadow-lg flex items-center justify-center transition-all"><UIcon name="i-heroicons-plus" class="w-6 h-6" /></button>
        </div>

        <button @click="confirmarVenda" :disabled="vendendo" class="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
          <UIcon v-if="vendendo" name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin" />
          <span v-else>Confirmar Venda <span class="bg-green-700/50 px-2 py-0.5 rounded text-sm ml-1">{{ formatarDinheiro((itemParaVenda?.preco || 0) * qtdVenda) }}</span></span>
        </button>
        
        <button @click="modalVendaAberto = false" class="w-full mt-3 py-3 text-gray-500 hover:text-gray-900 font-medium transition-colors">Cancelar</button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const busca = ref('')
const { data, status, refresh } = await useFetch('/api/pecas')

// Estados
const modalVendaAberto = ref(false)
const itemParaVenda = ref<any>(null)
const qtdVenda = ref(1)
const vendendo = ref(false)

const linhasFiltradas = computed(() => {
  const lista: any[] = data.value || []
  // Sanitização
  const listaLimpa = lista.map(p => ({
    ...p,
    modelo: p.modelo || '', ano: p.ano || '', marca: p.marca || 'ORIGINAL', nome: p.nome || '', quantidade: p.quantidade || 0, preco: p.preco || 0,
    estado: p.estado || 'SEM DETALHE', detalhes: p.detalhes || ''
  }))

  if (!busca.value) return listaLimpa
  const t = busca.value.toLowerCase()
  return listaLimpa.filter((p: any) => 
    p.nome.toLowerCase().includes(t) ||
    p.marca.toLowerCase().includes(t) ||
    (p.modelo || '').toLowerCase().includes(t)
  )
})

// Ações
function abrirVenda(item: any) {
  itemParaVenda.value = item
  qtdVenda.value = 1
  modalVendaAberto.value = true
}

async function confirmarVenda() {
  if (!itemParaVenda.value) return
  vendendo.value = true
  try {
    await $fetch(`/api/pecas/${itemParaVenda.value.id}/vender`, { method: 'POST', body: { quantidade: qtdVenda.value } })
    modalVendaAberto.value = false; alert('✅ Venda realizada!'); refresh()
  } catch (e: any) { alert('Erro: ' + (e.statusMessage || 'Estoque insuficiente')) } 
  finally { vendendo.value = false }
}

async function excluir(id: string) {
  if (!confirm('Tem certeza?')) return
  try { await $fetch(`/api/pecas/${id}`, { method: 'DELETE' }); refresh() } catch (e) { alert('Erro ao excluir.') }
}

function formatarPreco(row: any) { return formatarDinheiro(Number(row.preco)) }
function formatarDinheiro(val: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0) }

function getClasseEstado(row: any) {
  const e = row.estado
  if (e) return 'bg-red-50 text-red-700 border-red-100 text-[0.7rem] rounded border p-1'
}
</script>
