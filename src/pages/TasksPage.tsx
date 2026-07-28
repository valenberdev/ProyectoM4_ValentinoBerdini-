import { cerrarSesion } from '../features/auth/authService';
import { useTasks } from '../hooks/useTasks';
import { TodoForm } from '../components/TodoForm';
import { TodoList } from '../components/TodoList';
import { toggleTaskCompletion, deleteTask, updateTask } from '../features/tasks/taskService';

export function TasksPage() {
  const { tasks, loading, error } = useTasks();

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
    </div>
  );
}