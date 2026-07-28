import { cerrarSesion } from '../features/auth/authService';
import { useTasks } from '../hooks/useTasks';
import { TodoForm } from '../components/TodoForm';

export function TasksPage() {
  const { tasks, loading, error } = useTasks();

  return (
    <div>
      <h1>Mis tareas</h1>
      <button onClick={() => cerrarSesion()}>Cerrar sesión</button>

      <TodoForm />

      {loading && <p>Cargando tareas...</p>}
      {error && <p>{error}</p>}
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title} — {task.priority}</li>
        ))}
      </ul>
    </div>
  );
}