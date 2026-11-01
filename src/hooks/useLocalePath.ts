import { useCallback } from 'react';
import { useTranslation } from './useTranslation';

/** Devuelve una función que antepone el prefijo de idioma activo a una ruta interna. */
export function useLocalePath(): (path: string) => string {
  const { locale } = useTranslation();
  return useCallback(
    (path: string) => {
      const clean = path.startsWith('/') ? path : `/${path}`;
      return clean === '/' ? `/${locale}` : `/${locale}${clean}`;
    },
    [locale],
  );
}
