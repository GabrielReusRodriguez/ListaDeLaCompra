import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import * as storage from '../services/storage';
import { deriveCredentials, exportKey } from '../services/crypto';
import { loadData, persistData } from '../services/secureStorage';
import type { Item, ShoppingList, UserData } from '../types';

/** Renderiza la app completa en la ruta indicada. */
export function renderApp(initialPath = '/es/login') {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter initialEntries={[initialPath]}>
      <App />
    </MemoryRouter>,
  );
  return { user, ...utils };
}

export const VALID_PASSWORD = 'secreto123';

const TEST_SALT = 'c2FsdA==';

/**
 * Crea un usuario real (hash PBKDF2 + clave AES derivadas de `VALID_PASSWORD`) y
 * deja la clave en `sessionStorage`, como haría un login.
 */
export async function seedUser(username = 'ana'): Promise<CryptoKey> {
  const { hash, key } = await deriveCredentials(VALID_PASSWORD, TEST_SALT);
  storage.saveUser({
    username,
    salt: TEST_SALT,
    passwordHash: hash,
    createdAt: Date.now(),
  });
  storage.setSessionKey(username, await exportKey(key));
  return key;
}

/** Guarda los datos del usuario cifrados, como hace la app. */
export async function seedData(
  username: string,
  data: Partial<UserData>,
  key?: CryptoKey,
): Promise<void> {
  const cryptoKey = key ?? (await deriveCredentials(VALID_PASSWORD, TEST_SALT)).key;
  await persistData(cryptoKey, username, { lists: [], items: [], ...data });
}

/** Usuario + datos + sesión activa, todo listo para renderizar una vista protegida. */
export async function seedSession(username = 'ana', data: Partial<UserData> = {}): Promise<void> {
  const key = await seedUser(username);
  await seedData(username, data, key);
  storage.setSession(username);
}

/** Descifra el contenido actual de `ldlc:data:<username>` para inspeccionarlo en tests. */
export async function readStoredData(username = 'ana'): Promise<UserData> {
  const raw = storage.getRawData(username);
  if (raw === null) return { lists: [], items: [] };
  const { key } = await deriveCredentials(VALID_PASSWORD, TEST_SALT);
  return (await loadData(key, username)).data;
}

export function makeList(id: string, name: string, createdAt = 0): ShoppingList {
  return { id, name, createdAt };
}

export function makeItem(overrides: Partial<Item> & Pick<Item, 'id' | 'listId' | 'name'>): Item {
  return {
    quantity: 1,
    unit: '',
    store: 'supermercado',
    priority: 'media',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}
