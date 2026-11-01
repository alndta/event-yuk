import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import { Language, translations, TranslationKey } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'eventyuk_lang_pref';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'id';
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    return saved === 'en' ? 'en' : 'id';
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, language);
      document.documentElement.lang = language;
    } catch {
      // Ignore storage errors in private browsing
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'id' ? 'en' : 'id'));
  }, []);

  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      const currentDict = translations[language] || translations.id;
      const val = (currentDict as any)[key];
      if (val !== undefined && val !== null) {
        return val;
      }
      // Fallback to id
      const idVal = (translations.id as any)[key];
      if (idVal !== undefined && idVal !== null) {
        return idVal;
      }
      return fallback || key;
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
    }),
    [language, setLanguage, toggleLanguage, t]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
