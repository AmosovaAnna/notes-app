export const UNTITLED_NOTE = "Без названия"

export function noteTitle(title: string): string {
  return title.trim() === "" ? UNTITLED_NOTE : title
}
