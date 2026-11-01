import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { makeItem, renderApp, seedData, seedUser } from '../test/utils';
import { STORAGE_KEYS } from '../services/storage';

function seedSession(username = 'ana'): void {
  seedUser(username);
  sessionStorage.setItem(STORAGE_KEYS.session, username);
}

const lists = [
  { id: 'l1', name: 'Semana', createdAt: 1 },
  { id: 'l2', name: 'Sábado', createdAt: 2 },
];

const items = [
  makeItem({
    id: 'i1',
    listId: 'l1',
    name: 'Pan',
    store: 'panaderia',
    priority: 'alta',
    createdAt: 1,
  }),
  makeItem({
    id: 'i2',
    listId: 'l2',
    name: 'Manzanas',
    store: 'fruteria',
    priority: 'baja',
    createdAt: 2,
  }),
  makeItem({
    id: 'i3',
    listId: 'l1',
    name: 'Leche',
    store: 'supermercado',
    priority: 'media',
    createdAt: 3,
  }),
];

function itemNames(): string[] {
  return screen
    .getAllByRole('listitem')
    .map((row) => within(row).getByText(/^(Pan|Manzanas|Leche)$/).textContent ?? '');
}

describe('vista por prioridad', () => {
  it('muestra pendientes de todas las listas ordenados alta → media → baja', async () => {
    seedSession();
    seedData('ana', { lists, items });
    renderApp('/es/por-prioridad');

    await screen.findByRole('heading', { name: 'Pendientes por prioridad' });
    expect(itemNames()).toEqual(['Pan', 'Leche', 'Manzanas']);

    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(['Alta1', 'Media1', 'Baja1']);

    // Muestra la lista y el lugar de cada ítem.
    const manzanas = screen.getByText('Manzanas').closest('li') as HTMLElement;
    expect(screen.getAllByText('Sábado').length).toBeGreaterThan(0);
    expect(within(manzanas).getByText('Frutería')).toBeInTheDocument();
  });

  it('filtra por lista y por lugar', async () => {
    seedSession();
    seedData('ana', { lists, items });
    const { user } = renderApp('/es/por-prioridad');
    await screen.findByRole('heading', { name: 'Pendientes por prioridad' });

    await user.selectOptions(screen.getByLabelText('Lista'), 'l2');
    expect(itemNames()).toEqual(['Manzanas']);

    await user.selectOptions(screen.getByLabelText('Lista'), 'all');
    await user.selectOptions(screen.getByLabelText('Lugar'), 'panaderia');
    expect(itemNames()).toEqual(['Pan']);

    await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }));
    expect(itemNames()).toEqual(['Pan', 'Leche', 'Manzanas']);
  });
});

describe('vista por lugar', () => {
  it('agrupa por lugar y ordena cada grupo por prioridad', async () => {
    seedSession();
    seedData('ana', {
      lists,
      items: [
        ...items,
        makeItem({
          id: 'i4',
          listId: 'l1',
          name: 'Barra',
          store: 'panaderia',
          priority: 'baja',
          createdAt: 4,
        }),
      ],
    });
    renderApp('/es/por-lugar');

    await screen.findByRole('heading', { name: 'Pendientes por lugar de compra' });
    const headings = screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent);
    expect(headings).toEqual(['Frutería1', 'Panadería2', 'Supermercado1']);

    const panaderia = screen
      .getByRole('heading', { name: 'Panadería 2' })
      .closest('section') as HTMLElement;
    expect(
      within(panaderia)
        .getAllByRole('listitem')
        .map((row) => row.textContent),
    ).toEqual([expect.stringContaining('Pan'), expect.stringContaining('Barra')]);
  });

  it('la rejilla de filtros no reserva columnas para los filtros ocultos', async () => {
    seedSession();
    seedData('ana', { lists, items });
    renderApp('/es/por-lugar');
    await screen.findByRole('heading', { name: 'Pendientes por lugar de compra' });

    const grid = document.querySelector('.filters__grid');
    expect(grid).toHaveAttribute('data-fields', '3');
  });

  it('busca por nombre sin distinguir mayúsculas', async () => {
    seedSession();
    seedData('ana', { lists, items });
    const { user } = renderApp('/es/por-lugar');
    await screen.findByRole('heading', { name: 'Pendientes por lugar de compra' });

    await user.type(screen.getByLabelText('Buscar por nombre'), 'MANZ');
    expect(itemNames()).toEqual(['Manzanas']);
    expect(screen.getByRole('status')).toHaveTextContent('1 resultado');
  });

  it('muestra un mensaje cuando ningún ítem coincide', async () => {
    seedSession();
    seedData('ana', { lists, items });
    const { user } = renderApp('/es/por-lugar');
    await screen.findByRole('heading', { name: 'Pendientes por lugar de compra' });

    await user.type(screen.getByLabelText('Buscar por nombre'), 'zzz');
    expect(screen.getByText('Ningún ítem coincide con los filtros.')).toBeInTheDocument();
  });
});

describe('idioma', () => {
  it('la URL /ca muestra la interfaz en catalán', async () => {
    seedSession();
    seedData('ana', { lists, items });
    renderApp('/ca/por-prioridad');

    expect(
      await screen.findByRole('heading', { name: 'Pendents per prioritat' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tancar la sessió' })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe('ca');
  });

  it('el selector de idioma cambia la URL conservando la ruta y guarda la preferencia', async () => {
    seedSession();
    seedData('ana', { lists, items });
    const { user } = renderApp('/es/por-lugar');
    await screen.findByRole('heading', { name: 'Pendientes por lugar de compra' });

    await user.selectOptions(screen.getByLabelText('Idioma'), 'ca');

    expect(
      await screen.findByRole('heading', { name: 'Pendents per lloc de compra' }),
    ).toBeInTheDocument();
    expect(localStorage.getItem('ldlc:lang')).toBe('ca');
    expect(document.documentElement.lang).toBe('ca');
  });

  it('la raíz redirige al idioma guardado', async () => {
    localStorage.setItem('ldlc:lang', 'ca');
    renderApp('/');
    expect(await screen.findByRole('heading', { name: 'Inicia la sessió' })).toBeInTheDocument();
  });

  it('sin idioma guardado usa el del navegador', async () => {
    const original = navigator.language;
    Object.defineProperty(navigator, 'language', { value: 'ca-ES', configurable: true });
    try {
      renderApp('/');
      expect(await screen.findByRole('heading', { name: 'Inicia la sessió' })).toBeInTheDocument();
    } finally {
      Object.defineProperty(navigator, 'language', { value: original, configurable: true });
    }
  });
});
