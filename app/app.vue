<script setup lang="ts">
const notesStore = useNotesStore()

onMounted(() => {
  notesStore.load()
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ConfirmDialog />
  </div>
</template>
