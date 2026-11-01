import { useContext } from 'react';
import { LocaleContext, type LocaleContextValue } from '../context/LocaleContext';

export function useTranslation(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useTranslation debe usarse dentro de LocaleProvider');
  }
  return context;
}

/** Sustituye marcadores `{clave}` de una cadena traducida. */
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
