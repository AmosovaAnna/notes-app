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
  const undoStack: Array<Change> = []
  const redoStack: Array<Change> = []

  let currentInput: TextInput | null = null

  function push(change: Change): void {
    undoStack.push(change)
    redoStack.length = 0

    if (undoStack.length > limit) {
      undoStack.shift()
    }
  }

  function finishTextInput(): void {
    if (currentInput === null) {
      return
    }

    const finished = currentInput
    currentInput = null

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

    if (currentInput !== null && currentInput.key === key) {
      currentInput.after = after
      return
    }

    finishTextInput()
    currentInput = { key, field, before, after }
  }

  function undo(note: Note): Note | null {
    finishTextInput()

    const change = undoStack.pop()

    if (change === undefined) {
      return null
    }

    redoStack.push(change)

    return applyChange(note, change, "revert")
  }

  function redo(note: Note): Note | null {
    const change = redoStack.pop()

    if (change === undefined) {
      return null
    }

    undoStack.push(change)

    return applyChange(note, change, "apply")
  }

  function clear(): void {
    undoStack.length = 0
    redoStack.length = 0
    currentInput = null
  }

  return {
    addChange,
    trackTextInput,
    finishTextInput,
    undo,
    redo,
    clear,
    canUndo: () => undoStack.length > 0 || currentInput !== null,
    canRedo: () => redoStack.length > 0,
    size: () => undoStack.length,
  }
}
