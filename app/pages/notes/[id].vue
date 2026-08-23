<script setup lang="ts">
import { NEW_NOTE_ID, ROUTES } from "~/const/routes"
import { BUTTON_VARIANT } from "~/const/variants"

const route = useRoute()
const notesStore = useNotesStore()
const editor = useEditorStore()
const { ask, isOpen: isConfirmOpen } = useConfirm()

const { focusTodoId, titleField, keepFocusNearChange, focusTodo } = useEditorFocus()

const noteId = computed(() => String(route.params.id))
const isMissing = ref(false)

const isDeletedElsewhere = computed(() => (
  !isMissing.value
  && !editor.isNew
  && editor.note !== null
  && notesStore.findNote(noteId.value) === undefined
))

const pageTitle = computed(() => {
  const title = editor.note?.title.trim() ?? ""

  if (title === "" && editor.isNew) {
    return "Новая заметка"
  }

  return noteTitle(title)
})

const heading = computed(() => (editor.isNew ? "Новая заметка" : "Редактирование заметки"))

useHead({ title: () => `Заметка — ${pageTitle.value}` })

onMounted(() => {
  if (noteId.value === NEW_NOTE_ID) {
    editor.startNewNote()
    return
  }

  const source = notesStore.findNote(noteId.value)

  if (source === undefined) {
    isMissing.value = true
    return
  }

  editor.startEditing(source)
})

function undo(): void {
  keepFocusNearChange(() => editor.undo())
}

function redo(): void {
  keepFocusNearChange(() => editor.redo())
}

useUndoRedoHotkeys({
  onUndo: undo,
  onRedo: redo,
  isEnabled: () => !isConfirmOpen.value && !editor.hasDraftToRestore && !isDeletedElsewhere.value,
})

function removeTodo(id: string): void {
  keepFocusNearChange(() => editor.removeTodo(id))
}

function addTodo(afterId?: string): void {
  const item = editor.addTodo(afterId)

  focusTodo(item?.id ?? null)
}

async function save(): Promise<void> {
  editor.save()

  await navigateTo(ROUTES.NOTES)
}

async function leaveToNotes(): Promise<void> {
  editor.cancel()

  await navigateTo(ROUTES.NOTES)
}

async function cancelEditing(): Promise<void> {
  if (!editor.hasUnsavedChanges) {
    await leaveToNotes()
    return
  }

  const confirmed = await ask({
    title: "Отменить редактирование?",
    message: "Несохранённые изменения будут потеряны.",
    confirmLabel: "Отменить изменения",
    cancelLabel: "Продолжить",
    variant: BUTTON_VARIANT.DANGER,
  })

  if (!confirmed) {
    return
  }

  editor.cancel()

  await navigateTo(ROUTES.NOTES)
}

async function deleteNote(): Promise<void> {
  const confirmed = await ask({
    title: "Удалить заметку?",
    message: `«${pageTitle.value}» будет удалена без возможности восстановления.`,
    confirmLabel: "Удалить",
    variant: BUTTON_VARIANT.DANGER,
  })

  if (!confirmed) {
    return
  }

  notesStore.deleteNote(noteId.value)
  editor.cancel()

  await navigateTo(ROUTES.NOTES)
}
</script>

