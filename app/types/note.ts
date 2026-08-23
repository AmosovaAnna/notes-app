export interface TodoItem {
  id: string
  text: string
  done: boolean
}

export interface Note {
  id: string
  title: string
  todos: Array<TodoItem>
  updatedAt: number
}
