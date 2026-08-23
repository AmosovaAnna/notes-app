import { createPinia, setActivePinia } from "pinia"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useEditorStore } from "~/stores/editor"
import { useNotesStore } from "~/stores/notes"
import type { Note } from "~/types/note"

const DRAFT_KEY = "notes-app:draft"

function makeNote(overrides: Partial<Note> = {}): Note {
  return {
    id: "note-1",
    title: "Покупки",
    todos: [
      { id: "todo-1", text: "Молоко", done: false },
      { id: "todo-2", text: "Хлеб", done: true },
    ],
    updatedAt: 1000,
    ...overrides,
  }
}

function storedDraft(): Note | null {
  const raw = localStorage.getItem(DRAFT_KEY)

  return raw === null ? null : JSON.parse(raw).note
}

describe("стор редактора", () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("редактирует копию, не трогая заметку в списке", () => {
    const notesStore = useNotesStore()
    const editor = useEditorStore()

    notesStore.saveNote(makeNote())
    editor.startEditing(makeNote())
    editor.setTitle("Новое название")

    expect(notesStore.findNote("note-1")?.title).toBe("Покупки")
    expect(editor.note?.title).toBe("Новое название")
  })

  it("сохраняет изменения в список заметок", () => {
    const notesStore = useNotesStore()
    const editor = useEditorStore()

    notesStore.saveNote(makeNote())
    editor.startEditing(makeNote())
    editor.setTitle("Дела")
    editor.save()

    expect(notesStore.findNote("note-1")?.title).toBe("Дела")
    expect(editor.note).toBeNull()
  })

  it("новая заметка не попадает в список, пока её не сохранили", () => {
    const notesStore = useNotesStore()
    const editor = useEditorStore()

    editor.startNewNote()
    editor.setTitle("Черновая")

    expect(notesStore.notes).toHaveLength(0)
    expect(editor.isNew).toBe(true)
  })

  it("сохранение новой заметки добавляет её в список", () => {
    const notesStore = useNotesStore()
    const editor = useEditorStore()

    editor.startNewNote()
    editor.setTitle("Новая")
    editor.save()

    expect(notesStore.notes).toHaveLength(1)
    expect(notesStore.notes[0]?.title).toBe("Новая")
  })

  it("отмена создания не оставляет следов", () => {
    const notesStore = useNotesStore()
    const editor = useEditorStore()

    editor.startNewNote()
    editor.setTitle("Передумала")
    editor.cancel()

    expect(notesStore.notes).toHaveLength(0)
    expect(editor.note).toBeNull()
  })

  it("выбрасывает пустые пункты при сохранении", () => {
    const notesStore = useNotesStore()
    const editor = useEditorStore()

    editor.startNewNote()

    const filled = editor.addTodo()
    editor.addTodo()

    if (filled === null) {
      throw new Error("пункт не добавился")
    }

    editor.setTodoText(filled.id, "Молоко")
    editor.save()

    expect(notesStore.notes[0]?.todos).toEqual([
      { id: filled.id, text: "Молоко", done: false },
    ])
  })

  it("отмена редактирования не меняет заметку в списке", () => {
    const notesStore = useNotesStore()
    const editor = useEditorStore()

    notesStore.saveNote(makeNote())

    editor.startEditing(makeNote())
    editor.setTitle("Другое")
    editor.cancel()

    expect(notesStore.findNote("note-1")?.title).toBe("Покупки")
    expect(editor.note).toBeNull()
  })

  it("отменяет и повторяет изменение названия", () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.setTitle("Дела")
    editor.finishInputNow()

    editor.undo()
    expect(editor.note?.title).toBe("Покупки")

    editor.redo()
    expect(editor.note?.title).toBe("Дела")
  })

  it("непрерывный ввод отменяется одним шагом", () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.setTitle("П")
    editor.setTitle("По")
    editor.setTitle("Пок")

    editor.undo()

    expect(editor.note?.title).toBe("Покупки")
    expect(editor.canUndo).toBe(false)
  })

  it("пауза во вводе закрывает запись, и отмены становятся раздельными", () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.setTitle("Дела")
    vi.advanceTimersByTime(600)
    editor.setTitle("Дела на неделю")

    editor.undo()
    expect(editor.note?.title).toBe("Дела")

    editor.undo()
    expect(editor.note?.title).toBe("Покупки")
  })

  it("отметка пункта — отдельный шаг истории", () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.toggleTodo("todo-1")

    expect(editor.note?.todos[0]?.done).toBe(true)

    editor.undo()

    expect(editor.note?.todos[0]?.done).toBe(false)
  })

  it("добавляет пункт сразу после указанного", () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())

    const added = editor.addTodo("todo-1")

    expect(editor.note?.todos.map(todo => todo.id)).toEqual(["todo-1", added?.id, "todo-2"])
  })

  it("без указания соседа добавляет пункт в конец", () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())

    const added = editor.addTodo()

    expect(editor.note?.todos.map(todo => todo.id)).toEqual(["todo-1", "todo-2", added?.id])
  })

  it("добавление пункта отменяется", () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.addTodo("todo-1")

    editor.undo()

    expect(editor.note?.todos.map(todo => todo.id)).toEqual(["todo-1", "todo-2"])
  })

  it("удаление пункта отменяется с сохранением позиции", () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.removeTodo("todo-1")

    expect(editor.note?.todos.map(todo => todo.id)).toEqual(["todo-2"])

    editor.undo()

    expect(editor.note?.todos.map(todo => todo.id)).toEqual(["todo-1", "todo-2"])
  })

  it("сохранение сбрасывает историю", () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.setTitle("Дела")
    editor.save()

    expect(editor.canUndo).toBe(false)
    expect(editor.canRedo).toBe(false)
  })

  it("пишет черновик в хранилище после паузы", async () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.setTitle("Черновик")

    expect(storedDraft()).toBeNull()

    await vi.advanceTimersByTimeAsync(400)

    expect(storedDraft()?.title).toBe("Черновик")
  })

  it("предлагает восстановить черновик, если он отличается от сохранённой заметки", async () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.setTitle("Незаконченное")
    await vi.advanceTimersByTimeAsync(400)

    setActivePinia(createPinia())
    const nextSession = useEditorStore()
    nextSession.startEditing(makeNote())

    expect(nextSession.hasDraftToRestore).toBe(true)

    nextSession.restoreDraft()

    expect(nextSession.note?.title).toBe("Незаконченное")
    expect(nextSession.hasDraftToRestore).toBe(false)
  })

  it("не предлагает черновик, совпадающий с сохранённой заметкой", async () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.setTitle("Изменено")
    await vi.advanceTimersByTimeAsync(400)
    editor.setTitle("Покупки")
    await vi.advanceTimersByTimeAsync(400)

    setActivePinia(createPinia())
    const nextSession = useEditorStore()
    nextSession.startEditing(makeNote())

    expect(nextSession.hasDraftToRestore).toBe(false)
  })

  it("не предлагает черновик от другой заметки", async () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.setTitle("Незаконченное")
    await vi.advanceTimersByTimeAsync(400)

    setActivePinia(createPinia())
    const nextSession = useEditorStore()
    nextSession.startEditing(makeNote({ id: "note-2", title: "Другая" }))

    expect(nextSession.hasDraftToRestore).toBe(false)
  })

  it("предлагает восстановить прерванное создание заметки", async () => {
    const editor = useEditorStore()

    editor.startNewNote()
    editor.setTitle("Недописанная")
    await vi.advanceTimersByTimeAsync(400)

    setActivePinia(createPinia())
    const nextSession = useEditorStore()
    nextSession.startNewNote()

    expect(nextSession.hasDraftToRestore).toBe(true)

    nextSession.restoreDraft()

    expect(nextSession.note?.title).toBe("Недописанная")
  })

  it("отказ от черновика удаляет его из хранилища", async () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.setTitle("Незаконченное")
    await vi.advanceTimersByTimeAsync(400)

    setActivePinia(createPinia())
    const nextSession = useEditorStore()
    nextSession.startEditing(makeNote())
    nextSession.discardDraft()

    expect(storedDraft()).toBeNull()
    expect(nextSession.hasDraftToRestore).toBe(false)
  })

  it("сохранение убирает черновик", async () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.setTitle("Черновик")
    await vi.advanceTimersByTimeAsync(400)

    expect(storedDraft()).not.toBeNull()

    editor.save()

    expect(storedDraft()).toBeNull()
  })

  it("успевает записать черновик при закрытии вкладки", async () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.setTitle("Недописанное")
    await vi.advanceTimersByTimeAsync(0)

    expect(storedDraft()).toBeNull()

    window.dispatchEvent(new Event("beforeunload"))

    expect(storedDraft()?.title).toBe("Недописанное")
  })

  it("отмена редактирования убирает черновик", async () => {
    const editor = useEditorStore()

    editor.startEditing(makeNote())
    editor.setTitle("Черновик")
    await vi.advanceTimersByTimeAsync(400)

    editor.cancel()

    expect(storedDraft()).toBeNull()
  })
})
