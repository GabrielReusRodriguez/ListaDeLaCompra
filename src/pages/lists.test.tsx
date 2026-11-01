import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp, seedData, seedUser } from '../test/utils';
import { STORAGE_KEYS } from '../services/storage';

function seedSession(username = 'ana'): void {
  seedUser(username);
  sessionStorage.setItem(STORAGE_KEYS.session, username);
}

describe('gestión de listas', () => {
  it('crea una lista y entra en ella', async () => {
    seedSession();
    const { user } = renderApp('/es/listas');

    expect(
      await screen.findByText('Todavía no tienes listas. Crea la primera.'),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Nueva lista' }));
    await user.type(screen.getByLabelText('Nombre de la lista'), 'Semana');
    await user.click(screen.getByRole('button', { name: 'Añadir' }));

    expect(await screen.findByRole('heading', { name: 'Semana', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('No hay ítems pendientes en esta lista.')).toBeInTheDocument();
  });

  it('renombra una lista', async () => {
    seedSession();
    seedData('ana', { lists: [{ id: 'l1', name: 'Semana', createdAt: 1 }] });
    const { user } = renderApp('/es/listas');

    await user.click(await screen.findByRole('button', { name: 'Editar' }));
    const input = screen.getByLabelText('Nombre de la lista');
    await user.clear(input);
    await user.type(input, 'Compra del sábado');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByRole('button', { name: /Compra del sábado/ })).toBeInTheDocument();
  });

  it('elimina una lista junto con sus ítems', async () => {
    seedSession();
    seedData('ana', {
      lists: [{ id: 'l1', name: 'Semana', createdAt: 1 }],
      items: [
        {
          id: 'i1',
          listId: 'l1',
          name: 'Pan',
          quantity: 1,
          unit: '',
          store: 'panaderia',
          priority: 'alta',
          createdAt: 1,
          updatedAt: 1,
        },
      ],
    });
    const { user } = renderApp('/es/listas');

    expect(await screen.findByText('1 ítem pendiente')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Eliminar' }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/Se eliminará la lista «Semana»/)).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    expect(
      await screen.findByText('Todavía no tienes listas. Crea la primera.'),
    ).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem('ldlc:data:ana') ?? '{}');
    expect(stored.lists).toEqual([]);
    expect(stored.items).toEqual([]);
  });

  it('muestra «lista no encontrada» para un id inexistente', async () => {
    seedSession();
    renderApp('/es/lista/no-existe');
    expect(await screen.findByText('La lista no existe o se ha eliminado.')).toBeInTheDocument();
  });
});
