<template>
  <div class="pb-20 relative">
    
    <!-- CABEÇALHO -->
    <div class="flex flex-col gap-3 md:gap-4 mb-4 md:mb-6">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="font-semibold md:hidden text-xl text-black"><span class="text-2xl">💸 </span>Despesas</h1>
          <h1 class="hidden md:block text-3xl font-bold text-gray-900 tracking-tight"><span class="text-4xl">💸 </span>Gestão de Despesas</h1>

          <div class="flex justify-between items-center mt-1">
            <h2 class="text-[md] md:text-xl text-gray-800 font-bold">
              Registros: <strong class="text-gray-600">{{ linhasFiltradas.length }}</strong>
            </h2>
          </div>
        </div>
        
        <!-- Botão Mobile -->
        <UButton 
          to="/despesas/criar" 
          icon="i-heroicons-plus" 
          size="md" 
          class="md:hidden shadow-lg rounded-full p-2 flex items-center justify-center bg-red-600 font-bold text-white" 
        >
        </UButton>
        
        <!-- Botão Desktop -->
        <UButton 
          to="/despesas/criar" 
          icon="i-heroicons-plus" 
          size="lg" 
          class="cursor-pointer border bg-gradient-to-br from-red-600 to-red-700 text-white border-red-600 px-4 py-3 hidden md:flex shadow-lg hover:from-red-700 hover:to-red-800 hover:shadow-xl transition-all active:scale-[0.98] rounded-xl font-bold"
        >
          Nova Despesa
        </UButton>
      </div>

      <!-- Input de Busca -->
      <div class="relative">
        <UInput 
          v-model="busca" 
          placeholder="Buscar por descrição, categoria ou valor..." 
          size="lg"
          class="w-full shadow-sm rounded-xl border-2 border-gray-200 focus-within:border-red-400 transition-all [&_input]:pl-11"
          :ui="{ 
            base: 'placeholder:text-gray-400 focus:ring-2 focus:ring-red-400/20'
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

    <!-- ============================================== -->
    <!-- VISÃO DESKTOP (TABELA) -->
    <!-- ============================================== -->
    <div class="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-600">
          <tr>
            <th class="py-4 px-6 text-xs uppercase font-bold text-white w-4/12">Categoria / Descrição</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-white w-2/12">Data</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-white w-2/12">Forma Pagto.</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-white w-2/12 text-right">Valor</th>
            <th class="py-4 px-6 text-xs uppercase font-bold text-white w-1/12 text-center">Ações</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          <tr v-for="row in linhasFiltradas" :key="row.id" class="hover:bg-gray-50 transition-all group">
            
            <!-- Categoria / Descrição -->
            <td class="py-4 px-6 align-middle">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-red-50 flex flex-col items-center justify-center shrink-0 shadow-sm border border-red-100">
                  <UIcon name="i-heroicons-document-minus" class="w-5 h-5 text-red-500" />
                </div>
                
                <div>
                  <div class="font-bold text-gray-900 text-sm mb-0.5">{{ row.categoria }}</div>
                  <div class="text-xs text-gray-500 font-medium uppercase tracking-wide">{{ row.descricao }}</div>
                </div>
              </div>
            </td>

            <!-- Data -->
            <td class="py-4 px-6 align-middle">
              <div class="flex flex-col">
                <span class="text-sm font-bold text-gray-900">{{ new Date(row.data).toLocaleDateString('pt-BR') }}</span>
                <span class="text-[10px] text-gray-500 font-medium">
                    {{ new Date(row.data).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}) }}
                </span>
              </div>
            </td>

            <!-- Forma de Pagamento -->
            <td class="py-4 px-6 align-middle">
              <span :class="getBadgePagamento(row.formaPagamento)" class="px-2.5 py-1 rounded-lg text-[11px] font-bold border inline-block">
                {{ row.formaPagamento }}
              </span>
            </td>

            <!-- Valor (Vermelho para despesa) -->
            <td class="py-4 px-6 align-middle text-right">
              <div class="font-bold text-red-600 text-base">- {{ formatarDinheiro(row.valor) }}</div>
            </td>

            <!-- Ações -->
            <td class="py-4 px-6 align-middle">
              <div class="flex flex-col items-center justify-center gap-2">
                <UButton 
                  :to="`/despesas/editar/${row.id}`" 
                  icon="i-heroicons-pencil-square" 
                  size="xs"
                  class="w-24 text-center cursor-pointer px-2.5 py-1.5 bg-orange-500 text-white shadow-sm hover:bg-orange-600 hover:shadow-md transition-all active:scale-95 rounded-lg font-semibold text-[12px]"
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
          <UIcon name="i-heroicons-document-text" class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-500 font-medium">Nenhuma despesa encontrada</p>
      </div>
    </div>

    <!-- ============================================== -->
    <!-- VISÃO MOBILE (LISTA DE CARDS) -->
    <!-- ============================================== -->
    <div class="md:hidden space-y-3">
      <div v-if="status === 'pending'" class="text-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin mx-auto text-red-500" />
        <p class="text-gray-500 text-sm mt-2">Carregando...</p>
      </div>

      <div
        v-for="item in linhasFiltradas"
        :key="item.id"
        class="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative active:scale-[0.99] transition-transform"
      >
        <!-- Botões de ação (Topo Direito) -->
        <div class="absolute top-3 right-3 flex gap-2">
          <UButton :to="`/despesas/editar/${item.id}`" color="gray" variant="ghost" icon="i-heroicons-pencil-square" size="xs" class="w-8 h-8 p-0 text-orange-500 bg-orange-50"/>
          <UButton color="red" variant="ghost" icon="i-heroicons-trash" size="xs" class="w-8 h-8 p-0 text-red-600 bg-red-50" @click="excluir(item.id)" />
        </div>

        <!-- Header: Data -->
        <div class="flex justify-between items-start mb-2 pr-20">
            <div class="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md border border-gray-100 w-fit">
                <UIcon name="i-heroicons-calendar" class="w-3 h-3 text-gray-500" />
                <span class="text-[11px] font-bold text-gray-600">
                    {{ new Date(item.data).toLocaleDateString('pt-BR') }}
                </span>
            </div>
        </div>

        <!-- Categoria e Descrição -->
        <div class="mb-3">
          <h3 class="font-bold text-gray-900 text-lg leading-tight mb-0.5">{{ item.categoria }}</h3>
          <p class="text-sm text-gray-500 font-medium">{{ item.descricao }}</p>
        </div>

        <!-- Footer: Pagamento e Valor -->
        <div class="flex justify-between items-end pt-3 border-t border-gray-100">
          <div>
            <span :class="getBadgePagamento(item.formaPagamento)" class="text-[10px] px-2 py-1 rounded-md font-bold border">
                {{ item.formaPagamento }}
            </span>
          </div>
          
          <div class="text-right">
             <p class="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Valor</p>
             <span class="text-lg font-bold text-red-600 font-mono">
               - {{ formatarDinheiro(item.valor) }}
             </span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const busca = ref('')

