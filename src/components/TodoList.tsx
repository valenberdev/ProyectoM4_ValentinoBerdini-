import { type Task } from '../types/task';
import { TodoItem } from './TodoItem';

interface TodoListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, fields: Partial<Task>) => void;
}

export function TodoList({ tasks, onToggleComplete, onDelete, onUpdate }: TodoListProps) {
  return (
    <ul>
      {tasks.map((task) => (
        <TodoItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onUpdate={onUpdate}
        />
      ))}
    </ul>
  );
}