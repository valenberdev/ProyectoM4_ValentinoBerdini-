import { useState, useEffect } from 'react';
import { type User } from 'firebase/auth';
import { type Task } from '../types/task';
import { armarResumenTareas } from '../features/tasks/taskService';

export function useSendSummary(user: User | null, tasks: Task[]) {
  const [enviandoResumen, setEnviandoResumen] = useState(false);
  const [resumenError, setResumenError] = useState<string | null>(null);
  const [resumenExitoso, setResumenExitoso] = useState(false);

  useEffect(() => {
    if (resumenExitoso) {
      const timer = setTimeout(() => setResumenExitoso(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [resumenExitoso]);

  async function handleEnviarResumen() {
    if (!user) return;
    const currentUser = user;

    setEnviandoResumen(true);
    setResumenError(null);
    setResumenExitoso(false);

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

      setResumenExitoso(true);
    } catch (err) {
      setResumenError((err as Error).message);
    } finally {
      setEnviandoResumen(false);
    }
  }

  return { enviandoResumen, resumenError, resumenExitoso, handleEnviarResumen };
}