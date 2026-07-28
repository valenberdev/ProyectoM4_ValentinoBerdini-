import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { validarEmail, validarPassword } from '../utils/validators';
import { iniciarSesion, iniciarSesionConGoogle } from '../features/auth/authService';
import { ThemeToggle } from '../components/ThemeToggle';
import { GoogleIcon } from '../components/GoogleIcon';
import './auth.css';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errorEmail = validarEmail(email);
    const errorPassword = validarPassword(password);

    if (errorEmail || errorPassword) {
      setError(errorEmail || errorPassword);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await iniciarSesion(email, password);
      navigate('/tasks');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);

    try {
      await iniciarSesionConGoogle();
      navigate('/tasks');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div style={{ position: 'fixed', top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div className="auth-card">
        <p className="auth-brand">◆ tareas</p>
        <p className="auth-subtitle">Iniciá sesión para ver tus tareas</p>

        {error && <div className="auth-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <div className="auth-divider">o continuá con</div>

        <button
          type="button"
          className="auth-google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <GoogleIcon />
          Continuar con Google
        </button>

        <p className="auth-footer">
          ¿No tenés cuenta? <Link to="/register">Registrate</Link>
        </p>
      </div>
    </div>
  );
}
