import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../hooks/useTranslation';

/** Guard: sin sesión activa no se muestra ningún dato. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { username, ready } = useAuth();
  const { locale, t } = useTranslation();
  const location = useLocation();

  if (!ready) {
    return (
      <p className="empty-state" role="status">
        {t.common.loading}
      </p>
    );
  }

  if (!username) {
    return <Navigate to={`/${locale}/login`} replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
