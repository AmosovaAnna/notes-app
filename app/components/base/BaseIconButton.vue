<script setup lang="ts">
import type { PropType } from "vue"

defineProps({
  label: { type: String, required: true },
  tone: { type: String as PropType<"muted" | "danger">, default: "muted" },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    class="icon-button"
    :class="`icon-button--${tone}`"
  >
    <slot></slot>
    <span class="sr-only">{{ label }}</span>
  </button>
</template>

<style lang="scss" scoped>
.icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: $tap-target;
  height: $tap-target;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: $radius-md;
  cursor: pointer;
  transition: background $transition-fast, color $transition-fast;

  @include focus-ring;

  :deep(svg) {
    width: 18px;
    height: 18px;
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &--muted {
    color: var(--color-text-muted);

    &:hover:not(:disabled) {
      background: var(--color-surface-muted);
      color: var(--color-text);
    }
  }

  &--danger {
    color: var(--color-danger);

    &:hover:not(:disabled) {
      background: var(--color-surface-muted);
    }
  }
}
</style>
