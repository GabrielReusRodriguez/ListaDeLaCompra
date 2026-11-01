import { Navigate } from 'react-router-dom';
import { resolveInitialLocale } from '../i18n';
import { getSavedLocale, saveLocale } from '../services/storage';

/**
 * `/` y `/:locale` redirigen al idioma activo:
 * guardado → idioma del navegador → castellano.
 */
export function RootRedirect() {
  const locale = resolveInitialLocale(getSavedLocale(), navigator.language);
  saveLocale(locale);
  return <Navigate to={`/${locale}/listas`} replace />;
}
