import { useTheme } from '../context/ThemeContext';
import { useTranslation } from '../hooks/useTranslation';

/** Botón que alterna entre la interfaz clara y la oscura. */
export function ThemeSwitcher() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const isDark = theme === 'dark';
  const label = isDark ? t.theme.switchToLight : t.theme.switchToDark;

  return (
    <button
      type="button"
      className="btn btn--ghost btn--small theme-switcher"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
    >
      <span aria-hidden="true">{isDark ? '☀️' : '🌙'}</span>
      <span className="theme-switcher__label" aria-hidden="true">
        {isDark ? t.theme.light : t.theme.dark}
      </span>
    </button>
  );
}
