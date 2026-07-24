export function validarEmail(email: string): string | null {
  if (!email) {
    return 'El correo electrónico es obligatorio.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'El correo electrónico no es válido.';
  }
  return null;
}

export function validarPassword(password: string): string | null {
  if (!password) {
    return 'La contraseña es obligatoria.';
  }
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  return null;
}