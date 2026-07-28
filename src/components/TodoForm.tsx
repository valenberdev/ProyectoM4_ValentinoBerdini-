import { useState } from 'react';
import { createTask } from '../features/tasks/taskService';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { type Task } from '../types/task';
import './todo.css';

export function TodoForm() {
  const { user } = useAuth();
  const { tasks } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const currentUser = user;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      setError('El título es obligatorio');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await createTask(
        currentUser.uid,
        {
          title,
          description,
          priority,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
       tasks.length,
      );
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="todo-form-card">
      <form className="todo-form" onSubmit={handleSubmit}>
        <input
          className="todo-input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título"
        />
        <textarea
          className="todo-textarea"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Descripción"
        />
        <select
          className="todo-select"
          value={priority}
          onChange={(e) => setPriority(e.target.value as Task['priority'])}
        >
          <option value="low" style={{ color: 'var(--low)' }}>
            Baja
          </option>
          <option value="medium" style={{ color: 'var(--medium)' }}>
            Media
          </option>
          <option value="high" style={{ color: 'var(--high)' }}>
            Alta
          </option>
        </select>
        <input
          className="todo-input"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        {error && <div className="todo-error">{error}</div>}
        <button className="todo-submit" type="submit" disabled={loading}>
          {loading ? 'Creando...' : 'Crear tarea'}
        </button>
      </form>
    </div>
  );
}
