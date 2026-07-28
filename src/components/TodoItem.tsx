import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type Task } from '../types/task';
import './todo.css';

interface TodoItemProps {
  task: Task;
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, fields: Partial<Task>) => void;
  dragHabilitado: boolean;
}

const PRIORITY_COLOR: Record<Task['priority'], string> = {
  high: 'var(--high)',
  medium: 'var(--medium)',
  low: 'var(--low)',
};

const PRIORITY_LABEL: Record<Task['priority'], string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

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
    borderLeftColor: PRIORITY_COLOR[task.priority],
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
      <li ref={setNodeRef} style={style} className="todo-item">
        <div className="todo-item-edit">
          <input
            className="todo-input"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <input
            className="todo-input"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <div className="todo-item-actions">
            <button onClick={handleSave}>Guardar</button>
            <button onClick={handleCancel}>Cancelar</button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`todo-item${task.completed ? ' completed' : ''}`}
    >
      <span {...attributes} {...listeners} className="todo-item-drag-handle">
        ⠿
      </span>

      <div
        role="checkbox"
        aria-checked={task.completed}
        tabIndex={0}
        className={`todo-item-checkbox${task.completed ? ' checked' : ''}`}
        onClick={() => onToggleComplete(task.id, !task.completed)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleComplete(task.id, !task.completed);
          }
        }}
      >
        {task.completed && '✓'}
      </div>

      <div className="todo-item-body">
        <span className="todo-item-title">{task.title}</span>
        {task.description && (
          <span className="todo-item-description">{task.description}</span>
        )}
        <div className="todo-item-meta">
          <span style={{ color: PRIORITY_COLOR[task.priority] }}>
            {PRIORITY_LABEL[task.priority]}
          </span>
          {task.dueDate && (
            <span className="date">{task.dueDate.toLocaleDateString('es-AR')}</span>
          )}
        </div>
      </div>

      <div className="todo-item-actions">
        <button onClick={() => setIsEditing(true)}>Editar</button>
        <button onClick={() => onDelete(task.id)}>Eliminar</button>
      </div>
    </li>
  );
}