// Busca de dados (Assumindo que você criará a rota /api/despesas)
const { data, status, refresh, error } = await useFetch('/api/despesas', {
  lazy: true 
})

const linhasFiltradas = computed(() => {
  const lista: any[] = data.value || []
  
  // Mapeia e sanitiza os dados
  const listaLimpa = lista.map(d => ({
    ...d,
    categoria: d.categoria || 'Geral',
    descricao: d.descricao || '',
    data: d.data || new Date(),
    valor: Number(d.valor) || 0,
    formaPagamento: d.formaPagamento || 'Dinheiro'
  }))

  if (!busca.value) return listaLimpa
  
  const t = busca.value.toLowerCase()
  return listaLimpa.filter((d: any) => 
    d.categoria.toLowerCase().includes(t) ||
    d.descricao.toLowerCase().includes(t) ||
    String(d.valor).includes(t)
  )
})

async function excluir(id: string) {
  if (!confirm('Tem certeza que deseja excluir esta despesa?')) return
  try {
    await $fetch(`/api/despesas/${id}`, { method: 'DELETE' })
    refresh()
  } catch (e) { alert('Erro ao excluir.') }
}

function formatarDinheiro(val: number) { 
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0) 
}

// Estiliza o badge de pagamento
function getBadgePagamento(tipo: string) {
  const t = tipo.toLowerCase()
  if (t.includes('pix')) return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (t.includes('crédito') || t.includes('credito')) return 'bg-purple-50 text-purple-700 border-purple-200'
  if (t.includes('débito') || t.includes('debito')) return 'bg-blue-50 text-blue-700 border-blue-200'
  if (t.includes('dinheiro')) return 'bg-green-50 text-green-700 border-green-200'
  return 'bg-gray-50 text-gray-700 border-gray-200'
}
</script>