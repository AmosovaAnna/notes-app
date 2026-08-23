import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useNotesStore } from "~/stores/notes"
import type { Note } from "~/types/note"

const STORAGE_KEY = "notes-app:data"

function storedNotes(): Array<Note> {
  const raw = localStorage.getItem(STORAGE_KEY)

  return raw === null ? [] : JSON.parse(raw).notes
}

describe("notes store", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("создаёт заметку с пустым названием и без пунктов", () => {
    const store = useNotesStore()
    const note = store.createNote()

    expect(store.notes).toHaveLength(1)
    expect(note.title).toBe("")
    expect(note.todos).toEqual([])
    expect(note.id).not.toBe("")
  })

  it("находит заметку по id и возвращает undefined для несуществующей", () => {
    const store = useNotesStore()
    const note = store.createNote()

    expect(store.findNote(note.id)).toEqual(note)
    expect(store.findNote("нет-такой")).toBeUndefined()
  })

  it("сохраняет копию заметки, не трогая исходную до вызова saveNote", () => {
    const store = useNotesStore()
    const note = store.createNote()

    const draft: Note = { ...note, title: "Покупки" }

    expect(store.findNote(note.id)?.title).toBe("")

    store.saveNote(draft)

    expect(store.findNote(note.id)?.title).toBe("Покупки")
  })

  it("удаляет заметку по id", () => {
    const store = useNotesStore()
    const first = store.createNote()
    const second = store.createNote()

    store.deleteNote(first.id)

    expect(store.notes).toHaveLength(1)
    expect(store.notes[0]?.id).toBe(second.id)
  })

  it("показывает свежие заметки первыми", () => {
    const store = useNotesStore()
    const first = store.createNote()
    const second = store.createNote()

    store.saveNote({ ...first, title: "Изменена позже" })

    expect(store.sortedNotes[0]?.id).toBe(first.id)
    expect(store.sortedNotes[1]?.id).toBe(second.id)
  })

  it("загружает заметки из хранилища", () => {
    const stored: Note = {
      id: "note-1",
      title: "Из хранилища",
      todos: [],
      updatedAt: 1000,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, notes: [stored] }))

    const store = useNotesStore()
    store.load()

    expect(store.notes).toEqual([stored])
  })

  it("пишет в хранилище не сразу, а после паузы", async () => {
    const store = useNotesStore()
    store.load()

    store.createNote()
    await vi.advanceTimersByTimeAsync(0)

    expect(storedNotes()).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(500)

    expect(storedNotes()).toHaveLength(1)
  })

  it("собирает несколько изменений подряд в одну запись", async () => {
    const store = useNotesStore()
    store.load()

    const setItem = vi.spyOn(localStorage, "setItem")

    store.createNote()
    await vi.advanceTimersByTimeAsync(100)
    store.createNote()
    await vi.advanceTimersByTimeAsync(100)
    store.createNote()
    await vi.advanceTimersByTimeAsync(500)

    expect(setItem).toHaveBeenCalledTimes(1)
    expect(storedNotes()).toHaveLength(3)
  })

  it("saveNow записывает изменения немедленно", async () => {
    const store = useNotesStore()
    store.load()

    store.createNote()
    await vi.advanceTimersByTimeAsync(0)

    store.saveNow()

    expect(storedNotes()).toHaveLength(1)
  })
})
