import { useState } from 'react';
import { type User } from 'firebase/auth';
import { createTask } from '../features/tasks/taskService';
import { type Task } from '../types/task';

export function useCreateTask(user: User | null, tasksCount: number) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Task['priority']>('medium');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!user) return;
    const currentUser = user;

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
        tasksCount,
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

  return {
    title, setTitle,
    description, setDescription,
    priority, setPriority,
    dueDate, setDueDate,
    loading, error,
    handleSubmit,
  };
}