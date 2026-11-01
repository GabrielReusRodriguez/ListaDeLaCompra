import { useId, useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { useLocalePath } from '../hooks/useLocalePath';
import { useTranslation } from '../hooks/useTranslation';
import { validatePassword, validateUsername } from '../services/auth';

export function RegisterPage() {
  const { t } = useTranslation();
  const { username, register } = useAuth();
  const path = useLocalePath();
  const navigate = useNavigate();
  const id = useId();

  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (username) {
    return <Navigate to={path('/listas')} replace />;
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validateUsername(user.trim()) || !validatePassword(password)) {
      setError(t.auth.invalidInput);
      return;
    }
    if (password !== confirmation) {
      setError(t.auth.passwordMismatch);
      return;
    }
    setSubmitting(true);
    setError(null);
    const result = await register(user, password);
    setSubmitting(false);
    if (result.ok) {
      navigate(path('/listas'), { replace: true });
    } else if (result.error === 'user-exists') {
      setError(t.auth.userExists);
    } else if (result.error === 'crypto-unavailable') {
      setError(t.auth.cryptoUnavailable);
    } else {
      setError(t.auth.invalidInput);
    }
  };

  return (
    <div className="layout">
      <Header />
      <main className="main auth" id="main-content">
        <div className="card auth__card">
          <h1>{t.auth.registerTitle}</h1>
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
                aria-describedby={`${id}-user-hint`}
                required
              />
              <p id={`${id}-user-hint`} className="field__hint">
                {t.auth.usernameHint}
              </p>
            </div>
            <div className="field">
              <label htmlFor={`${id}-password`}>{t.auth.password}</label>
              <input
                id={`${id}-password`}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                aria-describedby={`${id}-password-hint`}
                required
              />
              <p id={`${id}-password-hint`} className="field__hint">
                {t.auth.passwordHint}
              </p>
            </div>
            <div className="field">
              <label htmlFor={`${id}-confirm`}>{t.auth.passwordConfirm}</label>
              <input
                id={`${id}-confirm`}
                type="password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
              {t.auth.registerAction}
            </button>
          </form>
          <p className="auth__switch">
            <Link to={path('/login')}>{t.auth.toLogin}</Link>
          </p>
          <p className="auth__note">{t.auth.localOnly}</p>
        </div>
      </main>
    </div>
  );
}
