import { describe, expect, it } from "vitest"
import { noteTitle, UNTITLED_NOTE } from "~/utils/note-title"

describe("noteTitle", () => {
  it("возвращает название как есть", () => {
    expect(noteTitle("Покупки")).toBe("Покупки")
  })

  it("подставляет заглушку вместо пустой строки", () => {
    expect(noteTitle("")).toBe(UNTITLED_NOTE)
  })

  it("считает пустым название из одних пробелов", () => {
    expect(noteTitle("   ")).toBe(UNTITLED_NOTE)
  })

  it("не обрезает пробелы у непустого названия", () => {
    expect(noteTitle(" Покупки ")).toBe(" Покупки ")
  })
})
