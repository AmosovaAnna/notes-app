import { nextTick, ref, type Ref } from "vue"
import type { Note, TodoItem } from "~/types/note"
import { useEditorStore } from "~/stores/editor"

interface FocusTarget {
  focus: () => void
}

export interface EditorFocus {
  focusTodoId: Ref<string | null>
  titleField: Ref<FocusTarget | null>
  keepFocusNearChange: (action: () => void) => void
  focusTodo: (id: string | null) => void
}

function snapshot(note: Note | null): Array<TodoItem> {
  return note?.todos.map(todo => ({ ...todo })) ?? []
}

function findRemovedNeighbour(before: Array<TodoItem>, after: Array<TodoItem>): string | null {
  const stillHere = new Set(after.map(todo => todo.id))
  const index = before.findIndex(todo => !stillHere.has(todo.id))

  if (index === -1) {
    return null
  }

  return before[index - 1]?.id ?? after[0]?.id ?? null
}

function findAdded(before: Array<TodoItem>, after: Array<TodoItem>): string | null {
  const wasHere = new Set(before.map(todo => todo.id))

  return after.find(todo => !wasHere.has(todo.id))?.id ?? null
}

function findEdited(before: Array<TodoItem>, after: Array<TodoItem>): string | null {
  const edited = after.find((todo) => {
    const previous = before.find(item => item.id === todo.id)

    return previous !== undefined && (previous.text !== todo.text || previous.done !== todo.done)
  })

  return edited?.id ?? null
}

export function useEditorFocus(): EditorFocus {
  const editor = useEditorStore()

  const focusTodoId: Ref<string | null> = ref(null)
  const titleField: Ref<FocusTarget | null> = ref(null)

  async function focusTodo(id: string | null): Promise<void> {
    focusTodoId.value = null

    await nextTick()

    focusTodoId.value = id
  }

  function focusTitle(): void {
    focusTodo(null)
    titleField.value?.focus()
  }

  function keepFocusNearChange(action: () => void): void {
    const titleBefore = editor.note?.title ?? ""
    const before = snapshot(editor.note)

    action()

    const after = snapshot(editor.note)

    const changedTodoId = findRemovedNeighbour(before, after)
      ?? findAdded(before, after)
      ?? findEdited(before, after)

    if (changedTodoId !== null) {
      focusTodo(changedTodoId)
      return
    }

    if ((editor.note?.title ?? "") !== titleBefore) {
      focusTitle()
    }
  }

  return {
    focusTodoId,
    titleField,
    keepFocusNearChange,
    focusTodo,
  }
}
