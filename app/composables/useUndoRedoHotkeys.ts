import { onBeforeUnmount, onMounted } from "vue"

interface UndoRedoHandlers {
  onUndo: () => void
  onRedo: () => void
  isEnabled?: () => boolean
}

enum Key {
  Z = "KeyZ",
  Y = "KeyY",
}

const KEY_LETTER: Record<Key, string> = {
  [Key.Z]: "z",
  [Key.Y]: "y",
}

function isPressed(event: KeyboardEvent, key: Key): boolean {
  return event.code === key || event.key.toLowerCase() === KEY_LETTER[key]
}

function isUndo(event: KeyboardEvent): boolean {
  return !event.shiftKey && isPressed(event, Key.Z)
}

function isRedo(event: KeyboardEvent): boolean {
  return isPressed(event, Key.Y) || (event.shiftKey && isPressed(event, Key.Z))
}

export function useUndoRedoHotkeys({ onUndo, onRedo, isEnabled }: UndoRedoHandlers): void {
  function onKeydown(event: KeyboardEvent): void {
    if (!event.ctrlKey && !event.metaKey) {
      return
    }

    if (isEnabled !== undefined && !isEnabled()) {
      return
    }

    if (isRedo(event)) {
      event.preventDefault()
      onRedo()
      return
    }

    if (isUndo(event)) {
      event.preventDefault()
      onUndo()
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", onKeydown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", onKeydown)
  })
}
