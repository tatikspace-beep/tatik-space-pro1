import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import the translation resources
import { translations } from './i18n';

// Configure i18next
i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Passes i18n down to react-i18next
  .init({
    resources: Object.keys(translations).reduce((acc, lang) => {
      acc[lang] = { translation: translations[lang as keyof typeof translations] };
      return acc;
    }, {} as Record<string, { translation: Record<string, string> }>),
    fallbackLng: 'en', // Use English as fallback language
    debug: process.env.NODE_ENV === 'development', // Enable debug mode in development
    
    interpolation: {
      escapeValue: false, // React already safes from XSS
    },
    
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;