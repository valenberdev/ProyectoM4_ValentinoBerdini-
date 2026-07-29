import { iniciarSesion } from '../features/auth/authService';
import { AuthForm } from '../components/AuthForm';

export function LoginPage() {
  return (
    <AuthForm
      subtitle="Iniciá sesión para ver tus tareas"
      onAuthSubmit={iniciarSesion}
      submitLabel="Iniciar sesión"
      submitLoadingLabel="Iniciando sesión..."
      footerText="¿No tenés cuenta?"
      footerLinkTo="/register"
      footerLinkLabel="Registrate"
    />
  );
}