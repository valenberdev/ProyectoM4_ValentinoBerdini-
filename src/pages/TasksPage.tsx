import { useState } from "react";
import { cerrarSesion } from "../features/auth/authService";
import { useAuth } from "../hooks/useAuth";
import { useTasks } from "../hooks/useTasks";
import { TodoForm } from "../components/TodoForm";
import { TodoList } from "../components/TodoList";
import { ThemeToggle } from "../components/ThemeToggle";
import { type Task } from "../types/task";
import {
  toggleTaskCompletion,
  deleteTask,
  updateTask,
  armarResumenTareas,
  ORDEN_PRIORIDAD,
} from "../features/tasks/taskService";
import { arrayMove } from "@dnd-kit/sortable";
import { type DragEndEvent } from "@dnd-kit/core";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import "./tasks.css";

const RADIO_ANILLO = 32;
const CIRCUNFERENCIA = 2 * Math.PI * RADIO_ANILLO;

export function TasksPage() {
  const { user } = useAuth();
  const { tasks, loading, error } = useTasks();
  const [enviandoResumen, setEnviandoResumen] = useState(false);
  const [resumenError, setResumenError] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<"all" | "pending" | "completed">("all");
  const [ordenarPor, setOrdenarPor] = useState<"none" | "priority" | "dueDate">(
    "none",
  );
  const sensors = useSensors(useSensor(PointerSensor));

  const tasksFiltradas = tasks.filter((task) => {
    if (filtro === "pending") return !task.completed;
    if (filtro === "completed") return task.completed;
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
    if (ordenarPor === "priority") return compararPorPrioridad(a, b);
    if (ordenarPor === "dueDate") return compararPorFecha(a, b);
    return a.order - b.order;
  });

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = tasksOrdenadas.findIndex((task) => task.id === active.id);
    const newIndex = tasksOrdenadas.findIndex((task) => task.id === over.id);

    const nuevoOrden = arrayMove(tasksOrdenadas, oldIndex, newIndex);

    await Promise.all(
      nuevoOrden.map((task, index) => updateTask(task.id, { order: index })),
    );
  }

  async function handleEnviarResumen() {
    if (!user) return;
    const currentUser = user;

    setEnviandoResumen(true);
    setResumenError(null);

    const { pendingTasks, completedTasks } = armarResumenTareas(tasks);

    try {
      const response = await fetch("/api/send-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: currentUser.email,
          pendingTasks,
          completedTasks,
        }),
      });

      if (!response.ok) {
        throw new Error("No se pudo enviar el resumen");
      }
    } catch (err) {
      setResumenError((err as Error).message);
    } finally {
      setEnviandoResumen(false);
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
              onClick={() => cerrarSesion()}
            >
              Cerrar sesión
            </button>
            <ThemeToggle />
          </div>
        </div>

        <div className="tasks-hero">
          <svg
            className="tasks-ring"
            width="76"
            height="76"
            viewBox="0 0 76 76"
          >
            <circle
              cx="38"
              cy="38"
              r={RADIO_ANILLO}
              fill="none"
              stroke="var(--hairline)"
              strokeWidth="6"
            />
            <circle
              cx="38"
              cy="38"
              r={RADIO_ANILLO}
              fill="none"
              stroke="var(--signal)"
              strokeWidth="6"
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
              onToggleComplete={toggleTaskCompletion}
              onDelete={deleteTask}
              onUpdate={updateTask}
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
        {resumenError && <div className="tasks-error">{resumenError}</div>}
      </main>
    </div>
  );
}
