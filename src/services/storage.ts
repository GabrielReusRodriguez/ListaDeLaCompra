import type { Locale, Theme, User, UserData } from '../types';

/**
 * Único punto de acceso a `localStorage` y `sessionStorage`.
 * Ningún componente debe tocar el almacenamiento directamente.
 *
 * Los datos de cada usuario (`ldlc:data:<username>`) se guardan cifrados; este
 * módulo solo los lee y escribe como contenido opaco. El cifrado vive en
 * `secureStorage.ts`.
 */

export const STORAGE_KEYS = {
  users: 'ldlc:users',
  dataPrefix: 'ldlc:data:',
  keyPrefix: 'ldlc:key:',
  lang: 'ldlc:lang',
  theme: 'ldlc:theme',
  session: 'ldlc:session',
} as const;

export function dataKey(username: string): string {
  return `${STORAGE_KEYS.dataPrefix}${username}`;
}

export function keyStorageKey(username: string): string {
  return `${STORAGE_KEYS.keyPrefix}${username}`;
}

function readJson<T>(storage: Storage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(storage: Storage, key: string, value: unknown): void {
  storage.setItem(key, JSON.stringify(value));
}

function readString(storage: Storage, key: string): string | null {
  try {
    return storage.getItem(key);
  } catch {
    return null;
  }
}

function writeString(storage: Storage, key: string, value: string): void {
  storage.setItem(key, value);
}

function remove(storage: Storage, key: string): void {
  storage.removeItem(key);
}

/* ------------------------------- Usuarios ------------------------------- */

export function getUsers(): User[] {
  const users = readJson<unknown>(localStorage, STORAGE_KEYS.users, []);
  return Array.isArray(users) ? (users as User[]) : [];
}

export function getUser(username: string): User | null {
  return getUsers().find((user) => user.username === username) ?? null;
}

export function saveUser(user: User): void {
  const users = getUsers().filter((existing) => existing.username !== user.username);
  writeJson(localStorage, STORAGE_KEYS.users, [...users, user]);
}

/* ----------------------------- Datos de usuario ----------------------------- */

/**
 * Contenido crudo de `ldlc:data:<username>`: un `EncryptedPayload` o, en datos
 * creados antes del cifrado, el `UserData` en claro que hay que migrar.
 */
export function getRawData(username: string): unknown {
  return readJson<unknown>(localStorage, dataKey(username), null);
}

export function saveRawData(username: string, payload: unknown): void {
  writeJson(localStorage, dataKey(username), payload);
}

/* ------------------------- Clave de cifrado (sesión) ------------------------- */

/** La clave solo vive en `sessionStorage`: se borra al cerrar la pestaña. */
export function getSessionKey(username: string): string | null {
  return readString(sessionStorage, keyStorageKey(username));
}

export function setSessionKey(username: string, jwk: string): void {
  writeString(sessionStorage, keyStorageKey(username), jwk);
}

export function clearSessionKey(username: string): void {
  remove(sessionStorage, keyStorageKey(username));
}

export function clearAllSessionKeys(): void {
  for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(STORAGE_KEYS.keyPrefix)) {
      sessionStorage.removeItem(key);
    }
  }
}

/** Normaliza cualquier valor leído a la forma esperada de `UserData`. */
export function normalizeData(value: unknown): UserData {
  const data = (typeof value === 'object' && value !== null ? value : {}) as Partial<UserData>;
  return {
    lists: Array.isArray(data.lists) ? data.lists : [],
    items: Array.isArray(data.items) ? data.items : [],
  };
}

/* -------------------------------- Idioma -------------------------------- */

export function getSavedLocale(): string | null {
  return readString(localStorage, STORAGE_KEYS.lang);
}

export function saveLocale(locale: Locale): void {
  writeString(localStorage, STORAGE_KEYS.lang, locale);
}

/* --------------------------------- Tema --------------------------------- */

export function getSavedTheme(): string | null {
  return readString(localStorage, STORAGE_KEYS.theme);
}

export function saveTheme(theme: Theme): void {
  writeString(localStorage, STORAGE_KEYS.theme, theme);
}

/* -------------------------------- Sesión -------------------------------- */

export function getSession(): string | null {
  return readString(sessionStorage, STORAGE_KEYS.session);
}

export function setSession(username: string): void {
  writeString(sessionStorage, STORAGE_KEYS.session, username);
}

export function clearSession(): void {
  remove(sessionStorage, STORAGE_KEYS.session);
}
