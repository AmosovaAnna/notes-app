export const BUTTON_VARIANT = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
  DANGER: "danger",
} as const

export const ICON_BUTTON_VARIANT = {
  MUTED: "muted",
  DANGER: "danger",
} as const

export const BUTTON_TYPE = {
  BUTTON: "button",
  SUBMIT: "submit",
} as const

export const TEXT_FIELD_SIZE = {
  NORMAL: "normal",
  TITLE: "title",
} as const

export type ButtonVariant = typeof BUTTON_VARIANT[keyof typeof BUTTON_VARIANT]
export type IconButtonVariant = typeof ICON_BUTTON_VARIANT[keyof typeof ICON_BUTTON_VARIANT]
export type ButtonType = typeof BUTTON_TYPE[keyof typeof BUTTON_TYPE]
export type TextFieldSize = typeof TEXT_FIELD_SIZE[keyof typeof TEXT_FIELD_SIZE]
