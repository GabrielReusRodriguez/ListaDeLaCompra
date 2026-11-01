import { es } from './es';
import { ca } from './ca';

export type Translations = typeof es;

export const translations: Record<string, Translations> = {
  es,
  ca,
};

export function getTranslation(lang: string): Translations {
  return translations[lang] || es;
}
