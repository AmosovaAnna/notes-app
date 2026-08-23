import { defineStore } from "pinia"
import { computed, ref, watch, type ComputedRef, type Ref, type WatchStopHandle } from "vue"
import type { Note, TodoItem } from "~/types/note"
import { createHistory, type TextField } from "~/services/history"
import { clearDraft, readDraft, writeDraft } from "~/services/storage"
import { useNotesStore } from "~/stores/notes"
import { createDebounce } from "~/utils/debounce"
import { createId } from "~/utils/id"

const INPUT_PAUSE_MS = 600
const DRAFT_SAVE_DELAY_MS = 400

function cloneNote(note: Note): Note {
  return {
    ...note,
    todos: note.todos.map(todo => ({ ...todo })),
  }
}

function isSameNote(first: Note, second: Note): boolean {
  return JSON.stringify(first) === JSON.stringify(second)
}

export const useEditorStore = defineStore("editor", () => {
  const note: Ref<Note | null> = ref(null)
  const canUndo = ref(false)
  const canRedo = ref(false)
  const restorableDraft: Ref<Note | null> = ref(null)

  const history = createHistory()

  const hasDraftToRestore: ComputedRef<boolean> = computed(() => restorableDraft.value !== null)

  const saveDraft = createDebounce(() => {
    if (note.value !== null) {
      writeDraft(note.value)
    }
  }, DRAFT_SAVE_DELAY_MS)

  const finishInputAfterPause = createDebounce(() => {
    history.finishTextInput()
    syncHistoryFlags()
  }, INPUT_PAUSE_MS)

  let stopWatch: WatchStopHandle | null = null

  function syncHistoryFlags(): void {
    canUndo.value = history.canUndo()
    canRedo.value = history.canRedo()
  }

  function startEditing(source: Note): void {
    const stored = readDraft()

    restorableDraft.value = stored !== null && stored.id === source.id && !isSameNote(stored, source)
      ? stored
      : null

    note.value = cloneNote(source)
    history.clear()
    syncHistoryFlags()

    stopWatch?.()
    stopWatch = watch(note, () => saveDraft.schedule(), { deep: true })
  }

  function restoreDraft(): void {
    if (restorableDraft.value === null) {
      return
    }

    note.value = cloneNote(restorableDraft.value)
    restorableDraft.value = null
    history.clear()
    syncHistoryFlags()
  }

  function discardDraft(): void {
    restorableDraft.value = null
    clearDraft()
  }

  function setTitle(value: string): void {
    if (note.value === null) {
      return
    }

    trackInput({ kind: "title" }, note.value.title, value)
    note.value.title = value
  }

  function setTodoText(id: string, value: string): void {
    const todo = findTodo(id)

    if (todo === undefined) {
      return
    }

    trackInput({ kind: "todo-text", id }, todo.text, value)
    todo.text = value
  }

  function trackInput(field: TextField, before: string, after: string): void {
    history.trackTextInput(field, before, after)
    finishInputAfterPause.schedule()
    syncHistoryFlags()
  }

  function toggleTodo(id: string): void {
    const todo = findTodo(id)

    if (todo === undefined) {
      return
    }

    finishInputNow()
    history.addChange({ kind: "todo-toggle", id, before: todo.done, after: !todo.done })
    todo.done = !todo.done
    syncHistoryFlags()
  }

  function addTodo(): TodoItem | null {
    if (note.value === null) {
      return null
    }

    const item: TodoItem = { id: createId(), text: "", done: false }

    finishInputNow()
    history.addChange({ kind: "todo-add", index: note.value.todos.length, item })
    note.value.todos.push({ ...item })
    syncHistoryFlags()

    return item
  }

  function removeTodo(id: string): void {
    if (note.value === null) {
      return
    }

    const index = note.value.todos.findIndex(todo => todo.id === id)
    const item = note.value.todos[index]

    if (item === undefined) {
      return
    }

    finishInputNow()
    history.addChange({ kind: "todo-remove", index, item: { ...item } })
    note.value.todos.splice(index, 1)
    syncHistoryFlags()
  }

  function finishInputNow(): void {
    finishInputAfterPause.cancel()
    history.finishTextInput()
    syncHistoryFlags()
  }

  function undo(): void {
    if (note.value === null) {
      return
    }

    finishInputAfterPause.cancel()

    const previous = history.undo(note.value)

    if (previous !== null) {
      note.value = previous
    }

    syncHistoryFlags()
  }

  function redo(): void {
    if (note.value === null) {
      return
    }

    const next = history.redo(note.value)

    if (next !== null) {
      note.value = next
    }

    syncHistoryFlags()
  }

  function save(): void {
    if (note.value === null) {
      return
    }

    finishInputNow()

    const notesStore = useNotesStore()

    notesStore.saveNote({
      ...note.value,
      todos: note.value.todos.filter(todo => todo.text.trim() !== ""),
    })

    stopEditing()
  }

  function cancel(): void {
    stopEditing()
  }

  function stopEditing(): void {
    stopWatch?.()
    stopWatch = null

    saveDraft.cancel()
    finishInputAfterPause.cancel()
    history.clear()
    clearDraft()

    note.value = null
    restorableDraft.value = null
    syncHistoryFlags()
  }

  function findTodo(id: string): TodoItem | undefined {
    return note.value?.todos.find(todo => todo.id === id)
  }

  return {
    note,
    canUndo,
    canRedo,
    hasDraftToRestore,
    startEditing,
    restoreDraft,
    discardDraft,
    setTitle,
    setTodoText,
    toggleTodo,
    addTodo,
    removeTodo,
    finishInputNow,
    undo,
    redo,
    save,
    cancel,
  }
})
