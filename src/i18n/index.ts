import { es, type Dictionary } from './es';
import { ca } from './ca';
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from '../types';

export const dictionaries: Record<Locale, Dictionary> = { es, ca };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/** Rutas que no llevan prefijo de idioma, como `/` o `/es`. */
export function isLocaleRoot(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);
  return segments.length === 0 || (segments.length === 1 && isLocale(segments[0]));
}

/** Detecta el idioma a partir del primer segmento de la ruta. */
export function localeFromPath(pathname: string): Locale | null {
  const first = pathname.split('/').filter(Boolean)[0];
  return isLocale(first) ? first : null;
}

/** Sustituye el prefijo de idioma de una ruta conservando el resto. */
export function replaceLocaleInPath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/').filter(Boolean);
  if (isLocale(segments[0])) {
    segments[0] = locale;
    return `/${segments.join('/')}`;
  }
  return `/${[locale, ...segments].join('/')}`;
}

export function detectBrowserLocale(language: string | undefined | null): Locale | null {
  if (!language) return null;
  const base = language.toLowerCase().split('-')[0];
  return isLocale(base) ? base : null;
}

/** Precedencia: idioma guardado → idioma del navegador → castellano. */
export function resolveInitialLocale(
  saved: string | null,
  browserLanguage: string | undefined | null,
): Locale {
  if (isLocale(saved)) return saved;
  return detectBrowserLocale(browserLanguage) ?? DEFAULT_LOCALE;
}

/** Formatea una cantidad con separador decimal del idioma activo. */
export function formatQuantity(locale: Locale, quantity: number): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(quantity);
}

/** Formatea una fecha con Intl según el idioma activo. */
export function formatDate(locale: Locale, timestamp: number): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(new Date(timestamp));
}

export { DEFAULT_LOCALE, LOCALES };
export type { Dictionary, Locale };
