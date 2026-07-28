import { useState } from 'react';
import { cerrarSesion } from '../features/auth/authService';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';
import { type Task } from '../types/task';
import {
  toggleTaskCompletion,
  deleteTask,
  updateTask,
  armarResumenTareas,
  ORDEN_PRIORIDAD
} from '../features/tasks/taskService';

export function TasksPage() {
  const { user } = useAuth();
  const { tasks, loading, error } = useTasks();
  const [enviandoResumen, setEnviandoResumen] = useState(false);
  const [resumenError, setResumenError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<'all' | 'pending' | 'completed'>('all');
  const [ordenarPor, setOrdenarPor] = useState<'none' | 'priority' | 'dueDate'>('none');

  const tasksFiltradas = tasks.filter((task) => {
    if (filtro === 'pending') return !task.completed;
    if (filtro === 'completed') return task.completed;
    return true;
  });

  function compararPorFecha(a: Task, b: Task): number {
  if (a.dueDate === null && b.dueDate === null) return 0;
  if (a.dueDate === null) return 1;
  if (b.dueDate === null) return -1;
  return a.dueDate.getTime() - b.dueDate.getTime();
}

function compararPorPrioridad(a: Task, b: Task): number {
  return ORDEN_PRIORIDAD[a.priority] - ORDEN_PRIORIDAD[b.priority];
}

const tasksOrdenadas = [...tasksFiltradas].sort((a, b) => {
  if (ordenarPor === 'priority') return compararPorPrioridad(a, b);
  if (ordenarPor === 'dueDate') return compararPorFecha(a, b);
  return 0;
});

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
        tasks={tasksOrdenadas}
        onToggleComplete={toggleTaskCompletion}
        onDelete={deleteTask}
        onUpdate={updateTask}
      />

      <select value={ordenarPor} onChange={(e) => setOrdenarPor(e.target.value as 'none' | 'priority' | 'dueDate')}>
      <option value="none">Sin ordenar</option>
      <option value="priority">Por prioridad</option>
      <option value="dueDate">Por fecha de vencimiento</option>
      </select>

      <button onClick={() => setFiltro('all')}>Todas</button>
      <button onClick={() => setFiltro('pending')}>Pendientes</button>
      <button onClick={() => setFiltro('completed')}>Completadas</button>
      <button onClick={handleEnviarResumen} disabled={enviandoResumen}>
        {enviandoResumen ? 'Enviando...' : 'Enviar resumen por email'}
      </button>
      {resumenError && <p>{resumenError}</p>}
    </div>
  );
}