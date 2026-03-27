import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import uz from './locales/uz.json';
import uzCyr from './locales/uz-cyr.json';
import ru from './locales/ru.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      uz: { translation: uz },
      'uz-cyr': { translation: uzCyr },
      ru: { translation: ru },
    },
    fallbackLng: 'uz',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'osonprava-lang',
    },
  });

export default i18n;
