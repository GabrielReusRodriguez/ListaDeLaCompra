export type Locale = 'es' | 'ca';

export const LOCALES: readonly Locale[] = ['es', 'ca'];

export const DEFAULT_LOCALE: Locale = 'es';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

export type Theme = 'light' | 'dark';

export const THEMES: readonly Theme[] = ['light', 'dark'];

export const DEFAULT_THEME: Theme = 'light';

export function isTheme(value: unknown): value is Theme {
  return typeof value === 'string' && (THEMES as readonly string[]).includes(value);
}

export type Priority = 'alta' | 'media' | 'baja';

/** De mayor a menor urgencia. */
export const PRIORITIES: readonly Priority[] = ['alta', 'media', 'baja'];

export const DEFAULT_PRIORITY: Priority = 'media';

export function isPriority(value: unknown): value is Priority {
  return typeof value === 'string' && (PRIORITIES as readonly string[]).includes(value);
}

/** Lugares predefinidos del catálogo. El lugar de un ítem es un identificador libre. */
export const STORE_CATALOG = [
  'supermercado',
  'panaderia',
  'fruteria',
  'carniceria',
  'farmacia',
  'papeleria',
  'centro-comercial',
  'otros',
] as const;

export type CatalogStore = (typeof STORE_CATALOG)[number];

export function isCatalogStore(value: string): value is CatalogStore {
  return (STORE_CATALOG as readonly string[]).includes(value);
}

export interface User {
  username: string;
  /** Salt aleatorio de 16 bytes en base64. */
  salt: string;
  /** Hash PBKDF2-SHA-256 de la contraseña con el salt, en base64. */
  passwordHash: string;
  createdAt: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  createdAt: number;
}

export interface Item {
  id: string;
  listId: string;
  name: string;
  quantity: number;
  /** Unidad opcional: kg, l, paquete... Cadena vacía si no aplica. */
  unit: string;
  /** Identificador de lugar: un valor de STORE_CATALOG o texto libre del usuario. */
  store: string;
  priority: Priority;
  createdAt: number;
  updatedAt: number;
}

/** Campos editables de un ítem. */
export type ItemInput = Pick<Item, 'listId' | 'name' | 'quantity' | 'unit' | 'store' | 'priority'>;

export interface UserData {
  lists: ShoppingList[];
  items: Item[];
}

export interface Filters {
  search: string;
  listId: string | 'all';
  priority: Priority | 'all';
  store: string | 'all';
}

export function createEmptyFilters(): Filters {
  return { search: '', listId: 'all', priority: 'all', store: 'all' };
}
