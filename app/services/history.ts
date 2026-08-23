import { ref, type Ref } from "vue"
import type { Note } from "~/types/note"
import { applyChange, type Change } from "~/services/changes"

const HISTORY_LIMIT = 50

export type TextField
  = | { kind: "title" }
    | { kind: "todo-text", id: string }

interface TextInput {
  key: string
  field: TextField
  before: string
  after: string
}

export interface History {
  addChange: (change: Change) => void
  trackTextInput: (field: TextField, before: string, after: string) => void
  finishTextInput: () => void
  undo: (note: Note) => Note | null
  redo: (note: Note) => Note | null
  clear: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  size: () => number
}

function fieldKey(field: TextField): string {
  return field.kind === "title" ? "title" : `todo-text:${field.id}`
}

function inputToChange(input: TextInput): Change {
  if (input.field.kind === "title") {
    return { kind: "title", before: input.before, after: input.after }
  }

  return {
    kind: "todo-text",
    id: input.field.id,
    before: input.before,
    after: input.after,
  }
}

export function createHistory(limit: number = HISTORY_LIMIT): History {
  const undoStack: Ref<Array<Change>> = ref([])
  const redoStack: Ref<Array<Change>> = ref([])
  const currentInput: Ref<TextInput | null> = ref(null)

  function push(change: Change): void {
    undoStack.value.push(change)
    redoStack.value.length = 0

    if (undoStack.value.length > limit) {
      undoStack.value.shift()
    }
  }

  function finishTextInput(): void {
    if (currentInput.value === null) {
      return
    }

    const finished = currentInput.value
    currentInput.value = null

    if (finished.before !== finished.after) {
      push(inputToChange(finished))
    }
  }

  function addChange(change: Change): void {
    finishTextInput()
    push(change)
  }

  function trackTextInput(field: TextField, before: string, after: string): void {
    const key = fieldKey(field)
    const started = currentInput.value

    if (started !== null && started.key === key) {
      started.after = after
      return
    }

    finishTextInput()
    currentInput.value = { key, field, before, after }
  }

  function undo(note: Note): Note | null {
    finishTextInput()

    const change = undoStack.value.pop()

    if (change === undefined) {
      return null
    }

    redoStack.value.push(change)

    return applyChange(note, change, "revert")
  }

  function redo(note: Note): Note | null {
    const change = redoStack.value.pop()

    if (change === undefined) {
      return null
    }

    undoStack.value.push(change)

    return applyChange(note, change, "apply")
  }

  function clear(): void {
    undoStack.value = []
    redoStack.value = []
    currentInput.value = null
  }

  return {
    addChange,
    trackTextInput,
    finishTextInput,
    undo,
    redo,
    clear,
    canUndo: () => undoStack.value.length > 0 || currentInput.value !== null,
    canRedo: () => redoStack.value.length > 0,
    size: () => undoStack.value.length,
  }
}
