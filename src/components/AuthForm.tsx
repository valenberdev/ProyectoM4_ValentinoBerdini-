import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { validarEmail, validarPassword } from "../utils/validators";
import { iniciarSesionConGoogle } from "../features/auth/authService";
import { ThemeToggle } from "./ThemeToggle";
import { GoogleIcon } from "./GoogleIcon";
import '../pages/auth.css';

interface AuthFormProps {
  subtitle: string;
  onAuthSubmit: (email: string, password: string) => Promise<unknown>;
  submitLabel: string;
  submitLoadingLabel: string;
  footerText: string;
  footerLinkTo: string;
  footerLinkLabel: string;
}

export function AuthForm({
  subtitle,
  onAuthSubmit,
  submitLabel,
  submitLoadingLabel,
  footerText,
  footerLinkTo,
  footerLinkLabel,
}: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await onAuthSubmit(email, password);
      navigate("/tasks");
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
      navigate("/tasks");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div style={{ position: "fixed", top: 20, right: 20 }}>
        <ThemeToggle />
      </div>

      <div className="auth-card">
        <p className="auth-brand">◆ tareas</p>
        <p className="auth-subtitle">{subtitle}</p>

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
            {loading ? submitLoadingLabel : submitLabel}
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
          {footerText} <Link to={footerLinkTo}>{footerLinkLabel}</Link>
        </p>
      </div>
    </div>
  );
}
