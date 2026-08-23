export default defineNuxtPlugin(() => {
  useNotesStore().load()
})
