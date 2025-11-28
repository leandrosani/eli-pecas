<template>
  <div class="max-w-4xl mx-auto pb-20">
    <div class="flex items-center gap-4 mb-8">
      <UButton to="/estoque" color="white" icon="i-heroicons-arrow-left" square size="lg" class="shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 w-10 h-10 hover:bg-gray-300 transition-all"/>
      <div>
        <h1 class="text-2xl font-bold text-gray-900 tracking-tight">Nova Peça</h1>
        <p class="text-gray-500 text-sm">Preencha os detalhes do produto.</p>
      </div>
    </div>

    <form @submit.prevent="salvar" class="space-y-6">
      
      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div class="bg-blue-100 p-2 rounded-lg text-blue-600"><UIcon name="i-heroicons-tag" class="w-5 h-5" /></div>
          <h2 class="font-semibold text-gray-900">Identificação da Peça</h2>
        </div>
        
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="space-y-2 flex flex-col">
            <label class="text-sm font-medium text-gray-700">Nome da Peça <span class="text-red-500"
            >*</span></label>
            <UInput v-model="form.nome" size="xl" placeholder="Ex: Farol Dianteiro LE" autofocus class="border border-gray-300 rounded-xl p-[9px]"
            :ui="{ 
              base: 'focus:ring-0 focus:outline-none'
            }"
            />
          </div>
          
          <div class="space-y-2 flex flex-col">
            <label class="text-sm font-medium text-gray-700">Procedência <span class="text-red-500">*</span></label>
            <div class="relative">
              <select 
                v-model="form.marca" 
                class="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 h-[44px]"
              >
                <option value="NOVA">NOVA</option>
                <option value="SEM-DETALHE">SEM DETALHE</option>
                <option value="COM-DETALHE">COM DETALHE</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div class="bg-orange-100 p-2 rounded-lg text-orange-600"><UIcon name="i-heroicons-wrench" class="w-5 h-5" /></div>
          <h2 class="font-semibold text-gray-900">Detalhes Técnicos</h2>
        </div>
        
        <div class="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="space-y-2 flex flex-col">
            <label class="text-sm font-medium text-gray-700">Modelo do Carro</label>
            <UInput v-model="form.modelo" size="xl" icon="i-heroicons-truck" placeholder="Universal"
            class=" border border-gray-300 rounded-xl p-2"
            :ui="{base: 'focus:ring-0 focus:outline-none pl-5'}"
            />
          </div>
          <div class="space-y-2 flex flex-col">
            <label class="text-sm font-medium text-gray-700">Ano</label>
            <UInput v-model="form.ano" size="xl" type="number" icon="i-heroicons-calendar" 
            class="border border-gray-300 rounded-xl p-2"
            :ui="{base: 'focus:ring-0 focus:outline-none pl-5'}"
            />
          </div>
          
          <div class="space-y-2 flex flex-col">
            <label class="text-sm font-medium text-gray-700">Condição</label>
            <div class="relative">
              <select 
                v-model="form.estado" 
                class="w-full appearance-none bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-black focus:border-black block w-full p-2.5 h-[44px]"
              >
                <option value="SEM-DETALHE">SEM DETALHE</option>
                <option value="RECUPERADA">1 GARRA RECUPERADA</option>
                <option value="NOVA-NA-CAIXA">DETALHE NA LENTE</option>
                <option value="COM-AVARIA">2 GARRAS RECUPERADAS</option>
                <option value="COM-AVARIA">3 GARRAS RECUPERADAS</option>
                <option value="COM-AVARIA">TODAS GARRAS RECUPERADAS</option>
                
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 pt-0">
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Observações / Descrição</label>
            <textarea 
              v-model="form.detalhes" 
              class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-black focus:border-black" 
              rows="3" 
              placeholder="Descreva detalhes: Ex: Pequeno risco na lente, suportes recuperados..."
            ></textarea>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
          <div class="bg-green-100 p-2 rounded-lg text-green-600"><UIcon name="i-heroicons-banknotes" class="w-5 h-5" /></div>
          <h2 class="font-semibold text-gray-900">Estoque e Preço</h2>
        </div>
        <div class="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div class="space-y-2">
            <label class="mr-3 text-sm font-medium text-gray-700">Preço de Venda (R$)*</label>
            <UInput v-model="form.preco" size="xl" type="number" step="0.01" icon="i-heroicons-currency-dollar" placeholder="0.00" 
            class="border border-gray-300 rounded-xl p-2"
            :ui="{base: 'focus:ring-0 focus:outline-none pl-5'}"
            />
          </div>
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Quantidade</label>
            <UInput v-model="form.quantidade" size="xl" type="number" 
            class="m-3 border w-22 border-gray-300 rounded-xl p-2"
            :ui="{base: 'focus:ring-0 focus:outline-none'}"
            />
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-4 pt-4">
        <UButton to="/estoque" variant="ghost" color="gray" size="lg" class="hover:text-red-400">Cancelar</UButton>
        <UButton type="submit" color="black" size="lg" :loading="loading" 
          class="cursor-pointer border border-gray-200 p-3 hidden md:flex shadow-lg hover:bg-gray-300 transition-all"
          >
          Salvar Produto
        </UButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })
const router = useRouter()
const loading = ref(false)

const form = reactive({
  nome: '',
  marca: 'ORIGINAL',
  modelo: '',
  ano: undefined,
  preco: undefined,
  quantidade: 1,
  estado: 'SEM DETALHE',
  detalhes: ''
})

async function salvar() {
  if (!form.nome || !form.preco) {
    alert('Preencha Nome e Preço.')
    return
  }
  loading.value = true
  try {
    await $fetch('/api/pecas', { method: 'POST', body: form })
    router.push('/estoque')
  } catch (e) {
    alert('Erro ao salvar.')
  } finally {
    loading.value = false
  }
}
</script>