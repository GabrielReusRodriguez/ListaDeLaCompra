import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { makeItem, readStoredData, renderApp, seedSession } from '../test/utils';

describe('gestión de listas', () => {
  it('crea una lista y entra en ella', async () => {
    await seedSession();
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
    await seedSession('ana', { lists: [{ id: 'l1', name: 'Semana', createdAt: 1 }] });
    const { user } = renderApp('/es/listas');

    await user.click(await screen.findByRole('button', { name: 'Editar' }));
    const input = screen.getByLabelText('Nombre de la lista');
    await user.clear(input);
    await user.type(input, 'Compra del sábado');
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByRole('button', { name: /Compra del sábado/ })).toBeInTheDocument();
  });

  it('elimina una lista junto con sus ítems', async () => {
    await seedSession('ana', {
      lists: [{ id: 'l1', name: 'Semana', createdAt: 1 }],
      items: [
        makeItem({ id: 'i1', listId: 'l1', name: 'Pan', store: 'panaderia', priority: 'alta' }),
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
    const stored = await readStoredData();
    expect(stored.lists).toEqual([]);
    expect(stored.items).toEqual([]);
  });

  it('muestra «lista no encontrada» para un id inexistente', async () => {
    await seedSession();
    renderApp('/es/lista/no-existe');
    expect(await screen.findByText('La lista no existe o se ha eliminado.')).toBeInTheDocument();
  });
});
