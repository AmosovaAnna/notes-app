import { describe, expect, it } from "vitest"
import { plural } from "~/utils/plural"

const FORMS: [string, string, string] = ["пункт", "пункта", "пунктов"]

describe("plural", () => {
  it("выбирает форму по последней цифре", () => {
    expect(plural(1, FORMS)).toBe("пункт")
    expect(plural(2, FORMS)).toBe("пункта")
    expect(plural(4, FORMS)).toBe("пункта")
    expect(plural(5, FORMS)).toBe("пунктов")
    expect(plural(9, FORMS)).toBe("пунктов")
  })

  it("для чисел от 11 до 19 всегда берёт последнюю форму", () => {
    expect(plural(11, FORMS)).toBe("пунктов")
    expect(plural(12, FORMS)).toBe("пунктов")
    expect(plural(14, FORMS)).toBe("пунктов")
    expect(plural(19, FORMS)).toBe("пунктов")
  })

  it("учитывает разряд сотен", () => {
    expect(plural(21, FORMS)).toBe("пункт")
    expect(plural(101, FORMS)).toBe("пункт")
    expect(plural(102, FORMS)).toBe("пункта")
    expect(plural(111, FORMS)).toBe("пунктов")
    expect(plural(112, FORMS)).toBe("пунктов")
    expect(plural(121, FORMS)).toBe("пункт")
  })

  it("для нуля и круглых чисел берёт последнюю форму", () => {
    expect(plural(0, FORMS)).toBe("пунктов")
    expect(plural(10, FORMS)).toBe("пунктов")
    expect(plural(100, FORMS)).toBe("пунктов")
  })
})
