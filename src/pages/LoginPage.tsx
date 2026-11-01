import { useId, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useLocalePath } from '../hooks/useLocalePath';
import { useTranslation } from '../hooks/useTranslation';

export function LoginPage() {
  const { t } = useTranslation();
  const { username, login } = useAuth();
  const path = useLocalePath();
  const navigate = useNavigate();
  const id = useId();

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (username) {
    return <Navigate to={path('/listas')} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await login(user, password);
    setSubmitting(false);
    if (result.ok) {
      navigate(path('/listas'), { replace: true });
    } else {
      setError(
        result.error === 'crypto-unavailable'
          ? t.auth.cryptoUnavailable
          : t.auth.invalidCredentials,
      );
    }
  };

  return (
    <div className="layout">
      <Header />
      <main className="main auth" id="main-content">
        <div className="card auth__card">
          <h1>{t.auth.loginTitle}</h1>
          <form className="form" onSubmit={handleSubmit} noValidate>
            {error && (
              <p className="form__error" role="alert">
                {error}
              </p>
            )}
            <div className="field">
              <label htmlFor={`${id}-user`}>{t.auth.username}</label>
              <input
                id={`${id}-user`}
                type="text"
                value={user}
                onChange={(event) => setUser(event.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                required
              />
            </div>
            <div className="field">
              <label htmlFor={`${id}-password`}>{t.auth.password}</label>
              <input
                id={`${id}-password`}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>
            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              {t.auth.loginAction}
            </button>
          </form>
          <p className="auth__switch">
            <Link to={path('/registro')}>{t.auth.toRegister}</Link>
          </p>
          <p className="auth__note">{t.auth.localOnly}</p>
        </div>
      </main>
    </div>
  );
}
