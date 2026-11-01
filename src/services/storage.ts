import type { Locale, Theme, User, UserData } from '../types';

/**
 * Único punto de acceso a `localStorage` y `sessionStorage`.
 * Ningún componente debe tocar el almacenamiento directamente.
 */

export const STORAGE_KEYS = {
  users: 'ldlc:users',
  dataPrefix: 'ldlc:data:',
  lang: 'ldlc:lang',
  theme: 'ldlc:theme',
  session: 'ldlc:session',
} as const;

export function dataKey(username: string): string {
  return `${STORAGE_KEYS.dataPrefix}${username}`;
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

export function getData(username: string): UserData {
  const data = readJson<Partial<UserData>>(localStorage, dataKey(username), {});
  return {
    lists: Array.isArray(data.lists) ? data.lists : [],
    items: Array.isArray(data.items) ? data.items : [],
  };
}

export function saveData(username: string, data: UserData): void {
  writeJson(localStorage, dataKey(username), data);
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
