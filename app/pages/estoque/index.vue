<template>
  <div class="pb-20 relative">
    
    <div class="flex flex-col gap-4 mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Estoque</h1>
          <p class="text-sm text-gray-500 mt-1">
            Total de itens: <strong>{{ linhasFiltradas.length }}</strong>
          </p>
        </div>
        
        <UButton to="/estoque/criar" icon="i-heroicons-plus" color="black" size="lg" class="md:hidden shadow-lg rounded-full w-12 h-12 flex items-center justify-center p-0" />
        <UButton to="/estoque/criar" icon="i-heroicons-plus" color="black" size="lg" class="cursor-pointer border border-gray-200 p-3 hidden md:flex shadow-lg hover:bg-gray-300 transition-all">
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
        class="pl-8 w-full shadow-md py-3 rounded-xl border border-gray-300"
        :ui="{ 
          base: 'ml-6 w-[95%] placeholder:text-gray-400 placeholder:font-normal focus:ring-2 focus:ring-blue-400 focus:border-transparent focus:p-2 transition-all duration-200'
        }"
      >
        <template #trailing v-if="busca">
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" :padded="false" @click="busca = ''" />
        </template>
      </UInput>
    </div>

    <div class="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50/80">
          <tr>
            <th class="py-4 px-6 text-xs uppercase font-bold text-gray-500 w-4/12">Peça / Estado</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-gray-500 w-3/12">Aplicação</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-gray-500 w-2/12">Endereço</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-gray-500 w-1/12 text-center">Qtd.</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-gray-500 w-2/12 text-right">Preço</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-gray-500 w-2/12 text-center">Ações</th>
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
                  <div v-if="row.estado" class="text-xs font-bold text-blue-600 mt-1 truncate max-w-[200px]">{{ row.estado }}</div>
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
              <span :class="getClasseEstado(row)" class="px-2 py-1 rounded-md text-[10px] font-bold border inline-block">
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

    <div class="md:hidden space-y-3">
      <div v-if="status === 'pending'" class="text-center py-8"><UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto text-gray-400" /></div>

      <div v-for="item in linhasFiltradas" :key="item.id" class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative">
        <div class="absolute top-3 right-3 flex gap-1">
          <UButton :to="`/estoque/editar/${item.id}`" color="gray" variant="ghost" icon="i-heroicons-pencil-square" size="sm" />
          <UButton color="red" variant="ghost" icon="i-heroicons-trash" size="sm" @click="excluir(item.id)" />
        </div>

        <div class="flex justify-between items-start mb-2 pr-20">
          <div class="flex gap-3">
            <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 shrink-0"><UIcon name="i-heroicons-cube" class="w-5 h-5" /></div>
            <div>
              <h3 class="font-bold text-gray-900 leading-tight">{{ item.nome }}</h3>
              <p class="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded w-fit mt-1">{{ item.marca }}</p>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-3 my-3 flex items-center gap-2 text-sm text-gray-700">
          <UIcon name="i-heroicons-truck" class="w-4 h-4 text-gray-400" />
          <span class="font-semibold">{{ item.modelo || 'Universal' }}</span>
          <span class="text-gray-400" v-if="item.ano">•</span>
          <span v-if="item.ano">{{ item.ano }}</span>
        </div>

        <div v-if="item.detalhes" class="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p class="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
            <UIcon name="i-heroicons-information-circle" class="w-3 h-3" /> Observação
          </p>
          <p class="text-sm text-blue-900 leading-snug">{{ item.detalhes }}</p>
        </div>

        <div class="flex justify-between items-center pt-1 border-t border-gray-50 mt-1">
          <div>
            <span :class="getClasseEstado(item)" class="text-[10px] px-2 py-0.5 rounded-full font-bold border mr-2">{{ item.estado }}</span>
            <span class="text-xs text-gray-500 font-medium">Qtd: <strong class="text-gray-900">{{ item.quantidade }}</strong></span>
          </div>
          
          <UButton v-if="item.quantidade > 0" color="green" size="sm" icon="i-heroicons-currency-dollar" class="px-4" @click="abrirVenda(item)">Vender</UButton>
        </div>
      </div>
    </div>

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
  return listaLimpa.filter((p: any) => p.nome.toLowerCase().includes(t) || p.marca.toLowerCase().includes(t))
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
  if (e === 'SEM DETALHE' || e === 'NOVA NA CAIXA') return 'bg-green-50 text-green-700 border-green-100'
  if (e === 'RECUPERADA') return 'bg-orange-50 text-orange-700 border-orange-100'
  return 'bg-red-50 text-red-700 border-red-100'
}
</script>