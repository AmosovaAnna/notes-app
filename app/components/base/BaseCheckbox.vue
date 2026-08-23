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
    >
      <IconCheck class="checkbox__tick" />
    </span>
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
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: var(--color-surface);
    border: 2px solid var(--color-border-strong);
    border-radius: 50%;
    transition: background $transition-fast, border-color $transition-fast;
  }

  &__tick {
    width: 13px;
    height: 13px;
    color: var(--color-accent);
    opacity: 0;
  }

  &__input:checked + &__box {
    background: var(--color-accent-soft);
    border-color: var(--color-accent);

    .checkbox__tick {
      opacity: 1;
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
