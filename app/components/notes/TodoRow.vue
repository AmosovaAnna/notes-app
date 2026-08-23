<script setup lang="ts">
import type { PropType } from "vue"
import type { TodoItem } from "~/types/note"

const props = defineProps({
  todo: { type: Object as PropType<TodoItem>, required: true },
  autofocus: { type: Boolean, default: false },
})

const emit = defineEmits(["toggle", "update:text", "blur", "remove", "submit"])

const field = ref<HTMLInputElement | null>(null)

function takeFocus(): void {
  field.value?.focus({ preventScroll: true })
  field.value?.scrollIntoView({ block: "nearest", behavior: "smooth" })
}

onMounted(() => {
  if (props.autofocus) {
    takeFocus()
  }
})

watch(() => props.autofocus, (needsFocus) => {
  if (needsFocus) {
    takeFocus()
  }
})

function onInput(event: Event): void {
  emit("update:text", (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div
    class="todo-row"
    :class="{ 'todo-row--empty': todo.text.trim() === '' }"
  >
    <BaseCheckbox
      :model-value="todo.done"
      :label="`Отметить пункт «${todo.text || 'без текста'}» выполненным`"
      @update:model-value="emit('toggle')"
    />

    <input
      ref="field"
      type="text"
      class="todo-row__input"
      :class="{ 'todo-row__input--done': todo.done }"
      :value="todo.text"
      placeholder="Текст пункта"
      :aria-label="`Текст пункта ${todo.text || 'без текста'}`"
      @input="onInput"
      @blur="emit('blur')"
      @keydown.enter="emit('submit')"
    >

    <BaseIconButton
      :label="`Удалить пункт «${todo.text || 'без текста'}»`"
      @click="emit('remove')"
    >
      <IconClose />
    </BaseIconButton>
  </div>
</template>

<style lang="scss" scoped>
.todo-row {
  display: flex;
  align-items: center;
  gap: $space-2;
  padding: $space-1 $space-2;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: $radius-md;

  outline: 2px solid transparent;
  outline-offset: 2px;
  transition: outline-color $transition-fast, border-color $transition-fast;

  &--empty {
    border-style: dashed;
  }

  &:has(.todo-row__input:focus-visible) {
    outline-color: var(--color-focus);
    border-color: var(--color-border-strong);
  }

  &__input {
    flex: 1;
    min-width: 0;
    min-height: $tap-target;
    padding: 0 $space-1;
    background: transparent;
    border: none;

    &:focus-visible {
      outline: none;
    }

    &--done {
      color: var(--color-text-muted);
      text-decoration: line-through;
    }

    &::placeholder {
      color: var(--color-text-muted);
    }
  }
}

@supports not selector(:has(*)) {
  .todo-row__input:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }
}
</style>
