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

function emptyNote(): Note {
  return { id: createId(), title: "", todos: [], updatedAt: Date.now() }
}

function withoutEmptyTodos(note: Note): Note {
  return {
    ...note,
    todos: note.todos.filter(todo => todo.text.trim() !== ""),
  }
}

export const useEditorStore = defineStore("editor", () => {
  const note: Ref<Note | null> = ref(null)
  const isNew = ref(false)
  const restorableDraft: Ref<Note | null> = ref(null)
  const savedState = ref("")

  const history = createHistory()

  const canUndo: ComputedRef<boolean> = computed(() => history.canUndo())
  const canRedo: ComputedRef<boolean> = computed(() => history.canRedo())
  const hasDraftToRestore: ComputedRef<boolean> = computed(() => restorableDraft.value !== null)

  const hasUnsavedChanges: ComputedRef<boolean> = computed(() => (
    note.value !== null && JSON.stringify(note.value) !== savedState.value
  ))

  const saveDraft = createDebounce(() => {
    if (note.value !== null) {
      writeDraft(note.value)
    }
  }, DRAFT_SAVE_DELAY_MS)

  const finishInputAfterPause = createDebounce(() => history.finishTextInput(), INPUT_PAUSE_MS)

  let stopWatch: WatchStopHandle | null = null

  function saveDraftNow(): void {
    saveDraft.runNow()
  }

  function handleVisibilityChange(): void {
    if (document.visibilityState === "hidden") {
      saveDraftNow()
    }
  }

  function watchWindowClose(): void {
    if (typeof window === "undefined") {
      return
    }

    forgetWindowClose()
    window.addEventListener("beforeunload", saveDraftNow)
    document.addEventListener("visibilitychange", handleVisibilityChange)
  }

  function forgetWindowClose(): void {
    if (typeof window === "undefined") {
      return
    }

    window.removeEventListener("beforeunload", saveDraftNow)
    document.removeEventListener("visibilitychange", handleVisibilityChange)
  }

  function startEditing(source: Note): void {
    const stored = readDraft()
    const isDraftOfSource = stored !== null && stored.id === source.id && !isSameNote(stored, source)

    restorableDraft.value = isDraftOfSource ? stored : null
    isNew.value = false

    beginSession(cloneNote(source))
  }

  function startNewNote(): void {
    const stored = readDraft()
    const notesStore = useNotesStore()
    const isDraftOfUnsaved = stored !== null && notesStore.findNote(stored.id) === undefined

    restorableDraft.value = isDraftOfUnsaved ? stored : null
    isNew.value = true

    beginSession(emptyNote())
  }

  function beginSession(nextNote: Note): void {
    note.value = nextNote
    savedState.value = JSON.stringify(nextNote)
    history.clear()

    stopWatch?.()
    stopWatch = watch(note, () => saveDraft.schedule(), { deep: true })

    watchWindowClose()
  }

  function restoreDraft(): void {
    if (restorableDraft.value === null) {
      return
    }

    note.value = cloneNote(restorableDraft.value)
    restorableDraft.value = null
    history.clear()
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
  }

  function toggleTodo(id: string): void {
    const todo = findTodo(id)

    if (todo === undefined) {
      return
    }

    finishInputNow()
    history.addChange({ kind: "todo-toggle", id, before: todo.done, after: !todo.done })
    todo.done = !todo.done
  }

  function addTodo(afterId?: string): TodoItem | null {
    if (note.value === null) {
      return null
    }

    const item: TodoItem = { id: createId(), text: "", done: false }
    const index = insertIndexAfter(afterId)

    finishInputNow()
    history.addChange({ kind: "todo-add", index, item })
    note.value.todos.splice(index, 0, { ...item })

    return item
  }

  function insertIndexAfter(afterId?: string): number {
    const todos = note.value?.todos ?? []

    if (afterId === undefined) {
      return todos.length
    }

    const afterIndex = todos.findIndex(todo => todo.id === afterId)

    return afterIndex === -1 ? todos.length : afterIndex + 1
  }

  function removeTodo(id: string): void {
    const index = note.value?.todos.findIndex(todo => todo.id === id) ?? -1
    const item = note.value?.todos[index]

    if (note.value === null || item === undefined) {
      return
    }

    finishInputNow()
    history.addChange({ kind: "todo-remove", index, item: { ...item } })
    note.value.todos.splice(index, 1)
  }

  function finishInputNow(): void {
    finishInputAfterPause.cancel()
    history.finishTextInput()
  }

  function undo(): void {
    if (note.value === null) {
      return
    }

    finishInputAfterPause.cancel()
    note.value = history.undo(note.value) ?? note.value
  }

  function redo(): void {
    if (note.value === null) {
      return
    }

    note.value = history.redo(note.value) ?? note.value
  }

  function save(): void {
    if (note.value === null) {
      return
    }

    finishInputNow()
    useNotesStore().saveNote(withoutEmptyTodos(note.value))

    stopEditing()
  }

  function cancel(): void {
    stopEditing()
  }

  function stopEditing(): void {
    stopWatch?.()
    stopWatch = null

    forgetWindowClose()
    saveDraft.cancel()
    finishInputAfterPause.cancel()
    history.clear()
    clearDraft()

    note.value = null
    restorableDraft.value = null
    isNew.value = false
  }

  function findTodo(id: string): TodoItem | undefined {
    return note.value?.todos.find(todo => todo.id === id)
  }

  return {
    note,
    canUndo,
    canRedo,
    isNew,
    hasUnsavedChanges,
    hasDraftToRestore,
    startEditing,
    startNewNote,
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
