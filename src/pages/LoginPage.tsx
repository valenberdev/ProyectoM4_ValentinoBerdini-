import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { validarEmail, validarPassword } from '../utils/validators';
import { iniciarSesion } from '../features/auth/authService';

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

  return (
    <form onSubmit={handleSubmit}>
      <h1>Iniciar sesión</h1>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
      />

      {error && <p>{error}</p>}

      <button type="submit" disabled={loading}>
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}