<template>
  <section
    v-if="isMissing"
    class="missing"
  >
    <h1 class="missing__title">
      Заметка не найдена
    </h1>
    <p class="missing__text">
      Возможно, её удалили или ссылка неверная.
    </p>
    <BaseButton
      variant="primary"
      @click="navigateTo(ROUTES.NOTES)"
    >
      К списку заметок
    </BaseButton>
  </section>

  <section
    v-else-if="editor.note"
    class="editor"
  >
    <div class="editor__toolbar">
      <div class="editor__history">
        <h1 class="editor__heading">
          {{ heading }}
        </h1>

        <BaseIconButton
          label="Отменить изменение"
          :disabled="!editor.canUndo"
          @click="undo"
        >
          <IconUndo />
        </BaseIconButton>

        <BaseIconButton
          label="Повторить изменение"
          :disabled="!editor.canRedo"
          @click="redo"
        >
          <IconRedo />
        </BaseIconButton>
      </div>

      <div class="editor__actions">
        <BaseButton @click="cancelEditing">
          Отменить
        </BaseButton>

        <BaseButton
          v-if="!editor.isNew"
          variant="danger"
          @click="deleteNote"
        >
          Удалить
        </BaseButton>

        <BaseButton
          variant="success"
          @click="save"
        >
          Сохранить
        </BaseButton>
      </div>
    </div>

    <BaseTextField
      ref="titleField"
      :model-value="editor.note.title"
      label="Название заметки"
      :placeholder="UNTITLED_NOTE"
      size="title"
      @update:model-value="editor.setTitle"
      @blur="editor.finishInputNow"
    />

    <TransitionGroup
      v-if="editor.note.todos.length > 0"
      tag="ul"
      name="todo"
      class="editor__todos"
      role="list"
    >
      <li
        v-for="todo in editor.note.todos"
        :key="todo.id"
      >
        <TodoRow
          :todo="todo"
          :autofocus="todo.id === focusTodoId"
          @toggle="editor.toggleTodo(todo.id)"
          @update:text="value => editor.setTodoText(todo.id, value)"
          @blur="editor.finishInputNow"
          @remove="removeTodo(todo.id)"
          @submit="addTodo(todo.id)"
        />
      </li>
    </TransitionGroup>

    <p
      v-else
      class="editor__hint"
    >
      В заметке пока нет задач.
    </p>

    <div>
      <BaseButton
        variant="primary"
        @click="addTodo"
      >
        <IconPlus class="editor__plus" />
        Добавить пункт
      </BaseButton>
    </div>

    <BaseModal
      :open="isDeletedElsewhere"
      title="Заметка удалена"
      @close="leaveToNotes"
    >
      <p>Её удалили в другой вкладке. Можно сохранить открытую версию заново или вернуться к списку.</p>

      <template #actions>
        <BaseButton @click="leaveToNotes">
          К списку
        </BaseButton>

        <BaseButton
          variant="success"
          @click="save"
        >
          Сохранить заново
        </BaseButton>
      </template>
    </BaseModal>

    <BaseModal
      :open="editor.hasDraftToRestore"
      title="Восстановить черновик?"
      @close="editor.discardDraft"
    >
      <p>Прошлое редактирование этой заметки осталось несохранённым.</p>

      <template #actions>
        <BaseButton @click="editor.discardDraft">
          Начать заново
        </BaseButton>

        <BaseButton
          variant="primary"
          @click="editor.restoreDraft"
        >
          Восстановить
        </BaseButton>
      </template>
    </BaseModal>
  </section>
</template>

<style lang="scss" scoped>
.missing {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $space-3;
  padding: $space-7 $space-4;
  text-align: center;

  &__title {
    font-size: 22px;
    font-weight: 700;
  }

  &__text {
    color: var(--color-text-muted);
  }
}

.editor {
  display: flex;
  flex-direction: column;
  gap: $space-4;

  &__heading {
    margin-right: $space-2;
    font-size: 20px;
    font-weight: 700;

    @include from($bp-md) {
      font-size: 24px;
    }
  }

  &__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    flex-wrap: wrap;
  }

  &__history {
    display: flex;
    align-items: center;
    gap: $space-2;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $space-2;
    flex-wrap: wrap;

    > * {
      flex: 1 1 auto;
    }

    @include from($bp-sm) {
      flex-wrap: nowrap;

      > * {
        flex: 0 0 auto;
      }
    }
  }

  &__todos {
    display: flex;
    flex-direction: column;

    > li {
      padding-bottom: $space-2;
    }
  }

  &__hint {
    color: var(--color-text-muted);
    font-size: 14px;
  }

  &__plus {
    width: 18px;
    height: 18px;
  }
}

.todo-enter-active {
  transition: opacity $transition-fast;
}

.todo-enter-from {
  opacity: 0;
}

.todo-leave-active {
  overflow: hidden;
  max-height: 140px;
  transition:
    opacity $transition-fast,
    max-height $transition-base,
    padding-bottom $transition-base;
}

.todo-leave-to {
  max-height: 0;
  padding-bottom: 0;
  opacity: 0;
}
</style>
