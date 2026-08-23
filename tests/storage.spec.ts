import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { clearDraft, readDraft, readNotes, writeDraft, writeNotes } from "~/services/storage"
import type { Note } from "~/types/note"

const STORAGE_KEY = "notes-app:data"
const DRAFT_KEY = "notes-app:draft"

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    title: "Покупки",
    todos: [{ id: "todo-1", text: "Молоко", done: false }],
    updatedAt: 1000,
    ...overrides,
  }
}

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("возвращает пустой список, когда в хранилище ничего нет", () => {
    expect(readNotes()).toEqual([])
  })

  it("сохраняет заметки вместе с версией схемы", () => {
    writeNotes([makeNote()])

    const raw = localStorage.getItem(STORAGE_KEY) ?? ""

    expect(JSON.parse(raw)).toEqual({
      schemaVersion: 1,
      notes: [makeNote()],
    })
  })

  it("читает то, что записал", () => {
    const notes = [makeNote(), makeNote({ id: "note-2", title: "Дела" })]

    writeNotes(notes)

    expect(readNotes()).toEqual(notes)
  })

  it("не падает на битом JSON и начинает с пустого списка", () => {
    localStorage.setItem(STORAGE_KEY, "{\"schemaVersion\": 1, \"notes\": [")

    expect(readNotes()).toEqual([])
    expect(console.warn).toHaveBeenCalled()
  })

  it("игнорирует данные другой версии схемы", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ schemaVersion: 2, notes: [makeNote()] }))

    expect(readNotes()).toEqual([])
    expect(console.warn).toHaveBeenCalled()
  })

  it("игнорирует чужие данные в том же ключе", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: "vasya" }))

    expect(readNotes()).toEqual([])
  })

  it("отбрасывает заметки с неверной структурой, сохраняя остальные", () => {
    const valid = makeNote()

    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      notes: [
        valid,
        { id: "note-2", title: "Без списка" },
        { id: "note-3", title: "Строка вместо списка", todos: "нет", updatedAt: 1 },
        { id: "note-4", title: "Битый пункт", todos: [{ id: "t", text: 42, done: false }], updatedAt: 1 },
      ],
    }))

    expect(readNotes()).toEqual([valid])
  })

  it("не падает, когда запись не проходит", () => {
    vi.stubGlobal("localStorage", {
      getItem: () => null,
      removeItem: () => {},
      setItem: () => {
        throw new Error("QuotaExceededError")
      },
    })

    expect(() => writeNotes([makeNote()])).not.toThrow()
    expect(() => writeDraft(makeNote())).not.toThrow()
    expect(console.warn).toHaveBeenCalled()
  })

  it("работает вхолостую, когда хранилища нет", () => {
    vi.stubGlobal("localStorage", undefined)

    expect(readNotes()).toEqual([])
    expect(readDraft()).toBeNull()
    expect(() => writeNotes([makeNote()])).not.toThrow()
    expect(() => writeDraft(makeNote())).not.toThrow()
    expect(() => clearDraft()).not.toThrow()
  })
})

describe("черновик", () => {
  beforeEach(() => {
    localStorage.clear()
    vi.spyOn(console, "warn").mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("возвращает null, когда черновика нет", () => {
    expect(readDraft()).toBeNull()
  })

  it("читает то, что записал", () => {
    writeDraft(makeNote({ title: "Черновик" }))

    expect(readDraft()?.title).toBe("Черновик")
  })

  it("не падает на битом черновике", () => {
    localStorage.setItem(DRAFT_KEY, "{\"schemaVersion\": 1, \"note\":")

    expect(readDraft()).toBeNull()
    expect(console.warn).toHaveBeenCalled()
  })

  it("игнорирует черновик другой версии схемы", () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ schemaVersion: 2, note: makeNote() }))

    expect(readDraft()).toBeNull()
  })

  it("игнорирует черновик с неверной структурой заметки", () => {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ schemaVersion: 1, note: { id: "note-1" } }))

    expect(readDraft()).toBeNull()
  })

  it("удаляется по clearDraft", () => {
    writeDraft(makeNote())
    clearDraft()

    expect(readDraft()).toBeNull()
  })
})
