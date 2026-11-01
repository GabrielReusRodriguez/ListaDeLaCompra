import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';

export function RegisterPage() {
  const { register } = useAuth();
  const { locale } = useLocale();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = lang || locale;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const success = await register(username, password);
    if (success) {
      navigate(`/${currentLang}/listas`);
    } else {
      setError('Username already exists');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Lista de la Compra</h1>
        <h2>Registrarse</h2>
        
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmar contraseña</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary btn-full">
            Registrarse
          </button>
        </form>
        
        <div className="auth-footer">
          <p>¿Ya tienes cuenta? <Link to={`/${currentLang}/login`}>Inicia sesión</Link></p>
        </div>
        
        <div className="language-selector">
          <Link to="/es/registro" className={currentLang === 'es' ? 'active' : ''}>Español</Link>
          <Link to="/ca/registro" className={currentLang === 'ca' ? 'active' : ''}>Català</Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
