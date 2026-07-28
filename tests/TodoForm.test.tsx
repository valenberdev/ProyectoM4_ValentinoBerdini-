import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TodoForm } from '../src/components/TodoForm';

vi.mock('../src/features/tasks/taskService', () => ({
  createTask: vi.fn(),
}));

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'user123', email: 'test@test.com' }, loading: false }),
}));

vi.mock('../src/hooks/useTasks', () => ({
  useTasks: () => ({ tasks: [{}, {}], loading: false, error: null }),
}));

import { createTask } from '../src/features/tasks/taskService';

describe('TodoForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a createTask con los datos correctos al enviar el formulario', async () => {
    render(<TodoForm />);

    fireEvent.change(screen.getByPlaceholderText('Título'), { target: { value: 'Mi tarea' } });
    fireEvent.click(screen.getByText('Crear tarea'));

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith(
        'user123',
        {
          title: 'Mi tarea',
          description: '',
          priority: 'medium',
          dueDate: null,
        },
        2
      );
    });
  });

  it('muestra un error y no llama a createTask si el título está vacío', async () => {
    render(<TodoForm />);

    fireEvent.click(screen.getByText('Crear tarea'));

    await waitFor(() => {
      expect(screen.getByText('El título es obligatorio')).toBeInTheDocument();
    });

    expect(createTask).not.toHaveBeenCalled();
  });
});