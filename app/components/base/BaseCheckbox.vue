<script setup lang="ts">
defineProps({
  modelValue: { type: Boolean, required: true },
  label: { type: String, required: true },
  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(["update:modelValue"])

function onChange(event: Event): void {
  emit("update:modelValue", (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <label class="checkbox">
    <input
      type="checkbox"
      class="checkbox__input"
      :checked="modelValue"
      :disabled="disabled"
      @change="onChange"
    >
    <span
      class="checkbox__box"
      aria-hidden="true"
    ></span>
    <span class="sr-only">{{ label }}</span>
  </label>
</template>

<style lang="scss" scoped>
.checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: $tap-target;
  height: $tap-target;
  flex: none;
  cursor: pointer;

  &__input {
    @include sr-only;
  }

  &__box {
    position: relative;
    width: 20px;
    height: 20px;
    background: var(--color-surface);
    border: 2px solid var(--color-border-strong);
    border-radius: $radius-sm;
    transition: background $transition-fast, border-color $transition-fast;
  }

  &__input:checked + &__box {
    background: var(--color-primary);
    border-color: var(--color-primary);

    &::after {
      content: "";
      position: absolute;
      left: 6px;
      top: 2px;
      width: 5px;
      height: 10px;
      border: solid var(--color-primary-contrast);
      border-width: 0 2px 2px 0;
      transform: rotate(45deg);
    }
  }

  &__input:focus-visible + &__box {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }

  &__input:disabled + &__box {
    opacity: 0.6;
  }

  &:has(&__input:disabled) {
    cursor: default;
  }
}
</style>
