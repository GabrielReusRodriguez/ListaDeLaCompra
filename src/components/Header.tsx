import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocalePath } from '../hooks/useLocalePath';
import { interpolate, useTranslation } from '../hooks/useTranslation';
import { LanguageSwitcher } from './LanguageSwitcher';
import { ThemeSwitcher } from './ThemeSwitcher';

export function Header() {
  const { t } = useTranslation();
  const { username, logout } = useAuth();
  const path = useLocalePath();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(path('/login'), { replace: true });
  };

  const links = [
    { to: path('/listas'), label: t.nav.lists },
    { to: path('/por-prioridad'), label: t.nav.byPriority },
    { to: path('/por-lugar'), label: t.nav.byStore },
  ];

  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <span className="app-header__logo" aria-hidden="true">
            🛒
          </span>
          <div>
            <p className="app-header__title">{t.appName}</p>
            {username && (
              <p className="app-header__user">{interpolate(t.auth.loggedInAs, { username })}</p>
            )}
          </div>
        </div>

        <div className="app-header__actions">
          <ThemeSwitcher />
          <LanguageSwitcher />
          {username && (
            <button type="button" className="btn btn--ghost" onClick={handleLogout}>
              {t.nav.logout}
            </button>
          )}
        </div>
      </div>

      {username && (
        <nav className="app-nav" aria-label={t.a11y.mainNavigation}>
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
