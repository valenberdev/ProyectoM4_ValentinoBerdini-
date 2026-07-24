import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../features/auth/authService';
import { validarEmail, validarPassword } from '../utils/validators';

export function RegisterPage() {
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
      await registrarUsuario(email, password);
      navigate('/tasks');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Registrarse</h1>

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
        {loading ? 'Registrando...' : 'Registrarse'}
      </button>
    </form>
  );
}