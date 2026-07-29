import { useState } from 'react';
import { arrayMove } from '@dnd-kit/sortable';
import { type DragEndEvent } from '@dnd-kit/core';
import { useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { type Task } from '../types/task';
import { updateTask } from '../features/tasks/taskService';

export function useDragAndDrop(tasksOrdenadas: Task[]) {
  const [dragError, setDragError] = useState<string | null>(null);
  const sensors = useSensors(useSensor(PointerSensor));

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasksOrdenadas.findIndex((task) => task.id === active.id);
    const newIndex = tasksOrdenadas.findIndex((task) => task.id === over.id);

    const nuevoOrden = arrayMove(tasksOrdenadas, oldIndex, newIndex);

    try {
      await Promise.all(
        nuevoOrden.map((task, index) => updateTask(task.id, { order: index }))
      );
      setDragError(null);
    } catch (err) {
      setDragError('No se pudo guardar el nuevo orden. Intentá de nuevo.');
      console.error('Error al reordenar tareas:', err);
    }
  }

  return { sensors, dragError, handleDragEnd };
}