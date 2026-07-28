import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Task } from '../types/task';

interface TodoItemProps {
  task: Task;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, fields: Partial<Task>) => void;
  dragHabilitado: boolean;
}

export function TodoItem({ task, onToggleComplete, onDelete, onUpdate, dragHabilitado }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: task.id,
    disabled: !dragHabilitado,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleCancel() {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setIsEditing(false);
  }

  function handleSave() {
    onUpdate(task.id, { title: editTitle, description: editDescription });
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <li ref={setNodeRef} style={style}>
        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
        <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
        <button onClick={handleSave}>Guardar</button>
        <button onClick={handleCancel}>Cancelar</button>
      </li>
    );
  }

  return (
  <li ref={setNodeRef} style={style}>
    <span {...attributes} {...listeners} style={{ cursor: 'grab', marginRight: '8px' }}>
      ⠿
    </span>
    <input
      type="checkbox"
      checked={task.completed}
      onChange={(e) => onToggleComplete(task.id, e.target.checked)}
    />
    <span>{task.title}</span> — <span>{task.priority}</span>
    <button onClick={() => setIsEditing(true)}>Editar</button>
    <button onClick={() => onDelete(task.id)}>Eliminar</button>
  </li>
);
}