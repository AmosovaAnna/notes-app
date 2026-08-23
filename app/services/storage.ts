import type { Note, TodoItem } from "~/types/note"

export const STORAGE_KEY = "notes-app:data"
const DRAFT_KEY = "notes-app:draft"
const SCHEMA_VERSION = 1

interface PersistedData {
  schemaVersion: number
  notes: Array<Note>
}

interface PersistedDraft {
  schemaVersion: number
  note: Note
  savedAt: number
}

function isTodoItem(value: unknown): value is TodoItem {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const item = value as Record<string, unknown>

  return (
    typeof item.id === "string"
    && typeof item.text === "string"
    && typeof item.done === "boolean"
  )
}

function isNote(value: unknown): value is Note {
  if (typeof value !== "object" || value === null) {
    return false
  }

  const note = value as Record<string, unknown>

  return (
    typeof note.id === "string"
    && typeof note.title === "string"
    && typeof note.updatedAt === "number"
    && Array.isArray(note.todos)
    && note.todos.every(isTodoItem)
  )
}

export function readNotes(): Array<Note> {
  if (typeof localStorage === "undefined") {
    return []
  }

  const raw = localStorage.getItem(STORAGE_KEY)

  if (raw === null) {
    return []
  }

  try {
    const data = JSON.parse(raw) as PersistedData

    if (data.schemaVersion !== SCHEMA_VERSION) {
      console.warn(`Заметки сохранены в схеме версии ${data.schemaVersion}, ожидалась ${SCHEMA_VERSION}`)
      return []
    }

    if (!Array.isArray(data.notes)) {
      return []
    }

    return data.notes.filter(isNote)
  }
  catch {
    console.warn("Не удалось разобрать сохранённые заметки, начинаем с пустого списка")
    return []
  }
}

export function readDraft(): Note | null {
  if (typeof localStorage === "undefined") {
    return null
  }

  const raw = localStorage.getItem(DRAFT_KEY)

  if (raw === null) {
    return null
  }

  try {
    const draft = JSON.parse(raw) as PersistedDraft

    if (draft.schemaVersion !== SCHEMA_VERSION || !isNote(draft.note)) {
      return null
    }

    return draft.note
  }
  catch {
    console.warn("Не удалось разобрать сохранённый черновик")
    return null
  }
}

export function writeDraft(note: Note): void {
  if (typeof localStorage === "undefined") {
    return
  }

  const draft: PersistedDraft = {
    schemaVersion: SCHEMA_VERSION,
    note,
    savedAt: Date.now(),
  }

  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  }
  catch {
    console.warn("Не удалось сохранить черновик")
  }
}

export function clearDraft(): void {
  if (typeof localStorage === "undefined") {
    return
  }

  localStorage.removeItem(DRAFT_KEY)
}

export function writeNotes(notes: Array<Note>): void {
  if (typeof localStorage === "undefined") {
    return
  }

  const data: PersistedData = {
    schemaVersion: SCHEMA_VERSION,
    notes,
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }
  catch {
    console.warn("Не удалось сохранить заметки: хранилище недоступно или переполнено")
  }
}
