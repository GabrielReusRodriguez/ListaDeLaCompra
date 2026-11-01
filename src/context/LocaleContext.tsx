import { createContext, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  DEFAULT_LOCALE,
  getDictionary,
  localeFromPath,
  replaceLocaleInPath,
  type Dictionary,
} from '../i18n';
import { saveLocale } from '../services/storage';
import type { Locale } from '../types';

export interface LocaleContextValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
}

export const LocaleContext = createContext<LocaleContextValue | null>(null);

interface LocaleProviderProps {
  children: ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const locale = localeFromPath(location.pathname) ?? DEFAULT_LOCALE;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback(
    (next: Locale) => {
      saveLocale(next);
      if (next === locale) return;
      const search = location.search;
      const hash = location.hash;
      navigate(`${replaceLocaleInPath(location.pathname, next)}${search}${hash}`);
    },
    [locale, location.pathname, location.search, location.hash, navigate],
  );

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, t: getDictionary(locale), setLocale }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
