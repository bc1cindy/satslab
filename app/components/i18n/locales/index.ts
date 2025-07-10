import { pt } from './pt'
import { en } from './en'

export const translations = {
  pt,
  en
}

export type TranslationKey = keyof typeof pt
export type Language = keyof typeof translations