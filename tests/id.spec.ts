import { afterEach, describe, expect, it, vi } from "vitest"
import { createId } from "~/utils/id"

describe("createId", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("берёт идентификатор у crypto, когда он доступен", () => {
    vi.spyOn(crypto, "randomUUID").mockReturnValue("11111111-1111-4111-8111-111111111111")

    expect(createId()).toBe("11111111-1111-4111-8111-111111111111")
  })

  it("обходится без crypto.randomUUID", () => {
    vi.stubGlobal("crypto", {})

    expect(createId()).not.toBe("")
  })

  it("не повторяет идентификаторы без crypto.randomUUID", () => {
    vi.stubGlobal("crypto", {})

    const ids = new Set(Array.from({ length: 50 }, () => createId()))

    expect(ids.size).toBe(50)
  })
})
