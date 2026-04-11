import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { appSettings } from './app-settings'
import enUS from '../locales/en-US.json'
import ptBR from '../locales/pt-BR.json'

const resources = {
  'pt-BR': {
    translation: ptBR,
  },
  'en-US': {
    translation: enUS,
  },
} as const

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: appSettings.idioma.idiomaPadrao,
    fallbackLng: appSettings.idioma.idiomaPadrao,
    supportedLngs: [...appSettings.idioma.idiomasSuportados],
    interpolation: {
      escapeValue: false,
    },
  })
}

export default i18n
