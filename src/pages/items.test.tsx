import { describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { makeItem, readStoredData, renderApp, seedSession, seedUser } from '../test/utils';
import { STORAGE_KEYS } from '../services/storage';

const baseLists = [
  { id: 'l1', name: 'Semana', createdAt: 1 },
  { id: 'l2', name: 'Sábado', createdAt: 2 },
];

describe('gestión de ítems', () => {
  it('crea un ítem con todos los campos', async () => {
    await seedSession('ana', { lists: baseLists });
    const { user } = renderApp('/es/lista/l1');

    await user.click(await screen.findByRole('button', { name: 'Añadir ítem' }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Producto'), 'Manzanas');
    const quantity = within(dialog).getByLabelText('Cantidad');
    await user.clear(quantity);
    await user.type(quantity, '2');
    await user.type(within(dialog).getByLabelText('Unidad'), 'kg');
    await user.selectOptions(within(dialog).getByLabelText('Lugar de compra'), 'fruteria');
    await user.click(within(dialog).getByLabelText('Alta'));
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Manzanas')).toBeInTheDocument();
    expect(screen.getByText('Cantidad: 2 kg')).toBeInTheDocument();
    expect(screen.getAllByText('Frutería').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Alta').length).toBeGreaterThan(0);

    const [item] = (await readStoredData()).items;
    expect(item).toMatchObject({
      listId: 'l1',
      name: 'Manzanas',
      quantity: 2,
      unit: 'kg',
      store: 'fruteria',
      priority: 'alta',
    });
  });

  it('valida que el nombre sea obligatorio', async () => {
    await seedSession('ana', { lists: baseLists });
    const { user } = renderApp('/es/lista/l1');

    await user.click(await screen.findByRole('button', { name: 'Añadir ítem' }));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(screen.getByRole('alert')).toHaveTextContent('Escribe el nombre del producto.');
  });

  it('permite un lugar de compra personalizado', async () => {
    await seedSession('ana', { lists: baseLists });
    const { user } = renderApp('/es/lista/l1');

    await user.click(await screen.findByRole('button', { name: 'Añadir ítem' }));
    const dialog = screen.getByRole('dialog');
    await user.type(within(dialog).getByLabelText('Producto'), 'Miel');
    await user.selectOptions(within(dialog).getByLabelText('Lugar de compra'), 'Otro lugar');
    await user.type(within(dialog).getByLabelText('Otro lugar'), 'Mercadillo');
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Miel')).toBeInTheDocument();
    expect((await readStoredData()).items[0].store).toBe('Mercadillo');
  });

  it('edita un ítem pendiente', async () => {
    await seedSession('ana', {
      lists: baseLists,
      items: [makeItem({ id: 'i1', listId: 'l1', name: 'Leche', priority: 'baja' })],
    });
    const { user } = renderApp('/es/lista/l1');

    await user.click(await screen.findByRole('button', { name: 'Editar: Leche' }));
    const dialog = screen.getByRole('dialog');
    const name = within(dialog).getByLabelText('Producto');
    await user.clear(name);
    await user.type(name, 'Leche entera');
    await user.click(within(dialog).getByLabelText('Media'));
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }));

    expect(await screen.findByText('Leche entera')).toBeInTheDocument();
    expect(screen.queryByText('Leche', { selector: '.item-row__name' })).not.toBeInTheDocument();
    expect((await readStoredData()).items[0]).toMatchObject({
      name: 'Leche entera',
      priority: 'media',
    });
  });

  it('elimina un ítem pendiente', async () => {
    await seedSession('ana', {
      lists: baseLists,
      items: [makeItem({ id: 'i1', listId: 'l1', name: 'Leche' })],
    });
    const { user } = renderApp('/es/lista/l1');

    await user.click(await screen.findByRole('button', { name: 'Eliminar: Leche' }));
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Eliminar' }));

    expect(await screen.findByText('No hay ítems pendientes en esta lista.')).toBeInTheDocument();
    expect((await readStoredData()).items).toEqual([]);
  });

  it('marca como comprado y el ítem desaparece del almacenamiento', async () => {
    await seedSession('ana', {
      lists: baseLists,
      items: [
        makeItem({ id: 'i1', listId: 'l1', name: 'Leche' }),
        makeItem({ id: 'i2', listId: 'l1', name: 'Pan' }),
      ],
    });
    const { user } = renderApp('/es/lista/l1');

    await user.click(await screen.findByRole('button', { name: 'Marcar como comprado: Leche' }));

    expect(screen.queryByText('Leche')).not.toBeInTheDocument();
    expect(screen.getByText('Pan')).toBeInTheDocument();
    expect((await readStoredData()).items.map((item) => item.id)).toEqual(['i2']);
  });

  it('ordena los pendientes por prioridad y, dentro de cada nivel, por creación', async () => {
    await seedSession('ana', {
      lists: baseLists,
      items: [
        makeItem({ id: 'i1', listId: 'l1', name: 'Baja-1', priority: 'baja', createdAt: 1 }),
        makeItem({ id: 'i2', listId: 'l1', name: 'Media-2', priority: 'media', createdAt: 2 }),
        makeItem({ id: 'i3', listId: 'l1', name: 'Alta-3', priority: 'alta', createdAt: 3 }),
        makeItem({ id: 'i4', listId: 'l1', name: 'Media-1', priority: 'media', createdAt: 1 }),
      ],
    });
    renderApp('/es/lista/l1');

    await screen.findByText('Alta-3');
    const names = screen
      .getAllByRole('listitem')
      .map((row) => within(row).getByText(/^(Alta|Media|Baja)-/).textContent);
    expect(names).toEqual(['Alta-3', 'Media-1', 'Media-2', 'Baja-1']);
  });

  it('los datos siguen disponibles tras recargar la página', async () => {
    await seedSession('ana', {
      lists: baseLists,
      items: [makeItem({ id: 'i1', listId: 'l1', name: 'Leche' })],
    });
    const first = renderApp('/es/lista/l1');
    expect(await first.findByText('Leche')).toBeInTheDocument();
    first.unmount();

    renderApp('/es/lista/l1');
    expect(await screen.findByText('Leche')).toBeInTheDocument();
  });

  it('en localStorage solo hay datos cifrados, sin nombres de listas ni ítems', async () => {
    await seedSession('ana', {
      lists: baseLists,
      items: [makeItem({ id: 'i1', listId: 'l1', name: 'Leche' })],
    });
    const { user } = renderApp('/es/lista/l1');
    await user.click(await screen.findByRole('button', { name: 'Marcar como comprado: Leche' }));
    expect(screen.queryByText('Leche')).not.toBeInTheDocument();

    // Espera a que la persistencia cifrada termine.
    await vi.waitFor(async () => {
      expect((await readStoredData()).items).toEqual([]);
    });

    const dump = JSON.stringify({ ...localStorage });
    expect(dump).not.toContain('Leche');
    expect(dump).not.toContain('Semana');
    expect(dump).not.toContain('Sábado');
    expect(JSON.parse(localStorage.getItem('ldlc:data:ana') ?? '{}')).toMatchObject({
      v: 1,
      alg: 'AES-GCM',
    });
  });

  it('no mezcla los datos de dos usuarios del mismo navegador', async () => {
    await seedSession('ana', {
      lists: baseLists,
      items: [makeItem({ id: 'i1', listId: 'l1', name: 'Leche de Ana' })],
    });
    const first = renderApp('/es/lista/l1');
    expect(await first.findByText('Leche de Ana')).toBeInTheDocument();
    first.unmount();

    await seedUser('luis');
    sessionStorage.setItem(STORAGE_KEYS.session, 'luis');
    renderApp('/es/listas');
    expect(
      await screen.findByText('Todavía no tienes listas. Crea la primera.'),
    ).toBeInTheDocument();
  });
});
