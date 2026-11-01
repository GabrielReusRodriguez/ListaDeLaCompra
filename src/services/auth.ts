import type { User } from '../types';
import * as storage from './storage';
import { migrateLegacyData, restoreKey } from './secureStorage';
import {
  constantTimeEqual,
  deriveCredentials,
  exportKey,
  generateSalt,
  isCryptoAvailable,
} from './crypto';

export type AuthError =
  'user-exists' | 'invalid-credentials' | 'invalid-input' | 'crypto-unavailable';

export type AuthResult = { ok: true; user: User; key: CryptoKey } | { ok: false; error: AuthError };

export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/;
export const MIN_PASSWORD_LENGTH = 6;

export function validateUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export function validatePassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
}

/** Guarda la clave de cifrado solo en `sessionStorage` (se borra al cerrar la pestaña). */
async function startSession(user: User, key: CryptoKey): Promise<void> {
  storage.setSession(user.username);
  storage.setSessionKey(user.username, await exportKey(key));
}

export async function registerUser(username: string, password: string): Promise<AuthResult> {
  const name = username.trim();
  if (!isCryptoAvailable()) {
    return { ok: false, error: 'crypto-unavailable' };
  }
  if (!validateUsername(name) || !validatePassword(password)) {
    return { ok: false, error: 'invalid-input' };
  }
  if (storage.getUser(name)) {
    return { ok: false, error: 'user-exists' };
  }

  const salt = generateSalt();
  const { hash: passwordHash, key } = await deriveCredentials(password, salt);
  const user: User = { username: name, salt, passwordHash, createdAt: Date.now() };
  storage.saveUser(user);
  await startSession(user, key);
  return { ok: true, user, key };
}

export async function loginUser(username: string, password: string): Promise<AuthResult> {
  const name = username.trim();
  if (!isCryptoAvailable()) {
    return { ok: false, error: 'crypto-unavailable' };
  }
  const user = storage.getUser(name);
  if (!user) {
    return { ok: false, error: 'invalid-credentials' };
  }
  const { hash, key } = await deriveCredentials(password, user.salt);
  if (!constantTimeEqual(hash, user.passwordHash)) {
    return { ok: false, error: 'invalid-credentials' };
  }
  // Datos guardados antes del cifrado: se cifran ahora con la clave derivada.
  await migrateLegacyData(key, user.username);
  await startSession(user, key);
  return { ok: true, user, key };
}

export function logout(): void {
  const username = storage.getSession();
  if (username) storage.clearSessionKey(username);
  storage.clearSession();
}

export function getSessionUsername(): string | null {
  const username = storage.getSession();
  if (!username) return null;
  // Si el usuario ya no existe, la sesión deja de ser válida.
  return storage.getUser(username) ? username : null;
}

/** Recupera usuario y clave de `sessionStorage` al recargar la pestaña. */
export async function restoreSession(): Promise<{ username: string; key: CryptoKey } | null> {
  const username = getSessionUsername();
  if (!username) return null;
  const key = await restoreKey(username);
  if (!key) {
    // Sin clave no se pueden descifrar los datos: se fuerza un nuevo login.
    storage.clearSession();
    return null;
  }
  return { username, key };
}
