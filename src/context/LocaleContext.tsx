import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTranslation, Translations } from '../i18n';
import storage from '../services/storage';

interface LocaleContextType {
  locale: string;
  translations: Translations;
  setLocale: (lang: string) => void;
  t: (key: keyof Translations) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const [locale, setLocaleState] = useState<string>(() => {
    const savedLang = storage.getLanguage();
    const browserLang = navigator.language.split('-')[0];
    return savedLang || (browserLang === 'ca' ? 'ca' : 'es');
  });

  const [translations, setTranslations] = useState<Translations>(getTranslation(locale));

  useEffect(() => {
    storage.setLanguage(locale);
    document.documentElement.lang = locale;
    setTranslations(getTranslation(locale));
  }, [locale]);

  const setLocale = (lang: string) => {
    setLocaleState(lang);
  };

  const t = (key: keyof Translations): string => {
    return translations[key];
  };

  const value: LocaleContextType = {
    locale,
    translations,
    setLocale,
    t,
  };

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextType {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

export default LocaleContext;
