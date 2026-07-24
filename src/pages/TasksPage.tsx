import { cerrarSesion } from '../features/auth/authService';

export function TasksPage() {
  return (
    <div>
      <h1>Mis tareas</h1>
      <button onClick={() => cerrarSesion()}>Cerrar sesión</button>
    </div>
  );
}