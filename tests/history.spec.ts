import { describe, expect, it } from "vitest"
import { createHistory } from "~/services/history"
import type { Note } from "~/types/note"

function makeNote(): Note {
  return {
    id: "note-1",
    title: "Покупки",
    todos: [{ id: "todo-1", text: "Молоко", done: false }],
    updatedAt: 1000,
  }
}

describe("история изменений", () => {
  it("отменяет и повторяет атомарное изменение", () => {
    const history = createHistory()
    const note = makeNote()

    history.addChange({ kind: "todo-toggle", id: "todo-1", before: false, after: true })

    const toggled: Note = { ...note, todos: [{ id: "todo-1", text: "Молоко", done: true }] }

    const undone = history.undo(toggled)
    expect(undone?.todos[0]?.done).toBe(false)

    const redone = history.redo(undone as Note)
    expect(redone?.todos[0]?.done).toBe(true)
  })

  it("непрерывный ввод в одно поле даёт одну запись", () => {
    const history = createHistory()

    history.trackTextInput({ kind: "title" }, "", "П")
    history.trackTextInput({ kind: "title" }, "П", "По")
    history.trackTextInput({ kind: "title" }, "По", "Пок")
    history.finishTextInput()

    expect(history.size()).toBe(1)

    const note: Note = { ...makeNote(), title: "Пок" }

    expect(history.undo(note)?.title).toBe("")
  })

  it("переход в другое поле закрывает предыдущую запись", () => {
    const history = createHistory()

    history.trackTextInput({ kind: "title" }, "", "Дела")
    history.trackTextInput({ kind: "todo-text", id: "todo-1" }, "", "Молоко")
    history.finishTextInput()

    expect(history.size()).toBe(2)
  })

  it("атомарное изменение закрывает накопленный ввод", () => {
    const history = createHistory()

    history.trackTextInput({ kind: "title" }, "", "Дела")
    history.addChange({ kind: "todo-toggle", id: "todo-1", before: false, after: true })

    expect(history.size()).toBe(2)
  })

  it("не создаёт запись, если текст в итоге не изменился", () => {
    const history = createHistory()

    history.trackTextInput({ kind: "title" }, "Покупки", "Покупк")
    history.trackTextInput({ kind: "title" }, "Покупк", "Покупки")
    history.finishTextInput()

    expect(history.size()).toBe(0)
    expect(history.canUndo()).toBe(false)
  })

  it("отметка чекбокса и добавление пункта — отдельные записи", () => {
    const history = createHistory()

    history.addChange({ kind: "todo-toggle", id: "todo-1", before: false, after: true })
    history.addChange({ kind: "todo-add", index: 1, item: { id: "todo-2", text: "", done: false } })
    history.addChange({ kind: "todo-remove", index: 0, item: { id: "todo-1", text: "Молоко", done: true } })

    expect(history.size()).toBe(3)
  })

  it("новое изменение после отмены очищает ветку повтора", () => {
    const history = createHistory()
    const note = makeNote()

    history.addChange({ kind: "todo-toggle", id: "todo-1", before: false, after: true })
    history.undo(note)

    expect(history.canRedo()).toBe(true)

    history.addChange({ kind: "title", before: "Покупки", after: "Дела" })

    expect(history.canRedo()).toBe(false)
  })

  it("хранит не больше лимита записей, выбрасывая самые старые", () => {
    const history = createHistory(50)

    for (let index = 0; index < 60; index += 1) {
      history.addChange({ kind: "title", before: String(index), after: String(index + 1) })
    }

    expect(history.size()).toBe(50)

    let current: Note = { ...makeNote(), title: "60" }

    for (let index = 0; index < 50; index += 1) {
      const undone = history.undo(current)

      if (undone === null) {
        throw new Error("история кончилась раньше лимита")
      }

      current = undone
    }

    expect(history.canUndo()).toBe(false)
    expect(current.title).toBe("10")
  })

  it("undo и redo на пустой истории возвращают null", () => {
    const history = createHistory()
    const note = makeNote()

    expect(history.undo(note)).toBeNull()
    expect(history.redo(note)).toBeNull()
  })

  it("clear сбрасывает обе ветки и накопленный ввод", () => {
    const history = createHistory()
    const note = makeNote()

    history.addChange({ kind: "todo-toggle", id: "todo-1", before: false, after: true })
    history.undo(note)
    history.trackTextInput({ kind: "title" }, "", "Дела")

    history.clear()

    expect(history.canUndo()).toBe(false)
    expect(history.canRedo()).toBe(false)
    expect(history.size()).toBe(0)
  })

  it("считает незакрытый ввод отменяемым изменением", () => {
    const history = createHistory()

    history.trackTextInput({ kind: "title" }, "", "Д")

    expect(history.canUndo()).toBe(true)

    const note: Note = { ...makeNote(), title: "Д" }

    expect(history.undo(note)?.title).toBe("")
  })
})
