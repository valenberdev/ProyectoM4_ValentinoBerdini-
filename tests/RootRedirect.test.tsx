import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RootRedirect } from '../src/routes/RootRedirect';

vi.mock('../src/hooks/useAuth');
import { useAuth } from '../src/hooks/useAuth';

function renderConRutas() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<p>Página de Login</p>} />
        <Route path="/tasks" element={<p>Página de Tasks</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RootRedirect', () => {
  it('muestra el mensaje de carga mientras loading es true', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: true });

    renderConRutas();

    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('redirige a /login si no hay usuario', () => {
    (useAuth as any).mockReturnValue({ user: null, loading: false });

    renderConRutas();

    expect(screen.getByText('Página de Login')).toBeInTheDocument();
  });

  it('redirige a /tasks si hay usuario', () => {
    (useAuth as any).mockReturnValue({ user: { uid: '123' }, loading: false });

    renderConRutas();

    expect(screen.getByText('Página de Tasks')).toBeInTheDocument();
  });
});