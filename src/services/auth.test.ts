import { describe, expect, it } from 'vitest';
import { getSessionUsername, loginUser, logout, registerUser } from './auth';
import * as storage from './storage';
import { STORAGE_KEYS } from './storage';

describe('registro e inicio de sesión local', () => {
  it('guarda solo el hash y el salt, nunca la contraseña en claro', async () => {
    const password = 'contraseña-segura';
    const result = await registerUser('ana', password);
    expect(result.ok).toBe(true);

    const raw = localStorage.getItem(STORAGE_KEYS.users) ?? '';
    expect(raw).not.toContain(password);

    const user = storage.getUser('ana');
    expect(user).not.toBeNull();
    expect(user?.passwordHash).toBeTruthy();
    expect(user?.salt).toBeTruthy();
    expect(user?.passwordHash).not.toBe(password);
    expect(user).not.toHaveProperty('password');
  });

  it('genera un salt distinto para cada usuario', async () => {
    await registerUser('ana', 'contraseña-segura');
    await registerUser('luis', 'contraseña-segura');
    expect(storage.getUser('ana')?.salt).not.toBe(storage.getUser('luis')?.salt);
  });

  it('abre sesión al iniciar con la contraseña correcta', async () => {
    await registerUser('ana', 'contraseña-segura');
    logout();
    expect(getSessionUsername()).toBeNull();

    const result = await loginUser('ana', 'contraseña-segura');
    expect(result.ok).toBe(true);
    expect(getSessionUsername()).toBe('ana');
  });

  it('rechaza contraseña incorrecta o usuario inexistente', async () => {
    await registerUser('ana', 'contraseña-segura');
    expect((await loginUser('ana', 'otra-cosa')).ok).toBe(false);
    expect((await loginUser('nadie', 'contraseña-segura')).ok).toBe(false);
  });

  it('rechaza nombres de usuario duplicados', async () => {
    await registerUser('ana', 'contraseña-segura');
    const result = await registerUser('ana', 'otra-contraseña');
    expect(result).toEqual({ ok: false, error: 'user-exists' });
  });

  it('valida el formato de usuario y la longitud de la contraseña', async () => {
    expect((await registerUser('a', 'contraseña-segura')).ok).toBe(false);
    expect((await registerUser('ana', '123')).ok).toBe(false);
    expect((await registerUser('ana con espacios', 'contraseña-segura')).ok).toBe(false);
  });

  it('la sesión vive en sessionStorage para cerrarse al cerrar la pestaña', async () => {
    await registerUser('ana', 'contraseña-segura');
    expect(sessionStorage.getItem(STORAGE_KEYS.session)).toBe('ana');
    expect(localStorage.getItem(STORAGE_KEYS.session)).toBeNull();
  });

  it('avisa si el contexto no es seguro y no hay Web Crypto', async () => {
    const original = globalThis.crypto;
    Object.defineProperty(globalThis, 'crypto', {
      value: { getRandomValues: original.getRandomValues.bind(original) },
      configurable: true,
    });
    try {
      expect(await registerUser('ana', 'contraseña-segura')).toEqual({
        ok: false,
        error: 'crypto-unavailable',
      });
      expect(await loginUser('ana', 'contraseña-segura')).toEqual({
        ok: false,
        error: 'crypto-unavailable',
      });
    } finally {
      Object.defineProperty(globalThis, 'crypto', { value: original, configurable: true });
    }
  });

  it('ignora una sesión cuyo usuario ya no existe', () => {
    sessionStorage.setItem(STORAGE_KEYS.session, 'fantasma');
    expect(getSessionUsername()).toBeNull();
  });
});
