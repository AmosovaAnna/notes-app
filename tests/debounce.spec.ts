import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createDebounce } from "~/utils/debounce"

describe("createDebounce", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("вызывает функцию один раз после паузы", () => {
    const spy = vi.fn()
    const debounced = createDebounce(spy, 100)

    debounced.schedule()
    debounced.schedule()
    debounced.schedule()

    expect(spy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(100)

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("каждый schedule начинает отсчёт заново", () => {
    const spy = vi.fn()
    const debounced = createDebounce(spy, 100)

    debounced.schedule()
    vi.advanceTimersByTime(80)

    debounced.schedule()
    vi.advanceTimersByTime(80)

    expect(spy).not.toHaveBeenCalled()

    vi.advanceTimersByTime(20)

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("runNow выполняет отложенный вызов немедленно и снимает таймер", () => {
    const spy = vi.fn()
    const debounced = createDebounce(spy, 100)

    debounced.schedule()
    debounced.runNow()

    expect(spy).toHaveBeenCalledTimes(1)
    expect(debounced.isWaiting()).toBe(false)

    vi.advanceTimersByTime(200)

    expect(spy).toHaveBeenCalledTimes(1)
  })

  it("runNow без отложенного вызова ничего не делает", () => {
    const spy = vi.fn()
    const debounced = createDebounce(spy, 100)

    debounced.runNow()

    expect(spy).not.toHaveBeenCalled()
  })

  it("cancel отменяет отложенный вызов", () => {
    const spy = vi.fn()
    const debounced = createDebounce(spy, 100)

    debounced.schedule()
    debounced.cancel()

    vi.advanceTimersByTime(200)

    expect(spy).not.toHaveBeenCalled()
    expect(debounced.isWaiting()).toBe(false)
  })

  it("после срабатывания можно отложить вызов заново", () => {
    const spy = vi.fn()
    const debounced = createDebounce(spy, 100)

    debounced.schedule()
    vi.advanceTimersByTime(100)

    debounced.schedule()
    vi.advanceTimersByTime(100)

    expect(spy).toHaveBeenCalledTimes(2)
  })
})
