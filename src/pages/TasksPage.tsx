import { useState } from 'react';
import { cerrarSesion } from '../features/auth/authService';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';
import {
  toggleTaskCompletion,
  deleteTask,
  updateTask,
  armarResumenTareas,
} from '../features/tasks/taskService';

export function TasksPage() {
  const { user } = useAuth();
  const { tasks, loading, error } = useTasks();

  const [enviandoResumen, setEnviandoResumen] = useState(false);
  const [resumenError, setResumenError] = useState<string | null>(null);

  async function handleEnviarResumen() {
    if (!user) return;
    const currentUser = user;

    setEnviandoResumen(true);
    setResumenError(null);

    const { pendingTasks, completedTasks } = armarResumenTareas(tasks);

    try {
      const response = await fetch('/api/send-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: currentUser.email,
          pendingTasks,
          completedTasks,
        }),
      });

      if (!response.ok) {
        throw new Error('No se pudo enviar el resumen');
      }
    } catch (err) {
      setResumenError((err as Error).message);
    } finally {
      setEnviandoResumen(false);
    }
  }

  return (
    <div>
      <h1>Mis tareas</h1>
      <button onClick={() => cerrarSesion()}>Cerrar sesión</button>

      <TodoForm />

      {loading && <p>Cargando tareas...</p>}
      {error && <p>{error}</p>}

      <TodoList
        tasks={tasks}
        onToggleComplete={toggleTaskCompletion}
        onDelete={deleteTask}
        onUpdate={updateTask}
      />

      <button onClick={handleEnviarResumen} disabled={enviandoResumen}>
        {enviandoResumen ? 'Enviando...' : 'Enviar resumen por email'}
      </button>
      {resumenError && <p>{resumenError}</p>}
    </div>
  );
}