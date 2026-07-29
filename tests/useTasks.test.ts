import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';

vi.mock('../src/hooks/useAuth');
vi.mock('../src/services/firebase/firebaseConfig', () => ({ db: {} }));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => 'mocked-collection'),
  query: vi.fn(() => 'mocked-query'),
  where: vi.fn(),
  onSnapshot: vi.fn(),
}));

import { useAuth } from '../src/hooks/useAuth';
import { onSnapshot } from 'firebase/firestore';
import { useTasks } from '../src/hooks/useTasks';

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve tasks vacío y loading false si no hay usuario', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: false });

    const { result } = renderHook(() => useTasks());

    expect(result.current.tasks).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('actualiza tasks cuando onSnapshot emite datos', async () => {
    (useAuth as any).mockReturnValue({ user: { uid: 'user123' }, loading: false });

    (onSnapshot as any).mockImplementation((_query: any, onNext: any) => {
      onNext({
        docs: [
          {
            id: 'task1',
            data: () => ({
              userId: 'user123', title: 'Tarea de prueba', description: '',
              completed: false, priority: 'medium', order: 0,
              dueDate: null, createdAt: { toDate: () => new Date() },
              updatedAt: { toDate: () => new Date() },
            }),
          },
        ],
      });
      return vi.fn();
    });

    const { result } = renderHook(() => useTasks());

    await waitFor(() => {
      expect(result.current.tasks).toHaveLength(1);
    });

    expect(result.current.tasks[0].title).toBe('Tarea de prueba');
    expect(result.current.loading).toBe(false);
  });
});