import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (user) {
    return <Navigate to="/tasks" />;
  }

  return <Navigate to="/login" />;
}