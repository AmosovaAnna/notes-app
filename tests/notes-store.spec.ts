import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useNotesStore } from "~/stores/notes"
import type { Note } from "~/types/note"

const STORAGE_KEY = "notes-app:data"

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    title: "Покупки",
    todos: [{ id: "todo-1", text: "Молоко", done: false }],
    updatedAt: 1000,
    ...overrides,
  }
}

function storedNotes(): Array<Note> {
  const raw = localStorage.getItem(STORAGE_KEY)

  return raw === null ? [] : JSON.parse(raw).notes
}

describe("стор заметок", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("добавляет заметку, которой ещё нет в списке", () => {
    const store = useNotesStore()

    store.saveNote(makeNote())

    expect(store.notes).toHaveLength(1)
    expect(store.findNote("note-1")?.title).toBe("Покупки")
  })

  it("обновляет существующую заметку, а не добавляет копию", () => {
    const store = useNotesStore()

    store.saveNote(makeNote())
    store.saveNote(makeNote({ title: "Дела" }))

    expect(store.notes).toHaveLength(1)
    expect(store.findNote("note-1")?.title).toBe("Дела")
  })

  it("возвращает undefined для несуществующей заметки", () => {
    const store = useNotesStore()

    expect(store.findNote("нет-такой")).toBeUndefined()
  })

  it("обновляет время изменения при сохранении", () => {
    const store = useNotesStore()

    vi.setSystemTime(new Date(5000))
    store.saveNote(makeNote({ updatedAt: 1000 }))

    expect(store.findNote("note-1")?.updatedAt).toBe(5000)
  })

  it("удаляет заметку по id", () => {
    const store = useNotesStore()

    store.saveNote(makeNote())
    store.saveNote(makeNote({ id: "note-2" }))

    store.deleteNote("note-1")

    expect(store.notes).toHaveLength(1)
    expect(store.notes[0]?.id).toBe("note-2")
  })

  it("показывает свежие заметки первыми", () => {
    const store = useNotesStore()

    vi.setSystemTime(new Date(1000))
    store.saveNote(makeNote({ id: "note-1" }))

    vi.setSystemTime(new Date(2000))
    store.saveNote(makeNote({ id: "note-2" }))

    expect(store.sortedNotes.map(note => note.id)).toEqual(["note-2", "note-1"])
  })

  it("загружает заметки из хранилища", () => {
    const stored = makeNote({ title: "Из хранилища" })

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 1, notes: [stored] }))

    const store = useNotesStore()
    store.load()

    expect(store.notes).toEqual([stored])
  })

  it("пишет в хранилище не сразу, а после паузы", async () => {
    const store = useNotesStore()
    store.load()

    store.saveNote(makeNote())
    await vi.advanceTimersByTimeAsync(0)

    expect(storedNotes()).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(500)

    expect(storedNotes()).toHaveLength(1)
  })

  it("собирает несколько изменений подряд в одну запись", async () => {
    const store = useNotesStore()
    store.load()

    const setItem = vi.spyOn(localStorage, "setItem")

    store.saveNote(makeNote({ id: "note-1" }))
    await vi.advanceTimersByTimeAsync(100)
    store.saveNote(makeNote({ id: "note-2" }))
    await vi.advanceTimersByTimeAsync(100)
    store.saveNote(makeNote({ id: "note-3" }))
    await vi.advanceTimersByTimeAsync(500)

    expect(setItem).toHaveBeenCalledTimes(1)
    expect(storedNotes()).toHaveLength(3)
  })

  it("saveNow записывает изменения немедленно", async () => {
    const store = useNotesStore()
    store.load()

    store.saveNote(makeNote())
    await vi.advanceTimersByTimeAsync(0)

    store.saveNow()

    expect(storedNotes()).toHaveLength(1)
  })
})
