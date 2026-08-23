<script setup lang="ts">
import type { PropType } from "vue"

defineProps({
  modelValue: { type: String, required: true },
  label: { type: String, required: true },
  placeholder: { type: String, default: "" },
  size: { type: String as PropType<"normal" | "title">, default: "normal" },
  showLabel: { type: Boolean, default: false },
})

const emit = defineEmits(["update:modelValue", "blur"])

const fieldId = useId()

function onInput(event: Event): void {
  emit("update:modelValue", (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="field">
    <label
      :for="fieldId"
      :class="showLabel ? 'field__label' : 'sr-only'"
    >{{ label }}</label>

    <input
      :id="fieldId"
      type="text"
      class="field__input"
      :class="`field__input--${size}`"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
      @blur="emit('blur')"
    >
  </div>
</template>

<style lang="scss" scoped>
.field {
  display: flex;
  flex-direction: column;
  gap: $space-1;
  width: 100%;

  &__label {
    color: var(--color-text-muted);
    font-size: 13px;
  }

  &__input {
    width: 100%;
    min-height: $tap-target;
    padding: $space-2 $space-3;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: $radius-md;
    transition: border-color $transition-fast;

    @include focus-ring;

    &::placeholder {
      color: var(--color-text-muted);
    }

    &--title {
      font-size: 20px;
      font-weight: 600;
    }
  }
}
</style>
