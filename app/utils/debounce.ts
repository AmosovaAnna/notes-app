export interface Debounce {
  schedule: () => void
  runNow: () => void
  cancel: () => void
  isWaiting: () => boolean
}

export function createDebounce(fn: () => void, waitMs: number): Debounce {
  let timer: ReturnType<typeof setTimeout> | null = null

  function cancel(): void {
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function schedule(): void {
    cancel()

    timer = setTimeout(() => {
      timer = null
      fn()
    }, waitMs)
  }

  function runNow(): void {
    if (timer === null) {
      return
    }

    cancel()
    fn()
  }

  function isWaiting(): boolean {
    return timer !== null
  }

  return { schedule, runNow, cancel, isWaiting }
}
