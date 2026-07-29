import { useState } from 'react';
import { type Task } from '../types/task';
import { ORDEN_PRIORIDAD } from '../features/tasks/taskService';

export function useSortedFilteredTasks(tasks: Task[]) {
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
    return a.order - b.order;
  });

  return { tasksOrdenadas, filtro, setFiltro, ordenarPor, setOrdenarPor };
}