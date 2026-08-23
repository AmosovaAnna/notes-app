import { describe, expect, it } from "vitest"
import { applyChange } from "~/services/changes"
import type { Note } from "~/types/note"

function makeNote(): Note {
  return {
    id: "note-1",
    title: "Покупки",
    todos: [
      { id: "todo-1", text: "Молоко", done: false },
      { id: "todo-2", text: "Хлеб", done: true },
    ],
    updatedAt: 1000,
  }
}

describe("applyChange", () => {
  it("меняет и возвращает название", () => {
    const note = makeNote()
    const change = { kind: "title", before: "Покупки", after: "Дела" } as const

    expect(applyChange(note, change, "apply").title).toBe("Дела")
    expect(applyChange(note, change, "revert").title).toBe("Покупки")
  })

  it("меняет и возвращает текст пункта", () => {
    const note = makeNote()
    const change = { kind: "todo-text", id: "todo-1", before: "Молоко", after: "Кефир" } as const

    expect(applyChange(note, change, "apply").todos[0]?.text).toBe("Кефир")
    expect(applyChange(note, change, "revert").todos[0]?.text).toBe("Молоко")
  })

  it("отмечает и снимает отметку пункта", () => {
    const note = makeNote()
    const change = { kind: "todo-toggle", id: "todo-1", before: false, after: true } as const

    expect(applyChange(note, change, "apply").todos[0]?.done).toBe(true)
    expect(applyChange(note, change, "revert").todos[0]?.done).toBe(false)
  })

  it("добавляет пункт на нужную позицию и убирает его обратно", () => {
    const note = makeNote()
    const item = { id: "todo-3", text: "Сыр", done: false }
    const change = { kind: "todo-add", index: 1, item } as const

    const added = applyChange(note, change, "apply")

    expect(added.todos.map(todo => todo.id)).toEqual(["todo-1", "todo-3", "todo-2"])
    expect(applyChange(added, change, "revert").todos.map(todo => todo.id)).toEqual(["todo-1", "todo-2"])
  })

  it("удаляет пункт и возвращает его на прежнее место", () => {
    const note = makeNote()
    const removed = note.todos[0]

    if (removed === undefined) {
      throw new Error("в заготовке заметки нет пунктов")
    }

    const change = { kind: "todo-remove", index: 0, item: removed } as const

    const withoutFirst = applyChange(note, change, "apply")

    expect(withoutFirst.todos.map(todo => todo.id)).toEqual(["todo-2"])
    expect(applyChange(withoutFirst, change, "revert").todos.map(todo => todo.id)).toEqual(["todo-1", "todo-2"])
  })

  it("не меняет исходную заметку", () => {
    const note = makeNote()
    const change = { kind: "title", before: "Покупки", after: "Дела" } as const

    applyChange(note, change, "apply")

    expect(note.title).toBe("Покупки")
    expect(note.todos).toHaveLength(2)
  })
})
