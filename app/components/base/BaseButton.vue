<script setup lang="ts">
import type { PropType } from "vue"

defineProps({
  variant: { type: String as PropType<"primary" | "ghost" | "danger">, default: "ghost" },
  type: { type: String as PropType<"button" | "submit">, default: "button" },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    class="button"
    :class="`button--${variant}`"
  >
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: $space-2;
  min-height: $tap-target;
  padding: $space-2 $space-4;
  border: 1px solid transparent;
  border-radius: $radius-md;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background $transition-fast, border-color $transition-fast, color $transition-fast;

  @include focus-ring;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &--primary {
    background: var(--color-primary);
    color: var(--color-primary-contrast);

    &:hover:not(:disabled) {
      background: var(--color-primary-hover);
    }
  }

  &--ghost {
    background: var(--color-surface);
    border-color: var(--color-border);
    color: var(--color-text);

    &:hover:not(:disabled) {
      background: var(--color-surface-muted);
    }
  }

  &--danger {
    background: transparent;
    border-color: var(--color-border);
    color: var(--color-danger);

    &:hover:not(:disabled) {
      background: var(--color-surface-muted);
      border-color: var(--color-danger);
    }
  }
}
</style>
