<script setup lang="ts">
const props = defineProps({
  open: { type: Boolean, required: true },
  title: { type: String, required: true },
})

const emit = defineEmits(["close"])

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "textarea:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
].join(", ")

const titleId = useId()
const modalWindow = ref<HTMLElement | null>(null)

let elementBeforeOpen: HTMLElement | null = null

function focusableInside(): Array<HTMLElement> {
  if (modalWindow.value === null) {
    return []
  }

  return Array.from(modalWindow.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
}

function keepFocusInside(event: KeyboardEvent): void {
  const focusable = focusableInside()
  const first = focusable[0]
  const last = focusable[focusable.length - 1]

  if (first === undefined || last === undefined) {
    event.preventDefault()
    return
  }

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
    return
  }

  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    emit("close")
    return
  }

  if (event.key === "Tab") {
    keepFocusInside(event)
  }
}

watch(() => props.open, async (open) => {
  document.body.style.overflow = open ? "hidden" : ""

  if (open) {
    elementBeforeOpen = document.activeElement as HTMLElement | null

    await nextTick()

    const [first] = focusableInside()
    first?.focus()
    return
  }

  elementBeforeOpen?.focus()
  elementBeforeOpen = null
})

onBeforeUnmount(() => {
  document.body.style.overflow = ""
})
</script>

<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="modal"
      @click.self="emit('close')"
    >
      <div
        ref="modalWindow"
        class="modal__window"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        @keydown="onKeydown"
      >
        <h2
          :id="titleId"
          class="modal__title"
        >
          {{ title }}
        </h2>

        <div class="modal__body">
          <slot></slot>
        </div>

        <div class="modal__actions">
          <slot name="actions"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.modal {
  position: fixed;
  inset: 0;
  z-index: $z-modal;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $space-4;
  background: var(--color-overlay);

  &__window {
    width: 100%;
    max-width: 420px;
    padding: $space-5;
    background: var(--color-surface);
    border-radius: $radius-lg;
    box-shadow: var(--shadow-modal);
  }

  &__title {
    margin-bottom: $space-2;
    font-size: 18px;
    font-weight: 600;
  }

  &__body {
    color: var(--color-text-muted);
    font-size: 15px;
  }

  &__actions {
    display: flex;
    flex-direction: column;
    gap: $space-2;
    margin-top: $space-5;

    @include from($bp-sm) {
      flex-direction: row;
      justify-content: flex-end;
    }
  }
}
</style>
