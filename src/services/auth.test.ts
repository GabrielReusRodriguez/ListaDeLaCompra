import { describe, expect, it } from 'vitest';
import { getSessionUsername, loginUser, logout, registerUser } from './auth';
import * as storage from './storage';
import { STORAGE_KEYS, dataKey, keyStorageKey } from './storage';
import { decryptJson } from './crypto';

const PASSWORD = 'contraseña-segura';

describe('registro e inicio de sesión local', () => {
  it('guarda solo el hash y el salt, nunca la contraseña en claro', async () => {
    const result = await registerUser('ana', PASSWORD);
    expect(result.ok).toBe(true);

    const raw = localStorage.getItem(STORAGE_KEYS.users) ?? '';
    expect(raw).not.toContain(PASSWORD);

    const user = storage.getUser('ana');
    expect(user).not.toBeNull();
    expect(user?.passwordHash).toBeTruthy();
    expect(user?.salt).toBeTruthy();
    expect(user?.passwordHash).not.toBe(PASSWORD);
    expect(user).not.toHaveProperty('password');
  });

  it('genera un salt distinto para cada usuario', async () => {
    await registerUser('ana', PASSWORD);
    await registerUser('luis', PASSWORD);
    expect(storage.getUser('ana')?.salt).not.toBe(storage.getUser('luis')?.salt);
  });

  it('abre sesión al iniciar con la contraseña correcta', async () => {
    await registerUser('ana', PASSWORD);
    logout();
    expect(getSessionUsername()).toBeNull();

    const result = await loginUser('ana', PASSWORD);
    expect(result.ok).toBe(true);
    expect(getSessionUsername()).toBe('ana');
  });

  it('rechaza contraseña incorrecta o usuario inexistente', async () => {
    await registerUser('ana', PASSWORD);
    expect((await loginUser('ana', 'otra-cosa')).ok).toBe(false);
    expect((await loginUser('nadie', PASSWORD)).ok).toBe(false);
  });

  it('rechaza nombres de usuario duplicados', async () => {
    await registerUser('ana', PASSWORD);
    const result = await registerUser('ana', 'otra-contraseña');
    expect(result).toEqual({ ok: false, error: 'user-exists' });
  });

  it('valida el formato de usuario y la longitud de la contraseña', async () => {
    expect((await registerUser('a', PASSWORD)).ok).toBe(false);
    expect((await registerUser('ana', '123')).ok).toBe(false);
    expect((await registerUser('ana con espacios', PASSWORD)).ok).toBe(false);
  });

  it('la sesión vive en sessionStorage para cerrarse al cerrar la pestaña', async () => {
    await registerUser('ana', PASSWORD);
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
      expect(await registerUser('ana', PASSWORD)).toEqual({
        ok: false,
        error: 'crypto-unavailable',
      });
      expect(await loginUser('ana', PASSWORD)).toEqual({
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

describe('cifrado de los datos', () => {
  it('la clave de cifrado solo vive en sessionStorage, nunca en localStorage', async () => {
    const result = await registerUser('ana', PASSWORD);
    expect(result.ok).toBe(true);

    expect(sessionStorage.getItem(keyStorageKey('ana'))).toBeTruthy();
    expect(localStorage.getItem(keyStorageKey('ana'))).toBeNull();
    expect(JSON.stringify({ ...localStorage })).not.toContain('"kty"');
  });

  it('los datos guardados son un payload AES-GCM sin texto plano', async () => {
    const result = await registerUser('ana', PASSWORD);
    if (!result.ok) throw new Error('registro fallido');

    const { persistData } = await import('./secureStorage');
    await persistData(result.key, 'ana', {
      lists: [{ id: 'l1', name: 'Lista secreta', createdAt: 1 }],
      items: [],
    });

    const raw = localStorage.getItem(dataKey('ana')) ?? '';
    expect(raw).not.toContain('Lista secreta');
    const payload = JSON.parse(raw);
    expect(payload).toMatchObject({ v: 1, alg: 'AES-GCM' });
    expect(payload.iv).toBeTruthy();
    expect(payload.ct).toBeTruthy();

    const decrypted = await decryptJson(result.key, payload);
    expect(decrypted).toMatchObject({ lists: [{ name: 'Lista secreta' }] });
  });

  it('cada escritura usa un IV distinto', async () => {
    const result = await registerUser('ana', PASSWORD);
    if (!result.ok) throw new Error('registro fallido');
    const { persistData } = await import('./secureStorage');

    await persistData(result.key, 'ana', { lists: [], items: [] });
    const first = JSON.parse(localStorage.getItem(dataKey('ana')) ?? '{}');
    await persistData(result.key, 'ana', { lists: [], items: [] });
    const second = JSON.parse(localStorage.getItem(dataKey('ana')) ?? '{}');

    expect(first.iv).not.toBe(second.iv);
    expect(first.ct).not.toBe(second.ct);
  });

  it('migra a cifrado los datos que estaban en claro al iniciar sesión', async () => {
    await registerUser('ana', PASSWORD);
    logout();

    // Simula un dato creado antes del cifrado.
    const legacy = { lists: [{ id: 'l1', name: 'Antigua', createdAt: 1 }], items: [] };
    localStorage.setItem(dataKey('ana'), JSON.stringify(legacy));

    const result = await loginUser('ana', PASSWORD);
    expect(result.ok).toBe(true);

    const raw = localStorage.getItem(dataKey('ana')) ?? '';
    expect(raw).not.toContain('Antigua');
    expect(JSON.parse(raw)).toMatchObject({ v: 1, alg: 'AES-GCM' });

    const { loadData } = await import('./secureStorage');
    if (!result.ok) throw new Error('login fallido');
    const { data } = await loadData(result.key, 'ana');
    expect(data.lists).toHaveLength(1);
    expect(data.lists[0].name).toBe('Antigua');
  });

  it('cerrar sesión borra la clave de sessionStorage', async () => {
    await registerUser('ana', PASSWORD);
    logout();
    expect(sessionStorage.getItem(keyStorageKey('ana'))).toBeNull();
    expect(localStorage.getItem(dataKey('ana'))).toBeNull();
  });
});
