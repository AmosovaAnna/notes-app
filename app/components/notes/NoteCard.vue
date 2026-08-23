<script setup lang="ts">
import type { PropType } from "vue"
import type { Note } from "~/types/note"
import { ROUTES } from "~/const/routes"

const PREVIEW_LIMIT = 3

const props = defineProps({
  note: { type: Object as PropType<Note>, required: true },
})

defineEmits(["delete"])

const title = computed(() => noteTitle(props.note.title))
const preview = computed(() => props.note.todos.slice(0, PREVIEW_LIMIT))
const restCount = computed(() => Math.max(props.note.todos.length - PREVIEW_LIMIT, 0))

const restLabel = computed(() => (
  `ещё ${restCount.value} ${plural(restCount.value, ["пункт", "пункта", "пунктов"])}`
))
</script>

<template>
  <article class="note-card">
    <div class="note-card__head">
      <h2 class="note-card__title">
        <NuxtLink
          :to="ROUTES.NOTE(note.id)"
          class="note-card__link"
        >
          {{ title }}
        </NuxtLink>
      </h2>

      <div class="note-card__actions">
        <NuxtLink
          :to="ROUTES.NOTE(note.id)"
          class="note-card__icon-link"
          :aria-label="`Изменить заметку «${title}»`"
        >
          <IconPencil />
        </NuxtLink>

        <BaseIconButton
          :label="`Удалить заметку «${title}»`"
          variant="danger"
          @click="$emit('delete', note)"
        >
          <IconTrash />
        </BaseIconButton>
      </div>
    </div>

    <ul
      v-if="preview.length > 0"
      class="note-card__todos"
      role="list"
    >
      <li
        v-for="todo in preview"
        :key="todo.id"
        class="note-card__todo"
        :class="{ 'note-card__todo--done': todo.done }"
      >
        <span
          class="note-card__mark"
          :class="{ 'note-card__mark--done': todo.done }"
          aria-hidden="true"
        >
          <IconCheck v-if="todo.done" />
        </span>
        <span class="note-card__text">{{ todo.text.trim() === "" ? "Без текста" : todo.text }}</span>
      </li>
    </ul>

    <p
      v-else
      class="note-card__empty"
    >
      Пока без задач
    </p>

    <p
      v-if="restCount > 0"
      class="note-card__rest"
    >
      {{ restLabel }}
    </p>
  </article>
</template>

<style lang="scss" scoped>
.note-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: $space-4;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: $radius-lg;
  box-shadow: var(--shadow-card);

  &__head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: $space-2;
  }

  &__title {
    font-size: 18px;
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  &__link {
    color: inherit;
    text-decoration: none;
    transition: color $transition-fast;

    &:hover {
      color: var(--color-primary);
    }
  }

  &__actions {
    display: flex;
    gap: $space-1;
    flex: none;
  }

  &__icon-link {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: $tap-target;
    height: $tap-target;
    color: var(--color-accent);
    border-radius: $radius-md;
    transition: background $transition-fast, color $transition-fast, outline-color $transition-fast;

    @include focus-ring;

    &:hover {
      background: var(--color-surface-muted);
    }

    svg {
      width: 18px;
      height: 18px;
    }
  }

  &__todos {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    margin-top: $space-3;
  }

  &__todo {
    display: flex;
    align-items: center;
    gap: $space-2;
    font-size: 15px;

    &--done {
      color: var(--color-text-muted);
      text-decoration: line-through;
    }
  }

  &__mark {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    flex: none;
    border: 2px solid var(--color-border-strong);
    border-radius: 50%;

    svg {
      width: 10px;
      height: 10px;
    }

    &--done {
      background: var(--color-accent-soft);
      border-color: var(--color-accent);
      color: var(--color-accent);
    }
  }

  &__text {
    @include line-clamp(1);
  }

  &__empty,
  &__rest {
    margin-top: auto;
    padding-top: $space-3;
    color: var(--color-text-muted);
    font-size: 14px;
  }
}
</style>
