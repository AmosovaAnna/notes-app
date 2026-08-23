import { defineStore } from 'pinia'
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type { Note } from '~/types/note'
import { createId } from '~/utils/id'

export const useNotesStore = defineStore('notes', () => {
  const notes: Ref<Array<Note>> = ref([])

  const sortedNotes: ComputedRef<Array<Note>> = computed(() =>
    [...notes.value].sort((a, b) => b.updatedAt - a.updatedAt),
  )

  function findNote(id: string): Note | undefined {
    return notes.value.find(note => note.id === id)
  }

  function createNote(): Note {
    const note: Note = {
      id: createId(),
      title: '',
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
    findNote,
    createNote,
    saveNote,
    deleteNote,
  }
})
