import type { Note, TodoItem } from "~/types/note"

export type Change
  = | { kind: "title", before: string, after: string }
    | { kind: "todo-text", id: string, before: string, after: string }
    | { kind: "todo-toggle", id: string, before: boolean, after: boolean }
    | { kind: "todo-add", index: number, item: TodoItem }
    | { kind: "todo-remove", index: number, item: TodoItem }

export type ChangeDirection = "apply" | "revert"

function withTodos(note: Note, todos: Array<TodoItem>): Note {
  return { ...note, todos }
}

function insertTodo(note: Note, index: number, item: TodoItem): Note {
  const todos = [...note.todos]
  todos.splice(index, 0, item)

  return withTodos(note, todos)
}

function removeTodoAt(note: Note, index: number): Note {
  const todos = [...note.todos]
  todos.splice(index, 1)

  return withTodos(note, todos)
}

function replaceTodo(note: Note, id: string, change: (todo: TodoItem) => TodoItem): Note {
  return withTodos(note, note.todos.map(todo => (todo.id === id ? change(todo) : todo)))
}

export function applyChange(note: Note, change: Change, direction: ChangeDirection): Note {
  const forward = direction === "apply"

  switch (change.kind) {
    case "title":
      return { ...note, title: forward ? change.after : change.before }

    case "todo-text":
      return replaceTodo(note, change.id, todo => ({
        ...todo,
        text: forward ? change.after : change.before,
      }))

    case "todo-toggle":
      return replaceTodo(note, change.id, todo => ({
        ...todo,
        done: forward ? change.after : change.before,
      }))

    case "todo-add":
      return forward
        ? insertTodo(note, change.index, change.item)
        : removeTodoAt(note, change.index)

    case "todo-remove":
      return forward
        ? removeTodoAt(note, change.index)
        : insertTodo(note, change.index, change.item)
  }
}
