<script setup lang="ts">
import type { PropType } from "vue"
import { BUTTON_TYPE, BUTTON_VARIANT, type ButtonType, type ButtonVariant } from "~/const/variants"

defineProps({
  variant: { type: String as PropType<ButtonVariant>, default: BUTTON_VARIANT.SECONDARY },
  type: { type: String as PropType<ButtonType>, default: BUTTON_TYPE.BUTTON },
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
  white-space: nowrap;
  cursor: pointer;
  transition:
    background $transition-fast,
    border-color $transition-fast,
    color $transition-fast,
    outline-color $transition-fast;

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

  &--secondary {
    background: transparent;
    border-color: var(--color-primary);
    color: var(--color-primary);

    &:hover:not(:disabled) {
      background: var(--color-primary-soft);
    }
  }

  &--success {
    background: var(--color-accent);
    color: var(--color-primary-contrast);

    &:hover:not(:disabled) {
      background: var(--color-accent-hover);
    }
  }

  &--danger {
    background: var(--color-danger);
    color: var(--color-primary-contrast);

    &:hover:not(:disabled) {
      background: var(--color-danger-hover);
    }
  }
}
</style>
