import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, useTranslations } from '@/lib/i18n';
import i18n from '@/lib/i18n';

type Language = keyof typeof translations;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('tatik-language');
    return (saved as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('tatik-language', lang);
    // Synchronize with i18next
    i18n.changeLanguage(lang);
  };

  // Sync i18next with initial language
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);

  const t = useTranslations(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
