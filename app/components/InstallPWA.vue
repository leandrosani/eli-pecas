<template>
  <div v-if="showInstall">
    <UButton 
      @click="install"
      icon="i-heroicons-arrow-down-tray"
      color="primary"
      size="lg"
    >
      Instalar App
    </UButton>
  </div>
</template>

<script setup lang="ts">
const showInstall = ref(false)
let deferredPrompt: any = null

onMounted(() => {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    showInstall.value = true
  })
})

const install = async () => {
  if (!deferredPrompt) return
  
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  
  if (outcome === 'accepted') {
    showInstall.value = false
  }
  
  deferredPrompt = null
}
</script>
