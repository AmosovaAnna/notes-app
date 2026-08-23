export const NEW_NOTE_ID = "new"

export const ROUTES = {
  NOTES: "/",
  NEW_NOTE: `/notes/${NEW_NOTE_ID}`,
  NOTE: (id: string): string => `/notes/${id}`,
}
