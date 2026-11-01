import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks';

export function Header() {
  const { t, locale, setLocale } = useTranslation();
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(`/${locale}/login`);
  };

  const handleLanguageChange = (lang: string) => {
    setLocale(lang);
  };

  if (!isAuthenticated) return null;

  return (
    <header className="header">
      <div className="header-content">
        <Link to={`/${locale}/listas`} className="app-title">
          {t('appName')}
        </Link>
        
        <nav className="nav">
          <Link to={`/${locale}/listas`}>{t('lists')}</Link>
          <Link to={`/${locale}/por-prioridad`}>{t('byPriority')}</Link>
          <Link to={`/${locale}/por-lugar`}>{t('byStore')}</Link>
        </nav>

        <div className="header-actions">
          <div className="language-selector">
            <button
              onClick={() => handleLanguageChange('es')}
              className={locale === 'es' ? 'active' : ''}
            >
              ES
            </button>
            <button
              onClick={() => handleLanguageChange('ca')}
              className={locale === 'ca' ? 'active' : ''}
            >
              CA
            </button>
          </div>
          <button onClick={handleLogout} className="btn btn-logout">
            {t('logout')}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
