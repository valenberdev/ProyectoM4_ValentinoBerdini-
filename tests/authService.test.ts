import { describe, it, expect, vi, beforeEach } from 'vitest';
import { registrarUsuario, iniciarSesion, iniciarSesionConGoogle, cerrarSesion } from '../src/features/auth/authService';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, signOut } from 'firebase/auth';


vi.mock('../src/services/firebase/firebaseConfig', () => ({
  auth: {},
}));

vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn(),
  signInWithPopup: vi.fn(),
}));

describe('registrarUsuario', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve el usuario cuando el registro es exitoso', async () => {
    (createUserWithEmailAndPassword as any).mockResolvedValueOnce({
      user: { uid: 'abc123', email: 'test@test.com' },
    });

    const resultado = await registrarUsuario('test@test.com', 'password123');

    expect(resultado).toEqual({ uid: 'abc123', email: 'test@test.com' });
  });

  it('lanza un error traducido cuando el email ya está en uso', async () => {
    (createUserWithEmailAndPassword as any).mockRejectedValueOnce({
      code: 'auth/email-already-in-use',
    });

    await expect(registrarUsuario('test@test.com', 'password123')).rejects.toThrow('El correo electrónico ya está en uso. Por favor, utiliza otro correo.');
  });
});

describe('iniciarSesion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve el usuario cuando el inicio de sesión es exitoso', async () => {
    (signInWithEmailAndPassword as any).mockResolvedValueOnce({
      user: { uid: 'abc123', email: 'test@test.com' },
    });

    const resultado = await iniciarSesion('test@test.com', 'password123');

    expect(resultado).toEqual({ uid: 'abc123', email: 'test@test.com' });
  });

  it('lanza un error traducido cuando las credenciales son inválidas', async () => {
    (signInWithEmailAndPassword as any).mockRejectedValueOnce({
      code: 'auth/invalid-credential',
    });

    await expect(iniciarSesion('test@test.com', 'wrongpassword')).rejects.toThrow(
      'Las credenciales son inválidas. Por favor, inténtalo de nuevo.'
    );
  });
});

describe('iniciarSesionConGoogle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('devuelve el usuario cuando el login con Google es exitoso', async () => {
    (signInWithPopup as any).mockResolvedValueOnce({
      user: { uid: 'google123', email: 'test@gmail.com' },
    });

    const resultado = await iniciarSesionConGoogle();

    expect(resultado).toEqual({ uid: 'google123', email: 'test@gmail.com' });
  });

  it('lanza un mensaje genérico cuando el código de error no está contemplado', async () => {
  (signInWithPopup as any).mockRejectedValueOnce({
    code: 'auth/some-unhandled-code',
  });

  await expect(iniciarSesionConGoogle()).rejects.toThrow(
    'Ocurrió un error desconocido. Por favor, inténtalo de nuevo más tarde.'
  );
});
});

describe('cerrarSesion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('llama a signOut correctamente', async () => {
    (signOut as any).mockResolvedValueOnce(undefined);

    await cerrarSesion();

    expect(signOut).toHaveBeenCalledOnce();
  });

  it('propaga el error sin traducir si signOut falla', async () => {
    const errorOriginal = new Error('Network error');
    (signOut as any).mockRejectedValueOnce(errorOriginal);

    await expect(cerrarSesion()).rejects.toThrow('Network error');
  });
});