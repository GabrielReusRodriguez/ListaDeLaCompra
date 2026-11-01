import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import * as storage from '../services/storage';
import type { Item, ShoppingList, UserData } from '../types';

/** Renderiza la app completa en la ruta indicada. */
export function renderApp(initialPath = '/es/login') {
  const user = userEvent.setup();
  const utils = render(
    <MemoryRouter
      initialEntries={[initialPath]}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <App />
    </MemoryRouter>,
  );
  return { user, ...utils };
}

export const VALID_PASSWORD = 'secreto123';

/** Crea un usuario directamente en el almacenamiento (sin pasar por la UI). */
export function seedUser(username = 'ana'): void {
  storage.saveUser({
    username,
    salt: 'c2FsdA==',
    passwordHash: 'aGFzaA==',
    createdAt: Date.now(),
  });
}

export function seedData(username: string, data: Partial<UserData>): void {
  storage.saveData(username, { lists: [], items: [], ...data });
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
