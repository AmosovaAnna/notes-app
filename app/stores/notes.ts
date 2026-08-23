import { defineStore } from "pinia"
import { computed, ref, watch, type ComputedRef, type Ref, type WatchStopHandle } from "vue"
import type { Note } from "~/types/note"
import { readNotes, writeNotes } from "~/services/storage"
import { createDebounce } from "~/utils/debounce"
import { createId } from "~/utils/id"

const SAVE_DELAY_MS = 500

export const useNotesStore = defineStore("notes", () => {
  const notes: Ref<Array<Note>> = ref([])

  const sortedNotes: ComputedRef<Array<Note>> = computed(() =>
    [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt),
  )

  const save = createDebounce(() => writeNotes(notes.value), SAVE_DELAY_MS)

  let stopWatch: WatchStopHandle | null = null

  function saveNow(): void {
    save.runNow()
  }

  function handleVisibilityChange(): void {
    if (document.visibilityState === "hidden") {
      saveNow()
    }
  }

  function load(): void {
    notes.value = readNotes()

    stopWatch?.()
    stopWatch = watch(notes, () => save.schedule(), { deep: true })

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", saveNow)
      document.addEventListener("visibilitychange", handleVisibilityChange)
    }
  }

  function findNote(id: string): Note | undefined {
    return notes.value.find(note => note.id === id)
  }

  function createNote(): Note {
    const note: Note = {
      id: createId(),
      title: "",
      todos: [],
      updatedAt: Date.now(),
    }

    notes.value.push(note)

    return note
  }

  function saveNote(updated: Note): void {
    const index = notes.value.findIndex(note => note.id === updated.id)
    const saved: Note = { ...updated, updatedAt: Date.now() }

    if (index === -1) {
      notes.value.push(saved)
      return
    }

    notes.value[index] = saved
  }

  function deleteNote(id: string): void {
    notes.value = notes.value.filter(note => note.id !== id)
  }

  return {
    notes,
    sortedNotes,
    load,
    saveNow,
    findNote,
    createNote,
    saveNote,
    deleteNote,
  }
})
