import { useState } from 'react';
import { createTask } from '../features/tasks/taskService';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { type Task } from '../types/task';

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
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripción"
      />
      <select value={priority} onChange={(e) => setPriority(e.target.value as Task['priority'])}>
        <option value="low">Baja</option>
        <option value="medium">Media</option>
        <option value="high">Alta</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />
      {error && <p>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creando...' : 'Crear tarea'}
      </button>
    </form>
  );
}