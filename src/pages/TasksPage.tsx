import { cerrarSesion } from "../features/auth/authService";
import { useAuth } from "../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";
import { useSortedFilteredTasks } from "../hooks/useSortedFilteredTasks";
import { useSendSummary } from "../hooks/useSendSummary";
import { useDragAndDrop } from "../hooks/useDragAndDrop";
import { TodoForm } from "../components/TodoForm";
import { TodoList } from "../components/TodoList";
import { ThemeToggle } from "../components/ThemeToggle";
import { type Task } from "../types/task";
import {
  toggleTaskCompletion,
  deleteTask,
  updateTask,
} from "../features/tasks/taskService";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import "./tasks.css";

const RADIO_ANILLO = 32;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO_ANILLO;

export function TasksPage() {
  const { user } = useAuth();
  const { tasks, loading, error } = useTasks();
  const [taskActionError, setTaskActionError] = useState<string | null>(null);

  const { tasksOrdenadas, filtro, setFiltro, ordenarPor, setOrdenarPor } =
    useSortedFilteredTasks(tasks);

  const { enviandoResumen, resumenError, resumenExitoso, handleEnviarResumen } =
    useSendSummary(user, tasks);

  const { sensors, dragError, handleDragEnd } = useDragAndDrop(tasksOrdenadas);

  async function handleToggleComplete(taskId: string, completed: boolean) {
    try {
      await toggleTaskCompletion(taskId, completed);
      setTaskActionError(null);
    } catch (err) {
      setTaskActionError("No se pudo actualizar la tarea. Intentá de nuevo.");
      console.error("Error al togglear tarea:", err);
    }
  }

  async function handleDeleteTask(taskId: string) {
    try {
      await deleteTask(taskId);
      setTaskActionError(null);
    } catch (err) {
      setTaskActionError("No se pudo eliminar la tarea. Intentá de nuevo.");
      console.error("Error al eliminar tarea:", err);
    }
  }

  async function handleUpdateTask(taskId: string, fields: Partial<Task>) {
    try {
      await updateTask(taskId, fields);
      setTaskActionError(null);
    } catch (err) {
      setTaskActionError("No se pudo editar la tarea. Intentá de nuevo.");
      console.error("Error al editar tarea:", err);
    }
  }

  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const porcentajeCompletado =
    totalTasks === 0 ? 0 : (completedCount / totalTasks) * 100;
  const dashOffset =
    CIRCUNFERENCIA - (porcentajeCompletado / 100) * CIRCUNFERENCIA;

  const fechaHoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div>
      <header className="tasks-header">
        <div className="tasks-header-top">
          <p className="tasks-brand">◆ tareas</p>
          <div className="tasks-header-actions">
            <button
              className="tasks-logout-btn"
              onClick={() =>
                cerrarSesion().catch((err) =>
                  console.error("Error al cerrar sesión:", err),
                )
              }
            >
              Cerrar sesión
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="tasks-hero">
          <svg className="tasks-ring" width="76" height="76" viewBox="0 0 76 76">
            <circle
              cx="38" cy="38" r={RADIO_ANILLO}
              fill="none" stroke="var(--hairline)" strokeWidth="6"
            />
            <circle
              cx="38" cy="38" r={RADIO_ANILLO}
              fill="none" stroke="var(--signal)" strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={CIRCUNFERENCIA}
              strokeDashoffset={dashOffset}
            />
          </svg>
          <div>
            <p className="tasks-eyebrow">{fechaHoy}</p>
            <p className="tasks-headline">
              {completedCount} de {totalTasks} tareas completadas
            </p>
          </div>
        </div>
      </header>

      <main className="tasks-main">
        <TodoForm />

        {loading && <p className="tasks-loading">Cargando tareas...</p>}
        {error && <div className="tasks-error">{error}</div>}
        {taskActionError && <p className="tasks-error">{taskActionError}</p>}

        <div className="chip-bar">
          <button
            className={`chip ${filtro === "all" ? "active" : ""}`}
            onClick={() => setFiltro("all")}
          >
            Todas
          </button>
          <button
            className={`chip ${filtro === "pending" ? "active" : ""}`}
            onClick={() => setFiltro("pending")}
          >
            Pendientes
          </button>
          <button
            className={`chip ${filtro === "completed" ? "active" : ""}`}
            onClick={() => setFiltro("completed")}
          >
            Completadas
          </button>
          <select
            className="chip chip-select"
            value={ordenarPor}
            onChange={(e) =>
              setOrdenarPor(e.target.value as "none" | "priority" | "dueDate")
            }
          >
            <option value="none">Sin ordenar</option>
            <option value="priority">Por prioridad</option>
            <option value="dueDate">Por fecha de vencimiento</option>
          </select>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={tasksOrdenadas.map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <TodoList
              tasks={tasksOrdenadas}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              onUpdate={handleUpdateTask}
              dragHabilitado={ordenarPor === "none"}
            />
          </SortableContext>
        </DndContext>

        <button
          className="tasks-secondary-btn"
          onClick={handleEnviarResumen}
          disabled={enviandoResumen}
        >
          {enviandoResumen ? "Enviando..." : "Enviar resumen por email"}
        </button>
        {dragError && <p className="tasks-error">{dragError}</p>}
        {resumenExitoso && (
          <p className="tasks-success">Resumen enviado correctamente ✓</p>
        )}
        {resumenError && <div className="tasks-error">{resumenError}</div>}
      </main>
    </div>
  );
}