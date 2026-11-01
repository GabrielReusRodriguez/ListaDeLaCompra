import type { User } from '../types';
import * as storage from './storage';
import { constantTimeEqual, generateSalt, hashPassword, isCryptoAvailable } from './crypto';

export type AuthError =
  'user-exists' | 'invalid-credentials' | 'invalid-input' | 'crypto-unavailable';

export type AuthResult = { ok: true; user: User } | { ok: false; error: AuthError };

export const USERNAME_PATTERN = /^[a-zA-Z0-9._-]{3,32}$/;
export const MIN_PASSWORD_LENGTH = 6;

export function validateUsername(username: string): boolean {
  return USERNAME_PATTERN.test(username);
}

export function validatePassword(password: string): boolean {
  return password.length >= MIN_PASSWORD_LENGTH;
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
  const passwordHash = await hashPassword(password, salt);
  const user: User = { username: name, salt, passwordHash, createdAt: Date.now() };
  storage.saveUser(user);
  storage.setSession(name);
  return { ok: true, user };
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
  const hash = await hashPassword(password, user.salt);
  if (!constantTimeEqual(hash, user.passwordHash)) {
    return { ok: false, error: 'invalid-credentials' };
  }
  storage.setSession(name);
  return { ok: true, user };
}

export function logout(): void {
  storage.clearSession();
}

export function getSessionUsername(): string | null {
  const username = storage.getSession();
  if (!username) return null;
  // Si el usuario ya no existe, la sesión deja de ser válida.
  return storage.getUser(username) ? username : null;
}
