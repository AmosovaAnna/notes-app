import { ref, type Ref } from "vue"
import type { ButtonVariant } from "~/const/variants"

export interface ConfirmOptions {
  title: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: Extract<ButtonVariant, "primary" | "danger">
}

const isOpen = ref(false)
const options: Ref<ConfirmOptions> = ref({ title: "" })

let answer: ((confirmed: boolean) => void) | null = null

export interface Confirm {
  isOpen: Ref<boolean>
  options: Ref<ConfirmOptions>
  ask: (next: ConfirmOptions) => Promise<boolean>
  respond: (confirmed: boolean) => void
}

export function useConfirm(): Confirm {
  function ask(next: ConfirmOptions): Promise<boolean> {
    answer?.(false)

    options.value = next
    isOpen.value = true

    return new Promise<boolean>((resolve) => {
      answer = resolve
    })
  }

  function respond(confirmed: boolean): void {
    isOpen.value = false
    answer?.(confirmed)
    answer = null
  }

  return { isOpen, options, ask, respond }
}
