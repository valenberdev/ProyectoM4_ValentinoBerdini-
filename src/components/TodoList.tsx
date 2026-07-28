import { type Task } from "../types/task";
import { TodoItem } from "./TodoItem";

interface TodoListProps {
  tasks: Task[];
  onToggleComplete: (taskId: string, completed: boolean) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (taskId: string, fields: Partial<Task>) => void;
  dragHabilitado: boolean;
}

export function TodoList({
  tasks,
  onToggleComplete,
  onDelete,
  onUpdate,
  dragHabilitado,
}: TodoListProps) {
  return (
    <ul
      style={{
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        margin: 0,
        padding: 0,
      }}
    >
      {tasks.map((task) => (
        <TodoItem
          key={task.id}
          task={task}
          onToggleComplete={onToggleComplete}
          onDelete={onDelete}
          onUpdate={onUpdate}
          dragHabilitado={dragHabilitado}
        />
      ))}
    </ul>
  );
}
