import { registrarUsuario } from '../features/auth/authService';
import { AuthForm } from '../components/AuthForm';

export function RegisterPage() {
  return (
    <AuthForm
      subtitle="Creá tu cuenta para empezar"
      onAuthSubmit={registrarUsuario}
      submitLabel="Registrarse"
      submitLoadingLabel="Registrando..."
      footerText="¿Ya tenés cuenta?"
      footerLinkTo="/login"
      footerLinkLabel="Iniciá sesión"
    />
  );
}