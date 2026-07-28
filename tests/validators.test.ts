import { describe, it, expect } from 'vitest';
import { validarEmail, validarPassword } from '../src/utils/validators';

describe('validarEmail', () => {
  it('devuelve un error si el email está vacío', () => {
    const resultado = validarEmail('');
    expect(resultado).toBe('El correo electrónico es obligatorio.');
  });

  it('devuelve un error si el email no tiene formato válido', () => {
    const resultado = validarEmail('usuario ejemplo.com');
    expect(resultado).toBe('El correo electrónico no es válido.');
  });

  it('devuelve null si el email es válido', () => {
    const resultado = validarEmail('usuario@ejemplo.com');
    expect(resultado).toBe(null);
  });
});

describe('validarPassword', () => {
  it('devuelve un error si la contraseña está vacía', () => {
    const resultado = validarPassword('');
    expect(resultado).toBe('La contraseña es obligatoria.');
  });
  it('devuelve un error si la contraseña tiene menos de 6 caracteres', () => {
    const resultado = validarPassword('12345');
    expect(resultado).toBe('La contraseña debe tener al menos 6 caracteres.');
  });
  it('devuelve null si la contraseña es válida', () => {
    const resultado = validarPassword('123456');
    expect(resultado).toBe(null);
  });
});
