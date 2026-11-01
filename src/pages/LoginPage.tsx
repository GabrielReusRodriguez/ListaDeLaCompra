import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

interface LoginPageProps {
  onLogin?: () => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const { login } = useAuth();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || locale;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Username and password are required');
      return;
    }

    const success = await login(username, password);
    if (success) {
      navigate(`/${currentLang}/listas`);
      if (onLogin) onLogin();
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Lista de la Compra</h1>
        <h2>Iniciar sesión</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="username">Nombre de usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full">
            Iniciar sesión
          </button>
        </form>
        
        <div className="auth-footer">
          <p>¿No tienes cuenta? <Link to={`/${currentLang}/registro`}>Regístrate</Link></p>
        </div>
        
        <div className="language-selector">
          <Link to="/es/login" className={currentLang === 'es' ? 'active' : ''}>Español</Link>
          <Link to="/ca/login" className={currentLang === 'ca' ? 'active' : ''}>Català</Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
