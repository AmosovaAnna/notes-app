<script setup lang="ts">
import type { Note } from "~/types/note"
import { ROUTES } from "~/const/routes"
import { BUTTON_VARIANT } from "~/const/variants"

useHead({ title: "Заметки" })

const notesStore = useNotesStore()
const { ask } = useConfirm()

async function createNote(): Promise<void> {
  await navigateTo(ROUTES.NEW_NOTE)
}

async function deleteNote(note: Note): Promise<void> {
  const title = noteTitle(note.title)

  const confirmed = await ask({
    title: "Удалить заметку?",
    message: `«${title}» будет удалена без возможности восстановления.`,
    confirmLabel: "Удалить",
    variant: BUTTON_VARIANT.DANGER,
  })

  if (confirmed) {
    notesStore.deleteNote(note.id)
  }
}
</script>

<template>
  <section class="notes">
    <div class="notes__head">
      <h1 class="notes__title">
        Заметки
      </h1>

      <BaseButton
        variant="primary"
        @click="createNote"
      >
        Новая заметка
      </BaseButton>
    </div>

    <ul
      v-if="notesStore.sortedNotes.length > 0"
      class="notes__list"
      role="list"
    >
      <li
        v-for="note in notesStore.sortedNotes"
        :key="note.id"
      >
        <NoteCard
          :note="note"
          @delete="deleteNote"
        />
      </li>
    </ul>

    <div
      v-else
      class="notes__empty"
    >
      <p class="notes__empty-title">
        Пока ни одной заметки
      </p>
      <p>Создайте первую заметку.</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.notes {
  display: flex;
  flex-direction: column;
  gap: $space-5;

  &__head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $space-3;
    flex-wrap: wrap;
  }

  &__title {
    font-size: 24px;
    font-weight: 700;
  }

  &__list {
    display: grid;
    gap: $space-4;

    > li {
      display: flex;
    }

    @include from($bp-md) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  &__empty {
    padding: $space-7 $space-4;
    color: var(--color-text-muted);
    text-align: center;
    background: var(--color-surface);
    border: 1px dashed var(--color-border-strong);
    border-radius: $radius-lg;
  }

  &__empty-title {
    margin-bottom: $space-1;
    color: var(--color-text);
    font-size: 17px;
    font-weight: 600;
  }
}
</style>
