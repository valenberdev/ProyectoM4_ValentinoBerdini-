import { useState } from 'react';
import { type Task } from '../types/task';

interface TodoItemProps {
  task: Task;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, fields: Partial<Task>) => void;
}

export function TodoItem({ task, onToggleComplete, onDelete, onUpdate }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);

  function handleSave() {
    onUpdate(task.id, { title: editTitle, description: editDescription });
    setIsEditing(false);
  }

  function handleCancel() {
  setEditTitle(task.title);
  setEditDescription(task.description);
  setIsEditing(false);
}

  if (isEditing) {
    return (
      <li>
        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
        <input value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
        <button onClick={handleSave}>Guardar</button>
        <button onClick={handleCancel}>Cancelar</button>
      </li>
    );
  }

  return (
    <li>
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