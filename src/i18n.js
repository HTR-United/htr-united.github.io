import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import fr from './locales/fr.json'

const saved = localStorage.getItem('htr-lang')
const browser = navigator.language?.startsWith('fr') ? 'fr' : 'en'
const locale = saved || browser

export const i18n = createI18n({
  legacy: false,
  locale,
  fallbackLocale: 'en',
  messages: { en, fr }
})
