import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { ProtectedRoute } from "../src/routes/ProtectedRoute";

vi.mock("../src/hooks/useAuth");
import { useAuth } from "../src/hooks/useAuth";

describe("ProtectedRoute", () => {
  it("muestra el mensaje de carga mientras loading es true", () => {
    (useAuth as any).mockReturnValue({ user: null, loading: true });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>Contenido protegido</p>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("redirige a /login si no hay usuario", () => {
    (useAuth as any).mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>Contenido protegido</p>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.queryByText("Contenido protegido")).not.toBeInTheDocument();
  });

  it("muestra el contenido si hay usuario", () => {
    (useAuth as any).mockReturnValue({ user: { uid: "123" }, loading: false });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <p>Contenido protegido</p>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText("Contenido protegido")).toBeInTheDocument();
  });
});
