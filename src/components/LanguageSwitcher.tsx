import { useTranslation } from '../hooks/useTranslation';
import { LOCALES, type Locale } from '../types';

const LABELS: Record<Locale, 'languageEs' | 'languageCa'> = {
  es: 'languageEs',
  ca: 'languageCa',
};

/** Selector de idioma: cambia el prefijo de la URL conservando la ruta actual. */
export function LanguageSwitcher() {
  const { locale, t, setLocale } = useTranslation();
  return (
    <label className="language-switcher">
      <span className="visually-hidden">{t.language}</span>
      <select
        className="select select--compact"
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        aria-label={t.language}
      >
        {LOCALES.map((option) => (
          <option key={option} value={option}>
            {t[LABELS[option]]}
          </option>
        ))}
      </select>
    </label>
  );
}
