import { describe, it, expect, vi, beforeEach } from 'vitest';
import { armarResumenTareas } from '../src/features/tasks/taskService';
import { type Task } from '../src/types/task';
import { addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { createTask, updateTask, deleteTask, toggleTaskCompletion } from '../src/features/tasks/taskService';

const tasksDePrueba: Task[] = [
  {
    id: '1', userId: 'u1', title: 'Tarea baja pendiente', description: '',
    completed: false, priority: 'low', dueDate: null, order: 0,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '2', userId: 'u1', title: 'Tarea alta pendiente', description: '',
    completed: false, priority: 'high', dueDate: null, order: 1,
    createdAt: new Date(), updatedAt: new Date(),
  },
  {
    id: '3', userId: 'u1', title: 'Tarea completada', description: '',
    completed: true, priority: 'medium', dueDate: null, order: 2,
    createdAt: new Date(), updatedAt: new Date(),
  },
];

describe('armarResumenTareas', () => {
  it('separa tareas pendientes y completadas, ordenando pendientes por prioridad', () => {
    const resultado = armarResumenTareas(tasksDePrueba);

    expect(resultado.pendingTasks).toEqual([
      { title: 'Tarea alta pendiente', priority: 'high' },
      { title: 'Tarea baja pendiente', priority: 'low' },
    ]);

    expect(resultado.completedTasks).toEqual([
      { title: 'Tarea completada' },
    ]);
  });

  it('devuelve arrays vacíos si no hay tareas', () => {
    const resultado = armarResumenTareas([]);

    expect(resultado.pendingTasks).toEqual([]);
    expect(resultado.completedTasks).toEqual([]);
  });
});

vi.mock('../src/services/firebase/firebaseConfig', () => ({
  db: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mocked-collection-ref'),
  addDoc: vi.fn(),
  doc: vi.fn(() => 'mocked-doc-ref'),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mocked-server-timestamp'),
}));

describe('createTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a addDoc con los datos correctos', async () => {
    await createTask('user123', {
      title: 'Nueva tarea',
      description: 'Descripción',
      priority: 'high',
      dueDate: null,
    }, 3);

    expect(addDoc).toHaveBeenCalledWith('mocked-collection-ref', {
      userId: 'user123',
      title: 'Nueva tarea',
      description: 'Descripción',
      priority: 'high',
      dueDate: null,
      completed: false,
      order: 3,
      createdAt: 'mocked-server-timestamp',
      updatedAt: 'mocked-server-timestamp',
    });
  });
});

describe('deleteTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a deleteDoc con la referencia correcta', async () => {
    await deleteTask('task123');

    expect(deleteDoc).toHaveBeenCalledWith('mocked-doc-ref');
  });
});

describe('updateTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a updateDoc con los campos actualizados más el timestamp', async () => {
    await updateTask('task123', { title: 'Título actualizado' });

    expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', {
      title: 'Título actualizado',
      updatedAt: 'mocked-server-timestamp',
    });
  });
});

describe('toggleTaskCompletion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a updateDoc con el campo completed actualizado', async () => {
    await toggleTaskCompletion('task123', true);

    expect(updateDoc).toHaveBeenCalledWith('mocked-doc-ref', {
      completed: true,
      updatedAt: 'mocked-server-timestamp',
    });
  });
});